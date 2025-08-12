// Supabase Edge Function: meme-catalog
// Unified catalog with categories + pagination using DexScreener as primary source
// Returns normalized MemeToken[] compatible with frontend and supports up to 50 items per page.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

type Category =
  | 'trending'
  | 'gainers'
  | 'marketcap_high'
  | 'marketcap_low'
  | 'liquidity_high'
  | 'liquidity_low'
  | 'txns'
  | 'volume'
  | 'newest'
  | 'boosted';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

function getAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json().catch(() => ({}));
    const category = String(payload.category ?? 'trending') as Category;
    const page = Math.max(1, Number(payload.page ?? 1));
    const rawSize = Number(payload.pageSize ?? 50);
    const pageSize = Math.min(50, Math.max(1, isNaN(rawSize) ? 50 : rawSize));

    const sb = getAdmin();

    const norm = (d: any): any[] => Array.isArray(d?.results) ? d.results
      : (Array.isArray(d?.data?.results) ? d.data.results
      : (Array.isArray(d?.data) ? d.data
      : (Array.isArray(d) ? d : [])));

    const addrFrom = (arr: any[]): string[] => (arr || [])
      .map((r: any) => r?.address || r?.baseToken?.address || r?.mainToken?.address || r?.token?.address)
      .filter((a: any) => typeof a === 'string' && a.length > 0);

    // Helper to fetch DexScreener profiles/pairs with a given sort
    const fetchDexscreenerProfiles = async (sort: string, order: 'asc' | 'desc' = 'desc') => {
      try {
        const { data, error } = await sb.functions.invoke('dexscreener-proxy', { body: { action: 'profiles', sort, order, limit: 200 } });
        if (error) throw error;
        const arr = norm(data);
        if (arr.length) return arr;
      } catch (_) {}
      // Fallback to pairsList if profiles unavailable
      const { data: pairsRes } = await sb.functions.invoke('dexscreener-proxy', { body: { action: 'pairsList' } });
      const pairs = norm(pairsRes);
      // Local sort emulation
      const asNum = (v: any) => typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/[\s,]/g, '')) : 0);
      const val = (p: any): number => {
        switch (String(sort)) {
          case 'priceChange': return asNum(p?.priceChange?.h24);
          case 'priceChange5m': return asNum(p?.priceChange?.m5);
          case 'priceChange1h': return asNum(p?.priceChange?.h1);
          case 'priceChange6h': return asNum(p?.priceChange?.h6);
          case 'volume': return asNum(p?.volume?.h24);
          case 'liquidity': return asNum(p?.liquidity?.usd);
          case 'marketCap': return asNum(p?.marketCap);
          case 'txns': { const b = asNum(p?.txns?.h24?.buys); const s = asNum(p?.txns?.h24?.sells); return b + s; }
          case 'createdAt': return asNum(p?.pairCreatedAt ?? p?.createdAt);
          case 'trendingScore':
          default: {
            const t1 = ((asNum(p?.txns?.h1?.buys) || 0) + (asNum(p?.txns?.h1?.sells) || 0)) * 1000;
            const pc = (asNum(p?.priceChange?.h1) || 0) * 100;
            const liq = (asNum(p?.liquidity?.usd) || 0);
            return t1 + pc + liq * 0.001;
          }
        }
      };
      const sorted = [...pairs].sort((a, b) => val(b) - val(a));
      return order === 'asc' ? sorted.reverse() : sorted;
    };

    // 1) Resolve candidate addresses by category
    let addresses: string[] = [];
    switch (category) {
      case 'trending': {
        const list = await fetchDexscreenerProfiles('trendingScore', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'gainers': {
        const list = await fetchDexscreenerProfiles('priceChange', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'marketcap_high': {
        const list = await fetchDexscreenerProfiles('marketCap', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'marketcap_low': {
        const list = await fetchDexscreenerProfiles('marketCap', 'asc');
        addresses = addrFrom(list);
        break;
      }
      case 'liquidity_high': {
        const list = await fetchDexscreenerProfiles('liquidity', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'liquidity_low': {
        const list = await fetchDexscreenerProfiles('liquidity', 'asc');
        addresses = addrFrom(list);
        break;
      }
      case 'txns': {
        const list = await fetchDexscreenerProfiles('txns', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'volume': {
        const list = await fetchDexscreenerProfiles('volume', 'desc');
        addresses = addrFrom(list);
        break;
      }
      case 'newest': {
        const { data } = await sb.functions.invoke('dexscreener-proxy', { body: { action: 'pairsList', sort: 'createdAt', order: 'desc' } });
        addresses = addrFrom(norm(data));
        break;
      }
      case 'boosted': {
        const { data } = await sb.functions.invoke('dexscreener-proxy', { body: { action: 'boosted' } });
        addresses = addrFrom(norm(data));
        break;
      }
    }

    // Total available (best-effort). DexScreener does not give a total; we approximate by deduped list length.
    const uniqueAddresses = Array.from(new Set(addresses));
    const total = uniqueAddresses.length;

    if (!uniqueAddresses.length) {
      return json({ items: [], page, pageSize, total: 0 });
    }

    // 2) Page the address list
    const start = (page - 1) * pageSize;
    const paged = uniqueAddresses.slice(start, start + pageSize);

    // 3) Fetch full details in batch via DexScreener proxy
    const { data: batch, error: batchErr } = await sb.functions.invoke('dexscreener-proxy', {
      body: { action: 'tokenBatch', addresses: paged }
    });
    if (batchErr) throw batchErr;
    const items: any[] = Array.isArray(batch?.results) ? batch.results : [];

    // 4) Map to MemeToken
    const toNum = (v: any): number => {
      if (typeof v === 'number') return isFinite(v) ? v : 0;
      if (typeof v === 'string') { const n = Number(v.replace(/[\,\s]/g, '')); return isNaN(n) ? 0 : n; }
      return 0;
    };

    const mapped: MemeToken[] = items
      .filter((x: any) => x?.ok && (x?.meta?.data ?? x?.meta)?.address)
      .map((x: any, idx: number) => {
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
          tags: [category],
          isHot: category === 'trending' ? idx < 10 : false,
          description: metaD.description,
        } as MemeToken;
      });

    return json({ items: mapped, page, pageSize, total });
  } catch (e: any) {
    console.error('[meme-catalog-error]', e?.message ?? e);
    // Fail soft with 200 to avoid client-side 502 surfacing
    return json({ items: [], page: 1, pageSize: 50, total: 0, error: e?.message ?? String(e) }, 200);
  }
});
