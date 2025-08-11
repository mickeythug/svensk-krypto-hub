import React, { memo, useCallback, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";
import TransparentLogo from "@/components/TransparentLogo";

// Import crypto logos
import btcLogo from "@/assets/crypto-logos/svg/btc.svg";
import ethLogo from "@/assets/crypto-logos/svg/eth.svg";
import bnbLogo from "@/assets/crypto-logos/svg/bnb.svg";
import adaLogo from "@/assets/crypto-logos/svg/ada.svg";
import solLogo from "@/assets/crypto-logos/svg/sol.svg";
import dotLogo from "@/assets/crypto-logos/svg/dot.svg";
import avaxLogo from "@/assets/crypto-logos/svg/avax.svg";
import linkLogo from "@/assets/crypto-logos/svg/link.svg";
import uniLogo from "@/assets/crypto-logos/svg/uni.svg";
import dogeLogo from "@/assets/crypto-logos/svg/doge.svg";
import shibLogo from "@/assets/crypto-logos/svg/shib.svg";
import maticLogo from "@/assets/crypto-logos/svg/matic.svg";
import ltcLogo from "@/assets/crypto-logos/svg/ltc.svg";
import xrpLogo from "@/assets/crypto-logos/svg/xrp.svg";

// Logo mapping
const CRYPTO_LOGOS = Object.freeze({
  'BTC': btcLogo,
  'ETH': ethLogo,
  'BNB': bnbLogo,
  'ADA': adaLogo,
  'SOL': solLogo,
  'DOT': dotLogo,
  'AVAX': avaxLogo,
  'LINK': linkLogo,
  'UNI': uniLogo,
  'DOGE': dogeLogo,
  'SHIB': shibLogo,
  'MATIC': maticLogo,
  'LTC': ltcLogo,
  'XRP': xrpLogo
} as const);

// Memoized token color mapping för optimal prestanda
const TOKEN_COLORS = Object.freeze({
  'BTC': '[&_.symbol-text]:hover:text-[#F7931A]',
  'ETH': '[&_.symbol-text]:hover:text-[#627EEA]',
  'BNB': '[&_.symbol-text]:hover:text-[#F3BA2F]',
  'ADA': '[&_.symbol-text]:hover:text-[#0033AD]',
  'SOL': '[&_.symbol-text]:hover:text-[#9945FF]',
  'DOT': '[&_.symbol-text]:hover:text-[#E6007A]',
  'AVAX': '[&_.symbol-text]:hover:text-[#E84142]',
  'LINK': '[&_.symbol-text]:hover:text-[#375BD2]',
  'UNI': '[&_.symbol-text]:hover:text-[#FF007A]',
  'DOGE': '[&_.symbol-text]:hover:text-[#C2A633]',
  'SHIB': '[&_.symbol-text]:hover:text-[#FFA409]',
  'MATIC': '[&_.symbol-text]:hover:text-[#8247E5]',
  'LTC': '[&_.symbol-text]:hover:text-[#BFBBBB]',
  'XRP': '[&_.symbol-text]:hover:text-[#23292F]'
} as const);

// Optimized formatters med caching
const formatPrice = (() => {
  const cache = new Map<number, string>();
  return (price: number): string => {
    if (cache.has(price)) return cache.get(price)!;
    
    let result: string;
    if (price >= 1000) {
      result = `$${(price / 1000).toFixed(1)}k`;
    } else if (price < 1) {
      result = `$${price.toFixed(4)}`;
    } else {
      result = `$${price.toFixed(2)}`;
    }
    
    cache.set(price, result);
    return result;
  };
})();

const formatChange = (() => {
  const cache = new Map<number, string>();
  return (change: number): string => {
    if (cache.has(change)) return cache.get(change)!;
    
    const sign = change >= 0 ? "+" : "";
    const result = `${sign}${change.toFixed(2)}%`;
    
    cache.set(change, result);
    return result;
  };
})();

// Optimized individual token component
interface TokenItemProps {
  crypto: {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  };
  isMobile: boolean;
  onTokenClick: (symbol: string) => void;
}

const TokenItem = memo<TokenItemProps>(({ crypto, isMobile, onTokenClick }) => {
  const tokenColor = TOKEN_COLORS[crypto.symbol as keyof typeof TOKEN_COLORS] || '[&_.symbol-text]:hover:text-primary-foreground';
  
  const handleClick = useCallback(() => {
    onTokenClick(crypto.symbol);
  }, [crypto.symbol, onTokenClick]);

  const isPositive = crypto.change24h >= 0;
  const priceFormatted = useMemo(() => formatPrice(crypto.price), [crypto.price]);
  const changeFormatted = useMemo(() => formatChange(crypto.change24h), [crypto.change24h]);

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'} bg-secondary/50 rounded-lg ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} border border-border/50 flex-shrink-0 group hover:bg-secondary/70 transition-colors cursor-pointer`}
    >
      <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
        <TransparentLogo
          originalSrc={CRYPTO_LOGOS[crypto.symbol as keyof typeof CRYPTO_LOGOS] || btcLogo}
          alt={crypto.symbol}
          className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`}
        />
        <span className={`symbol-text font-crypto font-bold text-primary group-hover:text-destructive ${isMobile ? 'text-xs' : 'text-sm'} transition-colors`}>
          {crypto.symbol}
        </span>
        <span className={`font-display text-foreground font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {priceFormatted}
        </span>
      </div>
      
      <div className={`flex items-center space-x-1 ${
        isPositive ? 'text-success' : 'text-destructive'
      }`}>
        {isPositive ? (
          <TrendingUp size={isMobile ? 10 : 14} />
        ) : (
          <TrendingDown size={isMobile ? 10 : 14} />
        )}
        <span className={`font-display ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
          {changeFormatted}
        </span>
      </div>
      
      {/* Live indicator */}
      <div className="w-2 h-2 bg-success rounded-full animate-pulse" title="Live data" />
    </div>
  );
});

TokenItem.displayName = 'TokenItem';

const CryptoPriceTicker = memo(() => {
  const { cryptoPrices, isLoading, error } = useCryptoData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleTokenClick = useCallback((symbol: string) => {
    navigate(`/crypto/${symbol.toLowerCase()}`);
  }, [navigate]);

  // Memoized doubled array för seamless loop
  const doubledPrices = useMemo(() => {
    if (!cryptoPrices || cryptoPrices.length === 0) return [];
    return [...cryptoPrices, ...cryptoPrices];
  }, [cryptoPrices]);

  // Always render ticker without loading text; show subtle skeleton if empty
  const showSkeleton = !cryptoPrices || cryptoPrices.length === 0;

  return (
    <section className={`bg-background border-b border-border ${isMobile ? 'py-2' : 'py-3'} relative z-40 w-full`}>
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
      <div className="relative overflow-hidden">
        {showSkeleton ? (
          <div className={`h-7 ${isMobile ? 'mx-2' : 'mx-4'} rounded-md bg-muted/40 overflow-hidden`}>
            <div className="h-full w-1/3 bg-muted/70 animate-[shimmer_1.6s_infinite]" />
          </div>
        ) : (
          <div className={`flex animate-ticker ${isMobile ? 'space-x-4' : 'space-x-8'} whitespace-nowrap`}>
            {doubledPrices.map((crypto, index) => (
              <TokenItem
                key={`${crypto.symbol}-${index}`}
                crypto={crypto}
                isMobile={isMobile}
                onTokenClick={handleTokenClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

CryptoPriceTicker.displayName = 'CryptoPriceTicker';

export default CryptoPriceTicker;