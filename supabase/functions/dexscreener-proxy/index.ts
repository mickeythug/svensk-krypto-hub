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
      // DexScreener token-profiles using the CORRECT working endpoints
      const body: any = await req.json().catch(() => ({}));
      const sortKey = body.sort || 'trendingScore';
      const order: 'asc' | 'desc' = (body.order === 'asc' ? 'asc' : 'desc');
      const limit = Math.max(1, Math.min(200, Number(body.limit ?? 100)));
      const minLiquidity = body.minLiquidity;
      const minMarketCap = body.minMarketCap;

      console.log(`[dexscreener-proxy] Processing profiles request: sort=${sortKey}, order=${order}, limit=${limit}`);

      try {
        // Use working DexScreener API endpoints - try multiple approaches
        console.log(`[dexscreener-proxy] Trying multiple endpoints for profiles...`);
        
        // Method 1: Try the trending pairs endpoint
        let url = `https://api.dexscreener.com/latest/dex/search/?q=solana`;
        console.log(`[dexscreener-proxy] Fetching from trending search: ${url}`);
        
        try {
          const json = await fetchJsonCached(url, TTL_TOKEN);
          console.log(`[dexscreener-proxy] Search response:`, JSON.stringify(json).substring(0, 500));
          
          if (json && Array.isArray(json.pairs) && json.pairs.length > 0) {
            let pairs = json.pairs.slice(0, limit);
            console.log(`[dexscreener-proxy] Found ${pairs.length} pairs from search`);
            
            // Filter by Solana only
            pairs = pairs.filter((p: any) => p.chainId === 'solana');
            
            // Apply additional filters if provided
            if (minLiquidity) {
              pairs = pairs.filter((p: any) => (asNum(p?.liquidity?.usd) ?? 0) >= Number(minLiquidity));
            }
            if (minMarketCap) {
              pairs = pairs.filter((p: any) => (asNum(p?.marketCap) ?? 0) >= Number(minMarketCap));
            }
            
            console.log(`[dexscreener-proxy] After filtering: ${pairs.length} pairs`);
            return new Response(JSON.stringify({ data: pairs }), { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
        } catch (e) {
          console.error('[dexscreener-proxy] Search method failed:', e);
        }

        // Method 2: Try the latest pairs endpoint directly 
        url = `https://api.dexscreener.com/latest/dex/pairs/solana`;
        console.log(`[dexscreener-proxy] Fetching from pairs endpoint: ${url}`);
        
        try {
          const json = await fetchJsonCached(url, TTL_TOKEN);
          console.log(`[dexscreener-proxy] Pairs response:`, JSON.stringify(json).substring(0, 500));
          
          if (json && Array.isArray(json.pairs) && json.pairs.length > 0) {
            let pairs = json.pairs;
            console.log(`[dexscreener-proxy] Found ${pairs.length} pairs from pairs endpoint`);
            
            // Apply filters
            if (minLiquidity) {
              pairs = pairs.filter((p: any) => (asNum(p?.liquidity?.usd) ?? 0) >= Number(minLiquidity));
            }
            if (minMarketCap) {
              pairs = pairs.filter((p: any) => (asNum(p?.marketCap) ?? 0) >= Number(minMarketCap));
            }
            
            // Sort and limit
            const sortedPairs = pairs.sort((a, b) => {
              let valA = 0, valB = 0;
              
              switch (String(sortKey)) {
                case 'priceChange':
                  valA = asNum(a?.priceChange?.h24) ?? 0;
                  valB = asNum(b?.priceChange?.h24) ?? 0;
                  break;
                case 'volume':
                  valA = asNum(a?.volume?.h24) ?? 0;
                  valB = asNum(b?.volume?.h24) ?? 0;
                  break;
                case 'liquidity':
                  valA = asNum(a?.liquidity?.usd) ?? 0;
                  valB = asNum(b?.liquidity?.usd) ?? 0;
                  break;
                case 'marketCap':
                  valA = asNum(a?.marketCap) ?? 0;
                  valB = asNum(b?.marketCap) ?? 0;
                  break;
                case 'txns':
                  valA = (asNum(a?.txns?.h24?.buys) ?? 0) + (asNum(a?.txns?.h24?.sells) ?? 0);
                  valB = (asNum(b?.txns?.h24?.buys) ?? 0) + (asNum(b?.txns?.h24?.sells) ?? 0);
                  break;
                case 'createdAt':
                  valA = asNum(a?.pairCreatedAt) ?? 0;
                  valB = asNum(b?.pairCreatedAt) ?? 0;
                  break;
                case 'trendingScore':
                default:
                  // Trending score calculation
                  const t1A = ((asNum(a?.txns?.h1?.buys) ?? 0) + (asNum(a?.txns?.h1?.sells) ?? 0)) * 1000;
                  const pcA = (asNum(a?.priceChange?.h1) ?? 0) * 100;
                  const liqA = (asNum(a?.liquidity?.usd) ?? 0) * 0.001;
                  valA = t1A + pcA + liqA;
                  
                  const t1B = ((asNum(b?.txns?.h1?.buys) ?? 0) + (asNum(b?.txns?.h1?.sells) ?? 0)) * 1000;
                  const pcB = (asNum(b?.priceChange?.h1) ?? 0) * 100;
                  const liqB = (asNum(b?.liquidity?.usd) ?? 0) * 0.001;
                  valB = t1B + pcB + liqB;
                  break;
              }
              
              return order === 'asc' ? valA - valB : valB - valA;
            });
            
            const finalTokens = sortedPairs.slice(0, limit);
            console.log(`[dexscreener-proxy] Returning ${finalTokens.length} tokens from pairs endpoint`);
            
            return new Response(JSON.stringify({ data: finalTokens }), { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
        } catch (e) {
          console.error('[dexscreener-proxy] Pairs method failed:', e);
        }
        
      } catch (e) {
        console.error('[dexscreener-proxy] All profile methods failed:', e);
      }

      // Method 3: Final fallback - use hardcoded popular Solana tokens
      console.log(`[dexscreener-proxy] Using final fallback with hardcoded tokens`);
      
      try {
        // Popular Solana meme/tokens for fallback
        const popularTokens = [
          'So11111111111111111111111111111111111111112', // SOL
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
          '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', // POPCAT
          'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', // DUST
          '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC', // BONK (old)
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK 
          'A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump', // PNUT
          'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', // AI16Z
          'HZLGzWaKRuD6g1SEyKqsKgWRnbBXVQRN7ZCiNyVCaEb7', // GOAT
        ];
        
        const tokenRequests = popularTokens.slice(0, 10).map(async (address) => {
          try {
            const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
            const response = await fetchJsonCached(url, TTL_TOKEN);
            if (response && Array.isArray(response.pairs) && response.pairs.length > 0) {
              const best = pickBestPair(response.pairs.filter((p: any) => p.chainId === 'solana'));
              return best;
            }
            return null;
          } catch (e) {
            console.error(`[dexscreener-proxy] Failed to fetch token ${address}:`, e);
            return null;
          }
        });
        
        const results = await Promise.all(tokenRequests);
        const validTokens = results.filter(Boolean);
        
        console.log(`[dexscreener-proxy] Fallback found ${validTokens.length} valid tokens`);
        
        if (validTokens.length > 0) {
          return new Response(JSON.stringify({ data: validTokens.slice(0, limit) }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
      } catch (e) {
        console.error('[dexscreener-proxy] Hardcoded fallback failed:', e);
      }
      
      // Last resort: return empty but valid response
      console.log(`[dexscreener-proxy] All methods failed, returning empty response`);
      return new Response(JSON.stringify({ 
        data: [], 
        error: 'All data sources temporarily unavailable',
        notice: 'api_endpoints_down',
        fallback: true
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
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
      console.log(`[dexscreener-proxy] Fetching boosted tokens`);
      try {
        const url = `https://api.dexscreener.com/token-boosts/latest/v1/solana`;
        console.log(`[dexscreener-proxy] Boosted URL: ${url}`);
        const json = await fetchJsonCached(url, TTL_TOKEN);
        console.log(`[dexscreener-proxy] Boosted response:`, JSON.stringify(json).substring(0, 500));
        
        // Handle different response structures
        let tokens = [];
        if (Array.isArray(json)) {
          tokens = json;
        } else if (json && Array.isArray(json.tokens)) {
          tokens = json.tokens;
        } else if (json && Array.isArray(json.data)) {
          tokens = json.data;
        }
        
        console.log(`[dexscreener-proxy] Found ${tokens.length} boosted tokens`);
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
