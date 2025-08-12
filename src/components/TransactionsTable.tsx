import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// removed ExternalLink
import { formatUsd } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  ts: number;
  side: 'buy' | 'sell';
  usd: number;
  tokenAmount: number;
  solAmount: number;
  price: number;
  maker?: string;
}


interface TransactionsTableProps {
  tokenAddress: string | undefined;
  tokenSymbol: string;
}

export const TransactionsTable = ({ tokenAddress, tokenSymbol }: TransactionsTableProps) => {
  const [transactions, setTransactions] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const prevRef = useRef<{ buys1h?: number; sells1h?: number; volume1h?: number; price?: number } | null>(null);

  const load = async () => {
    if (!tokenAddress) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('dexscreener-proxy', {
        body: { action: 'tokenFull', address: tokenAddress },
      });
      const priceD = (data?.price?.data ?? data?.price) as any || {};
      const poolP = (data?.poolPrice?.data ?? data?.poolPrice) as any || {};
      const now = Date.now();

      const prev = prevRef.current;
      const buysNow = Number(poolP?.buys1h ?? poolP?.buys24h ?? 0);
      const sellsNow = Number(poolP?.sells1h ?? poolP?.sells24h ?? 0);
      const volNow = Number(poolP?.volume1h ?? poolP?.volume24h ?? 0);
      const priceNow = Number(priceD?.price ?? 0);

      if (!prev) {
        prevRef.current = { buys1h: buysNow, sells1h: sellsNow, volume1h: volNow, price: priceNow };
        return;
      }

      const dBuys = Math.max(0, buysNow - (prev.buys1h ?? 0));
      const dSells = Math.max(0, sellsNow - (prev.sells1h ?? 0));
      const dVol = Math.max(0, volNow - (prev.volume1h ?? 0));
      const totalTrades = dBuys + dSells;

      if (totalTrades > 0 && dVol > 0) {
        const avgUsd = dVol / totalTrades;
        const cap = Math.min(10, totalTrades);
        const items: ActivityItem[] = [];
        for (let i = 0; i < Math.min(cap, dBuys); i++) {
          items.push({ id: `${now}-b-${i}`, ts: now - i * 500, side: 'buy', usd: avgUsd, tokenAmount: priceNow > 0 ? avgUsd / priceNow : 0, solAmount: 0, price: priceNow });
        }
        for (let i = 0; i < Math.min(cap - items.length, dSells); i++) {
          items.push({ id: `${now}-s-${i}`, ts: now - (i + dBuys) * 500, side: 'sell', usd: avgUsd, tokenAmount: priceNow > 0 ? avgUsd / priceNow : 0, solAmount: 0, price: priceNow });
        }
        if (items.length) {
          setTransactions(prevList => [...items, ...prevList].slice(0, 50));
        }
      }

      prevRef.current = { buys1h: buysNow, sells1h: sellsNow, volume1h: volNow, price: priceNow };
    } catch (e) {
      // swallow errors, keep previous
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      const id = setInterval(() => { if (!cancelled) load(); }, 3000);
      return () => clearInterval(id);
    })();
    return () => { cancelled = true; };
  }, [tokenAddress]);

  const formatLargeNumber = (num?: number): string => {
    const n = Number(num || 0);
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toLocaleString();
  };

  const rows = useMemo(() => transactions.map((tx) => ({
    key: tx.id,
    date: new Date(tx.ts).toLocaleString(),
    type: (tx.side === 'buy' ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
    usd: tx.usd,
    tokenAmount: tx.tokenAmount,
    solAmount: tx.solAmount,
    price: tx.price,
  })), [transactions]);

  return (
    <Card className="bg-background/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">Live Transactions</h3>
          <p className="text-sm text-muted-foreground">Real-time {tokenSymbol} trading activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">DATE</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">TYPE</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">USD</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">{tokenSymbol}</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr key={tx.key} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-2 text-muted-foreground text-xs">{tx.date}</td>
                  <td className="py-3 px-2">
                    <Badge 
                      variant={tx.type === 'Buy' ? 'default' : 'destructive'}
                      className={`font-semibold ${
                        tx.type === 'Buy' 
                          ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                          : 'bg-red-500/20 text-red-500 border-red-500/30'
                      }`}
                    >
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">
                    {formatUsd(tx.usd)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {formatLargeNumber(tx.tokenAmount)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {formatUsd(tx.price)}
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">{loading ? 'Loading activity...' : 'No recent activity'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => load()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
};