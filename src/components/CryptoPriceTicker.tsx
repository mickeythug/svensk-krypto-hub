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
  const isMobile = useIsMobile();

  const fetchCryptoPrices = async () => {
    try {
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('crypto-prices');
      
      if (functionError) throw functionError;
      
      if (data?.success && data?.data) {
        setCryptoPrices(data.data);
      } else {
        throw new Error(data?.error || 'Failed to fetch prices');
      }
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
    
    // Uppdatera prisdata var 30:e sekund
    const interval = setInterval(fetchCryptoPrices, 30000);
    
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
                <span className={`font-crypto font-bold text-primary ${isMobile ? 'text-xs' : 'text-sm'} group-hover:text-primary-foreground transition-colors`}>
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