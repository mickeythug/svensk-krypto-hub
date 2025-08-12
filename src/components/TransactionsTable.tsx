import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
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
  const [transactions, setTransactions] = useState<BirdeyeTxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    if (!tokenAddress) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('birdeye-proxy', {
        body: { action: 'transactions', address: tokenAddress, params: { offset: 0, limit: 50 } },
      });
      if (error) throw error;
      
      // Check if response is from cache or if API returned error
      if (data?.ok === false) {
        console.log('Birdeye transactions unavailable:', data?.status, data?.data?.message);
        return; // Keep previous data if API is unavailable
      }
      
      const items: BirdeyeTxItem[] = (data?.data?.items ?? data?.data ?? []).filter(Boolean);
      if (items.length > 0) {
        items.sort((a, b) => (b.blockUnixTime || 0) - (a.blockUnixTime || 0));
        setTransactions(items);
      }
    } catch (e) {
      // swallow
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      const id = setInterval(() => { if (!cancelled) load(); }, 10000);
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
    key: tx.txHash,
    date: tx.blockUnixTime ? new Date(tx.blockUnixTime * 1000).toLocaleString() : '-',
    type: (tx.side === 'buy' ? 'Buy' : tx.side === 'sell' ? 'Sell' : '—') as 'Buy' | 'Sell' | '—',
    usd: tx.volumeUSD ?? 0,
    tokenAmount: tx.uiAmount ?? tx.amount ?? 0,
    solAmount: tx.solAmount ?? 0,
    price: tx.price ?? 0,
    maker: tx.from?.owner || tx.from?.address || '-',
    txHash: tx.txHash,
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
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">SOL</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">PRICE</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">MAKER</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-semibold">TXN</th>
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
                    {Number(tx.solAmount || 0).toFixed(4)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {formatUsd(tx.price)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary-foreground"></div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {tx.maker ? `${tx.maker.slice(0, 6)}...` : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                      onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">{loading ? 'Loading transactions...' : 'No recent transactions'}</td>
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