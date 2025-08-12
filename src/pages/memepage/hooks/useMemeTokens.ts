import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, getCacheStaleOk, setCache } from '@/lib/cache';


export interface MemeToken {
  id: string; // mint address
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

export type MemeCategory = 'newest' | 'trending' | 'potential' | 'all' | 'under1m' | 'gainers' | 'losers' | 'volume' | 'liquidity' | 'liquidity_high' | 'liquidity_low' | 'marketcap' | 'marketcap_high' | 'marketcap_low' | 'txns' | 'boosted';

const preloadImage = (src?: string) =>
  new Promise<boolean>((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

export const useMemeTokens = (category: MemeCategory, limit: number = 30, page?: number) => {
  const pageKey = typeof page === 'number' && page > 0 ? `:p${page}` : '';
  const [tokens, setTokens] = useState<MemeToken[]>(() => {
    const k = `memeTokens:${category}:v2${pageKey}`;
    const boot = getCacheStaleOk<MemeToken[]>(k);
    return Array.isArray(boot) ? boot.slice(0, limit) : [];
  });
  const [loading, setLoading] = useState(() => {
    const k = `memeTokens:${category}:v2${pageKey}`;
    const boot = getCacheStaleOk<MemeToken[]>(k);
    return !(Array.isArray(boot) && boot.length);
  });
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    console.log('[useMemeTokens] start', { category, limit });

    const cacheKey = `memeTokens:${category}:v2${pageKey}`;

    // Prefer fresh cache (no network, instant paint)
    const freshEntry = getCache<MemeToken[]>(cacheKey);
    if (freshEntry?.data?.length && mounted) {
      setTokens(freshEntry.data.slice(0, limit));
      if (freshEntry.fresh) {
        // If cache is fresh, skip loading state to avoid skeletons
        setLoading(false);
      }
    }

    // Immediate bootstrap from stale cache as fallback (SWR)
    const bootstrap = getCacheStaleOk<MemeToken[]>(cacheKey);
    if (!freshEntry?.data?.length && bootstrap && bootstrap.length && mounted) {
      setTokens(bootstrap.slice(0, limit));
      // Show cached data immediately while background refresh happens
      setLoading(false);
    }

    const normalize = (d: any): any[] => {
      if (!d) return [];
      if (Array.isArray(d)) return d;
      const r = Array.isArray(d?.results) ? d.results
        : Array.isArray(d?.data?.results) ? d.data.results
        : Array.isArray(d?.data) ? d.data
        : [];
      return Array.isArray(r) ? r : [];
    };

    const load = async () => {
      try {
        // 0) Centralized cache bootstrap and refresh trigger
        try {
          const { data: row } = await supabase
            .from('meme_tokens_cache')
            .select('data, updated_at')
            .eq('category', category)
            .maybeSingle();
          if (row?.data && mounted) {
            const freshEnough = row.updated_at
              ? Date.now() - new Date(row.updated_at as any).getTime() <= 30 * 60 * 1000
              : false;
            const arr = Array.isArray(row.data) ? (row.data as unknown as MemeToken[]) : [];
            if (arr.length) {
              setTokens(arr.slice(0, limit));
            }
            if (!freshEnough) {
              // Trigger refresh in background (non-blocking)
              supabase.functions.invoke('meme-cache-refresh', { body: { categories: [category] } }).catch(() => {});
            }
          }
        } catch {}

        // 1) Backend aggregated catalog with pagination (meme-catalog)
        try {
          const backendCategory = (
            category === 'marketcap' ? 'marketcap_high' :
            category === 'liquidity' ? 'liquidity_high' :
            category === 'marketcap_high' ? 'marketcap_high' :
            category === 'marketcap_low' ? 'marketcap_low' :
            category === 'liquidity_high' ? 'liquidity_high' :
            category === 'liquidity_low' ? 'liquidity_low' :
            category === 'potential' ? 'newest' :
            category
          ) as any;

          const { data: res } = await supabase.functions.invoke('meme-catalog', {
            body: { category: backendCategory, page: page ?? 1, pageSize: limit }
          });

          const items = Array.isArray(res?.items) ? (res.items as MemeToken[]) : [];
          const total = Number(res?.total ?? 0);
          const pg = Number(res?.page ?? (page ?? 1));
          const sz = Number(res?.pageSize ?? limit);
          if (mounted) setHasMore(pg * sz < total);

          if (items.length) {
            await Promise.all(items.map((t) => preloadImage(t.image)));
            if (!mounted) return;
            setCache(cacheKey, items, { ttlMs: 2 * 60 * 1000 });
            setTokens(items);
            return; // success path
          }
        } catch (_) {}

        // 2) Legacy fallback is disabled to reduce rate limits and avoid 502s.
        // Preserve existing tokens on failure.
        return;
        const { data: batch, error: batchErr } = await supabase.functions.invoke('dexscreener-proxy', {
          body: { action: 'tokenBatch', addresses }
        });
        if (batchErr) throw batchErr;
        const items: any[] = batch?.results || [];
        if (!Array.isArray(items) || items.length === 0) {
          console.warn('[useMemeTokens] tokenBatch returned empty; skip override and keep cached tokens');
          return;
        }
        // 3) Map, filter and prepare tokens
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

            const toNum = (v: any): number => {
              if (typeof v === 'number') return v;
              if (typeof v === 'string') {
                const n = Number(v.replace(/[,\s]/g, ''));
                return isNaN(n) ? 0 : n;
              }
              return 0;
            };

            const marketCap = toNum(infoD.mcap);
            const holders = toNum(infoD.holders);
            const volume24h = toNum(poolD.volume24h);

            return {
              id: metaD.address,
              symbol: (metaD.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
              name: metaD.name || metaD.symbol || 'Token',
              image: metaD.logo || '/placeholder.svg',
              price: toNum(priceD.price),
              change24h: toNum(priceD.variation24h),
              volume24h,
              marketCap,
              holders,
              views: '—',
              emoji: undefined,
              tags: [category],
              isHot: category === 'trending' ? idx < 10 : false,
              description: metaD.description,
            } as MemeToken;
          });

        if (category === 'potential') {
          // nyaste med minst 40k marketcap (vi visar ändå alla, men markerar under gränsen sist)
          mapped = mapped.sort((a,b) => Number(b.marketCap>=40000) - Number(a.marketCap>=40000));
        }

        // Only take up to limit for initial render
        mapped = mapped.slice(0, limit);

        // 4) Preload all logos before rendering
        await Promise.all(mapped.map((t) => preloadImage(t.image)));

        if (!mounted) return;
        // Update cache (fresh for 2 minutes)
        setCache(cacheKey, mapped, { ttlMs: 2 * 60 * 1000 });
        setTokens(mapped);

        // 5) Enrich missing data via DEXTools tokenFull for gaps (holders/volume/mcap)
        const stillNeedsBase = mapped.filter(t => !(t.marketCap > 0 && t.holders > 0 && t.volume24h > 0));
        if (stillNeedsBase.length) {
          try {
            const concurrency = 3;
            const toNum = (v: any): number => {
              if (typeof v === 'number') return v;
              if (typeof v === 'string') { const n = Number(v.replace(/[\,\s]/g, '')); return isNaN(n) ? 0 : n; }
              return 0;
            };
            const chunks: typeof stillNeedsBase[] = [];
            for (let i = 0; i < stillNeedsBase.length; i += concurrency) chunks.push(stillNeedsBase.slice(i, i + concurrency));
            for (const grp of chunks) {
              const res = await Promise.all(grp.map(async (t) => {
                try {
                  const { data: full } = await supabase.functions.invoke('dexscreener-proxy', { body: { action: 'tokenFull', address: t.id } });
                  const infoD = (full?.info?.data ?? full?.info) as any || {};
                  const poolD = (full?.poolPrice?.data ?? full?.poolPrice) as any || {};
                  return {
                    id: t.id,
                    marketCap: toNum(infoD.mcap),
                    holders: toNum(infoD.holders),
                    volume24h: toNum(poolD.volume24h)
                  };
                } catch { return { id: t.id }; }
              }));
              if (!mounted) break;
              setTokens(prev => prev.map(p => {
                const u = res.find(r => r.id === p.id);
                if (!u) return p;
                return {
                  ...p,
                  marketCap: u.marketCap ?? p.marketCap,
                  holders: u.holders ?? p.holders,
                  volume24h: u.volume24h ?? p.volume24h,
                };
              }));
              await new Promise(r => setTimeout(r, 350));
            }
          } catch (_) {}
        }
      } catch (e: any) {
        // On error, try centralized cache, then local stale cache
        try {
          const { data: row } = await supabase
            .from('meme_tokens_cache')
            .select('data')
            .eq('category', category)
            .maybeSingle();
          const arr = Array.isArray(row?.data) ? (row!.data as unknown as MemeToken[]) : [];
          if (mounted && arr.length) {
            setTokens(arr.slice(0, limit));
            setError(null);
          } else {
            const cached = getCacheStaleOk<MemeToken[]>(cacheKey);
            if (mounted && cached && cached.length) {
              setTokens(cached.slice(0, limit));
              setError(null);
            } else if (mounted) {
              setError(e?.message || 'Kunde inte hämta data från DEXTools');
            }
          }
        } catch {
          const cached = getCacheStaleOk<MemeToken[]>(cacheKey);
          if (mounted && cached && cached.length) {
            setTokens(cached.slice(0, limit));
            setError(null);
          } else if (mounted) {
            setError(e?.message || 'Kunde inte hämta data från DEXTools');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!freshEntry?.fresh) {
      load();
    } else {
      // Fresh cache present; skip heavy fetch to respect rate limits
    }
    return () => {
      mounted = false;
    };
  }, [category, limit]);

  // Persist the latest tokens to localStorage so refresh/navigation is instant
  useEffect(() => {
    const cacheKey = `memeTokens:${category}:v2`;
    if (tokens && tokens.length) {
      setCache(cacheKey, tokens, { ttlMs: 2 * 60 * 1000 });
    }
  }, [category, tokens]);

  // Background monitor: keep enriching tokens that still miss data (no filtering)
  const enrichAttempts = useRef<Record<string, number>>({});
  useEffect(() => {
    const toNum = (v: any): number => typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/[\,\s]/g, '')) : 0);
    const pending = tokens.filter(t => (t.marketCap <= 0 || t.holders <= 0 || t.volume24h <= 0) && (enrichAttempts.current[t.id] ?? 0) < 5);
    if (!pending.length) return;
    let cancelled = false;
    const run = async () => {
      const batch = pending.slice(0, 5);
      const res = await Promise.all(batch.map(async (t) => {
        try {
          enrichAttempts.current[t.id] = (enrichAttempts.current[t.id] ?? 0) + 1;
          const { data: full } = await supabase.functions.invoke('dexscreener-proxy', { body: { action: 'tokenFull', address: t.id } });
          const infoD = (full?.info?.data ?? full?.info) as any || {};
          const poolD = (full?.poolPrice?.data ?? full?.poolPrice) as any || {};
          return { id: t.id, marketCap: toNum(infoD.mcap), holders: toNum(infoD.holders), volume24h: toNum(poolD.volume24h) };
        } catch { return { id: t.id }; }
      }));
      if (cancelled) return;
      setTokens(prev => prev.map(p => {
        const u = res.find(r => r.id === p.id);
        if (!u) return p;
        return { ...p, marketCap: u.marketCap ?? p.marketCap, holders: u.holders ?? p.holders, volume24h: u.volume24h ?? p.volume24h };
      }));
    };
    // run once immediately and then every 20s
    run();
    const id = setInterval(run, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [tokens]);

  // Removed PumpPortal real-time feed per requirements
  // Future: could poll DexScreener lists periodically if needed
  const sorted = useMemo(() => tokens, [tokens]);
  
  return { tokens: sorted, loading, error };
};
