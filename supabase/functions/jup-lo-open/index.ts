// Jupiter Limit Orders - get open/active orders proxy
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const isGet = req.method === 'GET';
    const input = isGet ? Object.fromEntries(url.searchParams) : await req.json().catch(() => ({}));
    const user = input.user || input.wallet || input.maker; // wallet pubkey
    if (!user) return new Response(JSON.stringify({ ok: false, error: 'Missing user' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const orderStatus = input.orderStatus || 'active';
    const page = input.page || 1;
    const inputMint = input.inputMint || '';
    const outputMint = input.outputMint || '';

    const qp = new URLSearchParams({ user, orderStatus: String(orderStatus), page: String(page) });
    if (inputMint) qp.set('inputMint', inputMint);
    if (outputMint) qp.set('outputMint', outputMint);

    const jupUrl = `https://lite-api.jup.ag/trigger/v1/getTriggerOrders?${qp.toString()}`;
    const res = await fetch(jupUrl, { headers: { 'accept': 'application/json' } });
    const data = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-open error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
