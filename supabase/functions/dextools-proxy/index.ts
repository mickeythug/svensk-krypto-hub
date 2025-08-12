// Supabase Edge Function: dextools-proxy
// Proxies DEXTools API v2 for Solana using project secret, aggregates trending, and adds CORS

    const memCache = new Map<string, { ts: number; data: any }>();
    const CACHE_MS = 30_000;
    const fetchCached = async (path: string) => {
      const now = Date.now();
      const hit = memCache.get(path);
      if (hit && now - hit.ts < CACHE_MS) return hit.data;
      const data = await fetchJSON(path);
      memCache.set(path, { ts: now, data });
      return data;
    };

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// PumpPortal WebSocket lightweight aggregator (hot globals)
const PUMP_WS_URL = 'wss://pumpportal.fun/api/data';
let pumpSocket: WebSocket | null = null;
let recentMigrations: any[] = [];
function ensurePumpConnection() {
  try {
    if (pumpSocket && (pumpSocket.readyState === WebSocket.OPEN || pumpSocket.readyState === WebSocket.CONNECTING)) return;
    pumpSocket = new WebSocket(PUMP_WS_URL);
    pumpSocket.onopen = () => {
      try { pumpSocket?.send(JSON.stringify({ method: 'subscribeMigration' })); } catch {}
    };
    pumpSocket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(typeof evt.data === 'string' ? evt.data : new TextDecoder().decode(evt.data));
        if (msg && (msg.type === 'migration' || msg.method === 'migration')) {
          const ev = {
            mint: msg.mint,
            name: msg.name,
            symbol: msg.symbol,
            uri: msg.uri,
            pool: msg.pool,
            bondingCurveComplete: msg.bondingCurveComplete,
            timestamp: new Date().toISOString(),
            source: msg.source || 'pumpfun',
          };
          recentMigrations.push(ev);
          if (recentMigrations.length > 200) recentMigrations = recentMigrations.slice(-200);
        }
      } catch (_) {}
    };
    pumpSocket.onclose = () => { pumpSocket = null; setTimeout(ensurePumpConnection, 3000); };
    pumpSocket.onerror = () => { try { pumpSocket?.close(); } catch {}; pumpSocket = null; };
  } catch (_) {}
}
ensurePumpConnection();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('DEXTOOLS_API_KEY');
    console.log('dextools-proxy invoked');
    if (!API_KEY) {
      console.error('DEXTOOLS_API_KEY missing');
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
    console.log('dextools-proxy action', action, { address });

    const fetchJSON = async (path: string) => {
      const r = await fetch(`${BASE}${path}`, { headers });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`DEXTools ${path} ${r.status}: ${text}`);
      }
      return r.json();
    };

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const fetchWithRetry = async (path: string, retries = 3) => {
      let attempt = 0;
      while (true) {
        try {
          return await fetchJSON(path);
        } catch (e: any) {
          const msg = e?.message || '';
          const isRate = msg.includes('429');
          const isServer = msg.includes('500') || msg.includes('502') || msg.includes('503');
          if (attempt >= retries - 1 || (!isRate && !isServer)) throw e;
          const wait = [300, 800, 1500][Math.min(attempt, 2)];
          console.warn(`Retry ${attempt + 1}/${retries} for ${path} after ${wait}ms due to:`, msg);
          await sleep(wait);
          attempt++;
        }
      }
    };

    switch (action) {
      case 'gainers': {
        try {
          const data = await fetchJSON('/v2/ranking/solana/gainers');
          return json(data);
        } catch (e: any) {
          console.error('dextools-proxy gainers fallback (empty list)', e?.message ?? e);
          return json({ statusCode: 200, data: [] });
        }
      }
      case 'hotpools': {
        try {
          const data = await fetchJSON('/v2/ranking/solana/hotpools');
          return json(data);
        } catch (e: any) {
          console.error('dextools-proxy hotpools fallback (empty list)', e?.message ?? e);
          return json({ statusCode: 200, data: [] });
        }
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
        try {
          const data = await fetchJSON(`/v2/token/solana?${qs.toString()}`);
          return json(data);
        } catch (e: any) {
          console.error('dextools-proxy newest fallback (empty list)', e?.message ?? e);
          // Graceful fallback to avoid 500 → return empty list
          return json({ statusCode: 200, data: { results: [] } });
        }
      }
      case 'tokenFull': {
        if (!address) return json({ error: 'address required' }, 400);
        try {
          const [meta, price, info, audit] = await Promise.all([
            fetchWithRetry(`/v2/token/solana/${address}`),
            fetchWithRetry(`/v2/token/solana/${address}/price`).catch(() => null),
            fetchWithRetry(`/v2/token/solana/${address}/info`).catch(() => null),
            fetchWithRetry(`/v2/token/solana/${address}/audit`).catch(() => null),
          ]);

          // Try to get a primary pool and its price/volume (prefer oldest pool first)
          let poolPrice: any = null;
          let poolLiquidity: any = null;
          try {
            let poolsResp = await fetchWithRetry(`/v2/token/solana/${address}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
            let firstPool = poolsResp?.results?.[0]?.address;
            if (!firstPool) {
              // Fallback to newest if no result
              poolsResp = await fetchWithRetry(`/v2/token/solana/${address}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
              firstPool = poolsResp?.results?.[0]?.address;
            }
            if (firstPool) {
              poolPrice = await fetchWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
              poolLiquidity = await fetchWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
            }
          } catch (_) {
            // ignore pool errors
          }

          return json({ meta, price, info, audit, poolPrice, poolLiquidity });
        } catch (e: any) {
          console.error('dextools-proxy tokenFull fallback (nulls)', e?.message ?? e);
          return json({ meta: null, price: null, info: null, audit: null, poolPrice: null });
        }
      }
      case 'tokenBatch': {
        try {
          const addresses = (payload.addresses as string[] | undefined)?.filter(Boolean) ?? [];
          if (!Array.isArray(addresses) || addresses.length === 0) {
            return json({ error: 'addresses array required' }, 400);
          }
          const unique = Array.from(new Set(addresses)).slice(0, 60); // safety cap
          const chunk = async <T,>(arr: T[], size: number) => {
            const out: T[][] = [];
            for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
            return out;
          };
          const chunks = await chunk(unique, 8); // limit concurrency bursts
          const results: any[] = [];
          for (const group of chunks) {
            const part = await Promise.all(group.map(async (addr) => {
              try {
                const [meta, price, info, audit] = await Promise.all([
                  fetchWithRetry(`/v2/token/solana/${addr}`),
                  fetchWithRetry(`/v2/token/solana/${addr}/price`).catch(() => null),
                  fetchWithRetry(`/v2/token/solana/${addr}/info`).catch(() => null),
                  fetchWithRetry(`/v2/token/solana/${addr}/audit`).catch(() => null),
                ]);
                let poolPrice: any = null;
                let poolLiquidity: any = null;
                try {
                  let poolsResp = await fetchWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
                  let firstPool = poolsResp?.results?.[0]?.address;
                  if (!firstPool) {
                    poolsResp = await fetchWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
                    firstPool = poolsResp?.results?.[0]?.address;
                  }
                  if (firstPool) {
                    poolPrice = await fetchWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
                    poolLiquidity = await fetchWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
                  }
                } catch (_) {}
                return { ok: true, address: addr, meta, price, info, audit, poolPrice, poolLiquidity };
              } catch (e: any) {
                return { ok: false, address: addr, error: e?.message ?? String(e) };
              }
            }));
            results.push(...part);
          }
          return json({ results });
        } catch (e: any) {
          console.error('dextools-proxy tokenBatch fallback (empty results)', e?.message ?? e);
          return json({ results: [] });
        }
      }
      case 'pumpMigrations': {
        const limit = Math.max(1, Math.min(200, Number(payload.limit ?? 50)));
        const list = recentMigrations.slice(-limit).reverse();
        return json({ results: list });
      }
      case 'trendingCombined': {
        const limit = Math.max(1, Math.min(60, Number(payload.limit ?? 50)));
        const norm = (d: any): any[] => Array.isArray(d?.results) ? d.results : (Array.isArray(d?.data) ? d.data : []);
        let hot: any[] = [];
        let gain: any[] = [];
        try { hot = norm(await fetchJSON('/v2/ranking/solana/hotpools')); } catch { hot = []; }
        try { gain = norm(await fetchJSON('/v2/ranking/solana/gainers')); } catch { gain = []; }
        const addrs = new Set<string>();
        for (const i of hot) {
          const a = i?.mainToken?.address || i?.address || i?.token?.address; if (a) addrs.add(a);
        }
        for (const i of gain) {
          const a = i?.mainToken?.address || i?.address || i?.token?.address; if (a) addrs.add(a);
        }
        // Fill with pump migrations (most recent first)
        for (const m of [...recentMigrations].reverse()) {
          if (addrs.size >= limit) break;
          if (m?.mint) addrs.add(m.mint);
        }
        return json({ addresses: Array.from(addrs).slice(0, limit) });
      }
      case 'trendingCombinedBatch': {
        const limit = Math.max(1, Math.min(60, Number(payload.limit ?? 50)));
        const norm = (d: any): any[] => Array.isArray(d?.results) ? d.results : (Array.isArray(d?.data) ? d.data : []);
        let hot: any[] = [];
        let gain: any[] = [];
        try { hot = norm(await fetchJSON('/v2/ranking/solana/hotpools')); } catch { hot = []; }
        try { gain = norm(await fetchJSON('/v2/ranking/solana/gainers')); } catch { gain = []; }
        const addrs = new Set<string>();
        for (const i of hot) {
          const a = i?.mainToken?.address || i?.address || i?.token?.address; if (a) addrs.add(a);
        }
        for (const i of gain) {
          const a = i?.mainToken?.address || i?.address || i?.token?.address; if (a) addrs.add(a);
        }
        for (const m of [...recentMigrations].reverse()) {
          if (addrs.size >= limit) break;
          if (m?.mint) addrs.add(m.mint);
        }
        const addresses = Array.from(addrs).slice(0, limit);
        // reuse tokenBatch logic by calling internal code inline
        const chunk = async <T,>(arr: T[], size: number) => {
          const out: T[][] = [];
          for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
          return out;
        };
        const chunks = await chunk(addresses, 8);
        const results: any[] = [];
        for (const group of chunks) {
          const part = await Promise.all(group.map(async (addr) => {
            try {
              const [meta, price, info, audit] = await Promise.all([
                fetchWithRetry(`/v2/token/solana/${addr}`),
                fetchWithRetry(`/v2/token/solana/${addr}/price`).catch(() => null),
                fetchWithRetry(`/v2/token/solana/${addr}/info`).catch(() => null),
                fetchWithRetry(`/v2/token/solana/${addr}/audit`).catch(() => null),
              ]);
              let poolPrice: any = null;
              let poolLiquidity: any = null;
              try {
                let poolsResp = await fetchWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
                let firstPool = poolsResp?.results?.[0]?.address;
                if (!firstPool) {
                  poolsResp = await fetchWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
                  firstPool = poolsResp?.results?.[0]?.address;
                }
                if (firstPool) {
                  poolPrice = await fetchWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
                  poolLiquidity = await fetchWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
                }
              } catch (_) {}
              return { ok: true, address: addr, meta, price, info, audit, poolPrice, poolLiquidity };
            } catch (e: any) {
              return { ok: false, address: addr, error: e?.message ?? String(e) };
            }
          }));
          results.push(...part);
        }
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
