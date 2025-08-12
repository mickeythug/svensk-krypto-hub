import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TradeBody = {
  action: "buy" | "sell";
  mint: string;
  amount: number | string; // allow percentages for sell like "100%"
  denominatedInSol: "true" | "false";
  slippage: number;
  priorityFee: number; // in SOL
  pool?: "pump" | "raydium" | "pump-amm" | "launchlab" | "raydium-cpmm" | "bonk" | "auto";
  skipPreflight?: "true" | "false";
  jitoOnly?: "true" | "false";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as TradeBody;

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

    // Create admin client to read encrypted secret securely
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Helpers for encryption/decryption
    const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bytesToHex = (bytes: Uint8Array) => "\\x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const hexToBytes = (hexPrefixed: string) => {
      const hex = hexPrefixed.startsWith("\\x") ? hexPrefixed.slice(2) : hexPrefixed;
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
      return out;
    };
    const getAesKey = async () => {
      const base64 = Deno.env.get("PUMP_ENC_KEY") || "";
      if (!base64) throw new Error("Missing PUMP_ENC_KEY secret");
      const raw = b64ToBytes(base64);
      return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    };
    const decryptApiKey = async (encryptedHex: string) => {
      const key = await getAesKey();
      const packed = hexToBytes(encryptedHex);
      const iv = packed.slice(0, 12);
      const data = packed.slice(12);
      const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
      return new TextDecoder().decode(new Uint8Array(plainBuf));
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

    // Read wallet row with admin to bypass column grants
    const { data: walletRow, error: wErr } = await supabaseAdmin
      .from("trading_wallets")
      .select("pump_api_key_encrypted, pump_api_key, wallet_address, acknowledged_backup")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (wErr || !walletRow) {
      return new Response(JSON.stringify({ error: "Trading wallet not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!walletRow.acknowledged_backup) {
      return new Response(JSON.stringify({ error: "Backup not acknowledged" }), {
        status: 428,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decrypt (and lazy-migrate if needed)
    let pumpApiKey: string | null = null;
    if (walletRow.pump_api_key_encrypted) {
      pumpApiKey = await decryptApiKey(String(walletRow.pump_api_key_encrypted));
    } else if (walletRow.pump_api_key) {
      // Migrate plaintext → encrypted
      const encHex = await encryptApiKey(String(walletRow.pump_api_key));
      await supabaseAdmin
        .from("trading_wallets")
        .update({ pump_api_key_encrypted: encHex, pump_api_key: null })
        .eq("user_id", authData.user.id);
      pumpApiKey = String(walletRow.pump_api_key);
    }

    if (!pumpApiKey) {
      return new Response(JSON.stringify({ error: "API key missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call PumpPortal trade endpoint with user's API key
    const url = `https://pumpportal.fun/api/trade?api-key=${encodeURIComponent(pumpApiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    return new Response(JSON.stringify({ status: res.status, result: json }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
