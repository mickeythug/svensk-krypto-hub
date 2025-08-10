import { useEffect, useMemo, useState } from 'react';
import { useTradingViewSymbol } from '@/hooks/useTradingViewSymbol';

export type ExchangeTicker = {
  high24h?: number;
  low24h?: number;
  volumeBase?: number; // e.g., BTC
  volumeQuote?: number; // e.g., USDT (preferred for $)
};

function parseNumber(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function useExchangeTicker(symbol: string, coinGeckoId?: string) {
  const { tvSymbol, exchange } = useTradingViewSymbol(symbol, coinGeckoId);
  const pair = useMemo(() => tvSymbol.split(':')[1] || `${symbol.toUpperCase()}USDT`, [tvSymbol, symbol]);

  const [data, setData] = useState<ExchangeTicker>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchTicker = async () => {
      try {
        setLoading(true);
        setError(null);
        const ex = (exchange || '').toUpperCase();

        if (ex.startsWith('BINANCE')) {
          // Binance 24hr ticker
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, { cache: 'no-store' });
          if (!res.ok) throw new Error('Binance ticker failed');
          const j = await res.json();
          const d: ExchangeTicker = {
            high24h: parseNumber(j.highPrice),
            low24h: parseNumber(j.lowPrice),
            volumeBase: parseNumber(j.volume),
            volumeQuote: parseNumber(j.quoteVolume),
          };
          if (active) setData(d);
        } else if (ex.startsWith('BYBIT')) {
          // Bybit spot tickers
          const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${pair}`;
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error('Bybit ticker failed');
          const j = await res.json();
          const row = j?.result?.list?.[0] || {};
          const d: ExchangeTicker = {
            high24h: parseNumber(row.highPrice24h ?? row.h ?? row.high),
            low24h: parseNumber(row.lowPrice24h ?? row.l ?? row.low),
            volumeBase: parseNumber(row.volume24h ?? row.v),
            volumeQuote: parseNumber(row.turnover24h ?? row.qv ?? row.quoteVolume),
          };
          if (active) setData(d);
        } else {
          // Fallback: leave as-is (could be extended for other CEX)
          if (active) setData({});
        }
      } catch (e: any) {
        if (active) setError(String(e?.message || e));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTicker();
    const id = window.setInterval(fetchTicker, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [exchange, pair]);

  return { data, loading, error } as const;
}
