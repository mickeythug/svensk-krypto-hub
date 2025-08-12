import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCacheStaleOk, setCache } from '@/lib/cache';

export interface CompleteMarketData {
  price: {
    usd?: number;
    sol?: number;
    logoURI?: string;
  };
  market: {
    marketCap?: number;
    fdv?: number;
    liquidity?: number;
    supply?: number;
    circulatingSupply?: number;
  };
  performance: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  tradingActivity: {
    txns24h?: number;
    buys24h?: number;
    sells24h?: number;
    uniqueTraders24h?: number;
  };
  volume: {
    volume24h?: number;
    buyVolume24h?: number;
    sellVolume24h?: number;
    volume1h?: number;
    volume6h?: number;
  };
  participants: {
    holders?: number;
  };
  socials?: Record<string, string>;
  raw?: any;
}

export function useCompleteMarketData(address?: string) {
  const [data, setData] = useState<CompleteMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(!!address);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const key = `completeMarketData:${address}:v1`;

    const stale = getCacheStaleOk<CompleteMarketData>(key);
    if (stale && mounted) setData(stale);

    const fetchAll = async () => {
      try {
        const [dtRes, beOverviewRes, beTradesRes] = await Promise.all([
          supabase.functions.invoke('dextools-proxy', { body: { action: 'tokenFull', address } }),
          supabase.functions.invoke('birdeye-proxy', { body: { action: 'token_overview', address } }),
          supabase.functions.invoke('birdeye-proxy', { body: { action: 'token_trades_24h', address } }),
        ]);

        const tokenResponse = (dtRes as any)?.data;
        const beOverview = (beOverviewRes as any)?.data?.data ?? (beOverviewRes as any)?.data;
        const beTrades = (beTradesRes as any)?.data?.items ?? (beTradesRes as any)?.data?.data?.items ?? (beTradesRes as any)?.data;

        const meta = tokenResponse?.meta?.data ?? tokenResponse?.meta ?? {};
        const price = tokenResponse?.price?.data ?? tokenResponse?.price ?? {};
        const info = tokenResponse?.info?.data ?? tokenResponse?.info ?? {};
        const poolLiquidity = tokenResponse?.poolLiquidity?.data ?? tokenResponse?.poolLiquidity ?? null;

        const parseNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[\,\s]/g, '');
            const num = Number(cleaned);
            return isNaN(num) ? undefined : num;
          }
          return undefined;
        };

        const h24 = beTrades?.h24 || {};
        const h1 = beTrades?.h1 || {};
        const h6 = beTrades?.h6 || {};
        const m5 = beTrades?.m5 || {};

        const combined: CompleteMarketData = {
          price: {
            usd: beOverview?.price ?? beOverview?.value ?? parseNum(price?.price),
            sol: parseNum(price?.priceChain),
            logoURI: meta?.logo || beOverview?.logoURI,
          },
          market: {
            marketCap: beOverview?.realMc ?? beOverview?.marketCap ?? parseNum(info?.mcap),
            fdv: beOverview?.fdv ?? parseNum(info?.fdv),
            liquidity: beOverview?.liquidity ?? parseNum(poolLiquidity?.liquidity),
            supply: beOverview?.supply ?? parseNum(info?.totalSupply),
            circulatingSupply: beOverview?.circulatingSupply ?? parseNum(info?.circulatingSupply),
          },
          performance: {
            m5: parseNum(price?.variation5m),
            h1: parseNum(price?.variation1h),
            h6: parseNum(price?.variation6h),
            h24: beOverview?.priceChange24h ?? parseNum(price?.variation24h),
          },
          tradingActivity: {
            txns24h: (h24?.buy || 0) + (h24?.sell || 0),
            buys24h: h24?.buy,
            sells24h: h24?.sell,
            uniqueTraders24h: h24?.traders,
          },
          volume: {
            volume24h: h24?.volume,
            buyVolume24h: h24?.buyVolume,
            sellVolume24h: h24?.sellVolume,
            volume1h: h1?.volume,
            volume6h: h6?.volume,
          },
          participants: {
            holders: beOverview?.holder ?? parseNum(info?.holders),
          },
          socials: meta?.socialInfo || {},
          raw: { tokenResponse, beOverview, beTrades },
        };

        if (!mounted) return;
        setCache(key, combined, { ttlMs: 30_000 });
        setData(combined);
      } catch (e: any) {
        if (!mounted) return;
        const cached = getCacheStaleOk<CompleteMarketData>(key);
        if (cached) setData(cached);
        else setError(e?.message || 'Kunde inte hämta marknadsdata');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [address]);

  return { data, loading, error };
}
