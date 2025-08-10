import { useEffect, useMemo, useState } from 'react';
import { SOL_TOKENS } from '@/lib/tokenMaps';

export type SolanaTokenInfo = { mint: string; decimals: number } | null;

function cacheKey(symbol: string, cgid?: string) {
  const id = (cgid || 'none').toLowerCase();
  return `solana_token_info_${symbol.toUpperCase()}_${id}`;
}

async function fetchFromJupiter(symbol: string, coinGeckoId?: string): Promise<SolanaTokenInfo> {
  try {
    // För att undvika falska positiver kräver vi CoinGecko‑ID‑match
    if (!coinGeckoId) return null;
    const res = await fetch('https://token.jup.ag/all', { cache: 'force-cache' });
    if (!res.ok) return null;
    const list = (await res.json()) as any[];
    const match = list.find((t) => (t?.extensions?.coingeckoId || '').toLowerCase() === coinGeckoId.toLowerCase());
    if (!match) return null;
    const mint = match?.address || match?.mint || match?.id;
    const decimals = Number(match?.decimals ?? 9);
    if (!mint) return null;
    return { mint, decimals: Number.isFinite(decimals) ? decimals : 9 };
  } catch {
    return null;
  }
}

export function useSolanaTokenInfo(symbol?: string, coinGeckoId?: string) {
  const symUpper = (symbol || '').toUpperCase();
  const [info, setInfo] = useState<SolanaTokenInfo>(null);
  const [loading, setLoading] = useState(false);

  const local = useMemo(() => {
    if (!symUpper) return null;
    const builtIn = SOL_TOKENS[symUpper];
    if (builtIn) return builtIn;
    try {
      const cached = sessionStorage.getItem(cacheKey(symUpper, coinGeckoId));
      if (cached) return JSON.parse(cached) as SolanaTokenInfo;
    } catch {}
    return null;
  }, [symUpper, coinGeckoId]);

  useEffect(() => {
    let active = true;
    if (!symUpper) return;
    (async () => {
      if (local) { setInfo(local); return; }
      setLoading(true);
      const fetched = await fetchFromJupiter(symUpper, coinGeckoId);
      if (!active) return;
      if (fetched) {
        setInfo(fetched);
        try { sessionStorage.setItem(cacheKey(symUpper, coinGeckoId), JSON.stringify(fetched)); } catch {}
      } else {
        setInfo(null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [symUpper, coinGeckoId, local]);

  return { info, isSolToken: Boolean(info && symUpper !== 'SOL'), loading } as const;
}
