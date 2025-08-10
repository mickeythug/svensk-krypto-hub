import { useEffect, useMemo, useState } from 'react';
import { SOL_TOKENS } from '@/lib/tokenMaps';

export type SolanaTokenInfo = { mint: string; decimals: number } | null;

function cacheKey(symbol: string) {
  return `solana_token_info_${symbol.toUpperCase()}`;
}

async function fetchFromJupiter(symbol: string, coinGeckoId?: string): Promise<SolanaTokenInfo> {
  try {
    const res = await fetch('https://token.jup.ag/all', { cache: 'force-cache' });
    if (!res.ok) return null;
    const list = (await res.json()) as any[];
    const sym = symbol.toUpperCase();
    const matches = list.filter((t) => (t?.symbol || '').toUpperCase() === sym);
    if (!matches.length) return null;
    // Prefer exact CoinGecko match if available
    let picked = matches[0];
    if (coinGeckoId) {
      const byCg = matches.find((t) => (t?.extensions?.coingeckoId || '').toLowerCase() === coinGeckoId.toLowerCase());
      if (byCg) picked = byCg;
    }
    const mint = picked?.address || picked?.mint || picked?.id;
    const decimals = Number(picked?.decimals ?? 9);
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
      const cached = sessionStorage.getItem(cacheKey(symUpper));
      if (cached) return JSON.parse(cached) as SolanaTokenInfo;
    } catch {}
    return null;
  }, [symUpper]);

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
        try { sessionStorage.setItem(cacheKey(symUpper), JSON.stringify(fetched)); } catch {}
      } else {
        setInfo(null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [symUpper, coinGeckoId, local]);

  return { info, isSolToken: Boolean(info && symUpper !== 'SOL'), loading } as const;
}
