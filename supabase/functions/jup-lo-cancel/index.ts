// Jupiter Limit Order cancel proxy
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'Use POST' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  try {
    const body = await req.json();
    const { maker, order, computeUnitPrice = 'auto' } = body || {};
    if (!maker || !order) return new Response(JSON.stringify({ ok: false, error: 'Missing maker or order' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const resp = await fetch('https://lite-api.jup.ag/trigger/v1/cancelOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maker, order, computeUnitPrice }),
    });
    const data = await resp.json();
    if (!resp.ok) return new Response(JSON.stringify({ ok: false, status: resp.status, error: data?.error || 'Cancel failed', details: data }), { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    return new Response(JSON.stringify({ ok: true, ...data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-cancel error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
