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

async function fetchTickers(coinGeckoId: string) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/tickers?include_exchange_logo=false`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Tickers fetch failed: ${res.status}`);
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
  if (!coinGeckoId) return { tvSymbol: `BINANCE:${sym}USDT`, exchange: 'BINANCE' };

  const data = await fetchTickers(coinGeckoId);
  const tickers: any[] = data?.tickers || [];

  // Prefer USDT/USD/USDC on preferred exchanges by trust score & volume
  for (const ex of PREFERRED_EXCHANGES) {
    for (const tgt of PREFERRED_TARGETS) {
      const candidates = tickers
        .filter((t) => t?.market?.name?.includes(ex) && t?.target?.toUpperCase() === tgt)
        .sort((a, b) => (b?.trust_score || 0) - (a?.trust_score || 0) || (b?.converted_volume?.usd || 0) - (a?.converted_volume?.usd || 0));
      if (candidates.length) {
        const { base, target, market } = candidates[0];
        const built = buildTvSymbol(market.name, base, target);
        if (built) return built;
      }
    }
  }

  // Any market from preferred exchanges
  for (const ex of PREFERRED_EXCHANGES) {
    const anyCandidate = tickers.find((t) => t?.market?.name?.includes(ex));
    if (anyCandidate) {
      const { base, target, market } = anyCandidate;
      const built = buildTvSymbol(market.name, base, target);
      if (built) return built;
    }
  }

  // Fallback guess
  return { tvSymbol: `BINANCE:${sym}USDT`, exchange: 'BINANCE' };
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
