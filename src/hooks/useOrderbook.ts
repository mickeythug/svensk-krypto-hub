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
    // Parse then sort first to ensure top-of-book correctness
    const parsedBids = bids.map(([p, q]) => ({ price: parseFloat(p), size: parseFloat(q) }));
    const parsedAsks = asks.map(([p, q]) => ({ price: parseFloat(p), size: parseFloat(q) }));

    parsedBids.sort((a, b) => b.price - a.price);
    parsedAsks.sort((a, b) => a.price - b.price);

    let totalBids = 0;
    let totalAsks = 0;

    const processedBids: OrderBookEntry[] = parsedBids.slice(0, limit).map((b) => {
      totalBids += b.size;
      return { price: b.price, size: b.size, total: totalBids };
    });

    const processedAsks: OrderBookEntry[] = parsedAsks.slice(0, limit).map((a) => {
      totalAsks += a.size;
      return { price: a.price, size: a.size, total: totalAsks };
    });

    return { processedBids, processedAsks };
  };

  // Lightweight polling for non-Binance exchanges
  useEffect(() => {
    if (isBinance) return; // handled by binance hook

    let active = true;

    const poll = async () => {
      try {
        const projectRef = 'jcllcrvomxdrhtkqpcbr';
        const ex = (exchange || '').toUpperCase();
        const normEx = ex.startsWith('GATE') ? 'GATE' : ex.startsWith('COINBASE') ? 'COINBASE' : ex;
        const url = `https://${projectRef}.supabase.co/functions/v1/orderbook-proxy?exchange=${encodeURIComponent(normEx)}&pair=${encodeURIComponent(pair)}&limit=${Math.min(100, limit * 2)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Orderbook proxy failed (${ex})`);
        const data = await res.json();

        const bids: [string, string][] = data?.bids || [];
        const asks: [string, string][] = data?.asks || [];
        const lastUpdateId: number = data?.lastUpdateId || Date.now();

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

    // Initial + interval polling (2s)
    poll();
    const id = window.setInterval(poll, 2000);
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
