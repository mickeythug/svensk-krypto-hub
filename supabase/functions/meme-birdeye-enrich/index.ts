// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("BIRDEYE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing BIRDEYE_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { addresses, limit = 20, delayMs = 1200 } = await req.json();
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return new Response(JSON.stringify({ error: "addresses array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toProcess = addresses.slice(0, Math.max(1, Math.min(limit, 50)));
    const base = "https://public-api.birdeye.so";
    const headers: HeadersInit = {
      "X-API-KEY": apiKey,
      "x-chain": "solana",
      accept: "application/json",
    };

    const results: Record<string, any> = {};

    for (let i = 0; i < toProcess.length; i++) {
      const addr = toProcess[i];
      const url = `${base}/defi/v3/token/market-data?address=${encodeURIComponent(addr)}`;

      const doFetch = async () => {
        const res = await fetch(url, { headers });
        const json = await res.json();
        const md = json?.data ?? json ?? {};
        let mc = md.marketCap ?? md.marketcap ?? md.mc ?? md.market_cap ?? undefined;
        let vol24 = md.volume24h ?? md.volume_24h ?? md.v24h ?? md.volume ?? md.volume_usd_24h ?? undefined;
        const liq = md.liquidity ?? md.liq ?? md.liquidity_usd ?? undefined;
        const circ = md.circulatingSupply ?? md.circulating_supply ?? undefined;
        const total = md.totalSupply ?? md.total_supply ?? undefined;
        const price = md.price ?? md.priceUsd ?? md.value ?? md.price_usd ?? undefined;

        return { res, md, mc, vol24, liq, circ, total, price };
      };

      let attempt = 0;
      let fetched: any;
      while (attempt < 2) {
        fetched = await doFetch();
        if (fetched.res.status !== 429) break;
        // backoff + jitter then retry once
        await sleep((Number(delayMs) || 1200) + 600 + Math.floor(Math.random() * 400));
        attempt++;
      }

      const { res, md, mc, vol24, liq, circ, total, price } = fetched;

      results[addr] = {
        ok: res.ok,
        status: res.status,
        address: addr,
        price,
        marketCap: typeof mc === "string" ? Number(mc.replace(/[\,\s]/g, "")) : mc,
        volume24h: typeof vol24 === "string" ? Number(vol24.replace(/[\,\s]/g, "")) : vol24,
        liquidity: typeof liq === "string" ? Number(liq.replace(/[\,\s]/g, "")) : liq,
        circulatingSupply: typeof circ === "string" ? Number(circ.replace(/[\,\s]/g, "")) : circ,
        totalSupply: typeof total === "string" ? Number(total.replace(/[\,\s]/g, "")) : total,
        raw: md,
      };

      // Respect free plan: 1 req/sec per key (add jitter)
      if (i < toProcess.length - 1) {
        const baseDelay = Math.max(1200, Number(delayMs) || 1200);
        const jitter = 150 + Math.floor(Math.random() * 250);
        await sleep(baseDelay + jitter);
      }
    }

    return new Response(JSON.stringify({ success: true, count: Object.keys(results).length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
