import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const unifiedCategory = mapCategory(category);
      console.log(`[useMemeTokens] 🚀 UNIFIED SERVICE CALL - Category: ${category} -> ${unifiedCategory}`);
      
      let allTokens: MemeToken[] = [];
      
      // ONLY use unified-meme-data service that combines DEXTools + DEXScreener
      const { data: res, error: supabaseError } = await supabase.functions.invoke('unified-meme-data', {
        body: { 
          category: unifiedCategory,
          limit: 200
        }
      });

      console.log('[useMemeTokens] 📊 Unified service response:', { 
        success: res?.success, 
        error: supabaseError,
        dataLength: res?.data?.length,
        sources: res?.sources 
      });

      if (supabaseError) {
        console.error('[useMemeTokens] Supabase error:', supabaseError);
        throw new Error(supabaseError.message || 'Supabase error');
      }

      if (!res?.success) {
        console.error('[useMemeTokens] Unified service returned error:', res?.error);
        throw new Error(res?.error || 'Unified service error');
      }

      if (res?.data && Array.isArray(res.data)) {
        console.log(`[useMemeTokens] ✅ Processing unified data: ${res.data.length} tokens from sources:`, res.sources);
        
        // Transform unified service response to our format
        allTokens = res.data.map((item: any, index: number) => {
          console.log(`[useMemeTokens] Processing token ${index + 1}:`, {
            address: item.address,
            symbol: item.symbol,
            name: item.name,
            source: item.source,
            price: item.price,
            marketCap: item.marketCap
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
        
        console.log(`[useMemeTokens] 🎯 Transformed ${allTokens.length} tokens successfully`);
      } else {
        console.warn('[useMemeTokens] ⚠️ No valid data from unified service');
        throw new Error('No data returned from unified service');
      }
      
      console.log(`[useMemeTokens] 📈 Final tokens count: ${allTokens.length}`);
      
      setTokens(allTokens);
      setHasMore(allTokens.length >= 200 && page < 10); // Max 10 pages
      setLastUpdated(new Date());
      
    } catch (e: any) {
      console.error('[useMemeTokens] ❌ Error fetching tokens:', e);
      setError('Kunde inte hämta token data från unified service');
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

  // Pagination logic - show tokens per page
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