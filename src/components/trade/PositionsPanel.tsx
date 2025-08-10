import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUsd } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { usePositionsFromHistory } from '@/hooks/usePositionsFromHistory';
import { useCryptoData } from '@/hooks/useCryptoData';
import { useMemo } from 'react';

export default function PositionsPanel() {
  const { address: evm } = useAccount();
  const { publicKey } = useWallet();
  const sol = publicKey?.toBase58();
  const { rows } = useOrderHistory({ addresses: [sol, evm] });
  const { cryptoPrices } = useCryptoData();

  const priceMap = useMemo(() => {
    const m: Record<string, number> = {};
    (cryptoPrices || []).forEach((c: any) => { m[(c.symbol || '').toUpperCase()] = Number(c.price || 0); });
    return m;
  }, [cryptoPrices]);

  const positions = usePositionsFromHistory(rows, priceMap).filter(p => p.amount > 0.0000001).slice(0, 5);

  return (
    <Card className="h-full p-0 bg-card/60 backdrop-blur-sm border-border/30 flex flex-col">
      <div className="px-3 py-2 border-b border-border/30 flex-shrink-0">
        <h3 className="text-sm font-semibold">Positioner</h3>
      </div>
      <div className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Token</TableHead>
              <TableHead className="text-xs">Belopp</TableHead>
              <TableHead className="text-xs">Entry</TableHead>
              <TableHead className="text-xs">Marknad</TableHead>
              <TableHead className="text-xs">PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                  Inga positioner
                </TableCell>
              </TableRow>
            ) : positions.map((p) => {
              const market = priceMap[p.symbol] || 0;
              const unrealized = (market - p.avgEntry) * p.amount;
              const totalPnl = p.realizedPnl + unrealized;
              const pct = p.avgEntry > 0 ? ((market - p.avgEntry) / p.avgEntry) * 100 : 0;
              return (
                <TableRow key={p.symbol} className="border-border/10">
                  <TableCell className="text-xs font-medium">{p.symbol}</TableCell>
                  <TableCell className="text-xs">{p.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
                  <TableCell className="text-xs">{p.avgEntry ? p.avgEntry.toFixed(6) : '-'}</TableCell>
                  <TableCell className="text-xs">{market ? market.toFixed(6) : '-'}</TableCell>
                  <TableCell className={`text-xs font-semibold ${totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatUsd(totalPnl)} ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
