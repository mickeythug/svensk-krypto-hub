import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, getCacheStaleOk, setCache } from '@/lib/cache';

export interface MemeTokenDetails {
  address: string;
  symbol: string;
  name: string;
  logo?: string;
  description?: string;
  price?: number;
  variation24h?: number;
  marketCap?: number;
  holders?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  socials?: Record<string, string>;
  pool?: { volume24h?: number; liquidity?: number } | null;
  raw?: any;
}

export function useMemeTokenDetails(address?: string) {
  const [data, setData] = useState<MemeTokenDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(!!address);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const key = `memeTokenDetails:${address}:v1`;

    // Bootstrap from cache immediately (stale ok)
    const stale = getCacheStaleOk<MemeTokenDetails>(key);
    if (stale && mounted) setData(stale);

    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('dexscreener-proxy', {
          body: { action: 'tokenFull', address },
        });
        if (error) throw error;
        const meta = data?.meta?.data ?? data?.meta ?? {};
        const price = data?.price?.data ?? data?.price ?? {};
        const info = data?.info?.data ?? data?.info ?? {};
        const pool = data?.poolPrice?.data ?? data?.poolPrice ?? null;
        const poolLiquidity = data?.poolLiquidity?.data ?? data?.poolLiquidity ?? null;

        const holdersParsed = typeof info?.holders === 'number'
          ? info.holders
          : (typeof info?.holders === 'string'
            ? Number(String(info.holders).replace(/[,\s]/g, ''))
            : undefined);

        const details: MemeTokenDetails = {
          address,
          symbol: String(meta?.symbol || 'TOKEN').toUpperCase(),
          name: meta?.name || meta?.symbol || 'Token',
          logo: meta?.logo,
          description: meta?.description,
          price: typeof price?.price === 'number' ? price.price : undefined,
          variation24h: typeof price?.variation24h === 'number' ? price.variation24h : undefined,
          marketCap: typeof info?.mcap === 'number' ? info.mcap : (typeof info?.mcap === 'string' ? Number(String(info.mcap).replace(/[,\s]/g, '')) : undefined),
          holders: holdersParsed,
          circulatingSupply: typeof info?.circulatingSupply === 'number' ? info.circulatingSupply : (typeof info?.circulatingSupply === 'string' ? Number(String(info.circulatingSupply).replace(/[,\s]/g, '')) : undefined),
          totalSupply: typeof info?.totalSupply === 'number' ? info.totalSupply : (typeof info?.totalSupply === 'string' ? Number(String(info.totalSupply).replace(/[,\s]/g, '')) : undefined),
          socials: meta?.socialInfo || {},
          pool: pool ? { volume24h: pool.volume24h, liquidity: poolLiquidity?.liquidity } : null,
          raw: data,
        };

        if (!mounted) return;
        setCache(key, details, { ttlMs: 5 * 60 * 1000 });
        setData(details);
      } catch (e: any) {
        if (mounted) {
          const cached = getCacheStaleOk<MemeTokenDetails>(key);
          if (cached) {
            setData(cached);
            setError(null);
          } else {
            setError(e?.message || 'Kunde inte hämta token-detaljer');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [address]);

  return { data, loading, error };
}
