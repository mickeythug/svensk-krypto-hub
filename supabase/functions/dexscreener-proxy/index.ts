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
        holders: undefined,
      }
    },
    poolPrice: {
      data: {
        // Dexscreener provides txns counts for multiple windows; expose 1h and 24h for our UI
        buys1h: asNum(txns?.h1?.buys),
        sells1h: asNum(txns?.h1?.sells),
        buys24h: asNum(txns?.h24?.buys),
        sells24h: asNum(txns?.h24?.sells),
        volume24h: asNum(volume?.h24),
        volume1h: undefined,
        volume6h: undefined,
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

    // TTLs: token data 15s, trades 5s
    const TTL_TOKEN = 15_000;
    const TTL_TRADES = 5_000;

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

      const mapped = mapToDexToolsLike(best);
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
