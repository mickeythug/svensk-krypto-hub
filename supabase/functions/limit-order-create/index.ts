// Create Limit Order (RLS, user JWT)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function bad(status: number, msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') return bad(405, 'Use POST');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return bad(500, 'Server not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return bad(401, 'Unauthorized');

    const body = await req.json().catch(() => ({}));
    const { chain, symbol, side, limit_price, amount, user_address, sol_mint, evm_from_token, evm_to_token } = body || {};
    if (!chain || !symbol || !side || !limit_price || !amount || !user_address) {
      return bad(400, 'Missing required fields');
    }
    if (!['SOL','EVM'].includes(chain)) return bad(400, 'Invalid chain');
    if (!['buy','sell'].includes(side)) return bad(400, 'Invalid side');

    // RLS will enforce user_owns_wallet(user_address)
    const { data, error } = await supabase.from('limit_orders').insert({
      chain,
      symbol: String(symbol).toUpperCase(),
      side,
      limit_price,
      amount,
      user_address,
      sol_mint: sol_mint || null,
      evm_from_token: evm_from_token || null,
      evm_to_token: evm_to_token || null,
      status: 'open',
    }).select('*').single();
    if (error) return bad(400, error.message || 'Insert failed');

    return new Response(JSON.stringify({ ok: true, order: data }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('limit-order-create error', e);
    return bad(500, String(e?.message || e));
  }
});
