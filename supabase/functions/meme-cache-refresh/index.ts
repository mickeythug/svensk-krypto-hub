// Centralized meme tokens cache refresher
// Fetches categories from DEXTools via existing proxy and stores results in DB
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types kept minimal to avoid drift with frontend
interface MemeToken {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  views: string;
  emoji?: string;
  tags: string[];
  isHot: boolean;
  description?: string;
}

type Category = "trending" | "newest" | "potential";

function toNum(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[\,\s]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: `Bearer ${serviceKey}` } },
  });

  try {
    const { categories: bodyCats } = (await req.json().catch(() => ({}))) as {
      categories?: Category[];
    };
    const categories: Category[] = (Array.isArray(bodyCats) && bodyCats.length
      ? bodyCats
      : ["trending", "newest", "potential"]) as Category[];

    const results: Record<string, MemeToken[]> = {};

    for (const category of categories) {
      let items: any[] = [];
      try {
        if (category === "trending") {
          const { data: batch, error } = await admin.functions.invoke(
            "dextools-proxy",
            { body: { action: "trendingCombinedBatch", limit: 120 } }
          );
          if (error) throw error;
          items = Array.isArray(batch?.results) ? batch.results : [];
        } else {
          // Fetch newest addresses in last 24h
          const to = new Date().toISOString();
          const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          let addresses: string[] = [];
          try {
            const { data, error } = await admin.functions.invoke(
              "dextools-proxy",
              { body: { action: "newest", page: 0, pageSize: 50, from, to } }
            );
            if (error) throw error;
            const resultsArr: any[] = Array.isArray(data?.results)
              ? data.results
              : Array.isArray(data?.data?.results)
              ? data.data.results
              : Array.isArray(data?.data)
              ? data.data
              : [];
            addresses = resultsArr
              .map((r: any) => r?.address || r?.mainToken?.address)
              .filter(Boolean)
              .slice(0, 120);
          } catch (_) {
            const { data: gain, error: gErr } = await admin.functions.invoke(
              "dextools-proxy",
              { body: { action: "gainers" } }
            );
            if (gErr) throw gErr;
            const list: any[] = Array.isArray(gain?.results)
              ? gain.results
              : Array.isArray(gain?.data?.results)
              ? gain.data.results
              : Array.isArray(gain?.data)
              ? gain.data
              : [];
            addresses = list
              .map(
                (i: any) =>
                  i?.mainToken?.address || i?.address || i?.token?.address
              )
              .filter(Boolean)
              .slice(0, 120);
          }

          if (addresses.length) {
            const { data: batch, error: batchErr } = await admin.functions.invoke(
              "dextools-proxy",
              { body: { action: "tokenBatch", addresses } }
            );
            if (batchErr) throw batchErr;
            items = Array.isArray(batch?.results) ? batch.results : [];
          } else {
            items = [];
          }
        }

        let mapped: MemeToken[] = items
          .filter((x: any) => {
            const metaD = (x?.meta?.data ?? x?.meta) as any;
            return x?.ok && metaD?.address;
          })
          .map((x: any, idx: number) => {
            const metaD = (x?.meta?.data ?? x?.meta) as any || {};
            const priceD = (x?.price?.data ?? x?.price) as any || {};
            const infoD = (x?.info?.data ?? x?.info) as any || {};
            const poolD = (x?.poolPrice?.data ?? x?.poolPrice) as any || {};

            const marketCap = toNum(infoD.mcap);
            const holders = toNum(infoD.holders);
            const volume24h = toNum(poolD.volume24h);

            return {
              id: metaD.address,
              symbol: (metaD.symbol || "TOKEN").toString().slice(0, 12).toUpperCase(),
              name: metaD.name || metaD.symbol || "Token",
              image: metaD.logo || "/placeholder.svg",
              price: toNum(priceD.price),
              change24h: toNum(priceD.variation24h),
              volume24h,
              marketCap,
              holders,
              views: "—",
              emoji: undefined,
              tags: [category],
              isHot: category === "trending" ? idx < 10 : false,
              description: metaD.description,
            } as MemeToken;
          });

        if (category === "potential") {
          mapped = mapped.sort(
            (a, b) => Number(b.marketCap >= 40000) - Number(a.marketCap >= 40000)
          );
        }

        mapped = mapped.slice(0, 60);
        results[category] = mapped;
      } catch (err) {
        // On per-category failure, keep going for others
        console.error("cache-refresh category error", category, err);
        results[category] = [];
      }
    }

    // Upsert results into centralized cache
    const rows = Object.entries(results).map(([category, data]) => ({
      category,
      data,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length) {
      const { error } = await admin
        .from("meme_tokens_cache")
        .upsert(rows, { onConflict: "category" });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, updated: Object.keys(results), counts: Object.fromEntries(Object.entries(results).map(([k,v]) => [k, v.length])) }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("meme-cache-refresh error", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
