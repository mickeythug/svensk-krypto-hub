import { useEffect, useMemo, useState } from 'react';
import { usePumpPortalWS } from '@/hooks/usePumpPortalWS';

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
  const { subscribe, onMessage } = usePumpPortalWS();
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to new token events (real-time)
    subscribe('subscribeNewToken');
    const off = onMessage((msg) => {
      try {
        const payload = msg || {};
        // Heuristic: accept messages that look like new token announcements
        const mint: string | undefined = payload.mint || payload.tokenMint || payload.ca || payload.contractAddress;
        const name: string | undefined = payload.name || payload.tokenName || payload.ticker;
        if (!mint || !name) return;
        const symbol: string = (payload.symbol || name || 'TOKEN').toString().slice(0, 12).toUpperCase();
        setTokens((prev) => {
          if (prev.some((t) => t.id === mint)) return prev;
          const next: MemeToken = {
            id: mint,
            symbol,
            name: name.toString(),
            image: payload.image || '/placeholder.svg',
            price: 0,
            change24h: 0,
            volume24h: 0,
            marketCap: 0,
            holders: 0,
            views: '—',
            emoji: undefined,
            tags: ['new'],
            isHot: true,
            description: payload.description || undefined,
          };
          const arr = [next, ...prev];
          return limit ? arr.slice(0, limit) : arr;
        });
      } catch {}
    });

    // Initial done state; real-time will append
    const timer = setTimeout(() => setLoading(false), 500);
    return () => { off(); clearTimeout(timer); };
  }, [subscribe, onMessage, limit]);

  // Basic sorting depending on category (no mock). We keep newest first.
  const sorted = useMemo(() => {
    return tokens;
  }, [tokens]);

  return { tokens: sorted, loading, error };
};
