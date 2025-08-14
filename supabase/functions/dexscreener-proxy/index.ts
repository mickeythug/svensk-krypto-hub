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
    // Read request body only once
    const body = await req.json().catch(() => ({}));
    const { action, address, pairAddress } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // TTLs: token/list 3s, trades 5s
    const TTL_TOKEN = 3_000;
    const TTL_TRADES = 5_000;

    if (action === 'profiles') {
      // Since profiles endpoint doesn't exist, use token-boosts for trending tokens
      console.log(`[dexscreener-proxy] Profiles action - using token-boosts endpoint`);
      
      try {
        const url = `https://api.dexscreener.com/token-boosts/latest/v1`;
        console.log(`[dexscreener-proxy] Fetching from URL: ${url}`);
        
        const json = await fetchJsonCached(url, TTL_TOKEN);
        console.log(`[dexscreener-proxy] Raw boosts response:`, JSON.stringify(json).substring(0, 500));
        
        // Filter for Solana tokens only
        let solanaBoosts = [];
        if (Array.isArray(json)) {
          solanaBoosts = json.filter((boost: any) => boost?.chainId === 'solana');
        }
        
        console.log(`[dexscreener-proxy] Found ${solanaBoosts.length} Solana boosted tokens`);
        
        if (solanaBoosts.length > 0) {
          // Transform boosted tokens to pairs-like structure
          const transformedTokens = await Promise.all(
            solanaBoosts.slice(0, body.limit || 50).map(async (boost: any) => {
              try {
                // Get token data for each boosted token
                const tokenUrl = `https://api.dexscreener.com/tokens/v1/solana/${boost.tokenAddress}`;
                const tokenData = await fetchJsonCached(tokenUrl, TTL_TOKEN);
                
                if (Array.isArray(tokenData) && tokenData.length > 0) {
                  return tokenData[0]; // Return the first (best) pair for this token
                }
                return null;
              } catch (e) {
                console.error(`[dexscreener-proxy] Error fetching token data for ${boost.tokenAddress}:`, e);
                return null;
              }
            })
          );
          
          const validTokens = transformedTokens.filter(Boolean);
          console.log(`[dexscreener-proxy] Returning ${validTokens.length} transformed tokens`);
          
          return new Response(JSON.stringify({ data: validTokens }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
        console.log(`[dexscreener-proxy] No Solana tokens found in boosts, trying search fallback`);
        
      } catch (e) {
        console.error('[dexscreener-proxy] Token-boosts endpoint failed:', e);
      }

      // Fallback: use search endpoint to get some popular Solana tokens
      try {
        console.log(`[dexscreener-proxy] Using search fallback for Solana tokens`);
        const searchUrl = `https://api.dexscreener.com/latest/dex/search/?q=solana`;
        const searchJson = await fetchJsonCached(searchUrl, TTL_TOKEN);
        
        let pairs: any[] = Array.isArray(searchJson?.pairs) ? searchJson.pairs : [];
        console.log(`[dexscreener-proxy] Found ${pairs.length} pairs from search fallback`);
        
        // Filter for Solana chain only
        pairs = pairs.filter((p: any) => p?.chainId === 'solana');
        
        // Apply filters if specified
        const minLiquidity = body.minLiquidity;
        const minMarketCap = body.minMarketCap;
        
        if (minLiquidity) {
          pairs = pairs.filter((p: any) => (asNum(p?.liquidity?.usd) ?? 0) >= Number(minLiquidity));
        }
        if (minMarketCap) {
          pairs = pairs.filter((p: any) => (asNum(p?.marketCap) ?? 0) >= Number(minMarketCap));
        }
        
        // Sort by volume for trending effect
        const sortedPairs = pairs.sort((a, b) => {
          const volA = asNum(a?.volume?.h24) ?? 0;
          const volB = asNum(b?.volume?.h24) ?? 0;
          return volB - volA;
        });
        
        const finalTokens = sortedPairs.slice(0, body.limit || 50);
        console.log(`[dexscreener-proxy] Returning ${finalTokens.length} tokens from search fallback`);
        
        return new Response(JSON.stringify({ data: finalTokens }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
        
      } catch (e) {
        console.error('[dexscreener-proxy] Search fallback also failed:', e);
        return new Response(JSON.stringify({ 
          data: [], 
          error: 'All endpoints failed',
          notice: 'profiles_all_endpoints_failed' 
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    if (action === 'pairsList') {
      // Use search to get pairs since /latest/dex/pairs/solana doesn't exist
      const searchUrl = `https://api.dexscreener.com/latest/dex/search/?q=solana`;
      const json = await fetchJsonCached(searchUrl, TTL_TOKEN);
      let list = Array.isArray(json?.pairs) ? json.pairs : [];
      list = list.filter((p: any) => p?.chainId === 'solana');
      const limit = Math.max(1, Math.min(200, Number(body.limit ?? 100)));
      return new Response(JSON.stringify({ data: list.slice(0, limit) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'boosted') {
      console.log(`[dexscreener-proxy] Fetching boosted tokens`);
      try {
        const url = `https://api.dexscreener.com/token-boosts/latest/v1`;
        console.log(`[dexscreener-proxy] Boosted URL: ${url}`);
        const json = await fetchJsonCached(url, TTL_TOKEN);
        console.log(`[dexscreener-proxy] Boosted response:`, JSON.stringify(json).substring(0, 500));
        
        // Filter for Solana tokens and return in expected format
        let tokens = [];
        if (Array.isArray(json)) {
          tokens = json.filter((boost: any) => boost?.chainId === 'solana');
        }
        
        console.log(`[dexscreener-proxy] Found ${tokens.length} Solana boosted tokens`);
        return new Response(JSON.stringify({ data: tokens }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (e) {
        console.error('[dexscreener-proxy] Boosted endpoint failed:', e);
        return new Response(JSON.stringify({ data: [], error: 'Boosted endpoint failed' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    if (action === 'tokenBatch') {
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
            // Use the new tokens endpoint
            const url = `https://api.dexscreener.com/tokens/v1/solana/${addr}`;
            const json = await fetchJsonCached(url, TTL_TOKEN);
            const pairs: any[] = Array.isArray(json) ? json : [];
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
      // Use the new tokens endpoint
      const url = `https://api.dexscreener.com/tokens/v1/solana/${address}`;
      const json = await fetchJsonCached(url, TTL_TOKEN);
      const pairs: any[] = Array.isArray(json) ? json : [];
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
      // This endpoint might still work for trades
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