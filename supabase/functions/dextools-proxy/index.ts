// Supabase Edge Function: dextools-proxy
// Proxies DEXTools API v2 for Solana using project secret, aggregates trending, and adds CORS
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // In-memory soft cache per function runtime for hot endpoints
    const ttlByPath = (path: string) => {
      if (path.includes('/price')) return 15_000; // token/pool price
      if (path.includes('/liquidity')) return 60_000; // pool liquidity is slow-changing
      if (path.includes('/info')) return 60_000; // token info
      if (path.includes('/pools')) return 60_000; // pool discovery
      return 30_000;
    };
    const fetchCachedWithRetry = async (path: string) => {
      const now = Date.now();
      const ttl = ttlByPath(path);
      const hit = memCache.get(path);
      if (hit && now - hit.ts < ttl) return hit.data;
      const data = await fetchWithRetry(path);
      memCache.set(path, { ts: now, data });
      return data;
    };

    // Admin client + persistence helpers
    const getAdmin = () => createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const upsertCatalog = async (rows: Array<{ address: string; symbol?: string; name?: string; image?: string; meta?: any; price?: any }>) => {
      if (!rows.length) return;
      const admin = getAdmin();
      const upserts = rows.map(r => ({
        address: r.address,
        chain: 'SOL',
        symbol: r.symbol ?? null,
        name: r.name ?? null,
        image: r.image ?? null,
        last_seen_at: new Date().toISOString(),
        last_meta: r.meta ?? null,
        last_price: r.price ?? null,
      }));
      await admin.from('tokens_catalog').upsert(upserts, { onConflict: 'address' });
    };

    const updateTrendingCache = async (tokens: any[]) => {
      const admin = getAdmin();
      await admin.from('meme_tokens_cache').upsert([
        { category: 'trending', data: tokens, updated_at: new Date().toISOString() }
      ], { onConflict: 'category' });
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
            fetchCachedWithRetry(`/v2/token/solana/${address}`),
            fetchCachedWithRetry(`/v2/token/solana/${address}/price`).catch(() => null),
            fetchCachedWithRetry(`/v2/token/solana/${address}/info`).catch(() => null),
            fetchCachedWithRetry(`/v2/token/solana/${address}/audit`).catch(() => null),
          ]);

          // Try to get a primary pool and its price/volume (prefer oldest pool first)
          let poolPrice: any = null;
          let poolLiquidity: any = null;
          let chosenPoolAddress: string | null = null;
          try {
            let poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${address}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
            let firstPool = poolsResp?.results?.[0]?.address;
            if (!firstPool) {
              // Fallback to newest if no result
              poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${address}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
              firstPool = poolsResp?.results?.[0]?.address;
            }
            if (firstPool) {
              chosenPoolAddress = firstPool;
              poolPrice = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
              poolLiquidity = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
            }
          } catch (_) {
            // ignore pool errors
          }

          // Structured debug log for diagnostics
          try {
            const metaD = meta?.data ?? meta ?? {};
            const priceD = price?.data ?? price ?? {};
            const infoD = info?.data ?? info ?? {};
            const poolPD = poolPrice?.data ?? poolPrice ?? {};
            const poolLD = poolLiquidity?.data ?? poolLiquidity ?? {};
            console.log('[market-debug]', JSON.stringify({
              address,
              metaOk: !!metaD?.address,
              priceKeys: Object.keys(priceD || {}),
              infoKeys: Object.keys(infoD || {}),
              holders: infoD?.holders ?? null,
              mcap: infoD?.mcap ?? null,
              fdv: infoD?.fdv ?? null,
              chosenPoolAddress,
              poolPriceKeys: Object.keys(poolPD || {}),
              poolLiquidityKeys: Object.keys(poolLD || {}),
              volume24h: poolPD?.volume24h ?? null,
              buys24h: poolPD?.buys24h ?? null,
              sells24h: poolPD?.sells24h ?? null,
              liquidity: poolLD?.liquidity ?? null,
            }));
          } catch (_) {}

          // Persist to catalog (best-effort)
          try {
            const metaD: any = meta?.data ?? meta ?? {};
            await upsertCatalog([{ address, symbol: metaD.symbol, name: metaD.name, image: metaD.logo, meta, price }]);
          } catch (_) {}

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
                  fetchCachedWithRetry(`/v2/token/solana/${addr}`),
                  fetchCachedWithRetry(`/v2/token/solana/${addr}/price`).catch(() => null),
                  fetchCachedWithRetry(`/v2/token/solana/${addr}/info`).catch(() => null),
                  fetchCachedWithRetry(`/v2/token/solana/${addr}/audit`).catch(() => null),
                ]);
                let poolPrice: any = null;
                let poolLiquidity: any = null;
                try {
                  let poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
                  let firstPool = poolsResp?.results?.[0]?.address;
                  if (!firstPool) {
                    poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
                    firstPool = poolsResp?.results?.[0]?.address;
                  }
                  if (firstPool) {
                    poolPrice = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
                    poolLiquidity = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
                  }
                } catch (_) {}
                return { ok: true, address: addr, meta, price, info, audit, poolPrice, poolLiquidity };
              } catch (e: any) {
                return { ok: false, address: addr, error: e?.message ?? String(e) };
              }
            }));
            results.push(...part);
          }
          // Persist catalog (best-effort)
          try {
            const rows = results.filter(r => r?.ok && r?.meta).map((r: any) => {
              const md = r.meta?.data ?? r.meta ?? {};
              return { address: r.address, symbol: md.symbol, name: md.name, image: md.logo, meta: r.meta, price: r.price };
            });
            await upsertCatalog(rows);
          } catch (_) {}
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
                fetchCachedWithRetry(`/v2/token/solana/${addr}`),
                fetchCachedWithRetry(`/v2/token/solana/${addr}/price`).catch(() => null),
                fetchCachedWithRetry(`/v2/token/solana/${addr}/info`).catch(() => null),
                fetchCachedWithRetry(`/v2/token/solana/${addr}/audit`).catch(() => null),
              ]);
              let poolPrice: any = null;
              let poolLiquidity: any = null;
              try {
                let poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=asc&page=0&pageSize=1`).catch(() => null);
                let firstPool = poolsResp?.results?.[0]?.address;
                if (!firstPool) {
                  poolsResp = await fetchCachedWithRetry(`/v2/token/solana/${addr}/pools?sort=creationTime&order=desc&page=0&pageSize=1`).catch(() => null);
                  firstPool = poolsResp?.results?.[0]?.address;
                }
                if (firstPool) {
                  poolPrice = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/price`).catch(() => null);
                  poolLiquidity = await fetchCachedWithRetry(`/v2/pool/solana/${firstPool}/liquidity`).catch(() => null);
                }
              } catch (_) {}
              return { ok: true, address: addr, meta, price, info, audit, poolPrice, poolLiquidity };
            } catch (e: any) {
              return { ok: false, address: addr, error: e?.message ?? String(e) };
            }
          }));
          results.push(...part);
        }
        // Persist catalog
        try {
          const rows = results.filter(r => r?.ok && r?.meta).map((r: any, idx: number) => {
            const md = r.meta?.data ?? r.meta ?? {};
            return { address: r.address, symbol: md.symbol, name: md.name, image: md.logo, meta: r.meta, price: r.price };
          });
          await upsertCatalog(rows);
        } catch (_) {}

        // Build trending cache payload (reduce to MemeToken shape)
        const toNum = (v: any) => typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/[\,\s]/g, '')) : 0);
        const mapped = results.filter((x: any) => x?.ok && (x?.meta?.data ?? x?.meta)?.address).slice(0, limit).map((x: any, i: number) => {
          const metaD = (x?.meta?.data ?? x?.meta) as any || {};
          const priceD = (x?.price?.data ?? x?.price) as any || {};
          const infoD = (x?.info?.data ?? x?.info) as any || {};
          const poolD = (x?.poolPrice?.data ?? x?.poolPrice) as any || {};
          return {
            id: metaD.address,
            symbol: (metaD.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
            name: metaD.name || metaD.symbol || 'Token',
            image: metaD.logo || '/placeholder.svg',
            price: toNum(priceD.price),
            change24h: toNum(priceD.variation24h),
            volume24h: toNum(poolD.volume24h),
            marketCap: toNum(infoD.mcap),
            holders: toNum(infoD.holders),
            views: '—',
            emoji: undefined,
            tags: ['trending'],
            isHot: i < 10,
            description: metaD.description,
          };
        });
        try { await updateTrendingCache(mapped); } catch (_) {}

        // Fallback fill from catalog if not enough ok results
        if (mapped.length < limit) {
          try {
            const admin = getAdmin();
            const existing = new Set(mapped.map((m: any) => m.id));
            const { data: extras } = await admin
              .from('tokens_catalog')
              .select('address, symbol, name, image')
              .order('last_seen_at', { ascending: false })
              .limit(limit * 2);
            const add = (extras || []).filter((r: any) => !existing.has(r.address)).slice(0, limit - mapped.length);
            for (const e of add) {
              // Append a minimal ok result for client-side mapping
              results.push({ ok: true, address: e.address, meta: { data: { address: e.address, symbol: e.symbol, name: e.name, logo: e.image } }, price: null, info: null, audit: null, poolPrice: null, poolLiquidity: null });
            }
          } catch (_) {}
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
