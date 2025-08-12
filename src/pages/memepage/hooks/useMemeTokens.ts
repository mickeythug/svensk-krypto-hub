import { useEffect, useMemo, useState } from 'react';
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

    const cacheKey = `memeTokens:${category}:v1`;
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

        // If no addresses, don't call batch
        if (!addresses.length) {
          if (mounted) {
            setTokens([]);
          }
          return;
        }

        // Safety cap
        addresses = addresses.slice(0, Math.max(limit * 2, 60));

        // 2) Fetch full details in batch
        const { data: batch, error: batchErr } = await supabase.functions.invoke('dextools-proxy', {
          body: { action: 'tokenBatch', addresses },
        });
        if (batchErr) throw batchErr;
        const items: any[] = batch?.results || [];

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
            return {
              id: metaD.address,
              symbol: (metaD.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
              name: metaD.name || metaD.symbol || 'Token',
              image: metaD.logo || '/placeholder.svg',
              price: Number(priceD.price ?? 0),
              change24h: Number(priceD.variation24h ?? 0),
              volume24h: Number(poolD.volume24h ?? 0),
              marketCap: Number(infoD.mcap ?? 0),
              holders: Number(infoD.holders ?? 0),
              views: '—',
              emoji: undefined,
              tags: [category],
              isHot: category === 'trending' ? idx < 10 : false,
              description: metaD.description,
            } as MemeToken;
          });

        if (category === 'potential') {
          // nyaste med minst 40k marketcap
          mapped = mapped.filter((t) => t.marketCap >= 40000);
        }

        // Only take up to limit
        mapped = mapped.slice(0, limit);

        // 4) Preload all logos before rendering
        await Promise.all(mapped.map((t) => preloadImage(t.image)));

        if (!mounted) return;
        // Update cache (fresh for 2 minutes)
        setCache(cacheKey, mapped, { ttlMs: 2 * 60 * 1000 });
        setTokens(mapped);
      } catch (e: any) {
        // On error, try serve stale cache as graceful fallback
        const cached = getCacheStaleOk<MemeToken[]>(cacheKey);
        if (mounted && cached && cached.length) {
          setTokens(cached.slice(0, limit));
          setError(null);
        } else if (mounted) {
          setError(e?.message || 'Kunde inte hämta data från DEXTools');
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

  const sorted = useMemo(() => tokens, [tokens]);

  return { tokens: sorted, loading, error };
};
