// Jupiter Limit Order create proxy + order history logging
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    // Best-effort history log (only if maker address belongs to authenticated user)
    try {
      const url = Deno.env.get('SUPABASE_URL')!;
      const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabaseAuth = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
      const { data: authData } = await supabaseAuth.auth.getUser();
      if (authData?.user) {
        const { data: owned } = await supabaseAuth
          .from('user_wallets')
          .select('id')
          .eq('wallet_address', maker)
          .maybeSingle();
        if (owned) {
          const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
          await admin.from('order_history').insert({
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
        }
      }
    } catch (e) {
      console.warn('order_history log failed (create)', e);
    }

    return new Response(JSON.stringify({ ok: true, status, ...data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-create error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
