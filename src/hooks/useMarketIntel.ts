import { useQuery } from "@tanstack/react-query";

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  image?: string;
}

export interface MarketOverviewData {
  totalMarketCap: number | null;
  totalVolume24h: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  activeAddresses24h: number | null;
  defiTVL: number | null;
}

export interface MarketSentimentData {
  fearGreedIndex: number | null;
  newsVolumePct: number | null; // 0-100 derived from our news feed volume
  socialVolumePct: number | null; // 0-100 derived from trending endpoints
  trend24hPct: number | null; // global market cap change 24h
}

async function fetchJSON<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

// Global market data with fallbacks
async function getGlobalMarket(): Promise<MarketOverviewData & { trend24hPct: number | null } > {
  // Primary: CoinGecko Global
  try {
    const cg = await fetchJSON<any>("https://api.coingecko.com/api/v3/global");
    const data = cg.data ?? cg;
    const mcap = Number(data.total_market_cap?.usd ?? null);
    const vol = Number(data.total_volume?.usd ?? null);
    const btcDom = Number(data.market_cap_percentage?.btc ?? null);
    const ethDom = Number(data.market_cap_percentage?.eth ?? null);
    const trend = typeof data.market_cap_change_percentage_24h_usd === 'number' ? data.market_cap_change_percentage_24h_usd : null;
    return {
      totalMarketCap: mcap || null,
      totalVolume24h: vol || null,
      btcDominance: btcDom || null,
      ethDominance: ethDom || null,
      activeAddresses24h: null, // filled separately
      defiTVL: null, // filled separately
      trend24hPct: trend,
    };
  } catch {}

  // Fallback 1: CoinPaprika Global
  try {
    const cp = await fetchJSON<any>("https://api.coinpaprika.com/v1/global");
    return {
      totalMarketCap: cp.market_cap_usd ?? null,
      totalVolume24h: cp.volume_24h_usd ?? null,
      btcDominance: cp.bitcoin_dominance_percentage ?? null,
      ethDominance: null, // not provided
      activeAddresses24h: null,
      defiTVL: null,
      trend24hPct: cp.market_cap_change_24h ?? null,
    };
  } catch {}

  // Fallback 2: Coinlore Global
  try {
    const cl = await fetchJSON<any>("https://api.coinlore.net/api/global/");
    const first = Array.isArray(cl) ? cl[0] : cl;
    return {
      totalMarketCap: first.total_mcap ?? first.total_mcap_usd ?? null,
      totalVolume24h: first.total_volume ?? null,
      btcDominance: first.btc_d ? Number(first.btc_d) : null,
      ethDominance: first.eth_d ? Number(first.eth_d) : null,
      activeAddresses24h: null,
      defiTVL: null,
      trend24hPct: first.mcap_change ? Number(first.mcap_change) : null,
    };
  } catch {}

  return {
    totalMarketCap: null,
    totalVolume24h: null,
    btcDominance: null,
    ethDominance: null,
    activeAddresses24h: null,
    defiTVL: null,
    trend24hPct: null,
  };
}

// DeFi TVL (primary DefiLlama, fallback to CoinGecko DeFi market cap)
async function getDefiTVL(): Promise<number | null> {
  // DefiLlama overview (open API)
  const tryLlama = async () => {
    // total TVL by chain, sum field 'tvl'
    const chains = await fetchJSON<any>("https://api.llama.fi/v2/chains");
    if (Array.isArray(chains)) {
      const total = chains.reduce((sum: number, c: any) => sum + (typeof c.tvl === 'number' ? c.tvl : 0), 0);
      return Number.isFinite(total) && total > 0 ? total : null;
    }
    return null;
  };

  try {
    const tvl = await tryLlama();
    if (tvl) return tvl;
  } catch {}

  // Fallback: CoinGecko DeFi data (use defi_market_cap as approximation if TVL unavailable)
  try {
    const defi = await fetchJSON<any>("https://api.coingecko.com/api/v3/global/decentralized_finance_defi");
    const cap = Number(defi?.data?.defi_market_cap?.replace(/[$,]/g, ""));
    if (Number.isFinite(cap)) return cap;
  } catch {}

  return null;
}

// Active BTC addresses (unique) last day, with fallback
async function getActiveAddresses(): Promise<number | null> {
  try {
    const bc = await fetchJSON<any>("https://api.blockchain.info/charts/n-unique-addresses?timespan=1days&format=json&cors=true");
    const last = bc?.values?.[bc.values.length - 1]?.y;
    return typeof last === 'number' ? last : null;
  } catch {}

  // Fallback: Blockchair
  try {
    const stats = await fetchJSON<any>("https://api.blockchair.com/bitcoin/stats");
    const val = stats?.data?.addresses?.unique_24h ?? stats?.data?.addresses_24h ?? null;
    return typeof val === 'number' ? val : null;
  } catch {}

  return null;
}

// Fear & Greed
async function getFearGreed(): Promise<number | null> {
  try {
    const fng = await fetchJSON<any>("https://api.alternative.me/fng/?limit=1&format=json");
    const val = Number(fng?.data?.[0]?.value);
    return Number.isFinite(val) ? val : null;
  } catch {}
  return null;
}

// Social volume approximation via CoinGecko trending endpoint
async function getSocialVolumePct(): Promise<number | null> {
  try {
    const tr = await fetchJSON<any>("https://api.coingecko.com/api/v3/search/trending");
    const coins = tr?.coins ?? [];
    if (!Array.isArray(coins) || coins.length === 0) return 0;
    // Normalize average score (0..1) to 0..100, clamp
    const avgScore = coins.reduce((s: number, c: any) => s + (c.item?.score ?? 0), 0) / coins.length;
    const pct = Math.max(0, Math.min(100, (avgScore / 10) * 100));
    return pct;
  } catch {}
  return null;
}

// Top movers from CoinGecko markets (24h)
async function getTopMovers(): Promise<TopMover[]> {
  try {
    const q = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "100",
      page: "1",
      sparkline: "false",
      price_change_percentage: "24h",
    });
    const list = await fetchJSON<any[]>(`https://api.coingecko.com/api/v3/coins/markets?${q.toString()}`);
    const mapped: TopMover[] = list.map((c: any) => ({
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0,
      image: c.image,
    }));
    // sort by absolute positive change descending
    return mapped
      .filter(m => Number.isFinite(m.change24h))
      .sort((a, b) => (b.change24h) - (a.change24h))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export type MarketIntel = {
  overview: MarketOverviewData;
  sentiment: MarketSentimentData;
  topMovers: TopMover[];
  lastUpdated: string;
}

async function fetchMarketIntel(newsCount24h?: number): Promise<MarketIntel> {
  const [global, tvl, active, fng, socialPct, movers] = await Promise.all([
    getGlobalMarket(),
    getDefiTVL(),
    getActiveAddresses(),
    getFearGreed(),
    getSocialVolumePct(),
    getTopMovers(),
  ]);

  // Derive news volume percentage from provided count (if present)
  const newsPct = typeof newsCount24h === 'number' && newsCount24h >= 0
    ? Math.max(0, Math.min(100, (newsCount24h / 500) * 100))
    : null;

  return {
    overview: {
      totalMarketCap: global.totalMarketCap,
      totalVolume24h: global.totalVolume24h,
      btcDominance: global.btcDominance,
      ethDominance: global.ethDominance,
      activeAddresses24h: active,
      defiTVL: tvl,
    },
    sentiment: {
      fearGreedIndex: fng,
      newsVolumePct: newsPct,
      socialVolumePct: socialPct,
      trend24hPct: global.trend24hPct,
    },
    topMovers: movers,
    lastUpdated: new Date().toISOString(),
  };
}

export function useMarketIntel(newsCount24h?: number) {
  return useQuery<MarketIntel>({
    queryKey: ["market-intel", newsCount24h ?? 0],
    queryFn: () => fetchMarketIntel(newsCount24h),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });
}
