// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { action, address, addresses, params } = await req.json();

    const base = "https://public-api.birdeye.so";
    const headers: HeadersInit = {
      "X-API-KEY": apiKey,
      "x-chain": "solana",
      accept: "application/json",
    };

    const toQuery = (obj: Record<string, any>) =>
      Object.entries(obj)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");

    let url = "";

    switch (action) {
      case "price":
        url = `${base}/defi/price?${toQuery({ address })}`;
        break;
      case "multi_price":
        url = `${base}/defi/multi_price?${toQuery({ list_address: (addresses || []).join(",") })}`;
        break;
      case "meta":
        url = `${base}/defi/v3/token/meta-data/single?${toQuery({ address })}`;
        break;
      case "market-data":
        url = `${base}/defi/v3/token/market-data?${toQuery({ address })}`;
        break;
      case "trade-data":
        url = `${base}/defi/v3/token/trade-data/single?${toQuery({ address })}`;
        break;
      case "ohlcv":
        url = `${base}/defi/v3/ohlcv?${toQuery({ address, ...params })}`;
        break;
      case "token_overview":
        url = `${base}/defi/token_overview?${toQuery({ address, ...params })}`;
        break;
      case "history_price":
        url = `${base}/defi/history_price?${toQuery({ address, ...params })}`;
        break;
      default:
        return new Response(JSON.stringify({ error: "Unsupported action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const res = await fetch(url, { headers, method: "GET" });
    const data = await res.json();

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }), {
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
