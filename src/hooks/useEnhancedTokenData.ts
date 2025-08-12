import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, getCacheStaleOk, setCache } from '@/lib/cache';

export interface PoolData {
  volume5m?: number;
  sells5m?: number;
  buys5m?: number;
  sellVolume5m?: number;
  buyVolume5m?: number;
  volume1h?: number;
  sells1h?: number;
  buys1h?: number;
  volume6h?: number;
  volume24h?: number;
  sells24h?: number;
  buys24h?: number;
}

export interface EnhancedTokenData {
  // Token basics
  address: string;
  symbol: string;
  name: string;
  logo?: string;
  description?: string;
  
  // Pricing
  price?: number;
  priceChain?: number;
  price5m?: number;
  variation5m?: number;
  price1h?: number;
  variation1h?: number;
  price6h?: number;
  variation6h?: number;
  price24h?: number;
  variation24h?: number;
  
  // Market info
  marketCap?: number;
  fdv?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  holders?: number;
  liquidity?: number;
  
  // Pool/Trading data
  poolData?: PoolData;
  
  // Audit/Security
  audit?: {
    isOpenSource?: string;
    isHoneypot?: string;
    isMintable?: string;
    isProxy?: string;
    slippageModifiable?: string;
    isBlacklisted?: string;
    sellTax?: { min: number; max: number; status: string };
    buyTax?: { min: number; max: number; status: string };
    isContractRenounced?: string;
    isPotentiallyScam?: string;
  };
  
  // Social
  socials?: Record<string, string>;
  
  // Raw data for backup
  raw?: any;
}

export function useEnhancedTokenData(address?: string) {
  const [data, setData] = useState<EnhancedTokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(!!address);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const key = `enhancedTokenData:${address}:v1`;

    // Bootstrap from cache immediately (stale ok)
    const stale = getCacheStaleOk<EnhancedTokenData>(key);
    if (stale && mounted) setData(stale);

    const loadTokenData = async () => {
      try {
        // Get comprehensive token data from DEXTools
        const { data: tokenResponse, error: tokenError } = await supabase.functions.invoke('dextools-proxy', {
          body: { action: 'tokenFull', address },
        });
        
        if (tokenError) throw tokenError;

        const meta = tokenResponse?.meta?.data ?? tokenResponse?.meta ?? {};
        const price = tokenResponse?.price?.data ?? tokenResponse?.price ?? {};
        const info = tokenResponse?.info?.data ?? tokenResponse?.info ?? {};
        const audit = tokenResponse?.audit?.data ?? tokenResponse?.audit ?? {};
        const poolPrice = tokenResponse?.poolPrice?.data ?? tokenResponse?.poolPrice ?? null;
        const poolLiquidity = tokenResponse?.poolLiquidity?.data ?? tokenResponse?.poolLiquidity ?? null;

        // Parse numeric values safely
        const parseNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[,\\s]/g, '');
            const num = Number(cleaned);
            return isNaN(num) ? undefined : num;
          }
          return undefined;
        };

        // Construct enhanced data object
        const enhancedData: EnhancedTokenData = {
          address,
          symbol: String(meta?.symbol || 'TOKEN').toUpperCase(),
          name: meta?.name || meta?.symbol || 'Token',
          logo: meta?.logo,
          description: meta?.description,
          
          // Pricing data
          price: parseNum(price?.price),
          priceChain: parseNum(price?.priceChain),
          price5m: parseNum(price?.price5m),
          variation5m: parseNum(price?.variation5m),
          price1h: parseNum(price?.price1h),
          variation1h: parseNum(price?.variation1h),
          price6h: parseNum(price?.price6h),
          variation6h: parseNum(price?.variation6h),
          price24h: parseNum(price?.price24h),
          variation24h: parseNum(price?.variation24h),
          
          // Market data
          marketCap: parseNum(info?.mcap),
          fdv: parseNum(info?.fdv),
          circulatingSupply: parseNum(info?.circulatingSupply),
          totalSupply: parseNum(info?.totalSupply),
          holders: parseNum(info?.holders),
          liquidity: parseNum(poolLiquidity?.liquidity),
          
          // Pool data if available
          poolData: poolPrice ? {
            volume5m: parseNum(poolPrice?.volume5m),
            sells5m: parseNum(poolPrice?.sells5m),
            buys5m: parseNum(poolPrice?.buys5m),
            sellVolume5m: parseNum(poolPrice?.sellVolume5m),
            buyVolume5m: parseNum(poolPrice?.buyVolume5m),
            volume1h: parseNum(poolPrice?.volume1h),
            sells1h: parseNum(poolPrice?.sells1h),
            buys1h: parseNum(poolPrice?.buys1h),
            volume6h: parseNum(poolPrice?.volume6h),
            volume24h: parseNum(poolPrice?.volume24h),
            sells24h: parseNum(poolPrice?.sells24h),
            buys24h: parseNum(poolPrice?.buys24h),
          } : undefined,
          
          // Audit data
          audit: audit ? {
            isOpenSource: audit?.isOpenSource,
            isHoneypot: audit?.isHoneypot,
            isMintable: audit?.isMintable,
            isProxy: audit?.isProxy,
            slippageModifiable: audit?.slippageModifiable,
            isBlacklisted: audit?.isBlacklisted,
            sellTax: audit?.sellTax,
            buyTax: audit?.buyTax,
            isContractRenounced: audit?.isContractRenounced,
            isPotentiallyScam: audit?.isPotentiallyScam,
          } : undefined,
          
          // Social info
          socials: meta?.socialInfo || {},
          
          // Keep raw for debugging
          raw: tokenResponse,
        };

        if (!mounted) return;
        setCache(key, enhancedData, { ttlMs: 3 * 60 * 1000 }); // 3 min cache
        setData(enhancedData);
        
      } catch (e: any) {
        if (mounted) {
          const cached = getCacheStaleOk<EnhancedTokenData>(key);
          if (cached) {
            setData(cached);
            setError(null);
          } else {
            setError(e?.message || 'Kunde inte hämta token-data');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTokenData();
    return () => { mounted = false; };
  }, [address]);

  return { data, loading, error };
}
