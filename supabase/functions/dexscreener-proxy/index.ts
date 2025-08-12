// Dexscreener Proxy Edge Function
// Provides a lightweight proxy with soft caching and structured logging.
// Maps Dexscreener responses into our existing DEXTools-like structure to avoid frontend rewrites.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory cache with TTL
interface CacheEntry<T> { data: T; expires: number }
const cache = new Map<string, CacheEntry<any>>();
const now = () => Date.now();

function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expires: now() + ttlMs });
}

function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expires < now()) return null;
  return item.data as T;
}

async function fetchJsonCached(url: string, ttlMs: number) {
  const cached = getCache<any>(url);
  if (cached) return cached;
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`Dexscreener HTTP ${res.status}`);
  const json = await res.json();
  setCache(url, json, ttlMs);
  return json;
}

function pickBestPair(pairs: any[]): any | null {
  if (!Array.isArray(pairs) || pairs.length === 0) return null;
  // Prefer highest liquidity.usd, fallback to first
  const sorted = [...pairs].sort((a, b) => (Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0)));
  return sorted[0] || pairs[0];
}

function mapToDexToolsLike(pair: any) {
  const priceUsd = asNum(pair?.priceUsd);
  const priceNative = asNum(pair?.priceNative);
  const priceChange = pair?.priceChange || {};
  const txns = pair?.txns || {};
  const volume = pair?.volume || {};
  const liqUsd = asNum(pair?.liquidity?.usd);
  const info = pair?.info || {};
  const socialsArr: Array<{ type: string; url: string }> = Array.isArray(info?.socials) ? info.socials : [];
  const socialInfo: Record<string, string> = {};
  for (const s of socialsArr) {
    if (s?.type && s?.url) socialInfo[s.type] = s.url;
  }

  // Derive buy/sell volume split proportionally from trade counts when exact split is not provided by API
  const buys24 = asNum(txns?.h24?.buys) ?? 0;
  const sells24 = asNum(txns?.h24?.sells) ?? 0;
  const totalTx24 = buys24 + sells24;
  const vol24 = asNum(volume?.h24);
  const buyVol24 = vol24 !== undefined && totalTx24 > 0 ? (vol24 * buys24) / totalTx24 : undefined;
  const sellVol24 = vol24 !== undefined && totalTx24 > 0 ? (vol24 * sells24) / totalTx24 : undefined;

  const mapped = {
    meta: {
      data: {
        address: pair?.baseToken?.address,
        name: pair?.baseToken?.name,
        symbol: pair?.baseToken?.symbol,
        logo: info?.imageUrl,
        socialInfo,
      }
    },
    price: {
      data: {
        price: priceUsd,
        priceChain: priceNative,
        variation5m: asNum(priceChange?.m5),
        variation1h: asNum(priceChange?.h1),
        variation6h: asNum(priceChange?.h6),
        variation24h: asNum(priceChange?.h24),
      }
    },
    info: {
      data: {
        mcap: asNum(pair?.marketCap),
        fdv: asNum(pair?.fdv),
        circulatingSupply: undefined,
        totalSupply: undefined,
        holders: undefined, // may be enriched from Jupiter
      }
    },
    poolPrice: {
      data: {
        // Dexscreener provides txns counts for multiple windows; expose 1h and 24h for our UI
        buys1h: asNum(txns?.h1?.buys),
        sells1h: asNum(txns?.h1?.sells),
        buys24h: asNum(txns?.h24?.buys),
        sells24h: asNum(txns?.h24?.sells),
        txns24h: totalTx24 || undefined,
        volume24h: vol24,
        buyVolume24h: buyVol24,
        sellVolume24h: sellVol24,
        volume1h: asNum(volume?.h1),
        volume6h: asNum(volume?.h6),
      }
    },
    poolLiquidity: {
      data: {
        liquidity: liqUsd,
      }
    },
    extra: {
      chosenPair: {
        chainId: pair?.chainId,
        dexId: pair?.dexId,
        pairAddress: pair?.pairAddress,
      }
    }
  };
  return mapped;
}

function asNum(v: any): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace?.(/[\s,]/g, '') ?? v);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { action, address, pairAddress } = await req.json().catch(() => ({}));

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // TTLs: token/list 3s, trades 5s
    const TTL_TOKEN = 3_000;
    const TTL_TRADES = 5_000;

    if (action === 'profiles') {
      // DexScreener token-profiles latest lists with robust fallback to pairs when endpoint is unavailable
      const body: any = await req.json().catch(() => ({}));
      const sortKey = body.sort || 'trendingScore';
      const order: 'asc' | 'desc' = (body.order === 'asc' ? 'asc' : 'desc');
      const limit = Math.max(1, Math.min(200, Number(body.limit ?? 100)));
      const minLiquidity = body.minLiquidity;
      const minMarketCap = body.minMarketCap;

      // Helper: sort pairs locally to emulate token profile sorts
      const sortPairs = (pairs: any[]) => {
        const val = (p: any): number => {
          switch (String(sortKey)) {
            case 'priceChange': return asNum(p?.priceChange?.h24) ?? 0;
            case 'priceChange5m': return asNum(p?.priceChange?.m5) ?? 0;
            case 'priceChange1h': return asNum(p?.priceChange?.h1) ?? 0;
            case 'priceChange6h': return asNum(p?.priceChange?.h6) ?? 0;
            case 'volume': return asNum(p?.volume?.h24) ?? 0;
            case 'liquidity': return asNum(p?.liquidity?.usd) ?? 0;
            case 'marketCap': return asNum(p?.marketCap) ?? 0;
            case 'txns': {
              const b = asNum(p?.txns?.h24?.buys) ?? 0; const s = asNum(p?.txns?.h24?.sells) ?? 0; return b + s;
            }
            case 'createdAt': return asNum((p as any)?.pairCreatedAt ?? (p as any)?.createdAt) ?? 0;
            case 'trendingScore':
            default: {
              // Approximate trending by 1h txns, then 1h price change, then liquidity
              const t1 = ((asNum(p?.txns?.h1?.buys) ?? 0) + (asNum(p?.txns?.h1?.sells) ?? 0)) * 1000;
              const pc = (asNum(p?.priceChange?.h1) ?? 0) * 100;
              const liq = (asNum(p?.liquidity?.usd) ?? 0);
              return t1 + pc + liq * 0.001; // scaled
            }
          }
        };
        const sorted = [...pairs].sort((a, b) => (val(b) - val(a)));
        return order === 'asc' ? sorted.reverse() : sorted;
      };

      try {
        // Primary: use token-profiles endpoint
        const qs = new URLSearchParams({ chainIds: 'solana', sort: String(sortKey), order: String(order) });
        if (minLiquidity) qs.set('minLiquidity', String(minLiquidity));
        if (minMarketCap) qs.set('minMarketCap', String(minMarketCap));
        const url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?${qs.toString()}`;
        const json = await fetchJsonCached(url, TTL_TOKEN);
        const list = Array.isArray(json?.tokens) ? json.tokens
          : Array.isArray(json?.pairs) ? json.pairs
          : Array.isArray(json?.data) ? json.data
          : Array.isArray(json?.results) ? json.results
          : [];
        if (Array.isArray(list) && list.length) {
          return new Response(JSON.stringify({ data: list.slice(0, limit) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        // Fallback to pairs endpoint if list empty
      } catch (_) {
        // swallow and fallback
      }

      // Fallback: use pairs list and sort locally
      try {
        const base = `https://api.dexscreener.com/latest/dex/pairs/solana`;
        const json = await fetchJsonCached(base, TTL_TOKEN);
        let list: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
        if (minLiquidity) list = list.filter((p: any) => (asNum(p?.liquidity?.usd) ?? 0) >= Number(minLiquidity));
        if (minMarketCap) list = list.filter((p: any) => (asNum(p?.marketCap) ?? 0) >= Number(minMarketCap));
        const sorted = sortPairs(list).slice(0, limit);
        return new Response(JSON.stringify({ data: sorted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        console.error('[dexscreener-profiles-fallback-error]', e);
        return new Response(JSON.stringify({ data: [], notice: 'profiles_fallback_failed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    if (action === 'pairsList') {
      // DexScreener latest pairs list for Solana (e.g., sort=createdAt)
      const body: any = await req.json().catch(() => ({}));
      const sortKey = body.sort || undefined; // e.g., 'createdAt'
      const order = body.order || 'desc';
      const limit = Math.max(1, Math.min(200, Number(body.limit ?? 100)));
      const qs = new URLSearchParams();
      if (sortKey) qs.set('sort', String(sortKey));
      if (order) qs.set('order', String(order));
      const base = `https://api.dexscreener.com/latest/dex/pairs/solana`;
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;
      const json = await fetchJsonCached(url, TTL_TOKEN);
      const list = Array.isArray(json?.pairs) ? json.pairs : [];
      return new Response(JSON.stringify({ data: list.slice(0, limit) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'boosted') {
      const url = `https://api.dexscreener.com/token-boosts/latest/v1/solana`;
      const json = await fetchJsonCached(url, TTL_TOKEN);
      const list = Array.isArray((json as any)?.tokens) ? (json as any).tokens : [];
      return new Response(JSON.stringify({ data: list }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'tokenBatch') {
      const body: any = await req.json().catch(() => ({}));
      const addresses: string[] = Array.isArray(body.addresses) ? body.addresses.filter(Boolean) : [];
      const unique = Array.from(new Set(addresses)).slice(0, 60);
      const concurrency = 6;
      const results: any[] = [];
      let i = 0;
      async function worker() {
        while (i < unique.length) {
          const idx = i++;
          const addr = unique[idx];
          try {
            const url = `https://api.dexscreener.com/latest/dex/tokens/${addr}`;
            const json = await fetchJsonCached(url, TTL_TOKEN);
            const pairs: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
            const best = pickBestPair(pairs);
            if (!best) { results.push({ ok: false, address: addr, error: 'no_pairs' }); continue; }
            const mapped = mapToDexToolsLike(best);
            results.push({ ok: true, address: addr, ...mapped });
          } catch (e: any) {
            results.push({ ok: false, address: addr, error: e?.message || 'fetch_error' });
          }
        }
      }
      const workers = Array.from({ length: Math.min(concurrency, unique.length) }, () => worker());
      await Promise.all(workers);
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'tokenFull') {
      if (!address) return new Response(JSON.stringify({ error: 'Missing address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
      const json = await fetchJsonCached(url, TTL_TOKEN);
      const pairs: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
      const best = pickBestPair(pairs);

      // Diagnostic log
      try {
        console.log('[dexscreener-debug]', JSON.stringify({
          action: 'tokenFull', address,
          pairs: pairs.length,
          best: best ? {
            chainId: best?.chainId,
            dexId: best?.dexId,
            pairAddress: best?.pairAddress,
            priceKeys: Object.keys(best?.priceChange || {}),
            hasTxnsH24: !!best?.txns?.h24,
            liqUsd: asNum(best?.liquidity?.usd) ?? null,
            volume24h: asNum(best?.volume?.h24) ?? null,
            buys24h: asNum(best?.txns?.h24?.buys) ?? null,
            sells24h: asNum(best?.txns?.h24?.sells) ?? null,
          } : null
        }));
      } catch (_) {}

      if (!best) {
        return new Response(JSON.stringify({ error: 'No pairs found', results: [] }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Enrich with Jupiter holders if available
      let jupHolders: number | undefined;
      try {
        const jupUrl = `https://price.jup.ag/v4/price?ids=${address}`;
        const jup = await fetchJsonCached(jupUrl, TTL_TOKEN);
        const rawHold = (jup as any)?.data?.[address]?.extraInfo?.holders;
        const parsedHold = asNum(rawHold);
        if (typeof parsedHold === 'number') jupHolders = parsedHold;
      } catch (_) {}

      const mapped = mapToDexToolsLike(best);
      if (jupHolders !== undefined) {
        try { (mapped as any).info.data.holders = jupHolders; } catch (_) {}
      }
      return new Response(JSON.stringify(mapped), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'trades') {
      if (!pairAddress) return new Response(JSON.stringify({ error: 'Missing pairAddress' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const url = `https://api.dexscreener.com/latest/dex/trades/${pairAddress}`;
      const json = await fetchJsonCached(url, TTL_TRADES);
      // Pass-through trades with CORS + small normalization
      return new Response(JSON.stringify({ trades: json?.trades ?? [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[dexscreener-error]', e);
    return new Response(JSON.stringify({ error: (e as Error).message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
