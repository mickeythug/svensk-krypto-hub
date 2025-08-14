import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  image?: string;
  logo?: string;
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
  console.log('[unified-meme-data] 🚀 FUNCTION CALLED - DEBUGGING IMAGE EXTRACTION');
  
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
    const body = await req.json().catch(() => ({}));
    const { category, limit = 50 }: UnifiedRequest = body;

    console.log(`[unified-meme-data] 📊 Fetching ${category} data from both sources (limit: ${limit})`);

    // Get current Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[unified-meme-data] Missing Supabase environment variables');
      throw new Error('Missing Supabase configuration');
    }

    // Fetch data from both sources in parallel
    const [dextoolsResponse, dexscreenerResponse] = await Promise.allSettled([
      fetch(`${supabaseUrl}/functions/v1/dextools-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ category, limit }),
      }),
      fetch(`${supabaseUrl}/functions/v1/dexscreener-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(getDexscreenerParams(category, limit)),
      }),
    ]);

    console.log('[unified-meme-data] API calls completed');

    // Process DEXTools data
    let dextoolsData: TokenData[] = [];
    if (dextoolsResponse.status === 'fulfilled' && dextoolsResponse.value.ok) {
      const dextoolsResult = await dextoolsResponse.value.json();
      console.log('[unified-meme-data] 🔧 DEXTools RAW response:', JSON.stringify(dextoolsResult, null, 2));
      
      dextoolsData = (dextoolsResult.data || []).map((token: any, index: number) => {
        console.log(`[unified-meme-data] 🔧 DEXTools token ${index} RAW:`, JSON.stringify(token, null, 2));
        
        return {
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          image: token.image || token.logo || '',
          logo: token.logo || token.image || '',
          price: token.price,
          priceChange24h: token.priceChange24h,
          marketCap: token.marketCap,
          volume24h: token.volume24h,
          liquidity: token.liquidity,
          holders: token.holders,
          created: token.created,
          source: 'dextools' as const,
        };
      });
    } else {
      console.warn('[unified-meme-data] DEXTools request failed:', dextoolsResponse);
    }

    // Process DEXScreener data
    let dexscreenerData: TokenData[] = [];
    if (dexscreenerResponse.status === 'fulfilled' && dexscreenerResponse.value.ok) {
      const dexscreenerResult = await dexscreenerResponse.value.json();
      console.log('[unified-meme-data] 🖼️ DEXScreener RAW response:', JSON.stringify(dexscreenerResult, null, 2));
      
      dexscreenerData = (dexscreenerResult.data || []).map((token: any, index: number) => {
        console.log(`[unified-meme-data] 🖼️ DEXScreener token ${index} RAW:`, JSON.stringify(token, null, 2));
        
        // Log all possible image fields we can find
        console.log(`[unified-meme-data] 🖼️ DEXScreener token ${index} IMAGE FIELDS:`, {
          'info.imageUrl': token.info?.imageUrl,
          'baseToken.image': token.baseToken?.image,
          'image': token.image,
          'logo': token.logo,
          'icon': token.icon,
          'logoURI': token.logoURI,
          'info.image': token.info?.image,
          'baseToken.logo': token.baseToken?.logo,
          'profile.imageUrl': token.profile?.imageUrl,
          'profile.image': token.profile?.image
        });

        const image = token.info?.imageUrl || 
                     token.baseToken?.image ||
                     token.image || 
                     token.logo ||
                     token.icon ||
                     token.logoURI ||
                     token.info?.image ||
                     token.baseToken?.logo ||
                     token.profile?.imageUrl ||
                     token.profile?.image ||
                     '';

        return {
          address: token.baseToken?.address || token.address || token.tokenAddress,
          name: token.baseToken?.name || token.name,
          symbol: token.baseToken?.symbol || token.symbol,
          image: image,
          logo: image,
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
        };
      });
    } else {
      console.warn('[unified-meme-data] DEXScreener request failed:', dexscreenerResponse);
    }

    console.log(`[unified-meme-data] 📈 DEXTools: ${dextoolsData.length} tokens, DEXScreener: ${dexscreenerData.length} tokens`);

    // Deduplicate tokens by address
    const addressMap = new Map<string, TokenData>();
    
    // Add DEXScreener data first
    dexscreenerData.forEach(token => {
      if (token.address && !addressMap.has(token.address)) {
        console.log(`[unified-meme-data] ➕ Adding DEXScreener token: ${token.symbol} with image: ${token.image}`);
        addressMap.set(token.address, token);
      }
    });

    // Add DEXTools data
    dextoolsData.forEach(token => {
      if (token.address) {
        const existing = addressMap.get(token.address);
        if (existing) {
          const bestImage = token.image || existing.image || '';
          const mergedToken = {
            ...token,
            image: bestImage,
            logo: bestImage,
          };
          console.log(`[unified-meme-data] 🔄 Merging token: ${token.symbol} - Final image: ${bestImage}`);
          addressMap.set(token.address, mergedToken);
        } else {
          console.log(`[unified-meme-data] ➕ Adding DEXTools token: ${token.symbol} with image: ${token.image}`);
          addressMap.set(token.address, token);
        }
      }
    });

    let combinedData = Array.from(addressMap.values());

    // Filter out tokens without essential data
    combinedData = combinedData.filter(token => 
      token.address && 
      token.symbol && 
      token.name
    );

    // Count image statistics
    const tokensWithImages = combinedData.filter(token => token.image && token.image.length > 0);
    const tokensWithoutImages = combinedData.filter(token => !token.image || token.image.length === 0);
    
    console.log(`[unified-meme-data] 🎨 IMAGE STATS: ${tokensWithImages.length}/${combinedData.length} tokens have images (${Math.round(tokensWithImages.length/combinedData.length*100)}%)`);
    console.log(`[unified-meme-data] ❌ TOKENS WITHOUT IMAGES:`, tokensWithoutImages.map(t => ({ symbol: t.symbol, source: t.source })));

    // Sort based on category
    combinedData = sortTokensByCategory(combinedData, category);

    // Limit results
    combinedData = combinedData.slice(0, limit);

    console.log(`[unified-meme-data] ✅ Returning ${combinedData.length} deduplicated tokens for ${category}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: combinedData,
        sources: {
          dextools: dextoolsData.length,
          dexscreener: dexscreenerData.length,
          combined: combinedData.length,
          withImages: combinedData.filter(t => t.image && t.image.length > 0).length,
        },
        category: category,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('[unified-meme-data] ❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
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