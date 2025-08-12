// Order History Logger - Inserts trade/order events into public.order_history securely
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LogEvent = {
  user_address: string;
  chain?: string; // 'SOL' | 'EVM'
  symbol?: string;
  base_mint?: string;
  quote_mint?: string;
  side?: 'buy' | 'sell';
  event_type: 'limit_create' | 'limit_cancel' | 'limit_execute' | 'market_trade';
  source?: string; // 'JUP' | 'DB' | 'DEX' | 'EVM'
  base_amount?: number;
  quote_amount?: number;
  price_quote?: number;
  price_usd?: number;
  fee_quote?: number;
  tx_hash?: string;
  meta?: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Use POST' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Authenticate caller
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const body = (await req.json()) as Partial<LogEvent> | { events: LogEvent[] };
    const events = Array.isArray((body as any)?.events) ? (body as any).events as LogEvent[] : [body as LogEvent];

    // Validate and normalize rows
    const rows = events.map((e) => {
      if (!e?.user_address || !e?.event_type) throw new Error('Missing user_address or event_type');
      return {
        user_address: e.user_address,
        chain: e.chain ?? 'SOL',
        symbol: e.symbol ?? null,
        base_mint: e.base_mint ?? null,
        quote_mint: e.quote_mint ?? null,
        side: e.side ?? null,
        event_type: e.event_type,
        source: e.source ?? null,
        base_amount: e.base_amount ?? null,
        quote_amount: e.quote_amount ?? null,
        price_quote: e.price_quote ?? null,
        price_usd: e.price_usd ?? null,
        fee_quote: e.fee_quote ?? null,
        tx_hash: e.tx_hash ?? null,
        meta: e.meta ?? null,
      };
    });

    // Ensure all addresses belong to the authenticated user
    const { data: wallets } = await supabaseAuth.from('user_wallets').select('wallet_address, chain');
    const owned = new Set((wallets || []).map((w: any) => `${(w.chain || 'SOL').toUpperCase()}:${String(w.wallet_address).toLowerCase()}`));
    const allOwned = rows.every((r) => owned.has(`${(r.chain || 'SOL').toUpperCase()}:${String(r.user_address).toLowerCase()}`));
    if (!allOwned) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden: address not owned by user' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Insert using service role (RLS on order_history restricts user inserts)
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data, error } = await admin.from('order_history').insert(rows).select('id, created_at');
    if (error) {
      console.error('order-history-log insert error', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    return new Response(JSON.stringify({ ok: true, inserted: data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('order-history-log error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
