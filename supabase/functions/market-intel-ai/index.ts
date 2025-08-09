import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const openAIApiKey = Deno.env.get("OPENAI_API") || Deno.env.get("OPENAI_API_KEY");

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
  let trend: "Bullish" | "Bearish" | "Sideways" = "Sideways";
  if (price && sma50 && sma200 && ema20 && ema50) {
    const bull = price > sma50 && sma50 > sma200 && ema20 > ema50;
    const bear = price < sma50 && sma50 < sma200 && ema20 < ema50;
    trend = bull ? "Bullish" : bear ? "Bearish" : "Sideways";
  }
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API not set" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check daily cache first
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `ai:market:${today}`;
    
    const { data: cached } = await supabase
      .from('news_cache')
      .select('data')
      .eq('key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (cached?.data) {
      console.log('Returning cached AI analysis for', today);
      return new Response(JSON.stringify(cached.data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // optional user prefs
    const { newsCount24h } = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    const [global, tvl, fng, socialPct, movers, btcDaily, ethDaily, btcHourly, ethHourly] = await Promise.all([
      getGlobalMarket(),
      getDefiTVL(),
      getFearGreed(),
      getSocialVolumePct(),
      getTopMovers(),
      getDailyPrices('bitcoin', 200),
      getDailyPrices('ethereum', 200),
      getHourlyPrices('bitcoin', 14),
      getHourlyPrices('ethereum', 14),
    ]);

    const btcTaD1 = diagnoseTA(btcDaily);
    const ethTaD1 = diagnoseTA(ethDaily);
    const btcTaH1 = diagnoseTA(btcHourly);
    const ethTaH1 = diagnoseTA(ethHourly);
    const btcTaH4 = diagnoseTA(downsample(btcHourly, 4));
    const ethTaH4 = diagnoseTA(downsample(ethHourly, 4));

    const topMovers = movers
      .filter((m: any) => Number.isFinite(m.change24h))
      .sort((a: any, b: any) => b.change24h - a.change24h)
      .slice(0, 5);

    const newsPct = typeof newsCount24h === 'number' && newsCount24h >= 0 ? Math.max(0, Math.min(100, (newsCount24h / 500) * 100)) : null;

    const facts = {
      overview: { ...global, defiTVL: tvl },
      sentiment: { fearGreedIndex: fng, newsVolumePct: newsPct, socialVolumePct: socialPct },
      topMovers,
      ta: { btc: { d1: btcTaD1, h4: btcTaH4, h1: btcTaH1 }, eth: { d1: ethTaD1, h4: ethTaH4, h1: ethTaH1 } },
      computed: {
        ethWeeklyChangePct: (() => {
          const n = ethDaily.length;
          if (n < 8) return null;
          const last = ethDaily[n - 1];
          const weekAgo = ethDaily[n - 8];
          return ((last - weekAgo) / weekAgo) * 100;
        })(),
        btcWeeklyChangePct: (() => {
          const n = btcDaily.length;
          if (n < 8) return null;
          const last = btcDaily[n - 1];
          const weekAgo = btcDaily[n - 8];
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

    const prompt = `Du är en expertanalytiker för kryptomarknaderna med tillgång till realtidsdata via webben. 

UPPDRAG: Genomför en OMFATTANDE marknadsanalys på svenska med följande komponenter:

1. REALTIDS WEBBSÖKNING - Sök webben för:
   - Senaste BTC/ETH priser och volymer från de senaste 24-48 timmarna
   - Aktuella stöd- och motståndslinjer för BTC och ETH
   - Senaste breakouts/breakdowns som har skett
   - Aktuella marknadssentiment från Twitter, Reddit, news
   - Institutionella flöden och whale movements

2. TEKNISK ANALYS MED EXAKTA NIVÅER:
   - Beräkna EXAKTA stöd- och motståndslinjer för BTC/ETH
   - Identifiera kritiska breakout/breakdown nivåer
   - Ange om vi "Närmar oss breakout på $XX,XXX" eller "Närmar oss breakdown $XX,XXX"
   - RSI/MACD/Bollinger Band signaler med precisa värden

3. SENTIMENTANALYS:
   - Fear & Greed Index tolkning
   - Social media sentiment (sök Twitter/Reddit för senaste 24h)
   - Institutional sentiment och flöden
   - Regulatory news påverkan

4. MARKNADSKONTEXT:
   - Globala makroekonomiska faktorer som påverkar crypto
   - Institutionella adoptionsignaler
   - DeFi/NFT/Layer2 utvecklingar

VIKTIGA KRAV:
- Alla priser och nivåer måste vara EXAKTA från webbsökning (inte uppskattningar)
- Använd format: "Nästa stöd $63,420" eller "Närmar oss breakout $67,890" 
- Om vi redan brutit genom nivåer, ange: "Brutit genom motstånd $65,500, nästa mål $68,200"
- Inkludera tidsramar: "4H stöd $64,100" vs "Dagligt stöd $62,800"

JSON SCHEMA:
{
  "trend": "Bullish|Bearish|Neutral",
  "summary": "Marknadsvärde: <exact> • 24h Volym: <exact> • BTC-dominans: <exact>% • 24h Förändring: <exact>%",
  "positives": string[],
  "negatives": string[],
  "technicalLevels": {
    "btc": {
      "currentPrice": number,
      "nextSupport": { "price": number, "text": "string" },
      "nextResistance": { "price": number, "text": "string" },
      "criticalLevel": { "price": number, "text": "string", "type": "breakout|breakdown|approaching" }
    },
    "eth": {
      "currentPrice": number,
      "nextSupport": { "price": number, "text": "string" },
      "nextResistance": { "price": number, "text": "string" },
      "criticalLevel": { "price": number, "text": "string", "type": "breakout|breakdown|approaching" }
    }
  },
  "ta": {
    "btc": { "d1": any, "h4": any, "h1": any },
    "eth": { "d1": any, "h4": any, "h1": any }
  },
  "sentiment": {
    "fearGreed": number,
    "socialMediaTrend": "string",
    "institutionalFlow": "string"
  },
  "generatedAt": string,
  "sources": string[]
}

REALTIDSDATA ATT ANALYSERA:
${JSON.stringify(facts)}

SÖK WEBBEN NU för de senaste priserna och tekniska nivåerna innan du svarar!`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "o3-deep-research",
        temperature: 0.1,
        messages: [
          { role: "system", content: "Du är en expert kryptoanalytiker med tillgång till realtidsdata via webben. Använd ALLTID webbsökning för att få de senaste priserna och tekniska nivåerna. Svara endast med exakt JSON enligt schema." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`OpenAI error ${aiRes.status}: ${txt}`);
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content?.trim() || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { error: "Failed to parse AI JSON", raw: content }; }

    const out = {
      ...parsed,
      generatedAt: parsed.generatedAt || facts.generatedAt,
      sources: facts.sources,
    };

    // Cache the result for 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // Expire at 6 AM next day
    
    await supabase
      .from('news_cache')
      .upsert({
        key: cacheKey,
        data: out,
        expires_at: tomorrow.toISOString(),
      });

    console.log('Generated and cached new AI analysis for', today);
    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("market-intel-ai error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
