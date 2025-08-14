import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';

export interface MemeToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders?: number;
  txns24h?: number;
  image?: string;
  pairAddress?: string;
  chainId?: string;
  dexId?: string;
  source?: 'dextools' | 'dexscreener';
  created?: string;
}

export interface MemeTokensResult {
  tokens: MemeToken[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Transform unified service response to our MemeToken interface
function transformUnifiedToken(token: any): MemeToken {
  return {
    address: token?.address || '',
    symbol: token?.symbol || '',
    name: token?.name || '',
    price: parseFloat(token?.price || '0'),
    priceChange24h: parseFloat(token?.priceChange24h || '0'),
    volume24h: parseFloat(token?.volume24h || '0'),
    marketCap: parseFloat(token?.marketCap || '0'),
    liquidity: parseFloat(token?.liquidity || '0'),
    holders: token?.holders,
    txns24h: undefined,
    image: token?.image || token?.logo || '',
    pairAddress: token?.pairAddress,
    chainId: 'solana',
    dexId: 'dexscreener',
    source: token?.source || 'unknown',
    created: token?.created,
  };
}

async function fetchMemeTokens(category: string = 'trending'): Promise<MemeToken[]> {
  try {
    console.log(`[useMemeTokens] Fetching ${category} tokens from unified service...`);
    
    // Call the unified data service that combines DEXTools + DEXScreener
    const { data, error } = await supabase.functions.invoke('unified-meme-data', {
      body: {
        category: category,
        limit: 50,
      },
    });

    if (error) {
      console.error('[useMemeTokens] Unified service error:', error);
      throw new Error(`Unified service error: ${error.message}`);
    }

    if (!data) {
      console.error('[useMemeTokens] No data returned from unified service');
      throw new Error('No data returned from unified service');
    }

    console.log('[useMemeTokens] Unified service response:', data);

    // Handle the response structure
    let tokens = [];
    if (Array.isArray(data.data)) {
      tokens = data.data;
    } else if (Array.isArray(data)) {
      tokens = data;
    } else {
      console.error('[useMemeTokens] Unexpected response structure:', data);
      throw new Error('Unexpected response structure from unified service');
    }

    console.log(`[useMemeTokens] Processing ${tokens.length} tokens from sources:`, data.sources);

    // Transform and filter tokens
    const transformedTokens = tokens
      .map(transformUnifiedToken)
      .filter(token => {
        // Filter out tokens with invalid data
        return token.address && 
               token.symbol && 
               token.name &&
               token.price >= 0; // Allow 0 price but not negative
      })
      .slice(0, 20); // Limit to top 20

    console.log(`[useMemeTokens] Returning ${transformedTokens.length} filtered tokens`);
    return transformedTokens;

  } catch (error) {
    console.error('[useMemeTokens] Error fetching tokens:', error);
    
    // Fallback to dexscreener-proxy if unified service fails
    try {
      console.log('[useMemeTokens] Trying fallback to dexscreener-proxy...');
      
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('dexscreener-proxy', {
        body: {
          action: 'profiles',
          sort: 'trendingScore',
          order: 'desc',
          limit: 50,
          minLiquidity: 1000,
        },
      });

      if (fallbackError || !fallbackData) {
        throw error; // Throw original error if fallback also fails
      }

      const fallbackTokens = Array.isArray(fallbackData.data) ? fallbackData.data : [];
      return fallbackTokens.map((token: any) => ({
        address: token?.baseToken?.address || token?.tokenAddress || '',
        symbol: token?.baseToken?.symbol || token?.symbol || '',
        name: token?.baseToken?.name || token?.name || '',
        price: parseFloat(token?.priceUsd || token?.price || '0'),
        priceChange24h: parseFloat(token?.priceChange?.h24 || token?.priceChange24h || '0'),
        volume24h: parseFloat(token?.volume?.h24 || token?.volume24h || '0'),
        marketCap: parseFloat(token?.marketCap || token?.fdv || '0'),
        liquidity: parseFloat(token?.liquidity?.usd || token?.liquidity || '0'),
        holders: token?.holders,
        image: token?.info?.imageUrl || token?.image || token?.logo || token?.icon || '',
        source: 'dexscreener' as const,
      })).filter(token => token.address && token.symbol).slice(0, 20);
      
    } catch (fallbackError) {
      console.error('[useMemeTokens] Fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

export function useMemeTokens(category: string = 'trending'): MemeTokensResult {
  const {
    data: tokens = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MemeToken[], Error>({
    queryKey: ['meme-tokens', category],
    queryFn: () => fetchMemeTokens(category),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount >= 3) return false;
      if (error?.message?.includes('Unified service error')) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    tokens,
    isLoading,
    error: error?.message || null,
    refetch,
  };
}

// Additional hook for getting boosted tokens
export function useBoostedMemeTokens(): MemeTokensResult {
  const {
    data: tokens = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MemeToken[], Error>({
    queryKey: ['boosted-meme-tokens'],
    queryFn: async () => {
      // Try unified service first for trending tokens as boost proxy
      try {
        const tokens = await fetchMemeTokens('trending');
        return tokens.slice(0, 10);
      } catch {
        // Fallback to dexscreener boosted endpoint
        const { data, error } = await supabase.functions.invoke('dexscreener-proxy', {
          body: {
            action: 'boosted',
          },
        });

        if (error) throw new Error(`DEXScreener proxy error: ${error.message}`);
        if (!data) throw new Error('No data returned from DEXScreener proxy');

        const tokens = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        return tokens.map((token: any) => ({
          address: token?.baseToken?.address || '',
          symbol: token?.baseToken?.symbol || '',
          name: token?.baseToken?.name || '',
          price: parseFloat(token?.priceUsd || '0'),
          priceChange24h: parseFloat(token?.priceChange?.h24 || '0'),
          volume24h: parseFloat(token?.volume?.h24 || '0'),
          marketCap: parseFloat(token?.marketCap || '0'),
          liquidity: parseFloat(token?.liquidity?.usd || '0'),
          image: token?.info?.imageUrl || token?.image || token?.logo || token?.icon || '',
          source: 'dexscreener' as const,
        })).slice(0, 10);
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  return {
    tokens,
    isLoading,
    error: error?.message || null,
    refetch,
  };
}