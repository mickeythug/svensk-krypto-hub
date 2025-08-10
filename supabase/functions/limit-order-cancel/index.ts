// Cancel Limit Order (service role)
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
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return res(500, { ok: false, error: 'Server not configured' });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('limit_orders')
      .update({ status: 'canceled' })
      .eq('id', id)
      .eq('user_address', user_address)
      .eq('status', 'open')
      .select('*')
      .single();
    if (error) return res(500, { ok: false, error: error.message });
    if (!data) return res(404, { ok: false, error: 'Order not found or not open' });

    return res(200, { ok: true, order: data });
  } catch (e) {
    console.error('limit-order-cancel error', e);
    return res(500, { ok: false, error: String(e?.message || e) });
  }
});
