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

// ---- Tekniska indikatorer (BTC/ETH) ----
export type TATrend = "Bullish" | "Bearish" | "Sideways";
export type TAResult = {
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema20: number | null;
  ema50: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  bbUpper: number | null;
  bbLower: number | null;
  trend: TATrend;
  positives: string[];
  negatives: string[];
};

function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let emaPrev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) {
    emaPrev = values[i] * k + emaPrev * (1 - k);
  }
  return emaPrev;
}

function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = Math.max(0, diff);
    const loss = Math.max(0, -diff);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function macdCalc(values: number[], fast = 12, slow = 26, signalP = 9): { macd: number | null, signal: number | null, hist: number | null } {
  if (values.length < slow + signalP) return { macd: null, signal: null, hist: null };
  const emaFast = [] as number[];
  const emaSlow = [] as number[];
  const kFast = 2 / (fast + 1);
  const kSlow = 2 / (slow + 1);
  let ef = values.slice(0, fast).reduce((a, b) => a + b, 0) / fast;
  let es = values.slice(0, slow).reduce((a, b) => a + b, 0) / slow;
  for (let i = fast; i < values.length; i++) {
    ef = values[i] * kFast + ef * (1 - kFast);
    emaFast.push(ef);
  }
  for (let i = slow; i < values.length; i++) {
    es = values[i] * kSlow + es * (1 - kSlow);
    emaSlow.push(es);
  }
  const start = values.length - Math.min(emaFast.length, emaSlow.length);
  const macdArr = [] as number[];
  for (let i = 0; i < Math.min(emaFast.length, emaSlow.length); i++) {
    macdArr.push(emaFast[emaFast.length - 1 - (Math.min(emaFast.length, emaSlow.length) - 1 - i)] - emaSlow[emaSlow.length - 1 - (Math.min(emaFast.length, emaSlow.length) - 1 - i)]);
  }
  // Signal EMA on MACD
  const kSig = 2 / (signalP + 1);
  let sig = macdArr.slice(0, signalP).reduce((a, b) => a + b, 0) / signalP;
  for (let i = signalP; i < macdArr.length; i++) {
    sig = macdArr[i] * kSig + sig * (1 - kSig);
  }
  const macdVal = macdArr[macdArr.length - 1];
  const signalVal = sig;
  const hist = macdVal - signalVal;
  return { macd: macdVal, signal: signalVal, hist };
}

function stddev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function bollinger(values: number[], period = 20, k = 2): { upper: number | null, lower: number | null } {
  if (values.length < period) return { upper: null, lower: null };
  const slice = values.slice(-period);
  const m = slice.reduce((a, b) => a + b, 0) / period;
  const sd = stddev(slice);
  return { upper: m + k * sd, lower: m - k * sd };
}

async function getDailyPrices(coinId: string, days = 200): Promise<number[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    const data = await fetchJSON<any>(url);
    const prices = Array.isArray(data?.prices) ? data.prices.map((p: any[]) => Number(p[1])) : [];
    return prices.filter((n: number) => Number.isFinite(n));
  } catch {
    return [];
  }
}

async function getHourlyPrices(coinId: string, days = 14): Promise<number[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    const data = await fetchJSON<any>(url);
    const prices = Array.isArray(data?.prices) ? data.prices.map((p: any[]) => Number(p[1])) : [];
    return prices.filter((n: number) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function downsample(values: number[], step: number): number[] {
  if (step <= 1) return values.slice();
  const result: number[] = [];
  for (let i = Math.max(0, values.length - 400); i < values.length; i += step) {
    result.push(values[i]);
  }
  return result;
}

function diagnoseTA(values: number[]): TAResult {
  const price = values[values.length - 1] ?? null;
  const sma20 = sma(values, 20);
  const sma50 = sma(values, 50);
  const sma200 = sma(values, 200);
  const ema20 = ema(values, 20);
  const ema50 = ema(values, 50);
  const rsi14 = rsi(values, 14);
  const { macd, signal: macdSignal, hist: macdHist } = macdCalc(values, 12, 26, 9);
  const bb = bollinger(values, 20, 2);

  const positives: string[] = [];
  const negatives: string[] = [];

  let trend: TATrend = "Sideways";
  if (price != null && sma50 != null && sma200 != null && ema20 != null && ema50 != null) {
    const bull = price > sma50 && sma50 > sma200 && ema20 > ema50;
    const bear = price < sma50 && sma50 < sma200 && ema20 < ema50;
    trend = bull ? "Bullish" : bear ? "Bearish" : "Sideways";
  }
  if (trend === 'Bullish') positives.push('Trend: pris>SMA50>SMA200, EMA20>EMA50');
  if (trend === 'Bearish') negatives.push('Trend: pris<SMA50<SMA200, EMA20<EMA50');

  if (typeof macd === 'number' && typeof macdSignal === 'number') {
    if (macd > macdSignal) positives.push(`MACD över signal (${macd.toFixed(2)} > ${macdSignal.toFixed(2)})`);
    else negatives.push(`MACD under signal (${macd.toFixed(2)} < ${macdSignal.toFixed(2)})`);
  }
  if (typeof rsi14 === 'number') {
    if (rsi14 > 70) negatives.push(`RSI överköpt (${rsi14.toFixed(0)})`);
    else if (rsi14 < 30) positives.push(`RSI översåld (${rsi14.toFixed(0)})`);
    else positives.push(`RSI neutral (${rsi14.toFixed(0)})`);
  }

  return {
    price: price ?? 0,
    sma20, sma50, sma200,
    ema20, ema50,
    rsi14,
    macd, macdSignal, macdHist,
    bbUpper: bb.upper, bbLower: bb.lower,
    trend,
    positives,
    negatives,
  };
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
  btcTa?: TAResult;
  ethTa?: TAResult;
  btcTaD7?: TAResult;
  ethTaD7?: TAResult;
  btcTaM1?: TAResult;
  ethTaM1?: TAResult;
}): MarketAnalysis {
  const {
    totalMarketCap, totalVolume24h, btcDominance, defiTVL,
    trend24hPct, fearGreedIndex, socialVolumePct, topMovers,
    btcTa, ethTa
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

  // BTC/ETH teknisk analys
  const taBullet = (label: string, ta?: TAResult, weight = 1) => {
    if (!ta) return;
    const parts = [] as string[];
    if (ta.sma50 != null && ta.sma200 != null) parts.push(`SMA50 ${(ta.sma50).toFixed(0)}, SMA200 ${(ta.sma200).toFixed(0)}`);
    if (ta.ema20 != null && ta.ema50 != null) parts.push(`EMA20 ${(ta.ema20).toFixed(0)}, EMA50 ${(ta.ema50).toFixed(0)}`);
    if (typeof ta.rsi14 === 'number') parts.push(`RSI ${ta.rsi14.toFixed(0)}`);
    if (typeof ta.macd === 'number' && typeof ta.macdSignal === 'number') parts.push(`MACD ${ta.macd.toFixed(2)}/${ta.macdSignal.toFixed(2)}`);
    const line = `${label}: ${parts.join(' • ')}`;
    if (ta.trend === 'Bullish') { score += weight; positives.push(`${label} Bullish – ${line}`); }
    else if (ta.trend === 'Bearish') { score -= weight; negatives.push(`${label} Bearish – ${line}`); }
    else { positives.push(`${label} Sideways – ${line}`); }
  };
  const args: any = arguments[0] || {};
  taBullet('BTC 1D', args?.btcTa, 2);
  taBullet('ETH 1D', args?.ethTa, 1.5);
  taBullet('BTC 7D', args?.btcTaD7, 1);
  taBullet('ETH 7D', args?.ethTaD7, 0.75);
  taBullet('BTC 1M', args?.btcTaM1, 0.5);
  taBullet('ETH 1M', args?.ethTaM1, 0.5);

  const trend: MarketAnalysis["trend"] = score >= 3 ? "Bullish" : score <= -3 ? "Bearish" : "Neutral";
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
  ta: {
    btc: { d1: TAResult; d7: TAResult; m1: TAResult };
    eth: { d1: TAResult; d7: TAResult; m1: TAResult };
  };
  lastUpdated: string;
}


async function fetchMarketIntel(newsCount24h?: number): Promise<MarketIntel> {
  const [global, tvl, active, fng, socialPct, movers, btcDaily, ethDaily] = await Promise.all([
    getGlobalMarket(),
    getDefiTVL(),
    getActiveAddresses(),
    getFearGreed(),
    getSocialVolumePct(),
    getTopMovers(),
    getDailyPrices('bitcoin', 1825),
    getDailyPrices('ethereum', 1825),
  ]);

  const btcTa = diagnoseTA(btcDaily);
  const ethTa = diagnoseTA(ethDaily);
  const btcTaD7 = diagnoseTA(downsample(btcDaily, 7));
  const ethTaD7 = diagnoseTA(downsample(ethDaily, 7));
  const btcTaM1 = diagnoseTA(downsample(btcDaily, 30));
  const ethTaM1 = diagnoseTA(downsample(ethDaily, 30));

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
      btcTa,
      ethTa,
      btcTaD7,
      ethTaD7,
      btcTaM1,
      ethTaM1,
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
    ta: {
      btc: { d1: btcTa, d7: btcTaD7, m1: btcTaM1 },
      eth: { d1: ethTa, d7: ethTaD7, m1: ethTaM1 },
    },
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
