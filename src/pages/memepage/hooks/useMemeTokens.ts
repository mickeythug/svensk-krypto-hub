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

export const useMemeTokens = (category: 'trending' | 'under1m' | 'all', limit?: number) => {
  // Pump WS removed; using DEXTools via Supabase Edge Function
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const action = category === 'trending' ? 'gainers' : 'hotpools';

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('dextools-proxy', {
          body: { action },
        });
        if (error) throw error;
        const list: any[] = Array.isArray(data) ? (data as any[]) : (data?.results || []);
        const mapped: MemeToken[] = list.map((item: any, idx: number) => {
          const t = item.mainToken || {};
          const price = Number(item.price ?? 0);
          const change = Number(item.variation24h ?? 0);
          return {
            id: t.address || String(idx),
            symbol: (t.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
            name: t.name || t.symbol || 'Token',
            image: '/placeholder.svg',
            price,
            change24h: change,
            volume24h: Number(item.volume24h ?? 0),
            marketCap: 0,
            holders: 0,
            views: '—',
            emoji: undefined,
            tags: ['trending'],
            isHot: idx < 10,
            description: undefined,
          } as MemeToken;
        });
        if (!mounted) return;
        setTokens(limit ? mapped.slice(0, limit) : mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Kunde inte hämta data från DEXTools');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [category, limit]);

  // Basic sorting depending on category (no mock). We keep newest first.
  const sorted = useMemo(() => {
    return tokens;
  }, [tokens]);

  return { tokens: sorted, loading, error };
};
