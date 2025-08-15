import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // pixels from bottom to trigger load
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollOptions) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollElementRef.current || isLoading || !hasMore) return;

    const element = scrollElementRef.current;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    // Check if we're near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  // Set up scroll listener
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Intersection Observer as backup for more reliable detection
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: scrollElementRef.current,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return {
    scrollElementRef,
    sentinelRef
  };
};