import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call PumpPortal to create wallet
    const res = await fetch("https://pumpportal.fun/api/create-wallet", { method: "GET" });
    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: "PumpPortal wallet creation failed", details: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await res.json();
    // Try common field names
    const walletAddress = body.walletAddress || body.publicKey || body.address || body.pubkey;
    const privateKey = body.privateKey || body.secretKey || body.sk;
    const pumpApiKey = body.apiKey || body.api_key || body.key;

    if (!walletAddress || !pumpApiKey) {
      return new Response(JSON.stringify({ error: "Malformed response from PumpPortal", body }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Encrypt PumpPortal API key before saving
    const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bytesToHex = (bytes: Uint8Array) => "\\x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const getAesKey = async () => {
      const base64 = Deno.env.get("PUMP_ENC_KEY") || "";
      if (!base64) throw new Error("Missing PUMP_ENC_KEY secret");
      const raw = b64ToBytes(base64);
      return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    };
    const encryptApiKey = async (apiKey: string) => {
      const key = await getAesKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = new TextEncoder().encode(apiKey);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
      const packed = new Uint8Array(iv.length + ct.length);
      packed.set(iv, 0);
      packed.set(ct, iv.length);
      return bytesToHex(packed);
    };

    const encryptedHex = await encryptApiKey(String(pumpApiKey));

    // Upsert into trading_wallets (unique per user) with encrypted key (no plaintext persisted)
    const { error: upsertErr } = await supabase
      .from("trading_wallets")
      .upsert(
        {
          user_id: authData.user.id,
          wallet_address: String(walletAddress),
          pump_api_key_encrypted: encryptedHex,
          pump_api_key: null,
          acknowledged_backup: false,
        },
        { onConflict: "user_id" }
      );

    if (upsertErr) {
      return new Response(JSON.stringify({ error: "Failed to save wallet", details: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return keys for one-time display (do NOT persist private key server-side)
    return new Response(
      JSON.stringify({ walletAddress, privateKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
