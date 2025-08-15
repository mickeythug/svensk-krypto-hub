import { useEffect } from 'react';
import { useCryptoData } from './useCryptoData';

interface DynamicTitleProps {
  symbol?: string;
  pageType: 'trading' | 'meme';
  enabled?: boolean;
}

export function useDynamicTitle({ symbol, pageType, enabled = true }: DynamicTitleProps) {
  const { cryptoPrices } = useCryptoData();

  useEffect(() => {
    if (!enabled || !symbol) return;

    // Find the token data
    const token = cryptoPrices?.find(
      (c: any) => (c.symbol || '').toUpperCase() === symbol.toUpperCase()
    );

    if (!token) return;

    const formatPrice = (price: number) => {
      if (price < 0.000001) return price.toExponential(2);
      if (price < 0.01) return price.toFixed(6);
      if (price < 1) return price.toFixed(4);
      return price.toFixed(2);
    };

    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e12) {
        return `${(marketCap / 1e12).toFixed(1)}T`;
      } else if (marketCap >= 1e9) {
        return `${(marketCap / 1e9).toFixed(1)}B`;
      } else if (marketCap >= 1e6) {
        return `${(marketCap / 1e6).toFixed(1)}M`;
      } else if (marketCap >= 1e3) {
        return `${(marketCap / 1e3).toFixed(1)}K`;
      }
      return marketCap.toFixed(0);
    };

    const getTokenDisplayName = (symbol: string) => {
      const symbolUpper = symbol.toUpperCase();
      switch (symbolUpper) {
        case 'BTC':
          return 'BITCOIN';
        case 'ETH':
          return 'ETHEREUM';
        case 'SOL':
          return 'SOLANA';
        case 'DOGE':
          return 'DOGECOIN';
        case 'ADA':
          return 'CARDANO';
        case 'DOT':
          return 'POLKADOT';
        case 'MATIC':
          return 'POLYGON';
        case 'AVAX':
          return 'AVALANCHE';
        case 'LINK':
          return 'CHAINLINK';
        case 'UNI':
          return 'UNISWAP';
        case 'BNB':
          return 'BINANCE COIN';
        case 'XRP':
          return 'RIPPLE';
        case 'LTC':
          return 'LITECOIN';
        case 'SHIB':
          return 'SHIBA INU';
        case 'TRX':
          return 'TRON';
        default:
          return symbolUpper;
      }
    };

    let newTitle = '';

    if (pageType === 'trading') {
      // Trading page: show price with real-time formatting
      const price = token.price || 0;
      const displayName = getTokenDisplayName(symbol);
      newTitle = `$${formatPrice(price)} ${displayName}`;
    } else if (pageType === 'meme') {
      // Meme page: show market cap with real-time formatting
      const marketCap = typeof token.marketCap === 'number' ? token.marketCap : 0;
      const displayName = getTokenDisplayName(symbol);
      newTitle = `${formatMarketCap(marketCap)} ${displayName}`;
    }

    // Update the browser title with real-time data
    if (newTitle) {
      document.title = newTitle;
      console.log(`📈 Dynamic title updated: ${newTitle}`);
    }

    // Cleanup function to restore original title when component unmounts
    return () => {
      document.title = 'CryptoTrade Pro';
    };
  }, [symbol, pageType, cryptoPrices, enabled]);

  // Also provide the formatted values for use in components
  const token = cryptoPrices?.find(
    (c: any) => (c.symbol || '').toUpperCase() === symbol?.toUpperCase()
  );

  return {
    currentPrice: token?.price || 0,
    currentMarketCap: token?.marketCap || 0,
    tokenData: token
  };
}