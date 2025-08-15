// Unified Meme Data Edge Function
// Aggregates data from multiple sources and provides a unified API for meme tokens

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache for reducing API calls
const cache = new Map<string, { data: any; expires: number }>();

function setCache(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

function getCache(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

async function fetchWithCache(url: string, ttlMs: number = 30000) {
  const cached = getCache(url);
  if (cached) return cached;
  
  const response = await fetch(url, {
    headers: { "accept": "application/json" }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  setCache(url, data, ttlMs);
  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, category, limit = 20, page = 1 } = await req.json().catch(() => ({}));

    console.log(`[unified-meme-data] Processing request: action=${action}, category=${category}, limit=${limit}, page=${page}`);

    if (action === 'getTokens') {
      // Fetch from dexscreener-proxy with proper parameters
      const dexscreenerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/dexscreener-proxy`;
      
      const requestBody = {
        action: 'profiles',
        sort: 'trendingScore',
        order: 'desc',
        chainId: 'solana',
        limit: Math.min(limit * 2, 200) // Get more data for better filtering
      };

      console.log(`[unified-meme-data] Calling dexscreener-proxy with:`, requestBody);

      const dexscreenerResponse = await fetch(dexscreenerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!dexscreenerResponse.ok) {
        console.error(`[unified-meme-data] Dexscreener proxy failed: ${dexscreenerResponse.status}`);
        
        // Fallback to hardcoded popular tokens
        const fallbackTokens = [
          {
            id: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            price: 100,
            change24h: 5.2,
            volume24h: 500000000,
            marketCap: 45000000000,
            holders: 2500000,
            views: '10M',
            tags: ['Layer 1'],
            isHot: true,
            description: 'Solana native token'
          },
          {
            id: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            symbol: 'POPCAT',
            name: 'Popcat',
            image: '',
            price: 1.25,
            change24h: 12.5,
            volume24h: 25000000,
            marketCap: 1250000000,
            holders: 45000,
            views: '2.5M',
            tags: ['Meme'],
            isHot: true,
            description: 'Popular cat meme token'
          },
          {
            id: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
            symbol: 'BONK',
            name: 'Bonk',
            image: '',
            price: 0.00003,
            change24h: 8.7,
            volume24h: 15000000,
            marketCap: 2100000000,
            holders: 75000,
            views: '3M',
            tags: ['Meme', 'Dog'],
            isHot: true,
            description: 'The first Solana dog coin for the people'
          }
        ];

        console.log(`[unified-meme-data] Using fallback tokens: ${fallbackTokens.length} tokens`);
        
        return new Response(JSON.stringify({
          data: fallbackTokens,
          source: 'fallback',
          total: fallbackTokens.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const dexscreenerData = await dexscreenerResponse.json();
      console.log(`[unified-meme-data] Dexscreener response:`, JSON.stringify(dexscreenerData).substring(0, 500));

      // Transform dexscreener data to our unified format
      const tokens = Array.isArray(dexscreenerData.data) ? dexscreenerData.data : [];
      
      const transformedTokens = tokens.slice(0, limit).map((token: any, index: number) => {
        return {
          id: token.baseToken?.address || token.address || token.tokenAddress || `token-${index}`,
          symbol: token.baseToken?.symbol || token.symbol || `TOK${index}`,
          name: token.baseToken?.name || token.name || `Token ${index}`,
          image: token.info?.imageUrl || token.image || token.icon || '',
          price: parseFloat(token.priceUsd || token.price || '0'),
          change24h: parseFloat(token.priceChange?.h24 || token.priceChange24h || token.change24h || '0'),
          volume24h: parseFloat(token.volume?.h24 || token.volume24h || '0'),
          marketCap: parseFloat(token.marketCap || token.fdv || '0'),
          holders: parseInt(token.holders || '0'),
          views: token.views || '0',
          tags: token.tags || [],
          isHot: token.isHot || Math.random() > 0.7, // Add some randomness for demo
          description: token.description || ''
        };
      });

      console.log(`[unified-meme-data] Transformed ${transformedTokens.length} tokens`);

      return new Response(JSON.stringify({
        data: transformedTokens,
        source: 'dexscreener',
        total: transformedTokens.length,
        hasMore: tokens.length > limit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default response for unknown actions
    return new Response(JSON.stringify({
      error: 'Unknown action',
      availableActions: ['getTokens']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[unified-meme-data] Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});