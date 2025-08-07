import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change1h?: number;
  change7d?: number;
  marketCap?: string;
  volume?: string;
  supply?: string;
  rank?: number;
  lastUpdated?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Avancerad memory cache med TTL och LRU
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder = new Map<string, number>();
  private maxSize = 100;
  private accessCounter = 0;

  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttlMs
    };

    // LRU eviction om cache är full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessOrder.delete(oldestKey);
      }
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Uppdatera access order för LRU
    this.accessOrder.set(key, ++this.accessCounter);
    return entry.data;
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new MemoryCache();

// Background refresh med exponential backoff
class BackgroundRefresher {
  private intervals = new Map<string, NodeJS.Timeout>();
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  start(key: string, fetchFn: () => Promise<void>, intervalMs: number): void {
    this.stop(key);
    
    const refresh = async () => {
      try {
        await fetchFn();
        this.retryAttempts.set(key, 0); // Reset på success
      } catch (error) {
        const attempts = (this.retryAttempts.get(key) || 0) + 1;
        this.retryAttempts.set(key, attempts);
        
        if (attempts < this.maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
          setTimeout(refresh, delay);
        }
      }
    };

    const interval = setInterval(refresh, intervalMs);
    this.intervals.set(key, interval);
  }

  stop(key: string): void {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
    }
  }

  stopAll(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.retryAttempts.clear();
  }
}

const backgroundRefresher = new BackgroundRefresher();

// Rate limiter med token bucket
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    // Vänta tills nästa token finns tillgänglig
    const waitTime = (1 / this.refillRate) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// API rate limiter - 10 requests per second
const apiRateLimiter = new RateLimiter(10, 2);

// CoinGecko coin data med optimerad struktur
const COIN_DATA = Object.freeze({
  'bitcoin': { name: 'Bitcoin', symbol: 'BTC', rank: 1 },
  'ethereum': { name: 'Ethereum', symbol: 'ETH', rank: 2 },
  'binancecoin': { name: 'Binance Coin', symbol: 'BNB', rank: 3 },
  'ripple': { name: 'XRP', symbol: 'XRP', rank: 4 },
  'cardano': { name: 'Cardano', symbol: 'ADA', rank: 5 },
  'solana': { name: 'Solana', symbol: 'SOL', rank: 6 },
  'polkadot': { name: 'Polkadot', symbol: 'DOT', rank: 7 },
  'avalanche-2': { name: 'Avalanche', symbol: 'AVAX', rank: 8 },
  'chainlink': { name: 'Chainlink', symbol: 'LINK', rank: 9 },
  'matic-network': { name: 'Polygon', symbol: 'MATIC', rank: 10 },
  'uniswap': { name: 'Uniswap', symbol: 'UNI', rank: 11 },
  'litecoin': { name: 'Litecoin', symbol: 'LTC', rank: 12 },
  'dogecoin': { name: 'Dogecoin', symbol: 'DOGE', rank: 13 },
  'shiba-inu': { name: 'Shiba Inu', symbol: 'SHIB', rank: 14 }
} as const);

// Cache keys
const CACHE_KEYS = Object.freeze({
  CRYPTO_PRICES: 'crypto-prices',
  CRYPTO_METADATA: 'crypto-metadata'
} as const);

// Cache durations
const CACHE_DURATIONS = Object.freeze({
  CRYPTO_PRICES: 60000, // 1 minut för priser
  CRYPTO_METADATA: 3600000, // 1 timme för metadata
  BACKGROUND_REFRESH: 30000, // 30s background refresh
  STALE_WHILE_REVALIDATE: 180000 // 3 minuter stale
} as const);

// Optimized formatter functions med memoization
const formatters = {
  marketCap: (() => {
    const cache = new Map<number, string>();
    return (marketCap: number): string => {
      if (cache.has(marketCap)) return cache.get(marketCap)!;
      
      let result: string;
      if (marketCap >= 1e12) {
        result = `${(marketCap / 1e12).toFixed(1)}T`;
      } else if (marketCap >= 1e9) {
        result = `${(marketCap / 1e9).toFixed(1)}B`;
      } else if (marketCap >= 1e6) {
        result = `${(marketCap / 1e6).toFixed(1)}M`;
      } else {
        result = marketCap.toString();
      }
      
      cache.set(marketCap, result);
      return result;
    };
  })(),

  volume: (() => {
    const cache = new Map<number, string>();
    return (volume: number): string => {
      if (cache.has(volume)) return cache.get(volume)!;
      
      let result: string;
      if (volume >= 1e9) {
        result = `${(volume / 1e9).toFixed(1)}B`;
      } else if (volume >= 1e6) {
        result = `${(volume / 1e6).toFixed(1)}M`;
      } else {
        result = volume.toString();
      }
      
      cache.set(volume, result);
      return result;
    };
  })()
};

// Optimerad API fetching med retry och circuit breaker
class CryptoAPIClient {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly circuitBreakerThreshold = 3;
  private readonly circuitBreakerTimeout = 30000; // 30s

  async fetchCryptoPrices(): Promise<CryptoPrice[]> {
    // Circuit breaker check
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open - too many recent failures');
    }

    try {
      await apiRateLimiter.acquire();

      const coinIds = Object.keys(COIN_DATA);
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true&include_market_cap=true&include_24hr_vol=true`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Reset circuit breaker på success
      this.failureCount = 0;
      
      return this.transformAPIResponse(data);
      
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private transformAPIResponse(data: any): CryptoPrice[] {
    const coinIds = Object.keys(COIN_DATA);
    
    return coinIds.map(coinId => {
      const coinPrice = data[coinId];
      if (!coinPrice) return null;

      const info = COIN_DATA[coinId as keyof typeof COIN_DATA];
      return {
        symbol: info.symbol,
        name: info.name,
        price: coinPrice.usd,
        change24h: coinPrice.usd_24h_change || 0,
        marketCap: formatters.marketCap(coinPrice.usd_market_cap || 0),
        volume: formatters.volume(coinPrice.usd_24h_vol || 0),
        rank: info.rank,
        lastUpdated: new Date(coinPrice.last_updated_at * 1000).toISOString()
      };
    }).filter(Boolean) as CryptoPrice[];
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private isCircuitOpen(): boolean {
    if (this.failureCount < this.circuitBreakerThreshold) return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure < this.circuitBreakerTimeout;
  }
}

const apiClient = new CryptoAPIClient();

// High-performance crypto data hook
export const useCryptoData = () => {
  const queryClient = useQueryClient();
  const refreshTimer = useRef<NodeJS.Timeout>();

  // React Query för avancerad caching och background updates
  const {
    data: cryptoPrices = [] as CryptoPrice[],
    isLoading,
    error,
    isStale
  } = useQuery<CryptoPrice[], Error>({
    queryKey: [CACHE_KEYS.CRYPTO_PRICES],
    queryFn: apiClient.fetchCryptoPrices.bind(apiClient),
    staleTime: CACHE_DURATIONS.CRYPTO_PRICES,
    gcTime: CACHE_DURATIONS.STALE_WHILE_REVALIDATE,
    refetchInterval: CACHE_DURATIONS.BACKGROUND_REFRESH,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Intelligent retry logik
      if (failureCount >= 3) return false;
      if (error?.message?.includes('Circuit breaker')) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Memoized helper functions för optimal prestanda
  const getCryptoBySymbol = useCallback((symbol: string) => {
    return cryptoPrices.find(crypto => crypto.symbol.toLowerCase() === symbol.toLowerCase());
  }, [cryptoPrices]);

  const getCryptoByName = useCallback((name: string) => {
    return cryptoPrices.find(crypto => crypto.name.toLowerCase() === name.toLowerCase());
  }, [cryptoPrices]);

  const refreshData = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CRYPTO_PRICES] });
      await queryClient.refetchQueries({ queryKey: [CACHE_KEYS.CRYPTO_PRICES] });
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }, [queryClient]);

  // Preload critical data och cleanup
  useEffect(() => {
    // Preload data if not already cached
    if (!cryptoPrices.length && !isLoading) {
      queryClient.prefetchQuery({
        queryKey: [CACHE_KEYS.CRYPTO_PRICES],
        queryFn: apiClient.fetchCryptoPrices.bind(apiClient),
        staleTime: CACHE_DURATIONS.CRYPTO_PRICES
      });
    }

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, [queryClient, cryptoPrices.length, isLoading]);

  // Optimized return object
  return useMemo(() => ({
    cryptoPrices,
    isLoading,
    error: error?.message || null,
    isStale,
    getCryptoBySymbol,
    getCryptoByName,
    refreshData
  }), [cryptoPrices, isLoading, error, isStale, getCryptoBySymbol, getCryptoByName, refreshData]);
};

export default useCryptoData;