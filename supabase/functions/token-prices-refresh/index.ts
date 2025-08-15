// Refresh token prices (top pages) every ~3 minutes in respectful batches.
// Public endpoint: returns latest DB data; use ?refresh=true to trigger a background refresh

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function delay(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

async function fetchCoinGeckoPages(pages: number, perPage = 100, vs = 'usd', delayMs = 1000) {
  const all: any[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`;
    const res = await fetch(url, { headers: { 'accept': 'application/json', 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
    const json = await res.json();
    all.push(...json);
    if (page < pages) await delay(delayMs);
  }
  return all;
}

async function upsertLatestPrices(coins: any[]) {
  // Transform to rows - Accept ALL tokens now
  const rows = coins
    .map((c) => ({
      symbol: String(c.symbol || '').toUpperCase(),
      name: c.name ?? null,
      price: c.current_price ?? null,
      change_1h: c.price_change_percentage_1h_in_currency ?? null,
      change_24h: (c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h) ?? null,
      change_7d: c.price_change_percentage_7d_in_currency ?? null,
      market_cap: c.market_cap ?? null,
      image: c.image ?? null,
      coin_gecko_id: c.id ?? null,
      updated_at: new Date().toISOString(),
      data: c,
    }));

  // Deduplicate by symbol to avoid ON CONFLICT multiple updates in one statement
  const dedupedMap = new Map<string, any>();
  for (const r of rows) {
    const existing = dedupedMap.get(r.symbol);
    if (!existing) {
      dedupedMap.set(r.symbol, r);
    } else {
      // Keep the one with higher market cap (more relevant)
      const prevCap = Number(existing.market_cap || 0);
      const currCap = Number(r.market_cap || 0);
      if (currCap > prevCap) dedupedMap.set(r.symbol, r);
    }
  }
  const deduped = Array.from(dedupedMap.values());

  const { error } = await supabase.from('latest_token_prices').upsert(deduped, { onConflict: 'symbol' });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const pages = Math.max(1, Math.min(50, Number(url.searchParams.get('pages') || '10')));

    if (refresh || req.method === 'POST') {
      EdgeRuntime.waitUntil((async () => {
        try {
          const coins = await fetchCoinGeckoPages(pages);
          await upsertLatestPrices(coins);
          console.log(`token-prices-refresh: refreshed ${coins.length} coins (pages=${pages})`);
        } catch (e) { console.error('token-prices-refresh refresh error', e); }
      })());
    }

    // Return latest from DB - Show ALL tokens now
    let { data, error } = await supabase
      .from('latest_token_prices')
      .select('*')
      .order('market_cap', { ascending: false })
      .limit(1000);
    if (error) throw error;

    const now = Date.now();
    const lastUpdated = data && data.length ? data.reduce((acc, row) => Math.max(acc, new Date(row.updated_at).getTime()), 0) : 0;
    const missingPercents = !data || data.length === 0 || data.some((r: any) => r.change_1h == null || r.change_7d == null);
    const stale = lastUpdated === 0 || (now - lastUpdated) > 180000; // > 3 minutes

    if (missingPercents || stale) {
      try {
        const coins = await fetchCoinGeckoPages(pages);
        await upsertLatestPrices(coins);
        // Re-read fresh data - Show ALL tokens now
        const reread = await supabase
          .from('latest_token_prices')
          .select('*')
          .order('market_cap', { ascending: false })
          .limit(1000);
        if (reread.error) throw reread.error;
        data = reread.data as any[];
      } catch (e) {
        console.error('token-prices-refresh on-demand refresh failed', e);
      }
    }

    const finalUpdated = data && data.length ? data.reduce((acc, row) => Math.max(acc, new Date(row.updated_at).getTime()), 0) : null;

    return new Response(JSON.stringify({
      ok: true,
      source: 'db',
      pages,
      last_updated: finalUpdated ? new Date(finalUpdated).toISOString() : null,
      count: data?.length ?? 0,
      data: data ?? [],
    }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('token-prices-refresh error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'content-type': 'application/json', ...corsHeaders } });
  }
});
