import { useState, useEffect, useCallback, useMemo } from 'react';
import { CryptoPrice } from './useCryptoData';

interface UsePaginatedTokensOptions {
  allTokens: CryptoPrice[];
  pageSize?: number;
  searchQuery?: string;
}

interface UsePaginatedTokensReturn {
  displayedTokens: CryptoPrice[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  totalCount: number;
  displayedCount: number;
  isLoading: boolean;
}

export const usePaginatedTokens = ({
  allTokens,
  pageSize = 30,
  searchQuery = ''
}: UsePaginatedTokensOptions): UsePaginatedTokensReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return allTokens;
    
    const query = searchQuery.toLowerCase();
    return allTokens.filter(token => 
      token.symbol.toLowerCase().includes(query) || 
      token.name.toLowerCase().includes(query)
    );
  }, [allTokens, searchQuery]);

  // Calculate displayed tokens based on current page
  const displayedTokens = useMemo(() => {
    return filteredTokens.slice(0, currentPage * pageSize);
  }, [filteredTokens, currentPage, pageSize]);

  // Check if there are more tokens to load
  const hasMore = useMemo(() => {
    return displayedTokens.length < filteredTokens.length;
  }, [displayedTokens.length, filteredTokens.length]);

  // Load more tokens (next page)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 100);
    }
  }, [hasMore, isLoading]);

  // Reset pagination when search changes
  const reset = useCallback(() => {
    setCurrentPage(1);
    setIsLoading(false);
  }, []);

  // Reset when search query changes
  useEffect(() => {
    reset();
  }, [searchQuery, reset]);

  // Reset when all tokens change (new data loaded)
  useEffect(() => {
    if (allTokens.length > 0 && currentPage > 1) {
      // If we have new data and we're not on first page, reset to first page
      setCurrentPage(1);
    }
  }, [allTokens.length]);

  return {
    displayedTokens,
    hasMore,
    loadMore,
    reset,
    totalCount: filteredTokens.length,
    displayedCount: displayedTokens.length,
    isLoading
  };
};