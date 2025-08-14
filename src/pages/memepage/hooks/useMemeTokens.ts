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
  
  // DexScreener proxy actions for each category
  const dexscreenerActions = {
    trending: 'profiles',
    new: 'profiles', 
    gainer: 'profiles',
    volume: 'profiles',
    newest: 'profiles',
    potential: 'profiles',
    all: 'pairsList',
    under1m: 'pairsList',
    gainers: 'profiles',
    losers: 'profiles',
    liquidity: 'pairsList',
    liquidity_high: 'pairsList',
    liquidity_low: 'pairsList',
    marketcap: 'pairsList',
    marketcap_high: 'pairsList',
    marketcap_low: 'pairsList',
    txns: 'profiles',
    boosted: 'boosted'
  };

  // Sort parameters for each category
  const sortParams = {
    trending: { sort: 'trendingScore', order: 'desc' },
    new: { sort: 'createdAt', order: 'desc' },
    gainer: { sort: 'priceChange', order: 'desc' },
    volume: { sort: 'volume', order: 'desc' },
    newest: { sort: 'createdAt', order: 'desc' },
    potential: { sort: 'createdAt', order: 'desc' },
    all: { sort: 'volume', order: 'desc' },
    under1m: { sort: 'volume', order: 'desc' },
    gainers: { sort: 'priceChange', order: 'desc' },
    losers: { sort: 'priceChange', order: 'asc' },
    liquidity: { sort: 'liquidity', order: 'desc' },
    liquidity_high: { sort: 'liquidity', order: 'desc' },
    liquidity_low: { sort: 'liquidity', order: 'asc' },
    marketcap: { sort: 'marketCap', order: 'desc' },
    marketcap_high: { sort: 'marketCap', order: 'desc' },
    marketcap_low: { sort: 'marketCap', order: 'asc' },
    txns: { sort: 'txns', order: 'desc' },
    boosted: { sort: 'trendingScore', order: 'desc' }
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const action = dexscreenerActions[category];
      const sortParam = sortParams[category];
      let allTokens: MemeToken[] = [];
      
      // Use dexscreener-proxy for all categories
      const { data: res } = await supabase.functions.invoke('dexscreener-proxy', {
        body: { 
          action,
          ...sortParam,
          chainId: 'solana',
          limit: 200
        }
      });

      if (res?.data && Array.isArray(res.data)) {
        // Transform dexscreener proxy response to our format
        allTokens = res.data.slice(0, 200).map((item: any) => ({
          id: item.tokenAddress || item.address || item.id || '',
          symbol: item.token?.symbol || item.symbol || '',
          name: item.token?.name || item.name || '',
          image: item.token?.image || item.image || item.icon || '',
          price: parseFloat(item.priceUsd || item.price || '0'),
          change24h: parseFloat(item.priceChange?.h24 || item.priceChange24h || item.change24h || '0'),
          volume24h: parseFloat(item.volume?.h24 || item.volume24h || '0'),
          marketCap: parseFloat(item.marketCap || item.fdv || '0'),
          holders: parseInt(item.holders || '0'),
          views: item.views || '0',
          tags: item.tags || [],
          isHot: item.isHot || false,
          description: item.description || ''
        }));
      } else {
        // Fallback to meme-catalog for compatibility
        const backendCategory = (
          category === 'marketcap' ? 'marketcap_high' :
          category === 'liquidity' ? 'liquidity_high' :
          category === 'potential' ? 'newest' :
          category === 'gainers' ? 'gainers' :
          category
        ) as any;

        const { data: fallbackRes } = await supabase.functions.invoke('meme-catalog', {
          body: { category: backendCategory, page: 1, pageSize: 200 }
        });

        allTokens = Array.isArray(fallbackRes?.items) ? (fallbackRes.items as MemeToken[]) : [];
      }
      
      setTokens(allTokens);
      setHasMore(allTokens.length >= 200 && page < 10); // Max 10 pages
      setLastUpdated(new Date());
      
    } catch (e: any) {
      console.error('Error fetching tokens:', e);
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
  const totalPages = Math.ceil(200 / limit); // Always 10 pages (200 tokens / 20 per page)
  
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
