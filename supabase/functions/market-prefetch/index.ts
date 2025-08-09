// Fetch top market pages from CoinGecko, upsert into latest_token_prices, and store hourly snapshot
// Public endpoint: returns latest DB data; use ?refresh=true to trigger a background refresh

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchCoinGeckoPages(pages: number, perPage = 100, vs = 'usd', delayMs = 1200) {
  const all: any[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, { headers: { 'accept': 'application/json', 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
    const json = await res.json();
    all.push(...json);
    if (page < pages) await delay(delayMs);
  }
  return all;
}

async function upsertLatestPrices(coins: any[]) {
  const rows = coins.map((c) => ({
    symbol: String(c.symbol || '').toUpperCase(),
    name: c.name ?? null,
    price: c.current_price ?? null,
    change_24h: c.price_change_percentage_24h ?? null,
    market_cap: c.market_cap ?? null,
    image: c.image ?? null,
    coin_gecko_id: c.id ?? null,
    updated_at: new Date().toISOString(),
    data: c,
  }));
  const { error } = await supabase.from('latest_token_prices').upsert(rows, { onConflict: 'symbol' });
  if (error) throw error;
}

async function storeSnapshot(coins: any[], pageCount: number) {
  const { error } = await supabase.from('market_snapshots').insert({
    snapshot_time: new Date().toISOString(),
    source: 'coingecko',
    page_count: pageCount,
    data: coins,
  });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const pages = Math.max(1, Math.min(5, Number(url.searchParams.get('pages') || '2')));

    // Optionally refresh in the background (safe for cron or manual calls)
    if (refresh || req.method === 'POST') {
      EdgeRuntime.waitUntil((async () => {
        try {
          const coins = await fetchCoinGeckoPages(pages);
          await upsertLatestPrices(coins);
          await storeSnapshot(coins, pages);
          console.log(`market-prefetch: refreshed ${coins.length} coins (pages=${pages})`);
        } catch (e) {
          console.error('market-prefetch refresh error', e);
        }
      })());
    }

    // Always return latest snapshot info + latest prices from DB (no external calls here)
    const { data: latestPrices, error: lpErr } = await supabase
      .from('latest_token_prices')
      .select('*')
      .order('market_cap', { ascending: false })
      .limit(pages * 100);
    if (lpErr) throw lpErr;

    const { data: snapshot, error: snapErr } = await supabase
      .from('market_snapshots')
      .select('id, snapshot_time, page_count')
      .order('snapshot_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (snapErr) throw snapErr;

    return new Response(JSON.stringify({
      ok: true,
      source: 'db',
      pages,
      last_snapshot: snapshot ?? null,
      count: latestPrices?.length ?? 0,
      data: latestPrices ?? [],
    }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('market-prefetch error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'content-type': 'application/json', ...corsHeaders } });
  }
});
