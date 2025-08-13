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
    console.log('pump-create-wallet function called');
    
    // Get the Solana address from the request body
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { solanaAddress } = requestBody;
    
    if (!solanaAddress) {
      console.error('Missing solanaAddress in request');
      return new Response(JSON.stringify({ error: "Solana address required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log('Creating wallet for Solana address:', solanaAddress);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Call PumpPortal to create wallet
    console.log('Calling PumpPortal API...');
    const res = await fetch("https://pumpportal.fun/api/create-wallet", { method: "GET" });
    console.log('PumpPortal response status:', res.status);
    if (!res.ok) {
      const txt = await res.text();
      console.error('PumpPortal API failed:', txt);
      return new Response(JSON.stringify({ error: "PumpPortal wallet creation failed", details: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseBody = await res.json();
    console.log('PumpPortal response body:', responseBody);
    // Try common field names
    const walletAddress = responseBody.walletAddress || responseBody.publicKey || responseBody.address || responseBody.pubkey;
    const privateKey = responseBody.privateKey || responseBody.secretKey || responseBody.sk;
    const pumpApiKey = responseBody.apiKey || responseBody.api_key || responseBody.key;

    if (!walletAddress || !pumpApiKey) {
      return new Response(JSON.stringify({ error: "Malformed response from PumpPortal", responseBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Encrypt strings (API key and optionally private key) before saving
    const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bytesToHex = (bytes: Uint8Array) => "\\x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const getAesKey = async () => {
      const base64 = Deno.env.get("PUMP_ENC_KEY") || "";
      if (!base64) throw new Error("Missing PUMP_ENC_KEY secret");
      const raw = b64ToBytes(base64);
      return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    };
    const encryptString = async (plain: string) => {
      const key = await getAesKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = new TextEncoder().encode(plain);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
      const packed = new Uint8Array(iv.length + ct.length);
      packed.set(iv, 0);
      packed.set(ct, iv.length);
      return bytesToHex(packed);
    };

    const encryptedApiKey = await encryptString(String(pumpApiKey));
    const encryptedPriv = privateKey ? await encryptString(String(privateKey)) : null;

    // Use the new secure storage system
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Store keys securely in private schema
    const { error: secureStoreError } = await supabaseAdmin.rpc('store_encrypted_key', {
      p_user_id: solanaAddress,
      p_wallet_address: String(walletAddress),
      p_private_key_encrypted: encryptedPriv,
      p_pump_api_key_encrypted: encryptedApiKey,
    });

    if (secureStoreError) {
      return new Response(JSON.stringify({ error: "Failed to save wallet securely", details: secureStoreError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the public trading_wallets table with non-sensitive data only
    const { error: upsertErr } = await supabaseAdmin
      .from("trading_wallets")
      .upsert(
        {
          user_id: solanaAddress,
          wallet_address: String(walletAddress),
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

    // Return keys for one-time display (do NOT persist private key server-side in plaintext)
    return new Response(
      JSON.stringify({ walletAddress, privateKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error('Unexpected error in pump-create-wallet:', e);
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
