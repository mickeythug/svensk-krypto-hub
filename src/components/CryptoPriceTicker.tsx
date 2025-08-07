import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const CryptoPriceTicker = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockPrices: CryptoPrice[] = [
      { symbol: "BTC", name: "Bitcoin", price: 645000, change24h: 2.34 },
      { symbol: "ETH", name: "Ethereum", price: 35000, change24h: -1.45 },
      { symbol: "BNB", name: "Binance Coin", price: 3200, change24h: 0.87 },
      { symbol: "ADA", name: "Cardano", price: 4.2, change24h: 3.21 },
      { symbol: "SOL", name: "Solana", price: 1100, change24h: 5.67 },
      { symbol: "DOT", name: "Polkadot", price: 85, change24h: -2.11 },
      { symbol: "AVAX", name: "Avalanche", price: 450, change24h: 1.99 },
      { symbol: "LINK", name: "Chainlink", price: 180, change24h: 4.33 },
      { symbol: "UNI", name: "Uniswap", price: 95, change24h: -0.88 },
      { symbol: "ATOM", name: "Cosmos", price: 120, change24h: 2.77 }
    ];
    setCryptoPrices(mockPrices);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k SEK`;
    }
    return `${price.toFixed(2)} SEK`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <section className="bg-background border-b border-border py-3 mt-16 relative z-40 w-full">
      
      <div className="relative overflow-hidden">
        <div className="flex animate-ticker space-x-8 whitespace-nowrap">
          {/* Duplicate the array for seamless loop */}
          {[...cryptoPrices, ...cryptoPrices].map((crypto, index) => (
            <div
              key={`${crypto.symbol}-${index}`}
              className="flex items-center space-x-3 bg-secondary/50 rounded-lg px-4 py-2 border border-border/50 flex-shrink-0"
            >
              <div className="flex items-center space-x-2">
                <span className="font-crypto font-bold text-primary text-sm">
                  {crypto.symbol}
                </span>
                <span className="font-display text-foreground font-medium">
                  {formatPrice(crypto.price)}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 ${
                crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {crypto.change24h >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span className="font-display text-sm font-medium">
                  {formatChange(crypto.change24h)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CryptoPriceTicker;