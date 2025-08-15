import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CryptoPrice {
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
  image?: string; // Riktig logo URL från CoinGecko
  coinGeckoId?: string; // CoinGecko ID för exakt TV-mapping
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

// CoinGecko top 100 coins - riktig ranking
const TOP_100_COINS = Object.freeze([
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'usd-coin', 'xrp', 'staked-ether', 'cardano', 'avalanche-2',
  'dogecoin', 'chainlink', 'tron', 'polygon', 'shiba-inu', 'polkadot', 'litecoin', 'bitcoin-cash', 'uniswap', 'pepe',
  'internet-computer', 'ethereum-classic', 'artificial-superintelligence-alliance', 'kaspa', 'near', 'dai', 'aptos',
  'stellar', 'cronos', 'filecoin', 'cosmos', 'vechain', 'monero', 'hedera', 'ethereum-name-service', 'arbitrum',
  'optimism', 'immutable-x', 'maker', 'fantom', 'rocket-pool', 'the-graph', 'bittensor', 'render-token', 'theta-network',
  'algorand', 'kucoin-shares', 'lido-dao', 'flow', 'aave', 'decentraland', 'injective-protocol', 'sei-network',
  'blockstack', 'elrond-erd-2', 'sandbox', 'axie-infinity', 'floki', 'thorchain', 'ftx-token', 'helium', 'gala',
  'tezos', 'zcash', 'chiliz', 'mina-protocol', 'dydx', 'bonk', 'neo', 'iota', 'celsius-degree-token', 'eos',
  'the-open-network', 'quant-network', 'kava', 'conflux-token', '1inch', 'compound', 'arweave', 'ecash', 'curve-dao-token',
  'terra-luna-2', 'looksrare', 'trust-wallet-token', 'wormhole', 'pancakeswap-token', 'convex-finance', 'havven',
  'bitcoin-sv', 'livepeer', 'sushiswap', 'blur', 'mask-network', 'osmosis', 'celsius-degree-token', 'golem'
] as const);

// Utökad coin data mapping för top 100
const getCoinInfo = (coinId: string, rank: number) => {
  const coinMap: Record<string, { name: string; symbol: string }> = {
    'bitcoin': { name: 'Bitcoin', symbol: 'BTC' },
    'ethereum': { name: 'Ethereum', symbol: 'ETH' },
    'tether': { name: 'Tether', symbol: 'USDT' },
    'binancecoin': { name: 'Binance Coin', symbol: 'BNB' },
    'solana': { name: 'Solana', symbol: 'SOL' },
    'usd-coin': { name: 'USD Coin', symbol: 'USDC' },
    'xrp': { name: 'XRP', symbol: 'XRP' },
    'staked-ether': { name: 'Lido Staked Ether', symbol: 'STETH' },
    'cardano': { name: 'Cardano', symbol: 'ADA' },
    'avalanche-2': { name: 'Avalanche', symbol: 'AVAX' },
    'dogecoin': { name: 'Dogecoin', symbol: 'DOGE' },
    'chainlink': { name: 'Chainlink', symbol: 'LINK' },
    'tron': { name: 'TRON', symbol: 'TRX' },
    'polygon': { name: 'Polygon', symbol: 'MATIC' },
    'shiba-inu': { name: 'Shiba Inu', symbol: 'SHIB' },
    'polkadot': { name: 'Polkadot', symbol: 'DOT' },
    'litecoin': { name: 'Litecoin', symbol: 'LTC' },
    'bitcoin-cash': { name: 'Bitcoin Cash', symbol: 'BCH' },
    'uniswap': { name: 'Uniswap', symbol: 'UNI' },
    'pepe': { name: 'Pepe', symbol: 'PEPE' },
    'internet-computer': { name: 'Internet Computer', symbol: 'ICP' },
    'ethereum-classic': { name: 'Ethereum Classic', symbol: 'ETC' },
    'artificial-superintelligence-alliance': { name: 'Artificial Superintelligence Alliance', symbol: 'FET' },
    'kaspa': { name: 'Kaspa', symbol: 'KAS' },
    'near': { name: 'NEAR Protocol', symbol: 'NEAR' },
    'dai': { name: 'Dai', symbol: 'DAI' },
    'aptos': { name: 'Aptos', symbol: 'APT' },
    'stellar': { name: 'Stellar', symbol: 'XLM' },
    'cronos': { name: 'Cronos', symbol: 'CRO' },
    'filecoin': { name: 'Filecoin', symbol: 'FIL' },
    'cosmos': { name: 'Cosmos', symbol: 'ATOM' },
    'vechain': { name: 'VeChain', symbol: 'VET' },
    'monero': { name: 'Monero', symbol: 'XMR' },
    'hedera': { name: 'Hedera', symbol: 'HBAR' },
    'ethereum-name-service': { name: 'Ethereum Name Service', symbol: 'ENS' },
    'arbitrum': { name: 'Arbitrum', symbol: 'ARB' },
    'optimism': { name: 'Optimism', symbol: 'OP' },
    'immutable-x': { name: 'Immutable', symbol: 'IMX' },
    'maker': { name: 'Maker', symbol: 'MKR' },
    'fantom': { name: 'Fantom', symbol: 'FTM' },
    'rocket-pool': { name: 'Rocket Pool', symbol: 'RPL' },
    'the-graph': { name: 'The Graph', symbol: 'GRT' },
    'bittensor': { name: 'Bittensor', symbol: 'TAO' },
    'render-token': { name: 'Render', symbol: 'RNDR' },
    'theta-network': { name: 'Theta Network', symbol: 'THETA' },
    'algorand': { name: 'Algorand', symbol: 'ALGO' },
    'kucoin-shares': { name: 'KuCoin Token', symbol: 'KCS' },
    'lido-dao': { name: 'Lido DAO', symbol: 'LDO' },
    'flow': { name: 'Flow', symbol: 'FLOW' },
    'aave': { name: 'Aave', symbol: 'AAVE' },
    'decentraland': { name: 'Decentraland', symbol: 'MANA' },
    'injective-protocol': { name: 'Injective', symbol: 'INJ' },
    'sei-network': { name: 'Sei', symbol: 'SEI' },
    'blockstack': { name: 'Stacks', symbol: 'STX' },
    'elrond-erd-2': { name: 'MultiversX', symbol: 'EGLD' },
    'sandbox': { name: 'The Sandbox', symbol: 'SAND' },
    'axie-infinity': { name: 'Axie Infinity', symbol: 'AXS' },
    'floki': { name: 'FLOKI', symbol: 'FLOKI' },
    'thorchain': { name: 'THORChain', symbol: 'RUNE' },
    'ftx-token': { name: 'FTX Token', symbol: 'FTT' },
    'helium': { name: 'Helium', symbol: 'HNT' },
    'gala': { name: 'Gala', symbol: 'GALA' },
    'tezos': { name: 'Tezos', symbol: 'XTZ' },
    'zcash': { name: 'Zcash', symbol: 'ZEC' },
    'chiliz': { name: 'Chiliz', symbol: 'CHZ' },
    'mina-protocol': { name: 'Mina', symbol: 'MINA' },
    'dydx': { name: 'dYdX', symbol: 'DYDX' },
    'bonk': { name: 'Bonk', symbol: 'BONK' },
    'neo': { name: 'Neo', symbol: 'NEO' },
    'iota': { name: 'IOTA', symbol: 'IOTA' },
    'celsius-degree-token': { name: 'Celsius', symbol: 'CEL' },
    'eos': { name: 'EOS', symbol: 'EOS' },
    'the-open-network': { name: 'Toncoin', symbol: 'TON' },
    'quant-network': { name: 'Quant', symbol: 'QNT' },
    'kava': { name: 'Kava', symbol: 'KAVA' },
    'conflux-token': { name: 'Conflux', symbol: 'CFX' },
    '1inch': { name: '1inch Network', symbol: '1INCH' },
    'compound': { name: 'Compound', symbol: 'COMP' },
    'arweave': { name: 'Arweave', symbol: 'AR' },
    'ecash': { name: 'eCash', symbol: 'XEC' },
    'curve-dao-token': { name: 'Curve DAO Token', symbol: 'CRV' },
    'terra-luna-2': { name: 'Terra', symbol: 'LUNA' },
    'looksrare': { name: 'LooksRare', symbol: 'LOOKS' },
    'trust-wallet-token': { name: 'Trust Wallet Token', symbol: 'TWT' },
    'wormhole': { name: 'Wormhole', symbol: 'W' },
    'pancakeswap-token': { name: 'PancakeSwap', symbol: 'CAKE' },
    'convex-finance': { name: 'Convex Finance', symbol: 'CVX' },
    'havven': { name: 'Synthetix', symbol: 'SNX' },
    'bitcoin-sv': { name: 'Bitcoin SV', symbol: 'BSV' },
    'livepeer': { name: 'Livepeer', symbol: 'LPT' },
    'sushiswap': { name: 'SushiSwap', symbol: 'SUSHI' },
    'blur': { name: 'Blur', symbol: 'BLUR' },
    'mask-network': { name: 'Mask Network', symbol: 'MASK' },
    'osmosis': { name: 'Osmosis', symbol: 'OSMO' },
    'golem': { name: 'Golem', symbol: 'GLM' }
  };

  const info = coinMap[coinId] || { name: coinId.charAt(0).toUpperCase() + coinId.slice(1), symbol: coinId.toUpperCase() };
  return { ...info, rank };
};

// Cache keys
const CACHE_KEYS = Object.freeze({
  CRYPTO_PRICES: 'crypto-prices',
  CRYPTO_METADATA: 'crypto-metadata'
} as const);

// Cache durations
const CACHE_DURATIONS = Object.freeze({
  CRYPTO_PRICES: 180000, // 3 minuter för priser (målet)
  CRYPTO_METADATA: 3600000, // 1 timme för metadata
  BACKGROUND_REFRESH: 180000, // 3 min bakgrundsrefresh
  STALE_WHILE_REVALIDATE: 3600000 // 1 timme fallback-cache
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

  const cacheKey = 'crypto-prices-cache-v2';
  const projectRef = 'jcllcrvomxdrhtkqpcbr';
  const fnUrl = `https://${projectRef}.supabase.co/functions/v1/token-prices-refresh?pages=50&refresh=true`;

  // Attempt via Edge Function (DB-backed, refreshed every 3 min via cron)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    await apiRateLimiter.acquire();

    const res = await fetch(fnUrl, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Edge error: ${res.status} ${res.statusText}`);

    const body = await res.json();
    const rows = (body?.data ?? []) as any[];

    const transformed: CryptoPrice[] = rows.map((r: any, idx: number) => ({
      symbol: String(r.symbol ?? r.symbol).toUpperCase(),
      name: r.name ?? r.name,
      price: Number(r.price ?? r.current_price ?? 0),
      change1h: r.change_1h != null ? Number(r.change_1h) : (r.price_change_percentage_1h_in_currency != null ? Number(r.price_change_percentage_1h_in_currency) : undefined),
      change24h: Number((r.change_24h ?? r.price_change_percentage_24h_in_currency ?? r.price_change_percentage_24h) ?? 0),
      change7d: r.change_7d != null ? Number(r.change_7d) : (r.price_change_percentage_7d_in_currency != null ? Number(r.price_change_percentage_7d_in_currency) : undefined),
      marketCap: r.market_cap != null ? formatters.marketCap(Number(r.market_cap)) : undefined,
      volume: r.total_volume != null ? formatters.volume(Number(r.total_volume)) : undefined,
      rank: r.market_cap_rank ?? idx + 1,
      lastUpdated: r.updated_at ?? r.last_updated ?? new Date().toISOString(),
      image: r.image,
      coinGeckoId: r.coin_gecko_id ?? r.id,
    }));

    const finalData: CryptoPrice[] = transformed;

    // Persist to localStorage as 1h fallback
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: finalData }));
    } catch {}

    // Reset circuit breaker on success
    this.failureCount = 0;
    
    // Return ALL tokens from CoinGecko
    return this.filterAllowed(finalData.length > 0 ? finalData : this.getFallbackData());
  } catch (error: any) {
    clearTimeout(timer);
    this.recordFailure();

    // Fallback 1: localStorage (max 1h)
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts <= CACHE_DURATIONS.STALE_WHILE_REVALIDATE) {
          return this.filterAllowed(parsed.data as CryptoPrice[]);
        }
      }
    } catch {}

    // Fallback 2 removed: avoid direct CoinGecko requests due to CORS; surface error instead
    throw (error instanceof Error ? error : new Error(String(error)));
  }
}

  private transformCoinGeckoResponse(data: any[]): CryptoPrice[] {
    return data.map((coin, index) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change1h: coin.price_change_percentage_1h_in_currency ?? undefined,
      change24h: (coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h) || 0,
      change7d: coin.price_change_percentage_7d_in_currency ?? undefined,
      marketCap: formatters.marketCap(coin.market_cap || 0),
      volume: formatters.volume(coin.total_volume || 0),
      rank: coin.market_cap_rank || index + 1,
      lastUpdated: coin.last_updated || new Date().toISOString(),
      image: coin.image,
      coinGeckoId: coin.id,
    }));
  }

  // Return ALL tokens instead of filtering to specific ones
  private filterAllowed(data: CryptoPrice[]): CryptoPrice[] {
    // Remove duplicates by symbol and sort by market cap rank
    const seen = new Set<string>();
    const filtered = data.filter(d => {
      if (!seen.has(d.symbol)) {
        seen.add(d.symbol);
        return true;
      }
      return false;
    });
    
    // Sort by market cap rank (ascending)
    filtered.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    
    return filtered;
  }

  private getFallbackData(): CryptoPrice[] {
    // Return top 100 fallback tokens for when API is unavailable
    return TOP_100_COINS.map((coinId, index) => {
      const info = getCoinInfo(coinId, index + 1);
      return {
        symbol: info.symbol,
        name: info.name,
        price: Math.random() * 1000 + 1, // Random fallback prices
        change24h: (Math.random() - 0.5) * 20, // Random change between -10% and +10%
        coinGeckoId: coinId,
        rank: index + 1,
        lastUpdated: new Date().toISOString(),
        marketCap: `${(Math.random() * 1000).toFixed(1)}B`,
        volume: `${(Math.random() * 100).toFixed(1)}B`,
        image: `https://assets.coingecko.com/coins/images/1/thumb/${coinId}.png`
      };
    });
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
    // Seed immediately from cache (localStorage) to avoid any loading flashes
    initialData: () => {
      try {
        const raw = localStorage.getItem('crypto-prices-cache-v2');
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts <= CACHE_DURATIONS.STALE_WHILE_REVALIDATE) {
          return parsed.data as CryptoPrice[];
        }
      } catch {}
      // Fallback to any in-memory cached data
      return queryClient.getQueryData([CACHE_KEYS.CRYPTO_PRICES]) as CryptoPrice[] | undefined;
    },
    placeholderData: () => queryClient.getQueryData([CACHE_KEYS.CRYPTO_PRICES]) as CryptoPrice[] | undefined,
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