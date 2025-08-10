import { useEffect, useMemo, useState } from 'react';
import { readTrades, type TradeEntry } from '@/lib/tradeHistory';

export function useTradeHistory(addressKeys: string[]) {
  const keys = addressKeys.filter(Boolean);
  const [history, setHistory] = useState<TradeEntry[]>([]);

  const load = () => {
    const all = keys.flatMap((k) => readTrades(k));
    // de-duplicate by id and sort desc
    const map = new Map<string, TradeEntry>();
    all.forEach((t) => map.set(t.id, t));
    const merged = Array.from(map.values()).sort((a, b) => b.ts - a.ts);
    setHistory(merged);
  };

  useEffect(() => {
    load();
    const onUpdate = (e: any) => {
      if (!e?.detail?.addressKey || keys.includes(e.detail.addressKey)) load();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key && keys.some((k) => e.key?.includes(k))) load();
    };
    window.addEventListener('trade-history-updated' as any, onUpdate as any);
    window.addEventListener('storage', onStorage);
    const id = setInterval(load, 10_000);
    return () => {
      window.removeEventListener('trade-history-updated' as any, onUpdate as any);
      window.removeEventListener('storage', onStorage);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join('|')]);

  return { history };
}
