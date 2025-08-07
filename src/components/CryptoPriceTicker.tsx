import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdated?: string;
}

const CryptoPriceTicker = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const isMobile = useIsMobile();

  // Cache och rate limiting - hämta bara var 3:e minut
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minuter
  const API_DELAY = 1000; // 1 sekund mellan requests för att respektera rate limits

  const fetchCryptoPrices = async () => {
    const now = Date.now();
    
    // Kontrollera cache - hämta bara om mer än 3 minuter har gått
    if (now - lastFetch < CACHE_DURATION && cryptoPrices.length > 0) {
      console.log('Använder cachad data, nästa uppdatering om:', Math.round((CACHE_DURATION - (now - lastFetch)) / 1000), 'sekunder');
      return;
    }

    try {
      setError(null);
      
      // CoinGecko coin IDs för våra kryptovalutor
      const coinIds = [
        'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
        'polkadot', 'avalanche-2', 'chainlink', 'uniswap', 'dogecoin',
        'shiba-inu', 'matic-network', 'litecoin', 'ripple'
      ];

      // Kryptovalutornas namn och symboler
      const cryptoInfo: { [key: string]: { name: string; symbol: string } } = {
        'bitcoin': { name: 'Bitcoin', symbol: 'BTC' },
        'ethereum': { name: 'Ethereum', symbol: 'ETH' },
        'binancecoin': { name: 'Binance Coin', symbol: 'BNB' },
        'cardano': { name: 'Cardano', symbol: 'ADA' },
        'solana': { name: 'Solana', symbol: 'SOL' },
        'polkadot': { name: 'Polkadot', symbol: 'DOT' },
        'avalanche-2': { name: 'Avalanche', symbol: 'AVAX' },
        'chainlink': { name: 'Chainlink', symbol: 'LINK' },
        'uniswap': { name: 'Uniswap', symbol: 'UNI' },
        'dogecoin': { name: 'Dogecoin', symbol: 'DOGE' },
        'shiba-inu': { name: 'Shiba Inu', symbol: 'SHIB' },
        'matic-network': { name: 'Polygon', symbol: 'MATIC' },
        'litecoin': { name: 'Litecoin', symbol: 'LTC' },
        'ripple': { name: 'XRP', symbol: 'XRP' }
      };

      // Rate limiting - vänta en sekund innan request
      await new Promise(resolve => setTimeout(resolve, API_DELAY));

      // Hämta från CoinGecko API (gratis endpoint)
      const coinsParam = coinIds.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinsParam}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
      
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
        const coinData = data[coinId];
        if (!coinData) return null;

        const info = cryptoInfo[coinId];
        return {
          symbol: info.symbol,
          name: info.name,
          price: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          lastUpdated: new Date(coinData.last_updated_at * 1000).toISOString()
        };
      }).filter(Boolean) as CryptoPrice[];

      setCryptoPrices(formattedPrices);
      setLastFetch(now);
      console.log('Prisdata uppdaterad från CoinGecko, nästa uppdatering om 3 minuter');
      
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback till mock data vid fel (USD priser)
      const mockPrices: CryptoPrice[] = [
        { symbol: "BTC", name: "Bitcoin", price: 98500, change24h: 2.34 },
        { symbol: "ETH", name: "Ethereum", price: 3420, change24h: -1.45 },
        { symbol: "BNB", name: "Binance Coin", price: 695, change24h: 0.87 },
        { symbol: "ADA", name: "Cardano", price: 1.08, change24h: 3.21 },
        { symbol: "SOL", name: "Solana", price: 245, change24h: 5.67 },
        { symbol: "DOT", name: "Polkadot", price: 12.5, change24h: -2.11 },
        { symbol: "AVAX", name: "Avalanche", price: 52.3, change24h: 1.99 },
        { symbol: "LINK", name: "Chainlink", price: 28.4, change24h: 4.33 },
        { symbol: "UNI", name: "Uniswap", price: 14.2, change24h: -0.88 },
        { symbol: "DOGE", name: "Dogecoin", price: 0.385, change24h: 2.77 }
      ];
      setCryptoPrices(mockPrices);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Hämta prisdata initialt
    fetchCryptoPrices();
    
    // Uppdatera prisdata var 3:e minut (med cache-kontroll)
    const interval = setInterval(fetchCryptoPrices, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const getTokenHoverColor = (symbol: string) => {
    const colors: { [key: string]: string } = {
      'BTC': 'hover:text-[#F7931A]', // Bitcoin Orange
      'ETH': 'hover:text-[#627EEA]', // Ethereum Blue  
      'BNB': 'hover:text-[#F3BA2F]', // Binance Yellow
      'ADA': 'hover:text-[#0033AD]', // Cardano Blue
      'SOL': 'hover:text-[#9945FF]', // Solana Purple
      'DOT': 'hover:text-[#E6007A]', // Polkadot Pink
      'AVAX': 'hover:text-[#E84142]', // Avalanche Red
      'LINK': 'hover:text-[#375BD2]', // Chainlink Blue
      'UNI': 'hover:text-[#FF007A]', // Uniswap Pink
      'DOGE': 'hover:text-[#C2A633]', // Dogecoin Gold
      'SHIB': 'hover:text-[#FFA409]', // Shiba Inu Orange
      'MATIC': 'hover:text-[#8247E5]', // Polygon Purple
      'LTC': 'hover:text-[#BFBBBB]', // Litecoin Silver
      'XRP': 'hover:text-[#23292F]' // XRP Dark Blue
    };
    return colors[symbol] || 'hover:text-primary-foreground';
  };

  return (
    <section className={`bg-background border-b border-border ${isMobile ? 'py-2 mt-14' : 'py-3 mt-16'} relative z-40 w-full`}>
      {/* Error indicator */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/30 py-1">
          <div className="container mx-auto px-4">
            <p className="text-destructive text-xs text-center">
              ⚠️ Live prisdata otillgänglig - visar senast kända priser
            </p>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="bg-muted/50 border-b border-border py-1">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground text-xs text-center animate-pulse">
              📡 Hämtar live kryptovalutapriser...
            </p>
          </div>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <div className={`flex animate-ticker ${isMobile ? 'space-x-4' : 'space-x-8'} whitespace-nowrap`}>
          {/* Duplicate the array for seamless loop */}
          {[...cryptoPrices, ...cryptoPrices].map((crypto, index) => (
            <div 
              key={`${crypto.symbol}-${index}`}
              className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'} bg-secondary/50 rounded-lg ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} border border-border/50 flex-shrink-0 group hover:bg-secondary/70 transition-colors`}
            >
              <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                <span className={`font-crypto font-bold text-primary ${isMobile ? 'text-xs' : 'text-sm'} group-hover:transition-colors ${getTokenHoverColor(crypto.symbol)}`}>
                  {crypto.symbol}
                </span>
                <span className={`font-display text-foreground font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {formatPrice(crypto.price)}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 ${
                crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {crypto.change24h >= 0 ? (
                  <TrendingUp size={isMobile ? 10 : 14} />
                ) : (
                  <TrendingDown size={isMobile ? 10 : 14} />
                )}
                <span className={`font-display ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {formatChange(crypto.change24h)}
                </span>
              </div>
              
              {/* Live indicator */}
              {!error && !isLoading && (
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" title="Live data" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CryptoPriceTicker;