// Create Limit Order (service role)
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
    const body = await req.json().catch(() => ({}));
    const { chain, symbol, side, limit_price, amount, user_address, sol_mint, evm_from_token, evm_to_token } = body || {};
    if (!chain || !symbol || !side || !limit_price || !amount || !user_address) {
      return bad(400, 'Missing required fields');
    }
    if (!['SOL','EVM'].includes(chain)) return bad(400, 'Invalid chain');
    if (!['buy','sell'].includes(side)) return bad(400, 'Invalid side');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return bad(500, 'Server not configured');

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('limit_orders').insert({
      chain, symbol: String(symbol).toUpperCase(), side, limit_price, amount, user_address,
      sol_mint: sol_mint || null, evm_from_token: evm_from_token || null, evm_to_token: evm_to_token || null,
      status: 'open',
    }).select('*').single();
    if (error) return bad(500, error.message || 'Insert failed');

    return new Response(JSON.stringify({ ok: true, order: data }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('limit-order-create error', e);
    return bad(500, String(e?.message || e));
  }
});
