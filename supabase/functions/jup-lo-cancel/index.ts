// Jupiter Limit Order cancel proxy + order history logging
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { maker, order, computeUnitPrice = 'auto', symbol } = body || {};
    if (!maker || !order) return new Response(JSON.stringify({ ok: false, error: 'Missing maker or order' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const resp = await fetch('https://lite-api.jup.ag/trigger/v1/cancelOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maker, order, computeUnitPrice }),
    });
    const data = await resp.json();
    if (!resp.ok) return new Response(JSON.stringify({ ok: false, status: resp.status, error: data?.error || 'Cancel failed', details: data }), { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    // Log cancel event best-effort
    try {
      const supabase = getClient();
      await supabase.from('order_history').insert({
        user_address: maker,
        chain: 'SOL',
        symbol: symbol || null,
        event_type: 'limit_cancel',
        source: 'JUP',
        meta: { jupiter: data, order },
      });
    } catch (e) {
      console.warn('order_history log failed (cancel)', e);
    }

    return new Response(JSON.stringify({ ok: true, ...data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jup-lo-cancel error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
