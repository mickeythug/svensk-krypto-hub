import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

    const load = async () => {
      try {
        // 1) Get base list (addresses)
        let addresses: string[] = [];
        if (category === 'trending') {
          const { data, error } = await supabase.functions.invoke('dextools-proxy', {
            body: { action: 'gainers' },
          });
          if (error) throw error;
          const list: any[] = Array.isArray(data) ? data : data?.results || [];
          addresses = list.map((i: any) => i?.mainToken?.address).filter(Boolean);
        } else {
          // newest and potential start from newest token listing
          const { data, error } = await supabase.functions.invoke('dextools-proxy', {
            body: { action: 'newest', page: 0, pageSize: Math.max(limit * 2, 60) },
          });
          if (error) throw error;
          const results: any[] = data?.results || [];
          addresses = results.map((r: any) => r?.address).filter(Boolean);
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
          .filter((x: any) => x?.ok && x?.meta?.address)
          .map((x: any, idx: number) => {
            const meta = x.meta || {};
            const price = x.price || {};
            const info = x.info || {};
            const pool = x.poolPrice || {};
            return {
              id: meta.address,
              symbol: (meta.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
              name: meta.name || meta.symbol || 'Token',
              image: meta.logo || '/placeholder.svg',
              price: Number(price.price ?? 0),
              change24h: Number(price.variation24h ?? 0),
              volume24h: Number(pool.volume24h ?? 0),
              marketCap: Number(info.mcap ?? 0),
              holders: Number(info.holders ?? 0),
              views: '—',
              emoji: undefined,
              tags: [category],
              isHot: category === 'trending' ? idx < 10 : false,
              description: meta.description,
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
        setTokens(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Kunde inte hämta data från DEXTools');
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
