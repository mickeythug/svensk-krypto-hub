import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyMessage } from "https://esm.sh/viem@2.13.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple SIWE-like verify: verifies that `signature` recovers to `address` for the provided `message`.
// NOTE: For production hardening, also validate nonce freshness and domain binding inside `message`.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST with JSON body' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { address, message, signature } = await req.json();
    if (!address || !message || !signature) {
      return new Response(JSON.stringify({ error: 'Missing fields: address, message, signature' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ok = await verifyMessage({ address, message, signature });
    if (!ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid signature' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('siwe-verify error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
