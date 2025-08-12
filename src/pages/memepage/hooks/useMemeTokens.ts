import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, getCacheStaleOk, setCache } from '@/lib/cache';
import { pumpOnMessage, pumpSubscribe } from '@/hooks/usePumpPortalWS';

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

export type MemeCategory = 'newest' | 'trending' | 'potential' | 'all' | 'under1m';

const preloadImage = (src?: string) =>
  new Promise<boolean>((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

export const useMemeTokens = (category: MemeCategory, limit: number = 30) => {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    console.log('[useMemeTokens] start', { category, limit });

    const cacheKey = `memeTokens:${category}:v2`;
    // Immediate bootstrap from cache (stale OK) to avoid empty UI
    const bootstrap = getCacheStaleOk<MemeToken[]>(cacheKey);
    if (bootstrap && bootstrap.length && mounted) {
      setTokens(bootstrap.slice(0, limit));
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

        // 1) Get base list (addresses)
        let addresses: string[] = [];
        if (category === 'trending') {
          const { data, error } = await supabase.functions.invoke('dextools-proxy', {
            body: { action: 'trendingCombined', limit: Math.max(limit * 2, 60) },
          });
          if (error) throw error;
          const list: string[] = Array.isArray(data?.addresses) ? data.addresses : [];
          addresses = list.filter(Boolean).slice(0, Math.max(limit * 2, 60));
        } else {
          // newest och potential hämtar senaste listningar (24h), faller tillbaka till gainers vid fel
          const to = new Date().toISOString();
          const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          try {
            const { data, error } = await supabase.functions.invoke('dextools-proxy', {
              body: { action: 'newest', page: 0, pageSize: 50, from, to },
            });
            if (error) throw error;
            const results: any[] = normalize(data);
            const arr = Array.isArray(results) ? results : [];
            addresses = arr
              .map((r: any) => r?.address || r?.mainToken?.address)
              .filter(Boolean)
              .slice(0, limit);
          } catch (_) {
            // Fallback: gainers
            const { data: gain, error: gErr } = await supabase.functions.invoke('dextools-proxy', {
              body: { action: 'gainers' },
            });
            if (gErr) throw gErr;
            const list: any[] = normalize(gain);
            addresses = list
              .map((i: any) => i?.mainToken?.address || i?.address || i?.token?.address)
              .filter(Boolean)
              .slice(0, limit);
          }
        }

        // If no addresses and not trending, don't call batch
        if (category !== 'trending' && !addresses.length) {
          if (mounted) {
            setTokens([]);
          }
          return;
        }

        // Safety cap
        addresses = addresses.slice(0, Math.max(limit * 2, 60));

        // 2) Fetch full details in batch
        let items: any[] = [];
        if (category === 'trending') {
          const { data: batch, error: batchErr } = await supabase.functions.invoke('dextools-proxy', {
            body: { action: 'trendingCombinedBatch', limit: Math.max(limit * 2, 60) },
          });
          if (batchErr) throw batchErr;
          items = batch?.results || [];
        } else {
          const { data: batch, error: batchErr } = await supabase.functions.invoke('dextools-proxy', {
            body: { action: 'tokenBatch', addresses },
          });
          if (batchErr) throw batchErr;
          items = batch?.results || [];
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

        // 5) Enrich missing data (prefer Birdeye for reliable market metrics, then fallback to DEXTools for holders)
        const needsEnrichment = mapped.filter(t => !(t.marketCap > 0 && t.volume24h > 0));
        if (needsEnrichment.length) {
          try {
            const birdeyeBatch = needsEnrichment.slice(0, 20).map(t => t.id);
            if (birdeyeBatch.length) {
              const { data: enr } = await supabase.functions.invoke('meme-birdeye-enrich', {
                body: { addresses: birdeyeBatch, limit: 20, delayMs: 1100 },
              });
              const results = (enr?.results || {}) as Record<string, any>;
              if (mounted && results && Object.keys(results).length) {
                setTokens(prev => prev.map(p => {
                  const r = results[p.id];
                  if (!r) return p;
                  const toNum = (v: any): number => {
                    if (typeof v === 'number') return v;
                    if (typeof v === 'string') { const n = Number(v.replace(/[\,\s]/g, '')); return isNaN(n) ? 0 : n; }
                    return 0;
                  };
                  return {
                    ...p,
                    price: toNum(r.price) || p.price,
                    marketCap: toNum(r.marketCap) || p.marketCap,
                    volume24h: toNum(r.volume24h) || p.volume24h,
                  };
                }));
              }
            }
          } catch (_) {}

          // Fallback: fill remaining gaps via DEXTools tokenFull (faster for holders)
          const stillNeeds = tokens.filter(t => !(t.marketCap > 0 && t.holders > 0 && t.volume24h > 0));
          if (stillNeeds.length) {
            const concurrency = 3;
            const toNum = (v: any): number => {
              if (typeof v === 'number') return v;
              if (typeof v === 'string') { const n = Number(v.replace(/[\,\s]/g, '')); return isNaN(n) ? 0 : n; }
              return 0;
            };
            const chunks: typeof stillNeeds[] = [];
            for (let i = 0; i < stillNeeds.length; i += concurrency) chunks.push(stillNeeds.slice(i, i + concurrency));
            for (const grp of chunks) {
              const res = await Promise.all(grp.map(async (t) => {
                try {
                  const { data: full } = await supabase.functions.invoke('dextools-proxy', { body: { action: 'tokenFull', address: t.id } });
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
          }
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

    load();
    return () => {
      mounted = false;
    };
  }, [category, limit]);

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
          const { data: full } = await supabase.functions.invoke('dextools-proxy', { body: { action: 'tokenFull', address: t.id } });
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

  const sorted = useMemo(() => tokens, [tokens]);

  // Live PumpPortal feed: subscribe to migrations and enrich them in real time (no extra hooks)
  useEffect(() => {
    if (category !== 'trending') return;
    let off: (() => void) | null = null;

    // Subscribe once on mount for this instance
    (async () => {
      try {
        await pumpSubscribe('subscribeMigration');
        // If needed later, we can also subscribe to new token creations:
        // await pumpSubscribe('subscribeNewToken');
      } catch {}
    })();

    off = pumpOnMessage(async (msg) => {
      const t = msg?.type || msg?.method;
      if (t !== 'migration' && t !== 'subscribeMigration') return;
      const mint = msg?.mint;
      if (!mint || typeof mint !== 'string') return;
      // Do not add if already present
      setTokens((prev) => {
        if (prev.some((p) => p.id === mint)) return prev;
        const base: MemeToken = {
          id: mint,
          symbol: (msg?.symbol || 'TOKEN').toString().slice(0,12).toUpperCase(),
          name: msg?.name || msg?.symbol || 'Token',
          image: undefined,
          price: 0,
          change24h: 0,
          volume24h: 0,
          marketCap: 0,
          holders: 0,
          views: '—',
          emoji: undefined,
          tags: ['trending'],
          isHot: false,
          description: undefined,
        };
        return [base, ...prev].slice(0, Math.max(limit * 2, 60));
      });
      try {
        const { data: full } = await supabase.functions.invoke('dextools-proxy', { body: { action: 'tokenFull', address: mint } });
        const metaD = (full?.meta?.data ?? full?.meta) as any || {};
        const priceD = (full?.price?.data ?? full?.price) as any || {};
        const infoD = (full?.info?.data ?? full?.info) as any || {};
        const poolD = (full?.poolPrice?.data ?? full?.poolPrice) as any || {};
        const toNum = (v: any) => typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/[\,\s]/g, '')) : 0);
        setTokens((prev) => prev.map((p) => p.id !== mint ? p : ({
          ...p,
          symbol: p.symbol || (metaD.symbol || 'TOKEN').toString().slice(0,12).toUpperCase(),
          name: p.name || metaD.name || metaD.symbol || 'Token',
          image: metaD.logo || p.image,
          price: toNum(priceD.price) || p.price,
          change24h: toNum(priceD.variation24h) || p.change24h,
          volume24h: toNum(poolD.volume24h) || p.volume24h,
          marketCap: toNum(infoD.mcap) || p.marketCap,
          holders: toNum(infoD.holders) || p.holders,
          description: metaD.description || p.description,
        })));
      } catch (_) {}
    });

    return () => { off?.(); };
  }, [category, limit]);


  return { tokens: sorted, loading, error };
};
