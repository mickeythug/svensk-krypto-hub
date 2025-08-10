export type TradeEntry = {
  id: string;
  ts: number; // epoch ms
  chain: 'SOL' | 'EVM';
  symbol: string; // e.g. BONK, BTC
  side: 'buy' | 'sell';
  amount: number; // base amount input
  amountUsd?: number; // approximate USD value at time
  txHash: string; // signature / tx hash
  address?: string; // wallet address used
};

const STORAGE_PREFIX = 'trade_history_v1_';

function keyFor(addressKey: string) {
  return `${STORAGE_PREFIX}${addressKey || 'anon'}`;
}

export function readTrades(addressKey: string): TradeEntry[] {
  try {
    const raw = localStorage.getItem(keyFor(addressKey));
    if (!raw) return [];
    const arr = JSON.parse(raw) as TradeEntry[];
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

export function writeTrades(addressKey: string, items: TradeEntry[]) {
  try {
    localStorage.setItem(keyFor(addressKey), JSON.stringify(items.slice(0, 200)));
  } catch {}
}

export function recordTrade(addressKey: string, entry: Omit<TradeEntry, 'id' | 'ts'>) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ts = Date.now();
  const next: TradeEntry = { id, ts, ...entry };
  const current = readTrades(addressKey);
  const updated = [next, ...current];
  writeTrades(addressKey, updated);
  try {
    window.dispatchEvent(new CustomEvent('trade-history-updated', { detail: { addressKey } }));
  } catch {}
  return next;
}
