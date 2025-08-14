// DEXTools Proxy Edge Function
// Integrates with DEXTools API v2 for comprehensive Solana token data
// Provides categorized data matching frontend requirements

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DEXTools API Configuration
const DEXTOOLS_API_KEY = "oPilvM85fv8QYvV22V3vW5hexTn6r6W84fx6wlpw";
const DEXTOOLS_BASE_URL = "https://public-api.dextools.io/trial";

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

async function fetchDexTools(endpoint: string, params?: Record<string, any>) {
  const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  const url = new URL(`${DEXTOOLS_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  console.log(`[dextools-proxy] Fetching: ${url.toString()}`);

  const response = await fetch(url, {
    headers: {
      'X-API-KEY': DEXTOOLS_API_KEY,
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`DEXTools API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  setCache(cacheKey, data, 30000); // Cache for 30 seconds
  return data;
}

function mapDexToolsToken(token: any, poolData?: any): any {
  const price = poolData?.price || token.price || 0;
  const priceChange24h = poolData?.variation24h || token.variation24h || 0;
  const volume24h = poolData?.volume24h || token.volume24h || 0;
  const marketCap = token.mcap || token.marketCap || (price * (token.totalSupply || 0));
  
  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    price: price,
    priceChange24h: priceChange24h,
    volume24h: volume24h,
    marketCap: marketCap,
    liquidity: poolData?.liquidity || 0,
    holders: token.holders || 0,
    txns24h: poolData?.txns24h || 0,
    image: token.logo,
    pairAddress: poolData?.address,
    chainId: 'solana',
    dexId: poolData?.exchangeName || 'raydium',
    // Additional DEXTools specific data
    audit: token.audit,
    score: token.score,
    locks: token.locks,
    socialInfo: token.socialInfo
  };
}

async function enrichWithPoolData(tokens: any[]): Promise<any[]> {
  const enrichedTokens = [];
  
  for (const token of tokens.slice(0, 50)) { // Limit to avoid rate limits
    try {
      // Get pools for this token
      const poolsData = await fetchDexTools(`/v2/token/solana/${token.address}/pools`, {
        sort: 'creationTime',
        order: 'desc',
        from: '2020-01-01T00:00:00.000Z',
        to: new Date().toISOString(),
        page: 0,
        pageSize: 10
      });
      
      if (poolsData?.results?.length > 0) {
        const mainPool = poolsData.results[0]; // Use most recent pool
        
        // Get pool price data
        try {
          const poolPrice = await fetchDexTools(`/v2/pool/solana/${mainPool.address}/price`);
          enrichedTokens.push(mapDexToolsToken(token, { ...mainPool, ...poolPrice }));
        } catch (e) {
          console.warn(`[dextools-proxy] Could not fetch pool price for ${token.address}:`, e);
          enrichedTokens.push(mapDexToolsToken(token, mainPool));
        }
      } else {
        enrichedTokens.push(mapDexToolsToken(token));
      }
    } catch (e) {
      console.warn(`[dextools-proxy] Could not enrich token ${token.address}:`, e);
      enrichedTokens.push(mapDexToolsToken(token));
    }
  }
  
  return enrichedTokens;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { action, category, limit = 50, page = 0 } = body;

    console.log(`[dextools-proxy] Processing request: action=${action}, category=${category}, limit=${limit}, page=${page}`);

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action parameter' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let data: any = { data: [] };

    switch (action) {
      case 'trending':
        // Use DEXTools hot pools for trending
        try {
          const hotPools = await fetchDexTools('/v2/ranking/solana/hotpools');
          if (hotPools && Array.isArray(hotPools)) {
            const tokens = hotPools.slice(0, limit).map((pool: any) => ({
              address: pool.mainToken.address,
              symbol: pool.mainToken.symbol,
              name: pool.mainToken.name,
              ...pool.mainToken
            }));
            
            data.data = await enrichWithPoolData(tokens);
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching trending:', e);
          data = { data: [], error: 'Failed to fetch trending tokens' };
        }
        break;

      case 'gainers':
        // Use DEXTools gainers ranking
        try {
          const gainers = await fetchDexTools('/v2/ranking/solana/gainers');
          if (gainers && Array.isArray(gainers)) {
            const tokens = gainers.slice(0, limit).map((pool: any) => ({
              address: pool.mainToken?.address || pool.address,
              symbol: pool.mainToken?.symbol || pool.symbol,
              name: pool.mainToken?.name || pool.name,
              price: pool.price,
              priceChange24h: pool.variation24h,
              ...pool.mainToken
            }));
            
            data.data = await enrichWithPoolData(tokens);
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching gainers:', e);
          data = { data: [], error: 'Failed to fetch gainers' };
        }
        break;

      case 'losers':
        // Use DEXTools losers ranking
        try {
          const losers = await fetchDexTools('/v2/ranking/solana/losers');
          if (losers && Array.isArray(losers)) {
            const tokens = losers.slice(0, limit).map((pool: any) => ({
              address: pool.mainToken?.address || pool.address,
              symbol: pool.mainToken?.symbol || pool.symbol,
              name: pool.mainToken?.name || pool.name,
              price: pool.price,
              priceChange24h: pool.variation24h,
              ...pool.mainToken
            }));
            
            data.data = await enrichWithPoolData(tokens);
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching losers:', e);
          data = { data: [], error: 'Failed to fetch losers' };
        }
        break;

      case 'newest':
        // Get newest tokens by creation time
        try {
          const endTime = new Date();
          const startTime = new Date(endTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // Last 7 days
          
          const tokens = await fetchDexTools('/v2/token/solana', {
            sort: 'creationTime',
            order: 'desc',
            from: startTime.toISOString(),
            to: endTime.toISOString(),
            page: page,
            pageSize: limit
          });
          
          if (tokens?.results) {
            data.data = await enrichWithPoolData(tokens.results);
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching newest:', e);
          data = { data: [], error: 'Failed to fetch newest tokens' };
        }
        break;

      case 'marketcap_high':
        // Get tokens sorted by market cap (high to low)
        try {
          const tokens = await fetchDexTools('/v2/token/solana', {
            sort: 'creationTime',
            order: 'desc',
            from: '2020-01-01T00:00:00.000Z',
            to: new Date().toISOString(),
            page: page,
            pageSize: Math.min(limit * 3, 150) // Get more to filter by market cap
          });
          
          if (tokens?.results) {
            const enriched = await enrichWithPoolData(tokens.results);
            // Sort by market cap descending and take requested limit
            const sorted = enriched
              .filter(token => token.marketCap > 0)
              .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
              .slice(0, limit);
            
            data.data = sorted;
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching marketcap_high:', e);
          data = { data: [], error: 'Failed to fetch high market cap tokens' };
        }
        break;

      case 'marketcap_low':
        // Get tokens sorted by market cap (low to high)
        try {
          const tokens = await fetchDexTools('/v2/token/solana', {
            sort: 'creationTime',
            order: 'desc',
            from: '2020-01-01T00:00:00.000Z',
            to: new Date().toISOString(),
            page: page,
            pageSize: Math.min(limit * 3, 150)
          });
          
          if (tokens?.results) {
            const enriched = await enrichWithPoolData(tokens.results);
            // Sort by market cap ascending and take requested limit
            const sorted = enriched
              .filter(token => token.marketCap > 0)
              .sort((a, b) => (a.marketCap || 0) - (b.marketCap || 0))
              .slice(0, limit);
            
            data.data = sorted;
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching marketcap_low:', e);
          data = { data: [], error: 'Failed to fetch low market cap tokens' };
        }
        break;

      case 'volume':
        // Get high volume tokens - use hot pools as proxy for volume
        try {
          const hotPools = await fetchDexTools('/v2/ranking/solana/hotpools');
          if (hotPools && Array.isArray(hotPools)) {
            const tokens = hotPools.slice(0, limit).map((pool: any) => ({
              address: pool.mainToken.address,
              symbol: pool.mainToken.symbol,
              name: pool.mainToken.name,
              ...pool.mainToken
            }));
            
            const enriched = await enrichWithPoolData(tokens);
            // Sort by volume descending
            const sorted = enriched
              .filter(token => token.volume24h > 0)
              .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
            
            data.data = sorted;
          }
        } catch (e) {
          console.error('[dextools-proxy] Error fetching volume:', e);
          data = { data: [], error: 'Failed to fetch volume tokens' };
        }
        break;

      case 'token_details':
        // Get detailed token information
        const { address } = body;
        if (!address) {
          return new Response(JSON.stringify({ error: 'Missing address parameter' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
        try {
          // Get token info
          const tokenInfo = await fetchDexTools(`/v2/token/solana/${address}`);
          
          // Get token price
          const tokenPrice = await fetchDexTools(`/v2/token/solana/${address}/price`);
          
          // Get token financial info
          const tokenFinancial = await fetchDexTools(`/v2/token/solana/${address}/info`);
          
          // Get token audit
          const tokenAudit = await fetchDexTools(`/v2/token/solana/${address}/audit`);
          
          // Get token score
          const tokenScore = await fetchDexTools(`/v2/token/solana/${address}/score`);
          
          data = {
            ...tokenInfo,
            price: tokenPrice,
            financial: tokenFinancial,
            audit: tokenAudit,
            score: tokenScore
          };
          
        } catch (e) {
          console.error('[dextools-proxy] Error fetching token details:', e);
          data = { error: 'Failed to fetch token details' };
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    console.log(`[dextools-proxy] Returning ${data.data?.length || 0} tokens for ${action}`);

    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (e) {
    console.error('[dextools-proxy] Error:', e);
    return new Response(JSON.stringify({ 
      error: (e as Error).message || 'Internal server error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});