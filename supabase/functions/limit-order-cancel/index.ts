// Cancel Limit Order (RLS, user JWT)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function res(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') return res(405, { ok: false, error: 'Use POST' });
    const { id, user_address } = await req.json();
    if (!id || !user_address) return res(400, { ok: false, error: 'Missing id or user_address' });

    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !anon) return res(500, { ok: false, error: 'Server not configured' });

    const supabase = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return res(401, { ok: false, error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('limit_orders')
      .update({ status: 'canceled' })
      .eq('id', id)
      .eq('user_address', user_address)
      .eq('status', 'open')
      .select('*')
      .single();
    if (error) return res(400, { ok: false, error: error.message });
    if (!data) return res(404, { ok: false, error: 'Order not found or not open' });

    // Best-effort: log to order_history (only if address belongs to user)
    try {
      const { data: owned } = await supabase
        .from('user_wallets')
        .select('wallet_address, chain')
        .eq('wallet_address', data.user_address)
        .maybeSingle();
      if (owned) {
        // Use service role only for logging
        const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        await admin.from('order_history').insert({
          user_address: data.user_address,
          chain: data.chain || 'SOL',
          symbol: data.symbol || null,
          side: data.side || null,
          event_type: 'limit_cancel',
          source: 'DB',
          price_quote: data.limit_price || null,
          base_amount: data.amount || null,
          tx_hash: data.tx_hash || null,
          meta: { reason: 'user_cancel', limit_order_id: data.id },
        });
      }
    } catch (e) {
      console.warn('order_history log failed (db cancel)', e);
    }

    return res(200, { ok: true, order: data });
  } catch (e) {
    console.error('limit-order-cancel error', e);
    return res(500, { ok: false, error: String(e?.message || e) });
  }
});
