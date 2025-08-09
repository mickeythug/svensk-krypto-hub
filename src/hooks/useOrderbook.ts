import { useEffect, useMemo, useRef, useState } from 'react';
import { useTradingViewSymbol } from '@/hooks/useTradingViewSymbol';
import { useBinanceOrderbook, OrderBook, OrderBookEntry } from '@/hooks/useBinanceOrderbook';

// Pair format helpers
const toHyphenPair = (p: string) => {
  const m = p.match(/([A-Z]+)(USDT|USD|USDC|BTC|ETH)$/);
  return m ? `${m[1]}-${m[2]}` : p;
};
const toUnderscorePair = (p: string) => {
  const m = p.match(/([A-Z]+)(USDT|USD|USDC|BTC|ETH)$/);
  return m ? `${m[1]}_${m[2]}` : p;
};

// Generic, exchange-aware orderbook hook (Binance → Bybit → MEXC)
export const useOrderbook = (
  symbol: string,
  coinGeckoId?: string,
  limit: number = 20
) => {
  const { tvSymbol, exchange } = useTradingViewSymbol(symbol, coinGeckoId);
  const pair = useMemo(() => tvSymbol.split(':')[1] || `${symbol.toUpperCase()}USDT`, [tvSymbol, symbol]);

  // If Binance, reuse the robust websocket hook we already have
  const isBinance = exchange === 'BINANCE' || tvSymbol.startsWith('BINANCE:');
  const binanceHook = useBinanceOrderbook(symbol, limit);

  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  // Normalized processing from generic bids/asks arrays
  const process = (bids: [string, string][], asks: [string, string][]) => {
    let totalBids = 0;
    let totalAsks = 0;

    const processedBids: OrderBookEntry[] = bids.slice(0, limit).map(([p, q]) => {
      const size = parseFloat(q);
      totalBids += size;
      return { price: parseFloat(p), size, total: totalBids };
    });

    const processedAsks: OrderBookEntry[] = asks.slice(0, limit).map(([p, q]) => {
      const size = parseFloat(q);
      totalAsks += size;
      return { price: parseFloat(p), size, total: totalAsks };
    });

    // Sort to consistent order (bids desc, asks asc)
    processedBids.sort((a, b) => b.price - a.price);
    processedAsks.sort((a, b) => a.price - b.price);

    return { processedBids, processedAsks };
  };

  // Lightweight polling for non-Binance exchanges
  useEffect(() => {
    if (isBinance) return; // handled by binance hook

    let active = true;

    const poll = async () => {
      try {
        let res: Response | null = null;
if (exchange === 'BYBIT' || tvSymbol.startsWith('BYBIT:')) {
          // Bybit Spot depth (public)
          res = await fetch(`https://api.bybit.com/spot/quote/v1/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`, { cache: 'no-store' });
          if (!res.ok) {
            res = await fetch(`https://api.bybit.com/spot/quote/v3/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`, { cache: 'no-store' });
          }
        } else if (exchange === 'MEXC' || tvSymbol.startsWith('MEXC:')) {
          // MEXC depth API (Binance-like)
          res = await fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`, { cache: 'no-store' });
        } else if (exchange === 'OKX' || tvSymbol.startsWith('OKX:')) {
          // OKX uses hyphen pairs and v5 books
          const okxPair = toHyphenPair(pair);
          res = await fetch(`https://www.okx.com/api/v5/market/books?instId=${okxPair}&sz=${Math.min(50, limit * 2)}`);
        } else if (exchange === 'KUCOIN' || tvSymbol.startsWith('KUCOIN:')) {
          // KuCoin uses hyphen pairs
          const kp = toHyphenPair(pair);
          res = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level2_${Math.min(100, limit * 5)}?symbol=${kp}`);
        } else if (exchange === 'GATE' || tvSymbol.startsWith('GATE:') || exchange === 'GATEIO' || tvSymbol.startsWith('GATEIO:')) {
          // Gate.io uses underscore pairs
          const gp = toUnderscorePair(pair);
          res = await fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${gp}&limit=${Math.min(50, limit * 2)}`);
        } else if (exchange === 'COINBASE' || tvSymbol.startsWith('COINBASE:') || exchange === 'COINBASEPRO' || tvSymbol.startsWith('COINBASEPRO:')) {
          const cp = toHyphenPair(pair);
          res = await fetch(`https://api.exchange.coinbase.com/products/${cp}/book?level=2`);
        } else {
          // Unknown exchange → try MEXC-style as best-effort
          res = await fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`, { cache: 'no-store' });
        }

        if (!res || !res.ok) throw new Error(`Orderbook fetch failed (${exchange})`);
        const data = await res.json();

        // Normalize various shapes
        const bids: [string, string][] = data?.bids || data?.result?.bids || [];
        const asks: [string, string][] = data?.asks || data?.result?.asks || [];
        const lastUpdateId: number = data?.lastUpdateId || data?.result?.lastUpdateId || Date.now();

        const { processedBids, processedAsks } = process(bids, asks);

        if (!active) return;
        setOrderBook({ bids: processedBids, asks: processedAsks, lastUpdateId, symbol: pair });
        setIsConnected(true);
        setError(null);
      } catch (e: any) {
        if (!active) return;
        setIsConnected(false);
        setError(e?.message || 'Orderbook error');
      }
    };

    // Initial + interval polling (2.5s)
    poll();
    const id = window.setInterval(poll, 2500);
    pollRef.current = id;

    return () => {
      active = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [exchange, tvSymbol, pair, isBinance, limit]);

  // Return Binance hook when applicable, otherwise our polled data
  if (isBinance) {
    return binanceHook;
  }

  return {
    orderBook,
    isConnected,
    error,
    refresh: () => {},
  };
};
