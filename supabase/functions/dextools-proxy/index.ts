// Supabase Edge Function: dextools-proxy
// Proxies DEXTools API v2 for Solana using project secret and adds CORS

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('DEXTOOLS_API_KEY');
    if (!API_KEY) {
      return json({ error: 'Missing DEXTOOLS_API_KEY' }, 500);
    }

    const BASE = 'https://public-api.dextools.io/trial';
    const headers = { 'X-API-KEY': API_KEY } as Record<string, string>;

    const url = new URL(req.url);
    let payload: any = {};

    if (req.method === 'GET') {
      payload.action = url.searchParams.get('action') ?? undefined;
      payload.address = url.searchParams.get('address') ?? undefined;
    } else {
      payload = await req.json().catch(() => ({}));
    }

    const action = payload.action as string | undefined;
    const address = payload.address as string | undefined;

    const fetchJSON = async (path: string) => {
      const r = await fetch(`${BASE}${path}`, { headers });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`DEXTools ${path} ${r.status}: ${text}`);
      }
      return r.json();
    };

    switch (action) {
      case 'gainers': {
        const data = await fetchJSON('/v2/ranking/solana/gainers');
        return json(data);
      }
      case 'hotpools': {
        const data = await fetchJSON('/v2/ranking/solana/hotpools');
        return json(data);
      }
      case 'newest': {
        const page = Math.max(0, Number(payload.page ?? 0));
        const rawSize = Number(payload.pageSize ?? 50);
        const pageSize = Math.min(50, Math.max(1, isNaN(rawSize) ? 50 : rawSize));
        const from = payload.from as string | undefined;
        const to = payload.to as string | undefined;
        const qs = new URLSearchParams({
          sort: 'creationTime',
          order: 'desc',
          page: String(page),
          pageSize: String(pageSize),
        });
        if (from) qs.set('from', from);
        if (to) qs.set('to', to);
        const data = await fetchJSON(`/v2/token/solana?${qs.toString()}`);
        return json(data);
      }
      case 'tokenFull': {
        if (!address) return json({ error: 'address required' }, 400);
        const [meta, price, info, audit] = await Promise.all([
          fetchJSON(`/v2/token/solana/${address}`),
          fetchJSON(`/v2/token/solana/${address}/price`).catch(() => null),
          fetchJSON(`/v2/token/solana/${address}/info`).catch(() => null),
          fetchJSON(`/v2/token/solana/${address}/audit`).catch(() => null),
        ]);

        // Try to get a primary pool and its price/volume
        let poolPrice: any = null;
        try {
          const poolsResp = await fetchJSON(`/v2/token/solana/${address}/pools?sort=creationTime&order=desc&page=0&pageSize=1`);
          const firstPool = poolsResp?.results?.[0]?.address;
          if (firstPool) {
            poolPrice = await fetchJSON(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
          }
        } catch (_) {
          // ignore pool errors
        }

        return json({ meta, price, info, audit, poolPrice });
      }
      case 'tokenBatch': {
        const addresses = (payload.addresses as string[] | undefined)?.filter(Boolean) ?? [];
        if (!Array.isArray(addresses) || addresses.length === 0) {
          return json({ error: 'addresses array required' }, 400);
        }
        const unique = Array.from(new Set(addresses)).slice(0, 60); // safety cap
        const results = await Promise.all(unique.map(async (addr) => {
          try {
            const [meta, price, info, audit] = await Promise.all([
              fetchJSON(`/v2/token/solana/${addr}`),
              fetchJSON(`/v2/token/solana/${addr}/price`).catch(() => null),
              fetchJSON(`/v2/token/solana/${addr}/info`).catch(() => null),
              fetchJSON(`/v2/token/solana/${addr}/audit`).catch(() => null),
            ]);
            let poolPrice: any = null;
            try {
              const poolsResp = await fetchJSON(`/v2/token/solana/${addr}/pools?sort=creationTime&order=desc&page=0&pageSize=1`);
              const firstPool = poolsResp?.results?.[0]?.address;
              if (firstPool) {
                poolPrice = await fetchJSON(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
              }
            } catch (_) {}
            return { ok: true, address: addr, meta, price, info, audit, poolPrice };
          } catch (e: any) {
            return { ok: false, address: addr, error: e?.message ?? String(e) };
          }
        }));
        return json({ results });
      }
      default:
        return json({ error: 'Unknown action' }, 400);
    }
  } catch (e: any) {
    console.error('dextools-proxy error', e);
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
