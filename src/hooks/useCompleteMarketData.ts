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
        // Only use DEXTools for comprehensive data since Birdeye free tier is limited
        const dtRes = await supabase.functions.invoke('dextools-proxy', { 
          body: { action: 'tokenFull', address } 
        });

        const tokenResponse = (dtRes as any)?.data;
        const meta = tokenResponse?.meta?.data ?? tokenResponse?.meta ?? {};
        const price = tokenResponse?.price?.data ?? tokenResponse?.price ?? {};
        const info = tokenResponse?.info?.data ?? tokenResponse?.info ?? {};
        const poolLiquidity = tokenResponse?.poolLiquidity?.data ?? tokenResponse?.poolLiquidity ?? null;
        const poolPrice = tokenResponse?.poolPrice?.data ?? tokenResponse?.poolPrice ?? null;

        const parseNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[\,\s]/g, '');
            const num = Number(cleaned);
            return isNaN(num) ? undefined : num;
          }
          return undefined;
        };

        const combined: CompleteMarketData = {
          price: {
            usd: parseNum(price?.price),
            sol: parseNum(price?.priceChain),
            logoURI: meta?.logo,
          },
          market: {
            marketCap: parseNum(info?.mcap),
            fdv: parseNum(info?.fdv),
            liquidity: parseNum(poolLiquidity?.liquidity),
            supply: parseNum(info?.totalSupply),
            circulatingSupply: parseNum(info?.circulatingSupply),
          },
          performance: {
            m5: parseNum(price?.variation5m),
            h1: parseNum(price?.variation1h),
            h6: parseNum(price?.variation6h),
            h24: parseNum(price?.variation24h),
          },
          tradingActivity: {
            txns24h: (poolPrice?.buys24h || 0) + (poolPrice?.sells24h || 0),
            buys24h: poolPrice?.buys24h,
            sells24h: poolPrice?.sells24h,
            uniqueTraders24h: undefined, // Not available in DEXTools
          },
          volume: {
            volume24h: poolPrice?.volume24h,
            buyVolume24h: poolPrice?.buyVolume24h,
            sellVolume24h: poolPrice?.sellVolume24h,
            volume1h: poolPrice?.volume1h,
            volume6h: poolPrice?.volume6h,
          },
          participants: {
            holders: parseNum(info?.holders),
          },
          socials: meta?.socialInfo || {},
          raw: { tokenResponse, poolPrice, poolLiquidity },
        };

        if (!mounted) return;
        // Client-side diagnostics for missing fields
        if (!combined.market.liquidity || !combined.tradingActivity.txns24h || !combined.volume.volume24h || !combined.participants.holders) {
          console.warn('[market-debug-client]', {
            address,
            missing: {
              liquidity: !combined.market.liquidity,
              txns24h: !combined.tradingActivity.txns24h,
              volume24h: !combined.volume.volume24h,
              holders: !combined.participants.holders,
            },
            rawKeys: {
              price: Object.keys((tokenResponse?.price?.data ?? tokenResponse?.price ?? {}) || {}),
              info: Object.keys((tokenResponse?.info?.data ?? tokenResponse?.info ?? {}) || {}),
              poolPrice: Object.keys((tokenResponse?.poolPrice?.data ?? tokenResponse?.poolPrice ?? {}) || {}),
              poolLiquidity: Object.keys((tokenResponse?.poolLiquidity?.data ?? tokenResponse?.poolLiquidity ?? {}) || {}),
            }
          });
        }
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
