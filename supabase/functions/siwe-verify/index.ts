import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import * as secp from "npm:@noble/secp256k1";
import { keccak256 } from "npm:ethereum-cryptography/keccak";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid hex");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

function utf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function personalHash(message: string): Uint8Array {
  const msgBytes = utf8Bytes(message);
  const prefix = `\x19Ethereum Signed Message:\n${msgBytes.length}`;
  const prefixed = new Uint8Array(prefix.length + msgBytes.length);
  prefixed.set(utf8Bytes(prefix), 0);
  prefixed.set(msgBytes, prefix.length);
  return keccak256(prefixed);
}

function pubkeyToAddress(pubKey: Uint8Array): string {
  const uncompressed = pubKey.length === 65 && pubKey[0] === 0x04 ? pubKey.slice(1) : pubKey;
  const hash = keccak256(uncompressed);
  const addr = hash.slice(-20);
  return "0x" + Array.from(addr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST with JSON body" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { address, message, signature } = await req.json();
    if (!address || !message || !signature) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields: address, message, signature" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const msgHash = personalHash(message);
    const sig = hexToBytes(signature);
    if (sig.length !== 65) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature length" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sig64 = sig.slice(0, 64);
    let v = sig[64];
    if (v >= 27) v -= 27;
    if (v !== 0 && v !== 1) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid recovery id" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pub = secp.recoverPublicKey(msgHash, sig64, v);
    if (!pub) {
      return new Response(JSON.stringify({ ok: false, error: "Recover failed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const recovered = pubkeyToAddress(pub).toLowerCase();
    const claimed = String(address).toLowerCase();
    const ok = recovered === claimed;

    // If authenticated and verified, insert a short-lived proof
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
    const { data: authData } = await supabase.auth.getUser();
    if (ok && authData?.user) {
      await supabase.from('wallet_verification_proofs').insert({
        user_id: authData.user.id,
        address,
        chain: 'EVM',
      });
    }

    return new Response(JSON.stringify({ ok, recovered }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("siwe-verify error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
