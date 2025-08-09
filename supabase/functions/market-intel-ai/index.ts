import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const openAIApiKey = Deno.env.get("OPENAI_API") || Deno.env.get("OPENAI_API_KEY");
const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function fetchJSON<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

// --- TA utils ---
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
function macdCalc(values: number[], fast = 12, slow = 26, signalP = 9) {
  if (values.length < slow + signalP) return { macd: null as number | null, signal: null as number | null, hist: null as number | null };
  const emaFast: number[] = [];
  const emaSlow: number[] = [];
  const kFast = 2 / (fast + 1);
  const kSlow = 2 / (slow + 1);
  let ef = values.slice(0, fast).reduce((a, b) => a + b, 0) / fast;
  let es = values.slice(0, slow).reduce((a, b) => a + b, 0) / slow;
  for (let i = fast; i < values.length; i++) { ef = values[i] * kFast + ef * (1 - kFast); emaFast.push(ef); }
  for (let i = slow; i < values.length; i++) { es = values[i] * kSlow + es * (1 - kSlow); emaSlow.push(es); }
  const macdArr: number[] = [];
  for (let i = 0; i < Math.min(emaFast.length, emaSlow.length); i++) {
    macdArr.push(emaFast[emaFast.length - Math.min(emaFast.length, emaSlow.length) + i] -
                 emaSlow[emaSlow.length - Math.min(emaFast.length, emaSlow.length) + i]);
  }
  const kSig = 2 / (signalP + 1);
  let sig = macdArr.slice(0, signalP).reduce((a, b) => a + b, 0) / signalP;
  for (let i = signalP; i < macdArr.length; i++) { sig = macdArr[i] * kSig + sig * (1 - kSig); }
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
function bollinger(values: number[], period = 20, k = 2) {
  if (values.length < period) return { upper: null as number | null, lower: null as number | null };
  const slice = values.slice(-period);
  const m = slice.reduce((a, b) => a + b, 0) / period;
  const sd = stddev(slice);
  return { upper: m + k * sd, lower: m - k * sd };
}

function diagnoseTA(values: number[]) {
  const price = values[values.length - 1] ?? 0;
  const sma20 = sma(values, 20);
  const sma50 = sma(values, 50);
  const sma200 = sma(values, 200);
  const ema20 = ema(values, 20);
  const ema50 = ema(values, 50);
  const rsi14 = rsi(values, 14);
  const { macd, signal: macdSignal, hist: macdHist } = macdCalc(values, 12, 26, 9);
  const bb = bollinger(values, 20, 2);

  // Improved trend logic using a scoring system across indicators
  let bull = 0, bear = 0;
  if (price && sma20) {
    if (price > sma20) bull++; else bear++;
  }
  if (sma20 && sma50) {
    if (sma20 > sma50) bull++; else bear++;
  }
  if (sma50 && sma200) {
    if (sma50 > sma200) bull++; else bear++;
  }
  if (ema20 && ema50) {
    if (ema20 > ema50) bull++; else bear++;
  }
  if (typeof rsi14 === 'number') {
    if (rsi14 >= 60) bull += 2; else if (rsi14 <= 40) bear += 2;
  }
  if (typeof macdHist === 'number') {
    if (macdHist > 0) bull++; else if (macdHist < 0) bear++;
  }

  let trend: "Bullish" | "Bearish" | "Sideways" = "Sideways";
  if (bull - bear >= 2) trend = "Bullish";
  else if (bear - bull >= 2) trend = "Bearish";

  return { price, sma20, sma50, sma200, ema20, ema50, rsi14, macd, macdSignal, macdHist, bbUpper: bb.upper, bbLower: bb.lower, trend };
}

async function getDailyPrices(coinId: string, days = 200): Promise<number[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    const data = await fetchJSON<any>(url);
    const prices = Array.isArray(data?.prices) ? data.prices.map((p: any[]) => Number(p[1])) : [];
    return prices.filter((n: number) => Number.isFinite(n));
  } catch { return []; }
}
async function getHourlyPrices(coinId: string, days = 14): Promise<number[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    const data = await fetchJSON<any>(url);
    const prices = Array.isArray(data?.prices) ? data.prices.map((p: any[]) => Number(p[1])) : [];
    return prices.filter((n: number) => Number.isFinite(n));
  } catch { return []; }
}

// Simple price fallback to guarantee non-zero current prices
async function getSimplePrices(ids: string[]): Promise<Record<string, number>> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const data = await fetchJSON<any>(url);
    const out: Record<string, number> = {};
    for (const id of ids) {
      const v = Number(data?.[id]?.usd);
      if (Number.isFinite(v) && v > 0) out[id] = v;
    }
    return out;
  } catch { return {}; }
}

function downsample(values: number[], step: number): number[] {
  if (step <= 1) return values.slice();
  const result: number[] = [];
  for (let i = Math.max(0, values.length - 400); i < values.length; i += step) result.push(values[i]);
  return result;
}

async function getGlobalMarket() {
  try {
    const cg = await fetchJSON<any>("https://api.coingecko.com/api/v3/global");
    const d = cg.data ?? cg;
    return {
      totalMarketCap: Number(d.total_market_cap?.usd ?? null) || null,
      totalVolume24h: Number(d.total_volume?.usd ?? null) || null,
      btcDominance: Number(d.market_cap_percentage?.btc ?? null) || null,
      ethDominance: Number(d.market_cap_percentage?.eth ?? null) || null,
      trend24hPct: typeof d.market_cap_change_percentage_24h_usd === 'number' ? d.market_cap_change_percentage_24h_usd : null,
    };
  } catch { return { totalMarketCap: null, totalVolume24h: null, btcDominance: null, ethDominance: null, trend24hPct: null }; }
}
async function getDefiTVL(): Promise<number | null> {
  try {
    const chains = await fetchJSON<any>("https://api.llama.fi/v2/chains");
    if (Array.isArray(chains)) {
      const total = chains.reduce((sum: number, c: any) => sum + (typeof c.tvl === 'number' ? c.tvl : 0), 0);
      return Number.isFinite(total) && total > 0 ? total : null;
    }
  } catch {}
  try {
    const defi = await fetchJSON<any>("https://api.coingecko.com/api/v3/global/decentralized_finance_defi");
    const cap = Number(defi?.data?.defi_market_cap?.replace(/[$,]/g, ""));
    if (Number.isFinite(cap)) return cap;
  } catch {}
  return null;
}
async function getFearGreed(): Promise<number | null> {
  try {
    const fng = await fetchJSON<any>("https://api.alternative.me/fng/?limit=1&format=json");
    const val = Number(fng?.data?.[0]?.value);
    return Number.isFinite(val) ? val : null;
  } catch { return null; }
}
async function getSocialVolumePct(): Promise<number | null> {
  try {
    const tr = await fetchJSON<any>("https://api.coingecko.com/api/v3/search/trending");
    const coins = tr?.coins ?? [];
    if (!Array.isArray(coins) || coins.length === 0) return 0;
    const avgScore = coins.reduce((s: number, c: any) => s + (c.item?.score ?? 0), 0) / coins.length;
    return Math.max(0, Math.min(100, (avgScore / 10) * 100));
  } catch { return null; }
}
async function getTopMovers() {
  try {
    const q = new URLSearchParams({ vs_currency: "usd", order: "market_cap_desc", per_page: "100", page: "1", sparkline: "false", price_change_percentage: "24h" });
    const list = await fetchJSON<any[]>(`https://api.coingecko.com/api/v3/coins/markets?${q.toString()}`);
    return list.map((c: any) => ({ symbol: (c.symbol || "").toUpperCase(), name: c.name, price: c.current_price, change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0 }));
  } catch { return []; }
}

// Optional: Live web research via Perplexity (if key provided)
async function researchViaPerplexity(facts: any): Promise<any | null> {
  if (!perplexityApiKey) return null;
  try {
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: 'Du är en mycket noggrann krypto-researchanalytiker. Svara ENDAST med giltig JSON enligt schema, inga förklaringar.' },
          { role: 'user', content: `Hämta AKTUELLA nivåer och marknadsdata från webben för BTC och ETH. Följ detta JSON-schema strikt (inga extra fält):\n${`{
  "trend": "Bullish|Bearish|Neutral",
  "summary": "Marknadsvärde: <exact> • 24h Volym: <exact> • BTC-dominans: <exact>% • 24h Förändring: <exact>%",
  "positives": [],
  "negatives": [],
  "technicalLevels": {
    "btc": {
      "currentPrice": 0,
      "nextSupport": { "price": 0, "text": "" },
      "nextResistance": { "price": 0, "text": "" },
      "criticalLevel": { "price": 0, "text": "", "type": "breakout|breakdown|approaching" }
    },
    "eth": {
      "currentPrice": 0,
      "nextSupport": { "price": 0, "text": "" },
      "nextResistance": { "price": 0, "text": "" },
      "criticalLevel": { "price": 0, "text": "", "type": "breakout|breakdown|approaching" }
    }
  },
  "ta": { "btc": {"d1": {}, "d7": {}, "m1": {}}, "eth": {"d1": {}, "d7": {}, "m1": {}} },
  "sentiment": { "fearGreed": 0, "socialMediaTrend": "", "institutionalFlow": "" },
  "generatedAt": "",
  "sources": []
}`}` }
        ],
        search_domain_filter: [],
        search_recency_filter: 'week',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });
    if (!resp.ok) throw new Error(`Perplexity ${resp.status}`);
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    try { return JSON.parse(content); } catch { return null; }
  } catch (e) {
    console.error('Perplexity research failed', e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API not set" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse body early to read flags
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {} as any;
    const { newsCount24h, refresh } = body || {};

    // Centralized TTL cache (ai_market_intel_cache) unless forced refresh
    const cacheKey = 'ai:market:rolling:v1';
    if (!refresh) {
      const { data: cached } = await supabase
        .from('ai_market_intel_cache')
        .select('data, expires_at')
        .eq('key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();
      if (cached?.data) {
        console.log('Returning cached AI analysis from centralized cache');
        return new Response(JSON.stringify(cached.data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

const [global, tvl, fng, socialPct, movers, btcH3, ethH3, btcH8, ethH8, btcD120, ethD120, simple] = await Promise.all([
  getGlobalMarket(),
  getDefiTVL(),
  getFearGreed(),
  getSocialVolumePct(),
  getTopMovers(),
  getHourlyPrices('bitcoin', 3),
  getHourlyPrices('ethereum', 3),
  getHourlyPrices('bitcoin', 8),
  getHourlyPrices('ethereum', 8),
  getDailyPrices('bitcoin', 120),
  getDailyPrices('ethereum', 120),
  getSimplePrices(['bitcoin','ethereum']),
]);

const btcTaD1 = diagnoseTA(btcH3);
const ethTaD1 = diagnoseTA(ethH3);
const btcTaD7 = diagnoseTA(btcH8);
const ethTaD7 = diagnoseTA(ethH8);
const btcTaM1 = diagnoseTA(btcD120.slice(-60));
const ethTaM1 = diagnoseTA(ethD120.slice(-60));

// Ensure non-zero current prices using simple price fallback
const btcSpot = Number(simple?.bitcoin);
const ethSpot = Number(simple?.ethereum);
if ((!btcTaD1.price || btcTaD1.price <= 0) && Number.isFinite(btcSpot) && btcSpot > 0) {
  (btcTaD1 as any).price = btcSpot;
}
if ((!ethTaD1.price || ethTaD1.price <= 0) && Number.isFinite(ethSpot) && ethSpot > 0) {
  (ethTaD1 as any).price = ethSpot;
}

    const topMovers = movers
      .filter((m: any) => Number.isFinite(m.change24h))
      .sort((a: any, b: any) => b.change24h - a.change24h)
      .slice(0, 5);

    const newsPct = typeof newsCount24h === 'number' && newsCount24h >= 0 ? Math.max(0, Math.min(100, (newsCount24h / 500) * 100)) : null;

    const facts = {
      overview: { ...global, defiTVL: tvl },
      sentiment: { fearGreedIndex: fng, newsVolumePct: newsPct, socialVolumePct: socialPct },
      topMovers,
      ta: { btc: { d1: btcTaD1, d7: btcTaD7, m1: btcTaM1 }, eth: { d1: ethTaD1, d7: ethTaD7, m1: ethTaM1 } },
      computed: {
        ethWeeklyChangePct: (() => {
          const n = ethD120.length;
          if (n < 8) return null;
          const last = ethD120[n - 1];
          const weekAgo = ethD120[n - 8];
          return ((last - weekAgo) / weekAgo) * 100;
        })(),
        btcWeeklyChangePct: (() => {
          const n = btcD120.length;
          if (n < 8) return null;
          const last = btcD120[n - 1];
          const weekAgo = btcD120[n - 8];
          return ((last - weekAgo) / weekAgo) * 100;
        })(),
      },
      sources: [
        "https://api.coingecko.com/api/v3/global",
        "https://api.coingecko.com/api/v3/coins/markets",
        "https://api.coingecko.com/api/v3/search/trending",
        "https://api.llama.fi/v2/chains",
        "https://api.alternative.me/fng/",
      ],
      generatedAt: new Date().toISOString(),
    };

const prompt = `Du är en senior krypto-researchanalytiker med fokus på precision och riskhantering.\n\nMål: Producera ENDAST giltig JSON enligt schemat nedan. Använd exakta nivåer och siffror. Skriv korta, klara texter på svenska.\n\nKrav för analysen:\n- Konsolidera all realtidsdata som skickas i Fakta till en heltäckande bedömning\n- Teknisk analys för BTC och ETH på 1D, 7D och 1M baserat på givna indikatorer (SMA20/50/200, EMA20/50, RSI14, MACD, Bollinger-band)\n- Ange nästa stöd/motstånd i USD och avgör criticalLevel.type: 'breakout' | 'breakdown' | 'approaching' med en tydlig, kort text\n- Sentiment: inkludera Fear & Greed, social aktivitet och (om ej kända) sätt institutionalFlow till '—'\n- Makro: nämn kort ev. kända faktorer från fynden (räntor, reglering, ETF-flöden); om okänt, utelämna\n- Summera exakt 5 positiva och 5 risker (om färre, fyll på med de starkaste signalerna från TA och volym/mcap)\n- Svara endast med JSON, inga förklaringar utanför JSON\n\nJSON SCHEMA (oförändrat): ${JSON.stringify({
  trend: "Bullish|Bearish|Neutral",
  summary: "Marknadsvärde: <exact> • 24h Volym: <exact> • BTC-dominans: <exact>% • 24h Förändring: <exact>%",
  positives: [],
  negatives: [],
  technicalLevels: {
    btc: { currentPrice: 0, nextSupport: { price: 0, text: "" }, nextResistance: { price: 0, text: "" }, criticalLevel: { price: 0, text: "", type: "breakout|breakdown|approaching" } },
    eth: { currentPrice: 0, nextSupport: { price: 0, text: "" }, nextResistance: { price: 0, text: "" }, criticalLevel: { price: 0, text: "", type: "breakout|breakdown|approaching" } },
  },
  ta: { btc: { d1: {} as any, d7: {} as any, m1: {} as any }, eth: { d1: {} as any, d7: {} as any, m1: {} as any } },
  sentiment: { fearGreed: 0, socialMediaTrend: "", institutionalFlow: "" },
  generatedAt: new Date().toISOString(),
  sources: []
})}\n`;

    // Optional web research
    const perpFindings = await researchViaPerplexity(facts);

    const finalUser = `Verifiera och sammanfoga följande DATA till korrekt JSON enligt schema. \nFakta (mätvärden): ${JSON.stringify(facts)}\n\nWebb-fynd (om tillgängligt): ${JSON.stringify(perpFindings)}\n\nRegler:\n- Behåll exakta nivåer för nästa stöd/motstånd\n- Sätt criticalLevel.type till 'breakout' | 'breakdown' | 'approaching' med tydlig text (t.ex. 'Närmar oss breakout $67,890')\n- Summera 5 positiva och 5 risker\n- Sätt källor om tillgängligt\n- Svara ENDAST med JSON`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "o3-2025-04-16",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Du är en extremt noggrann kryptoanalytiker. Svara endast med giltig JSON utan extra text." },
          { role: "user", content: prompt },
          { role: "user", content: finalUser },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`OpenAI error ${aiRes.status}: ${txt}`);
    }
    const aiJson = await aiRes.json();
    let contentRaw = aiJson?.choices?.[0]?.message?.content ?? "";

    // Extract clean JSON from possible code fences or text
    const extractJson = (txt: string): any => {
      try {
        const fenceMatch = txt.match(/```json\s*([\s\S]*?)```/i) || txt.match(/```\s*([\s\S]*?)```/i);
        const candidate = fenceMatch ? fenceMatch[1] : txt;
        // Trim and slice from first { to last }
        const start = candidate.indexOf('{');
        const end = candidate.lastIndexOf('}');
        const jsonStr = start !== -1 && end !== -1 ? candidate.slice(start, end + 1) : candidate;
        return JSON.parse(jsonStr);
      } catch (_e) { return null; }
    };

    let parsed: any = extractJson(contentRaw);
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }

    // Normalize AI levels with sanity checks against current price and TA bands
    function ensureLevels(raw: any, ta: any) {
      const price = Number(raw?.currentPrice) || Number(ta?.price) || 0;
      let sup = Number(raw?.nextSupport?.price);
      let res = Number(raw?.nextResistance?.price);
      const bbLower = Number(ta?.bbLower) || (price ? price * 0.97 : 0);
      const bbUpper = Number(ta?.bbUpper) || (price ? price * 1.03 : 0);

      if (!Number.isFinite(sup)) sup = bbLower || price * 0.97;
      if (!Number.isFinite(res)) res = bbUpper || price * 1.03;

      // Enforce logical ordering
      if (sup >= price) sup = Math.min(price * 0.98, bbLower || price * 0.97);
      if (res <= price) res = Math.max(price * 1.02, bbUpper || price * 1.03);

      // Determine critical state
      let type: 'breakout' | 'breakdown' | 'approaching' = 'approaching';
      let text = '';
      const nearRes = (res - price) / res;
      const nearSup = (price - sup) / price;
      if (price >= res * 1.001) {
        type = 'breakout';
        text = `Brutit genom motstånd $${Math.round(res).toLocaleString()}`;
      } else if (price <= sup * 0.999) {
        type = 'breakdown';
        text = `Brutit ned genom stöd $${Math.round(sup).toLocaleString()}`;
      } else if (nearRes <= nearSup) {
        type = 'approaching';
        text = `Närmar oss breakout $${Math.round(res).toLocaleString()}`;
      } else {
        type = 'approaching';
        text = `Närmar oss breakdown $${Math.round(sup).toLocaleString()}`;
      }

      return {
        currentPrice: price,
        nextSupport: { price: sup, text: `Nästa stöd $${Math.round(sup).toLocaleString()}` },
        nextResistance: { price: res, text: `Nästa motstånd $${Math.round(res).toLocaleString()}` },
        criticalLevel: { price: type === 'approaching' ? (nearRes <= nearSup ? res : sup) : (type === 'breakout' ? res : sup), text, type },
      };
    }

    const compactUSD = (n?: number | null) => {
      if (typeof n !== 'number' || !isFinite(n)) return '—';
      return `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)}`;
    };

    const ensured = {
      trend: parsed.trend ?? (facts?.overview?.trend24hPct && facts.overview.trend24hPct >= 0 ? 'Bullish' : 'Neutral'),
      summary: parsed.summary ?? `Marknadsvärde: ${compactUSD(facts?.overview?.totalMarketCap)} • 24h Volym: ${compactUSD(facts?.overview?.totalVolume24h)} • BTC-dominans: ${typeof facts?.overview?.btcDominance === 'number' ? `${facts.overview.btcDominance.toFixed(2)}%` : '—'} • 24h Förändring: ${typeof facts?.overview?.trend24hPct === 'number' ? `${facts.overview.trend24hPct.toFixed(2)}%` : '—'}`,
      positives: Array.isArray(parsed.positives) && parsed.positives.length ? parsed.positives : [
        facts?.overview?.trend24hPct && facts.overview.trend24hPct > 0 ? `Globalt marknadsvärde ${facts.overview.trend24hPct.toFixed(2)}% senaste 24h` : undefined,
        typeof facts?.sentiment?.fearGreedIndex === 'number' ? `Sentiment: ${facts.sentiment.fearGreedIndex >= 60 ? 'Greed' : 'Neutral'} (${facts.sentiment.fearGreedIndex})` : undefined,
        typeof facts?.overview?.defiTVL === 'number' ? `Stark DeFi-aktivitet (TVL $${Math.round(facts.overview.defiTVL).toLocaleString()})` : undefined,
      ].filter(Boolean) as string[],
      negatives: Array.isArray(parsed.negatives) && parsed.negatives.length ? parsed.negatives : [
        typeof facts?.overview?.btcDominance === 'number' && facts.overview.btcDominance > 55 ? `Hög BTC-dominans (${facts.overview.btcDominance.toFixed(1)}%) – risk-off` : undefined,
      ].filter(Boolean) as string[],
      technicalLevels: {
        btc: ensureLevels(parsed?.technicalLevels?.btc, facts.ta.btc.d1),
        eth: ensureLevels(parsed?.technicalLevels?.eth, facts.ta.eth.d1),
      },
      ta: facts.ta,
      sentiment: parsed.sentiment ?? {
        fearGreed: typeof facts?.sentiment?.fearGreedIndex === 'number' ? facts.sentiment.fearGreedIndex : null,
        socialMediaTrend: typeof facts?.sentiment?.socialVolumePct === 'number' ? `${Math.round(facts.sentiment.socialVolumePct)}% social aktivitet` : '—',
        institutionalFlow: '—',
      },
    };

    const out = {
      ...ensured,
      generatedAt: ensured.generatedAt || facts.generatedAt,
      sources: Array.isArray(parsed.sources) && parsed.sources.length ? parsed.sources : facts.sources,
    };

    // Cache the result for ~2 minutes (centralized cache)
    const expires = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    await supabase
      .from('ai_market_intel_cache')
      .upsert({ key: cacheKey, data: out, expires_at: expires, source: 'openai', version: 'v1' });

    console.log('Generated and cached new AI analysis (TTL 2m)');
    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("market-intel-ai error", err);
    try {
      const { data: cachedLatest } = await supabase
        .from('ai_market_intel_cache')
        .select('data')
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cachedLatest?.data) {
        console.log('Returning last cached AI analysis due to error');
        return new Response(JSON.stringify(cachedLatest.data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } catch (_e) { /* ignore */ }
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
