import { useMemo } from 'react';
import type { OrderHistoryRow } from './useOrderHistory';

export type Position = {
  symbol: string;
  amount: number;        // base amount currently held
  avgEntry: number;      // average entry price in quote
  value: number;         // current value using current price passed from caller
  realizedPnl: number;   // sum from sells
};

export function usePositionsFromHistory(rows: OrderHistoryRow[], prices: Record<string, number>) {
  const positions = useMemo(() => {
    const map = new Map<string, Position & { cost: number }>();
    for (const r of rows) {
      const sym = (r.symbol || '').toUpperCase();
      if (!sym) continue;
      // derive base amount robustly (fallback from quote/price if needed)
      let baseRaw = Number(r.base_amount ?? 0);
      const px = Number((r as any).price_usd ?? r.price_quote ?? 0);
      if (!Number.isFinite(baseRaw) || baseRaw === 0) {
        const qa = Number(r.quote_amount ?? 0);
        if (Number.isFinite(qa) && qa !== 0 && Number.isFinite(px) && px > 0) {
          baseRaw = qa / px;
        }
      }
      const base = Math.abs(baseRaw);
      if (!['market_trade', 'limit_execute'].includes(String(r.event_type))) continue;
      const key = sym;
      if (!map.has(key)) map.set(key, { symbol: sym, amount: 0, avgEntry: 0, value: 0, realizedPnl: 0, cost: 0 });
      const p = map.get(key)!;
      if (r.side === 'buy') {
        // Increase position, update weighted average cost
        const newAmount = p.amount + base;
        const addCost = base * (px || 0);
        const newCost = p.cost + addCost;
        p.amount = newAmount;
        p.cost = newCost;
        p.avgEntry = newAmount > 0 ? newCost / newAmount : 0;
      } else if (r.side === 'sell') {
        // Realize PnL against current avgEntry
        const sellAmt = base;
        const sellProceeds = sellAmt * (px || 0);
        const costBasis = sellAmt * p.avgEntry;
        p.realizedPnl += (sellProceeds - costBasis);
        p.amount = Math.max(0, p.amount - sellAmt);
        p.cost = Math.max(0, p.amount * p.avgEntry);
      }
    }
    // Compute current value per price map
    const out: Position[] = [];
    for (const [, p] of map) {
      const price = prices[p.symbol] || 0;
      const amt = Math.abs(p.amount) < 1e-8 ? 0 : p.amount;
      out.push({ symbol: p.symbol, amount: amt, avgEntry: p.avgEntry, value: amt * price, realizedPnl: p.realizedPnl });
    }
    return out.sort((a, b) => b.value - a.value);
  }, [rows, prices]);

  return positions;
}
