import { useEffect, useState, useCallback } from "react";

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

// Centraliserad hook för alla krypto-data
export const useCryptoData = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache och rate limiting - hämta bara var 3:e minut
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minuter
  const API_DELAY = 1000; // 1 sekund mellan requests

  // CoinGecko coin IDs och info
  const coinData = {
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
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(1)}M`;
    }
    return marketCap.toString();
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    }
    return volume.toString();
  };

  const fetchCryptoPrices = useCallback(async () => {
    const now = Date.now();
    
    // Kontrollera cache
    if (now - lastFetch < CACHE_DURATION && cryptoPrices.length > 0) {
      console.log('Använder cachad crypto data, nästa uppdatering om:', Math.round((CACHE_DURATION - (now - lastFetch)) / 1000), 'sekunder');
      return;
    }

    try {
      setError(null);
      
      const coinIds = Object.keys(coinData);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, API_DELAY));

      // Hämta från CoinGecko API
      const coinsParam = coinIds.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinsParam}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true&include_market_cap=true&include_24hr_vol=true`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Formatera data
      const formattedPrices: CryptoPrice[] = coinIds.map(coinId => {
        const coinPrice = data[coinId];
        if (!coinPrice) return null;

        const info = coinData[coinId as keyof typeof coinData];
        return {
          symbol: info.symbol,
          name: info.name,
          price: coinPrice.usd,
          change24h: coinPrice.usd_24h_change || 0,
          marketCap: formatMarketCap(coinPrice.usd_market_cap || 0),
          volume: formatVolume(coinPrice.usd_24h_vol || 0),
          rank: info.rank,
          lastUpdated: new Date(coinPrice.last_updated_at * 1000).toISOString()
        };
      }).filter(Boolean) as CryptoPrice[];

      setCryptoPrices(formattedPrices);
      setLastFetch(now);
      console.log('Crypto data uppdaterad från CoinGecko, nästa uppdatering om 3 minuter');
      
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback till mock data vid fel
      if (cryptoPrices.length === 0) {
        const mockPrices: CryptoPrice[] = [
          { symbol: "BTC", name: "Bitcoin", price: 98500, change24h: 2.34, rank: 1, marketCap: "1.9T", volume: "28.5B" },
          { symbol: "ETH", name: "Ethereum", price: 3420, change24h: -1.45, rank: 2, marketCap: "411B", volume: "15.2B" },
          { symbol: "BNB", name: "Binance Coin", price: 695, change24h: 0.87, rank: 3, marketCap: "101B", volume: "1.8B" },
          { symbol: "XRP", name: "XRP", price: 2.15, change24h: 3.21, rank: 4, marketCap: "123B", volume: "4.2B" },
          { symbol: "ADA", name: "Cardano", price: 1.08, change24h: 3.21, rank: 5, marketCap: "38B", volume: "1.1B" },
          { symbol: "SOL", name: "Solana", price: 245, change24h: 5.67, rank: 6, marketCap: "115B", volume: "3.2B" },
          { symbol: "DOT", name: "Polkadot", price: 12.5, change24h: -2.11, rank: 7, marketCap: "15B", volume: "892M" },
          { symbol: "AVAX", name: "Avalanche", price: 52.3, change24h: 1.99, rank: 8, marketCap: "22B", volume: "1.2B" },
          { symbol: "LINK", name: "Chainlink", price: 28.4, change24h: 4.33, rank: 9, marketCap: "17B", volume: "654M" },
          { symbol: "MATIC", name: "Polygon", price: 0.89, change24h: 2.77, rank: 10, marketCap: "8.9B", volume: "423M" },
          { symbol: "UNI", name: "Uniswap", price: 14.2, change24h: -0.88, rank: 11, marketCap: "10.8B", volume: "321M" },
          { symbol: "LTC", name: "Litecoin", price: 102.5, change24h: 1.45, rank: 12, marketCap: "7.6B", volume: "567M" },
          { symbol: "DOGE", name: "Dogecoin", price: 0.385, change24h: 2.77, rank: 13, marketCap: "56B", volume: "1.8B" },
          { symbol: "SHIB", name: "Shiba Inu", price: 0.000025, change24h: 4.12, rank: 14, marketCap: "14.8B", volume: "892M" }
        ];
        setCryptoPrices(mockPrices);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastFetch, cryptoPrices.length, CACHE_DURATION]);

  useEffect(() => {
    // Hämta prisdata initialt
    fetchCryptoPrices();
    
    // Uppdatera prisdata var 3:e minut
    const interval = setInterval(fetchCryptoPrices, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [fetchCryptoPrices, CACHE_DURATION]);

  // Hjälpfunktioner för att hitta specifik crypto
  const getCryptoBySymbol = (symbol: string) => {
    return cryptoPrices.find(crypto => crypto.symbol.toLowerCase() === symbol.toLowerCase());
  };

  const getCryptoByName = (name: string) => {
    return cryptoPrices.find(crypto => crypto.name.toLowerCase() === name.toLowerCase());
  };

  return {
    cryptoPrices,
    isLoading,
    error,
    lastFetch,
    getCryptoBySymbol,
    getCryptoByName,
    refreshData: fetchCryptoPrices
  };
};

export default useCryptoData;