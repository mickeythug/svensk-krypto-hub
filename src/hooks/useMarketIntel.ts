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

export type MarketAnalysis = {
  trend: "Bullish" | "Bearish" | "Neutral";
  summary: string;
  positives: string[];
  negatives: string[];
  generatedAt: string;
};

function formatAbbrevUSD(n?: number | null) {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return '—';
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T USD';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B USD';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M USD';
  return n.toFixed(2) + ' USD';
}

function computeMarketAnalysis(params: {
  totalMarketCap: number | null;
  totalVolume24h: number | null;
  btcDominance: number | null;
  defiTVL: number | null;
  trend24hPct: number | null;
  fearGreedIndex: number | null;
  socialVolumePct: number | null;
  topMovers: TopMover[];
}): MarketAnalysis {
  const {
    totalMarketCap, totalVolume24h, btcDominance, defiTVL,
    trend24hPct, fearGreedIndex, socialVolumePct, topMovers
  } = params;

  const positives: string[] = [];
  const negatives: string[] = [];
  let score = 0;

  // Trend 24h
  if (typeof trend24hPct === 'number') {
    if (trend24hPct > 1.5) { score += 2; positives.push(`Globalt marknadsvärde +${trend24hPct.toFixed(2)}% senaste 24h`); }
    else if (trend24hPct > 0.2) { score += 1; positives.push(`Globalt marknadsvärde +${trend24hPct.toFixed(2)}% senaste 24h`); }
    else if (trend24hPct < -1.5) { score -= 2; negatives.push(`Globalt marknadsvärde ${trend24hPct.toFixed(2)}% senaste 24h`); }
    else if (trend24hPct < -0.2) { score -= 1; negatives.push(`Globalt marknadsvärde ${trend24hPct.toFixed(2)}% senaste 24h`); }
  }

  // Fear & Greed
  if (typeof fearGreedIndex === 'number') {
    if (fearGreedIndex >= 60) { score += 1; positives.push(`Sentiment: Greed (${fearGreedIndex})`); }
    else if (fearGreedIndex <= 40) { score -= 1; negatives.push(`Sentiment: Fear (${fearGreedIndex})`); }
  }

  // Social volume proxy
  if (typeof socialVolumePct === 'number') {
    if (socialVolumePct >= 50) { score += 1; positives.push(`Hög social aktivitet (${socialVolumePct.toFixed(0)}%)`); }
    else if (socialVolumePct <= 30) { score -= 1; negatives.push(`Svag social aktivitet (${socialVolumePct.toFixed(0)}%)`); }
  }

  // Volume to Market Cap ratio
  if (typeof totalMarketCap === 'number' && typeof totalVolume24h === 'number') {
    const ratio = totalVolume24h / totalMarketCap;
    if (ratio >= 0.04) { score += 1; positives.push(`Stark handelsaktivitet (volym/mcap ${(ratio*100).toFixed(1)}%)`); }
    else if (ratio < 0.02) { score -= 1; negatives.push(`Låg handelsaktivitet (volym/mcap ${(ratio*100).toFixed(1)}%)`); }
  }

  // BTC Dominance heuristic
  if (typeof btcDominance === 'number') {
    if (btcDominance >= 55) { score -= 1; negatives.push(`Hög BTC-dominans (${btcDominance.toFixed(1)}%) – risk-off`); }
    else if (btcDominance <= 45) { score += 1; positives.push(`Lägre BTC-dominans (${btcDominance.toFixed(1)}%) – altcoins gynnas`); }
  }

  // DeFi TVL
  if (typeof defiTVL === 'number' && defiTVL > 0) {
    const tvlText = formatAbbrevUSD(defiTVL);
    if (defiTVL >= 4e10) { score += 1; positives.push(`Stark DeFi-aktivitet (TVL ${tvlText})`); }
    else if (defiTVL < 2e10) { score -= 1; negatives.push(`Svag DeFi-aktivitet (TVL ${tvlText})`); }
  }

  // Top mover confirmation
  if (topMovers && topMovers.length) {
    const avgTop5 = topMovers.reduce((s, m) => s + (m.change24h || 0), 0) / Math.max(1, topMovers.length);
    if (avgTop5 >= 5) { score += 1; positives.push(`Toppvinnare i snitt +${avgTop5.toFixed(1)}% (24h)`); }
    else if (avgTop5 <= -5) { score -= 1; negatives.push(`Toppförlorare i snitt ${avgTop5.toFixed(1)}% (24h)`); }
  }

  const trend: MarketAnalysis["trend"] = score >= 2 ? "Bullish" : score <= -2 ? "Bearish" : "Neutral";
  const summary = [
    `Marknadsvärde: ${formatAbbrevUSD(totalMarketCap)}`,
    `24h Volym: ${formatAbbrevUSD(totalVolume24h)}`,
    typeof btcDominance === 'number' ? `BTC-dominans: ${btcDominance.toFixed(1)}%` : null,
    typeof trend24hPct === 'number' ? `24h Förändring: ${(trend24hPct >= 0 ? '+' : '') + trend24hPct.toFixed(2)}%` : null,
  ].filter(Boolean).join(" • ");

  return {
    trend,
    summary,
    positives,
    negatives,
    generatedAt: new Date().toISOString(),
  };
}

export type MarketIntel = {
  overview: MarketOverviewData;
  sentiment: MarketSentimentData;
  topMovers: TopMover[];
  analysis: MarketAnalysis;
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

  const todayKey = new Date().toISOString().slice(0, 10);
  let analysis: MarketAnalysis | null = null;
  try {
    const cached = localStorage.getItem(`market-analysis:${todayKey}`);
    if (cached) {
      analysis = JSON.parse(cached) as MarketAnalysis;
    }
  } catch {}

  if (!analysis) {
    analysis = computeMarketAnalysis({
      totalMarketCap: global.totalMarketCap,
      totalVolume24h: global.totalVolume24h,
      btcDominance: global.btcDominance,
      defiTVL: tvl,
      trend24hPct: global.trend24hPct,
      fearGreedIndex: fng,
      socialVolumePct: socialPct,
      topMovers: movers,
    });
    try { localStorage.setItem(`market-analysis:${todayKey}`, JSON.stringify(analysis)); } catch {}
  }

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
    analysis,
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
