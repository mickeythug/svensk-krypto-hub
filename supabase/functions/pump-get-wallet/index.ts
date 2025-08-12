import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hexToBytes(hex: string): Uint8Array {
  let clean = hex.trim();
  if (clean.startsWith("\\x") || clean.startsWith("0x")) clean = clean.slice(2);
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function getAesKey() {
  const base64 = Deno.env.get("PUMP_ENC_KEY") || "";
  if (!base64) throw new Error("Missing PUMP_ENC_KEY secret");
  const raw = b64ToBytes(base64);
  return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function decryptToString(hexPacked: string): Promise<string> {
  const packed = hexToBytes(hexPacked);
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  const key = await getAesKey();
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(new Uint8Array(plainBuf));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("trading_wallets")
      .select("wallet_address, acknowledged_backup")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (data.acknowledged_backup) {
      // Already acknowledged: do not leak private key again
      return new Response(
        JSON.stringify({ walletAddress: data.wallet_address, privateKey: null, acknowledged: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    
    // Use secure storage to retrieve private key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: encryptedKeyBytea, error: retrieveError } = await supabaseAdmin.rpc('get_encrypted_key', {
      p_user_id: authData.user.id,
      p_wallet_address: data.wallet_address,
      p_key_type: 'private_key',
    });

    if (retrieveError || !encryptedKeyBytea) {
      return new Response(
        JSON.stringify({ walletAddress: data.wallet_address, privateKey: null, acknowledged: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert bytea to hex string for decryption
    let hexString: string;
    if (typeof encryptedKeyBytea === 'string' && encryptedKeyBytea.startsWith('\\x')) {
      hexString = encryptedKeyBytea;
    } else {
      // Convert buffer to hex if needed
      hexString = "\\x" + Buffer.from(encryptedKeyBytea).toString('hex');
    }

    const decrypted = await decryptToString(hexString);

    return new Response(
      JSON.stringify({ walletAddress: data.wallet_address, privateKey: decrypted, acknowledged: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
