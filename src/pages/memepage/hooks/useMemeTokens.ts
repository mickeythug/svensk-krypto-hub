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
  
  // Direct API endpoints for each category
  const endpoints = {
    trending: 'https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=trendingScore',
    new: 'https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=createdAt',
    gainer: 'https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=priceChange',
    volume: 'https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=volume',
    // Fallback to existing endpoints for other categories
    newest: 'meme-catalog',
    potential: 'meme-catalog',
    all: 'meme-catalog',
    under1m: 'meme-catalog',
    gainers: 'meme-catalog',
    losers: 'meme-catalog',
    liquidity: 'meme-catalog',
    liquidity_high: 'meme-catalog',
    liquidity_low: 'meme-catalog',
    marketcap: 'meme-catalog',
    marketcap_high: 'meme-catalog',
    marketcap_low: 'meme-catalog',
    txns: 'meme-catalog',
    boosted: 'meme-catalog'
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = endpoints[category];
      let allTokens: MemeToken[] = [];
      
      if (endpoint === 'meme-catalog') {
        // Use existing backend for other categories
        const backendCategory = (
          category === 'marketcap' ? 'marketcap_high' :
          category === 'liquidity' ? 'liquidity_high' :
          category === 'potential' ? 'newest' :
          category === 'gainers' ? 'gainers' :
          category
        ) as any;

        const { data: res } = await supabase.functions.invoke('meme-catalog', {
          body: { category: backendCategory, page: 1, pageSize: 200 }
        });

        allTokens = Array.isArray(res?.items) ? (res.items as MemeToken[]) : [];
      } else {
        // Direct API call for main categories
        const response = await fetch(endpoint);
        const data = await response.json();
        
        // Transform dexscreener data to our format
        allTokens = (data?.data || []).slice(0, 200).map((item: any) => ({
          id: item.tokenAddress || item.address || '',
          symbol: item.token?.symbol || item.symbol || '',
          name: item.token?.name || item.name || '',
          image: item.token?.image || item.image || item.icon || '',
          price: parseFloat(item.priceUsd || item.price || '0'),
          change24h: parseFloat(item.priceChange?.h24 || item.priceChange24h || '0'),
          volume24h: parseFloat(item.volume?.h24 || item.volume24h || '0'),
          marketCap: parseFloat(item.marketCap || '0'),
          holders: parseInt(item.holders || '0'),
          views: '0',
          tags: [],
          isHot: false
        }));
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
