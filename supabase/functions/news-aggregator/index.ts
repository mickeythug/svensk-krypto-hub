import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CRYPTOCOMPARE_API_KEY = Deno.env.get("CRYPTOCOMPARE_API_KEY");
const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY");
const MARKETAUX_API_KEY = Deno.env.get("MARKETAUX_API_KEY");
const CRYPTOPANIC_API_KEY = Deno.env.get("CRYPTOPANIC_API_KEY");

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  global: { headers: { "x-application-name": "news-aggregator" } },
});

function log(...args: any[]) {
  console.log("[news-aggregator]", ...args);
}

function cacheKey(params: Record<string, string | number | boolean | undefined>) {
  const base = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `news:${base || 'default'}`;
}

type NormalizedArticle = {
  id: string;
  source: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string | null;
  publishedAt: string; // ISO
  author?: string | null;
  tickers?: string[];
};

function dedupeByUrl(items: NormalizedArticle[]) {
  const seen = new Set<string>();
  const out: NormalizedArticle[] = [];
  for (const it of items) {
    const key = it.url || it.title;
    if (!seen.has(key)) { seen.add(key); out.push(it); }
  }
  return out;
}

async function fetchCryptoCompare(langParam: string): Promise<NormalizedArticle[]> {
  if (!CRYPTOCOMPARE_API_KEY) return [];
  const lang = ["EN","SE","DE","FR","IT","ES"].includes(langParam.toUpperCase()) ? langParam.toUpperCase() : "EN";
  const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}`;
  const res = await fetch(url, { headers: { Authorization: `Apikey ${CRYPTOCOMPARE_API_KEY}` } });
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const json = await res.json();
  const data = (json.Data || []) as any[];
  return data.map((a) => ({
    id: `cc_${a.id}`,
    source: a.source_info?.name || "CryptoCompare",
    title: a.title,
    description: a.body,
    url: a.url,
    imageUrl: a.imageurl || null,
    publishedAt: new Date((a.published_on || 0) * 1000).toISOString(),
    author: a.source_info?.name || null,
    tickers: Array.isArray(a.categories) ? a.categories : undefined,
  }));
}

async function fetchGNews(langParam: string): Promise<NormalizedArticle[]> {
  if (!GNEWS_API_KEY) return [];
  const lang = ["sv","en","de","fr","it","es"].includes(langParam) ? langParam : "en";
  const url = `https://gnews.io/api/v4/search?q=crypto%20OR%20bitcoin%20OR%20ethereum&lang=${lang}&country=se&max=50&apikey=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GNews ${res.status}`);
  const json = await res.json();
  const articles = (json.articles || []) as any[];
  return articles.map((a) => ({
    id: `gn_${a.url}`,
    source: a.source?.name || "GNews",
    title: a.title,
    description: a.description,
    url: a.url,
    imageUrl: a.image || null,
    publishedAt: a.publishedAt || new Date().toISOString(),
    author: a.source?.name || null,
  }));
}

async function fetchMarketaux(langParam: string): Promise<NormalizedArticle[]> {
  if (!MARKETAUX_API_KEY) return [];
  const langs = langParam === "sv" ? "sv,en" : "en";
  const url = `https://api.marketaux.com/v1/news/all?industries=Cryptocurrency&language=${langs}&limit=50&api_token=${MARKETAUX_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Marketaux ${res.status}`);
  const json = await res.json();
  const data = (json.data || []) as any[];
  return data.map((a) => ({
    id: `mx_${a.uuid}`,
    source: a.source || "Marketaux",
    title: a.title,
    description: a.description,
    url: a.url,
    imageUrl: a.image_url || null,
    publishedAt: a.published_at || new Date().toISOString(),
    author: a.author || null,
    tickers: (a.entities || []).map((e: any) => e.symbol).filter(Boolean),
  }));
}

async function fetchCryptoPanic(): Promise<NormalizedArticle[]> {
  if (!CRYPTOPANIC_API_KEY) return [];
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_API_KEY}&kind=news&filter=trending`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CryptoPanic ${res.status}`);
  const json = await res.json();
  const results = (json.results || []) as any[];
  return results.map((a) => ({
    id: `cp_${a.id}`,
    source: a.source?.title || "CryptoPanic",
    title: a.title,
    description: a.domain || a.slug,
    url: a.url,
    imageUrl: a.metadata?.image || null,
    publishedAt: a.published_at || new Date().toISOString(),
    author: a.source?.title || null,
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get("lang") || "sv").toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "50");

    const key = cacheKey({ lang, limit });
    log("cache key", key);

    // Check cache
    const { data: cached } = await supabaseAdmin
      .from("news_cache")
      .select("data, expires_at")
      .eq("key", key)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.data) {
      log("cache hit");
      return new Response(JSON.stringify({ source: "cache", articles: cached.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("cache miss, fetching providers");

    const results = await Promise.allSettled([
      fetchCryptoCompare(lang),
      fetchGNews(lang),
      fetchMarketaux(lang),
      fetchCryptoPanic(),
    ]);

    const articles = results.flatMap((r) => (r.status === "fulfilled" ? r.value : [] as NormalizedArticle[]));
    const unique = dedupeByUrl(articles)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    // Store in cache for 5 minutes
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await supabaseAdmin.from("news_cache").upsert({ key, data: unique, expires_at: expires });

    return new Response(JSON.stringify({ source: "live", articles: unique }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("news-aggregator error", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
