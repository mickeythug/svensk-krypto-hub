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
}

export interface MemeTokensResult {
  tokens: MemeToken[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Transform DEXScreener API response to our MemeToken interface
function transformDexScreenerToken(token: any): MemeToken {
  const txns24h = (token?.txns?.h24?.buys || 0) + (token?.txns?.h24?.sells || 0);
  
  return {
    address: token?.baseToken?.address || '',
    symbol: token?.baseToken?.symbol || '',
    name: token?.baseToken?.name || '',
    price: parseFloat(token?.priceUsd || '0'),
    priceChange24h: parseFloat(token?.priceChange?.h24 || '0'),
    volume24h: parseFloat(token?.volume?.h24 || '0'),
    marketCap: parseFloat(token?.marketCap || '0'),
    liquidity: parseFloat(token?.liquidity?.usd || '0'),
    holders: token?.info?.holders,
    txns24h: txns24h > 0 ? txns24h : undefined,
    image: token?.info?.imageUrl,
    pairAddress: token?.pairAddress,
    chainId: token?.chainId,
    dexId: token?.dexId,
  };
}

async function fetchMemeTokens(): Promise<MemeToken[]> {
  try {
    console.log('[useMemeTokens] Fetching trending meme tokens...');
    
    // Call the DEXScreener proxy Edge Function with correct parameters
    const { data, error } = await supabase.functions.invoke('dexscreener-proxy', {
      body: {
        action: 'profiles',
        sort: 'trendingScore',
        order: 'desc',
        limit: 50,
        minLiquidity: 1000, // Minimum $1000 liquidity
      },
    });

    if (error) {
      console.error('[useMemeTokens] Supabase function error:', error);
      throw new Error(`DEXScreener proxy error: ${error.message}`);
    }

    if (!data) {
      console.error('[useMemeTokens] No data returned from proxy');
      throw new Error('No data returned from DEXScreener proxy');
    }

    console.log('[useMemeTokens] Raw response:', data);

    // Handle the response structure
    let tokens = [];
    if (Array.isArray(data.data)) {
      tokens = data.data;
    } else if (Array.isArray(data)) {
      tokens = data;
    } else {
      console.error('[useMemeTokens] Unexpected response structure:', data);
      throw new Error('Unexpected response structure from DEXScreener proxy');
    }

    console.log(`[useMemeTokens] Processing ${tokens.length} tokens`);

    // Transform and filter tokens
    const transformedTokens = tokens
      .map(transformDexScreenerToken)
      .filter(token => {
        // Filter out tokens with invalid data
        return token.address && 
               token.symbol && 
               token.price > 0 && 
               token.liquidity > 1000; // Minimum liquidity filter
      })
      .slice(0, 20); // Limit to top 20

    console.log(`[useMemeTokens] Returning ${transformedTokens.length} filtered tokens`);
    return transformedTokens;

  } catch (error) {
    console.error('[useMemeTokens] Error fetching tokens:', error);
    throw error;
  }
}

export function useMemeTokens(): MemeTokensResult {
  const {
    data: tokens = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MemeToken[], Error>({
    queryKey: ['meme-tokens'],
    queryFn: fetchMemeTokens,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount >= 3) return false;
      if (error?.message?.includes('DEXScreener proxy error')) return false;
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
      const { data, error } = await supabase.functions.invoke('dexscreener-proxy', {
        body: {
          action: 'boosted',
        },
      });

      if (error) throw new Error(`DEXScreener proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from DEXScreener proxy');

      const tokens = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      return tokens.map(transformDexScreenerToken).slice(0, 10);
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