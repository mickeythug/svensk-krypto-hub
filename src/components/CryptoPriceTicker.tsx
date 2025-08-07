import { TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";

const CryptoPriceTicker = () => {
  const { cryptoPrices, isLoading, error } = useCryptoData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
      'BTC': '[&_.symbol-text]:hover:text-[#F7931A]', // Bitcoin Orange
      'ETH': '[&_.symbol-text]:hover:text-[#627EEA]', // Ethereum Blue  
      'BNB': '[&_.symbol-text]:hover:text-[#F3BA2F]', // Binance Yellow
      'ADA': '[&_.symbol-text]:hover:text-[#0033AD]', // Cardano Blue
      'SOL': '[&_.symbol-text]:hover:text-[#9945FF]', // Solana Purple
      'DOT': '[&_.symbol-text]:hover:text-[#E6007A]', // Polkadot Pink
      'AVAX': '[&_.symbol-text]:hover:text-[#E84142]', // Avalanche Red
      'LINK': '[&_.symbol-text]:hover:text-[#375BD2]', // Chainlink Blue
      'UNI': '[&_.symbol-text]:hover:text-[#FF007A]', // Uniswap Pink
      'DOGE': '[&_.symbol-text]:hover:text-[#C2A633]', // Dogecoin Gold
      'SHIB': '[&_.symbol-text]:hover:text-[#FFA409]', // Shiba Inu Orange
      'MATIC': '[&_.symbol-text]:hover:text-[#8247E5]', // Polygon Purple
      'LTC': '[&_.symbol-text]:hover:text-[#BFBBBB]', // Litecoin Silver
      'XRP': '[&_.symbol-text]:hover:text-[#23292F]' // XRP Dark Blue
    };
    return colors[symbol] || '[&_.symbol-text]:hover:text-primary-foreground';
  };

  const handleTokenClick = (symbol: string) => {
    navigate(`/crypto/${symbol.toLowerCase()}`);
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
              onClick={() => handleTokenClick(crypto.symbol)}
              className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'} bg-secondary/50 rounded-lg ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} border border-border/50 flex-shrink-0 group hover:bg-secondary/70 transition-colors cursor-pointer ${getTokenHoverColor(crypto.symbol)}`}
            >
              <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                <span className={`symbol-text font-crypto font-bold text-primary ${isMobile ? 'text-xs' : 'text-sm'} transition-colors`}>
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