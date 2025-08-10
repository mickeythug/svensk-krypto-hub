// Jupiter Trigger execute proxy (optional)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'Use POST' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  try {
    const { signedTransaction, requestId } = await req.json();
    if (!signedTransaction || !requestId) return new Response(JSON.stringify({ ok: false, error: 'Missing signedTransaction or requestId' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const resp = await fetch('https://lite-api.jup.ag/trigger/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction, requestId }),
    });
    const data = await resp.json();
    return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-execute error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
