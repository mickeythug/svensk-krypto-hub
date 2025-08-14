import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  holders?: number;
  created?: string;
  source: 'dextools' | 'dexscreener';
  pairAddress?: string;
  baseToken?: {
    address: string;
    symbol: string;
  };
  quoteToken?: {
    address: string;
    symbol: string;
  };
}

interface UnifiedRequest {
  category: 'trending' | 'gainers' | 'losers' | 'newest' | 'marketcap_high' | 'marketcap_low' | 'volume';
  limit?: number;
}

Deno.serve(async (req: Request) => {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { category, limit = 50 }: UnifiedRequest = body;

    console.log(`[unified-meme-data] Fetching ${category} data from both sources`);

    // Fetch data from both sources in parallel
    const [dextoolsResponse, dexscreenerResponse] = await Promise.allSettled([
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/dextools-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ category, limit }),
      }),
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/dexscreener-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify(getDexscreenerParams(category, limit)),
      }),
    ]);

    // Process DEXTools data
    let dextoolsData: TokenData[] = [];
    if (dextoolsResponse.status === 'fulfilled' && dextoolsResponse.value.ok) {
      const dextoolsResult = await dextoolsResponse.value.json();
      dextoolsData = (dextoolsResult.data || []).map((token: any) => ({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        price: token.price,
        priceChange24h: token.priceChange24h,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        liquidity: token.liquidity,
        holders: token.holders,
        created: token.created,
        source: 'dextools' as const,
      }));
    } else {
      console.warn('[unified-meme-data] DEXTools request failed:', dextoolsResponse);
    }

    // Process DEXScreener data
    let dexscreenerData: TokenData[] = [];
    if (dexscreenerResponse.status === 'fulfilled' && dexscreenerResponse.value.ok) {
      const dexscreenerResult = await dexscreenerResponse.value.json();
      dexscreenerData = (dexscreenerResult.data || []).map((token: any) => ({
        address: token.baseToken?.address || token.address,
        name: token.baseToken?.name || token.name,
        symbol: token.baseToken?.symbol || token.symbol,
        price: parseFloat(token.priceUsd || token.price || '0'),
        priceChange24h: parseFloat(token.priceChange?.h24 || token.priceChange24h || '0'),
        marketCap: token.marketCap || token.fdv,
        volume24h: token.volume?.h24 || token.volume24h,
        liquidity: token.liquidity?.usd || token.liquidity,
        pairAddress: token.pairAddress,
        baseToken: token.baseToken,
        quoteToken: token.quoteToken,
        created: token.pairCreatedAt || token.created,
        source: 'dexscreener' as const,
      }));
    } else {
      console.warn('[unified-meme-data] DEXScreener request failed:', dexscreenerResponse);
    }

    console.log(`[unified-meme-data] DEXTools: ${dextoolsData.length} tokens, DEXScreener: ${dexscreenerData.length} tokens`);

    // Deduplicate tokens by address (prefer DEXTools data as it's more detailed)
    const addressMap = new Map<string, TokenData>();
    
    // Add DEXScreener data first
    dexscreenerData.forEach(token => {
      if (token.address && !addressMap.has(token.address)) {
        addressMap.set(token.address, token);
      }
    });

    // Add DEXTools data, overwriting DEXScreener data for same addresses
    dextoolsData.forEach(token => {
      if (token.address) {
        addressMap.set(token.address, token);
      }
    });

    let combinedData = Array.from(addressMap.values());

    // Sort based on category
    combinedData = sortTokensByCategory(combinedData, category);

    // Limit results
    combinedData = combinedData.slice(0, limit);

    console.log(`[unified-meme-data] Returning ${combinedData.length} deduplicated tokens for ${category}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: combinedData,
        sources: {
          dextools: dextoolsData.length,
          dexscreener: dexscreenerData.length,
          combined: combinedData.length,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('[unified-meme-data] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function getDexscreenerParams(category: string, limit: number) {
  switch (category) {
    case 'trending':
      return {
        action: 'profiles',
        sort: 'trendingScore',
        order: 'desc',
        limit,
        minLiquidity: 1000,
      };
    case 'gainers':
      return {
        action: 'profiles',
        sort: 'priceChange24h',
        order: 'desc',
        limit,
        minLiquidity: 1000,
      };
    case 'volume':
      return {
        action: 'profiles',
        sort: 'volume24h',
        order: 'desc',
        limit,
        minLiquidity: 1000,
      };
    case 'newest':
      return {
        action: 'profiles',
        sort: 'pairCreatedAt',
        order: 'desc',
        limit,
        minLiquidity: 1000,
      };
    case 'marketcap_high':
      return {
        action: 'search',
        sort: 'marketCap',
        order: 'desc',
        limit,
        minLiquidity: 10000,
      };
    case 'marketcap_low':
      return {
        action: 'search',
        sort: 'marketCap',
        order: 'asc',
        limit,
        minLiquidity: 1000,
      };
    default:
      return {
        action: 'profiles',
        sort: 'trendingScore',
        order: 'desc',
        limit,
        minLiquidity: 1000,
      };
  }
}

function sortTokensByCategory(tokens: TokenData[], category: string): TokenData[] {
  switch (category) {
    case 'trending':
      // Sort by a combination of volume and price change
      return tokens.sort((a, b) => {
        const scoreA = (a.volume24h || 0) * Math.max(1 + (a.priceChange24h || 0) / 100, 0.1);
        const scoreB = (b.volume24h || 0) * Math.max(1 + (b.priceChange24h || 0) / 100, 0.1);
        return scoreB - scoreA;
      });
    case 'gainers':
      return tokens.sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0));
    case 'losers':
      return tokens.sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0));
    case 'volume':
      return tokens.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    case 'marketcap_high':
      return tokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    case 'marketcap_low':
      return tokens.sort((a, b) => (a.marketCap || 0) - (b.marketCap || 0));
    case 'newest':
      return tokens.sort((a, b) => {
        const timeA = new Date(a.created || '1970-01-01').getTime();
        const timeB = new Date(b.created || '1970-01-01').getTime();
        return timeB - timeA;
      });
    default:
      return tokens;
  }
}