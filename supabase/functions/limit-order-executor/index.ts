// Execute/Trigger Limit Orders (service role)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return new Response(JSON.stringify({ ok: false, error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    const supabase = createClient(url, key);

    // Load open orders
    const { data: orders, error: ordErr } = await supabase
      .from('limit_orders')
      .select('id, symbol, side, limit_price, status')
      .eq('status', 'open')
      .limit(500);
    if (ordErr) throw ordErr;

    if (!orders || orders.length === 0) return new Response(JSON.stringify({ ok: true, triggered: 0 }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const symbols = Array.from(new Set(orders.map((o: any) => o.symbol)));
    const { data: prices, error: pErr } = await supabase
      .from('latest_token_prices')
      .select('symbol, price')
      .in('symbol', symbols);
    if (pErr) throw pErr;
    const priceMap = new Map<string, number>((prices || []).map((r: any) => [String(r.symbol).toUpperCase(), Number(r.price)]));

    let triggered = 0;
    for (const o of orders as any[]) {
      const sym = String(o.symbol).toUpperCase();
      const cur = priceMap.get(sym);
      if (!Number.isFinite(cur)) continue;
      const hit = (o.side === 'buy') ? (cur <= Number(o.limit_price)) : (cur >= Number(o.limit_price));
      if (hit) {
        triggered++;
        await supabase
          .from('limit_orders')
          .update({ status: 'triggered', triggered_at: new Date().toISOString() })
          .eq('id', o.id)
          .eq('status', 'open');
      }
    }

    return new Response(JSON.stringify({ ok: true, triggered }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('limit-order-executor error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
