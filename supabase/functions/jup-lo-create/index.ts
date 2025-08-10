// Jupiter Limit Order create proxy
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
    const { inputMint, outputMint, maker, payer, params, makingAmount, takingAmount, computeUnitPrice = 'auto', feeAccount, wrapAndUnwrapSol = true } = body || {};
    if (!inputMint || !outputMint || !maker || !payer) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    const effectiveParams = params || { makingAmount, takingAmount };

    const resp = await fetch('https://lite-api.jup.ag/trigger/v1/createOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputMint, outputMint, maker, payer, params: effectiveParams, computeUnitPrice, feeAccount, wrapAndUnwrapSol }),
    });
    const data = await resp.json();
    const status = resp.status;
    if (!resp.ok) return new Response(JSON.stringify({ ok: false, status, error: data?.error || 'Create failed', details: data }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    return new Response(JSON.stringify({ ok: true, status, ...data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-create error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
