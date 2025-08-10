// Jupiter Limit Order create proxy + order history logging
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOL_MINT = 'So11111111111111111111111111111111111111112';

function getClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'Use POST' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  try {
    const body = await req.json();
    const { inputMint, outputMint, maker, payer, params, makingAmount, takingAmount, computeUnitPrice = 'auto', feeAccount, wrapAndUnwrapSol = true, symbol } = body || {};
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

    // Best-effort history log
    try {
      const mk = Number(effectiveParams?.makingAmount ?? makingAmount ?? 0);
      const tk = Number(effectiveParams?.takingAmount ?? takingAmount ?? 0);
      const side = inputMint === SOL_MINT && outputMint !== SOL_MINT ? 'buy' : (outputMint === SOL_MINT ? 'sell' : null);
      const price_quote = (mk > 0 && tk > 0)
        ? (inputMint === SOL_MINT ? (mk / tk) : (outputMint === SOL_MINT ? (tk / mk) : (mk / tk)))
        : null;
      const supabase = getClient();
      await supabase.from('order_history').insert({
        user_address: maker,
        chain: 'SOL',
        symbol: symbol || null,
        base_mint: side === 'buy' ? outputMint : inputMint,
        quote_mint: side === 'buy' ? inputMint : outputMint,
        side: side as any,
        event_type: 'limit_create',
        source: 'JUP',
        base_amount: side === 'buy' ? tk : mk,
        quote_amount: side === 'buy' ? mk : tk,
        price_quote,
        tx_hash: data?.txSignature || null,
        meta: { jupiter: data, params: effectiveParams },
      });
    } catch (e) {
      console.warn('order_history log failed (create)', e);
    }

    return new Response(JSON.stringify({ ok: true, status, ...data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-create error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
