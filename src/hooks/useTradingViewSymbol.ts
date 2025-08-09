import { useMemo } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";

// Map CoinGecko market names to TradingView exchange codes
const EXCHANGE_CODE_MAP: Record<string, string> = {
  Binance: "BINANCE",
  "Binance US": "BINANCEUS",
  Bybit: "BYBIT",
  MEXC: "MEXC",
  "MEXC Global": "MEXC",
  OKX: "OKX",
  KuCoin: "KUCOIN",
  "KuCoin Futures": "KUCOINF",
  "Gate.io": "GATEIO",
  Kraken: "KRAKEN",
  Coinbase: "COINBASE",
  "Coinbase Pro": "COINBASE",
  Bitfinex: "BITFINEX",
  Bitstamp: "BITSTAMP",
  Huobi: "HUOBI",
  HTX: "HUOBI",
  Poloniex: "POLONIEX",
  Bittrex: "BITTREX",
};

const PREFERRED_EXCHANGES = [
  "Binance",
  "Bybit",
  "MEXC",
  "OKX",
  "KuCoin",
  "Gate.io",
  "Kraken",
  "Coinbase",
] as const;

const PREFERRED_TARGETS = ["USDT", "USD", "USDC"] as const;

interface TvSymbolResult {
  tvSymbol: string;
  exchange: string;
}

const SYMBOL_OVERRIDES: Record<string, TvSymbolResult> = {
  // Example manual overrides when TradingView symbol differs from CG base
  // 'TIA': { tvSymbol: 'BINANCE:TIAUSDT', exchange: 'BINANCE' },
};

async function fetchTickersViaProxy(coinGeckoId?: string, symbol?: string) {
  const projectRef = 'jcllcrvomxdrhtkqpcbr';
  const params = new URLSearchParams();
  if (coinGeckoId) params.set('id', coinGeckoId);
  if (symbol) params.set('symbol', symbol);
  const url = `https://${projectRef}.supabase.co/functions/v1/tv-symbol-resolver?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`tv-symbol-resolver failed: ${res.status}`);
  return res.json();
}

function buildTvSymbol(exchangeName: string, base: string, target: string): TvSymbolResult | null {
  const code = EXCHANGE_CODE_MAP[exchangeName] || EXCHANGE_CODE_MAP[Object.keys(EXCHANGE_CODE_MAP).find(k => exchangeName.includes(k)) || ''];
  if (!code) return null;
  return { tvSymbol: `${code}:${base.toUpperCase()}${target.toUpperCase()}`, exchange: code };
}

export async function resolveTradingViewSymbol(symbol: string, coinGeckoId?: string): Promise<TvSymbolResult> {
  const sym = (symbol || '').toUpperCase();
  if (SYMBOL_OVERRIDES[sym]) return SYMBOL_OVERRIDES[sym];

  try {
    const res = await fetchTickersViaProxy(coinGeckoId, sym);
    if (res?.ok && res?.tvSymbol && res?.exchange) {
      return { tvSymbol: res.tvSymbol, exchange: res.exchange };
    }
  } catch (e) {
    // ignore and fallback below
  }

  // Fallback guesses across popular venues (non-Binance first)
  const guesses = ['BYBIT', 'OKX', 'KUCOIN', 'MEXC', 'GATEIO', 'COINBASE', 'KRAKEN', 'BINANCE'];
  return { tvSymbol: `${guesses[0]}:${sym}USDT`, exchange: guesses[0] };
}

export function useTradingViewSymbol(symbol: string, coinGeckoId?: string) {
  const sym = (symbol || "").toUpperCase();

  const query = useQuery<TvSymbolResult>({
    queryKey: ["tv-symbol", sym, coinGeckoId],
    enabled: true,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 48 * 60 * 60 * 1000, // 48h
    placeholderData: (prev) => prev as TvSymbolResult | undefined,
    queryFn: () => resolveTradingViewSymbol(sym, coinGeckoId),
  });

  const immediate = useMemo<TvSymbolResult>(() => ({
    tvSymbol: `BINANCE:${sym}USDT`,
    exchange: "BINANCE",
  }), [sym]);

  return {
    tvSymbol: query.data?.tvSymbol ?? immediate.tvSymbol,
    exchange: query.data?.exchange ?? immediate.exchange,
    isLoading: query.isLoading,
    error: (query.error as Error)?.message || null,
  };
}

export async function prefetchTradingViewSymbols(queryClient: QueryClient, items: Array<{symbol: string; coinGeckoId?: string}>) {
  await Promise.allSettled(items.map(({symbol, coinGeckoId}) => queryClient.prefetchQuery({
    queryKey: ["tv-symbol", symbol.toUpperCase(), coinGeckoId],
    queryFn: () => resolveTradingViewSymbol(symbol.toUpperCase(), coinGeckoId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  })));
}
