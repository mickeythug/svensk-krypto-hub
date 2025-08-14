import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, getCacheStaleOk, setCache } from '@/lib/cache';


export interface MemeToken {
  id: string; // mint address
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  views: string;
  emoji?: string;
  tags: string[];
  isHot: boolean;
  description?: string;
  source?: 'dextools' | 'dexscreener';
  liquidity?: number;
  created?: string;
}

export type MemeCategory = 'trending' | 'new' | 'gainer' | 'volume' | 'newest' | 'potential' | 'all' | 'under1m' | 'gainers' | 'losers' | 'liquidity' | 'liquidity_high' | 'liquidity_low' | 'marketcap' | 'marketcap_high' | 'marketcap_low' | 'txns' | 'boosted';

const preloadImage = (src?: string) =>
  new Promise<boolean>((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

export const useMemeTokens = (category: MemeCategory, limit: number = 20, page: number = 1) => {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Map frontend categories to unified service categories
  const mapCategory = (cat: MemeCategory): string => {
    switch (cat) {
      case 'trending':
      case 'new':
      case 'newest':
        return 'trending';
      case 'gainer':
      case 'gainers':
        return 'gainers';
      case 'losers':
        return 'losers';
      case 'volume':
        return 'volume';
      case 'marketcap':
      case 'marketcap_high':
        return 'marketcap_high';
      case 'marketcap_low':
        return 'marketcap_low';
      case 'liquidity':
      case 'liquidity_high':
        return 'marketcap_high'; // Use marketcap as proxy for liquidity
      case 'liquidity_low':
        return 'marketcap_low';
      case 'potential':
      case 'under1m':
        return 'newest';
      default:
        return 'trending';
    }
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useMemeTokens] Fetching category:', category);
      
      const unifiedCategory = mapCategory(category);
      console.log('[useMemeTokens] Mapped to unified category:', unifiedCategory);
      
      let allTokens: MemeToken[] = [];
      
      // Use unified-meme-data service that combines DEXTools + DEXScreener
      const { data: res, error: supabaseError } = await supabase.functions.invoke('unified-meme-data', {
        body: { 
          category: unifiedCategory,
          limit: 200
        }
      });

      console.log('[useMemeTokens] Unified service response:', { res, supabaseError });

      if (supabaseError) {
        console.error('[useMemeTokens] Supabase error:', supabaseError);
        throw new Error(supabaseError.message || 'Supabase error');
      }

      if (res?.data && Array.isArray(res.data)) {
        console.log('[useMemeTokens] Processing unified data array of length:', res.data.length);
        console.log('[useMemeTokens] Sources:', res.sources);
        
        // Transform unified service response to our format
        allTokens = res.data.map((item: any, index: number) => {
          console.log(`[useMemeTokens] Processing unified item ${index}:`, {
            address: item.address,
            symbol: item.symbol,
            name: item.name,
            source: item.source
          });
          
          return {
            id: item.address || `token-${index}`,
            symbol: item.symbol || `TOK${index}`,
            name: item.name || `Token ${index}`,
            image: item.image || '',
            price: item.price || 0,
            change24h: item.priceChange24h || 0,
            volume24h: item.volume24h || 0,
            marketCap: item.marketCap || 0,
            holders: item.holders || 0,
            views: '0',
            tags: [],
            isHot: (item.priceChange24h || 0) > 10,
            description: '',
            source: item.source,
            liquidity: item.liquidity || 0,
            created: item.created
          };
        });
        
        console.log('[useMemeTokens] Transformed tokens:', allTokens.slice(0, 3));
      } else {
        console.log('[useMemeTokens] No valid data from unified service, using fallback');
        
        // Fallback to dexscreener-proxy for compatibility
        const { data: fallbackRes, error: fallbackError } = await supabase.functions.invoke('dexscreener-proxy', {
          body: { 
            action: 'profiles',
            sort: 'trendingScore',
            order: 'desc',
            chainId: 'solana',
            limit: 200
          }
        });
        
        console.log('[useMemeTokens] Fallback response:', { fallbackRes, fallbackError });

        if (fallbackRes?.data && Array.isArray(fallbackRes.data)) {
          allTokens = fallbackRes.data.slice(0, 200).map((item: any, index: number) => ({
            id: item.tokenAddress || item.address || item.baseToken?.address || `token-${index}`,
            symbol: item.symbol || item.baseToken?.symbol || `TOK${index}`,
            name: item.name || item.baseToken?.name || `Token ${index}`,
            image: item.image || item.icon || '',
            price: parseFloat(item.priceUsd || item.price || '0'),
            change24h: parseFloat(item.priceChange?.h24 || item.priceChange24h || '0'),
            volume24h: parseFloat(item.volume?.h24 || item.volume24h || '0'),
            marketCap: parseFloat(item.marketCap || item.fdv || '0'),
            holders: parseInt(item.holders || '0'),
            views: '0',
            tags: [],
            isHot: false,
            description: '',
            source: 'dexscreener' as const
          }));
        }
      }
      
      console.log('[useMemeTokens] Final tokens count:', allTokens.length);
      
      setTokens(allTokens);
      setHasMore(allTokens.length >= 200 && page < 10); // Max 10 pages
      setLastUpdated(new Date());
      
    } catch (e: any) {
      console.error('[useMemeTokens] Error fetching tokens:', e);
      setError('Kunde inte hämta token data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTokens();
  }, [category]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [category]);

  // Reset page when category changes
  useEffect(() => {
    if (page !== 1) {
      // This will be handled by the parent component
    }
  }, [category]);

  // Pagination logic - show 20 tokens per page
  const indexOfLastToken = page * limit;
  const indexOfFirstToken = indexOfLastToken - limit;
  const currentTokens = tokens.slice(indexOfFirstToken, indexOfLastToken);
  const totalPages = Math.ceil(Math.min(tokens.length, 200) / limit);
  
  return { 
    tokens: currentTokens, 
    loading, 
    error, 
    hasMore: page < totalPages,
    lastUpdated,
    totalPages,
    currentPage: page,
    totalTokens: Math.min(tokens.length, 200)
  };
};