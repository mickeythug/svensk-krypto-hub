import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUsd } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { usePositionsFromHistory } from '@/hooks/usePositionsFromHistory';
import { useCryptoData } from '@/hooks/useCryptoData';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PositionsPanel() {
  const { address: evm } = useAccount();
  const { publicKey } = useWallet();
  const sol = publicKey?.toBase58();
  const { rows } = useOrderHistory({ addresses: [sol, evm] });
  const { cryptoPrices } = useCryptoData();
  const navigate = useNavigate();

  const priceMap = useMemo(() => {
    const m: Record<string, number> = {};
    (cryptoPrices || []).forEach((c: any) => { m[(c.symbol || '').toUpperCase()] = Number(c.price || 0); });
    return m;
  }, [cryptoPrices]);

  const positions = usePositionsFromHistory(rows, priceMap).filter(p => p.amount > 0.0000001);

  const summary = useMemo(() => {
    let val = 0;
    let pnl = 0;
    for (const p of positions) {
      const m = priceMap[p.symbol] || 0;
      const unrealized = (m - p.avgEntry) * p.amount;
      pnl += p.realizedPnl + unrealized;
      val += p.amount * m;
    }
    return { val, pnl };
  }, [positions, priceMap]);

  return (
    <Card className="h-full p-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-border/40 flex flex-col">
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-base font-semibold text-foreground">Positioner</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-foreground">{formatUsd(summary.val)}</span>
          <span className={`font-semibold ${summary.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {summary.pnl >= 0 ? '+' : ''}{formatUsd(summary.pnl)}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Token</TableHead>
              <TableHead className="text-xs">QTY</TableHead>
              <TableHead className="text-xs">Entry Price</TableHead>
              <TableHead className="text-xs">Market Price</TableHead>
              <TableHead className="text-xs">Value</TableHead>
              <TableHead className="text-xs">PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                  Inga positioner
                </TableCell>
              </TableRow>
            ) : positions.map((p) => {
              const market = priceMap[p.symbol] || 0;
              const unrealized = (market - p.avgEntry) * p.amount;
              const totalPnl = p.realizedPnl + unrealized;
              const pct = p.avgEntry > 0 ? ((market - p.avgEntry) / p.avgEntry) * 100 : 0;
              const value = p.amount * market;
              return (
                <TableRow key={p.symbol} className="border-border/10 hover:bg-muted/20 cursor-pointer" onClick={() => navigate(`/crypto/${p.symbol.toLowerCase()}`)}>
                  <TableCell className="text-xs font-medium">{p.symbol}</TableCell>
                  <TableCell className="text-xs">{p.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {p.symbol}</TableCell>
                  <TableCell className="text-xs">{p.avgEntry ? formatUsd(p.avgEntry) : '-'}</TableCell>
                  <TableCell className="text-xs">{market ? formatUsd(market) : '-'}</TableCell>
                  <TableCell className="text-xs">{formatUsd(value)}</TableCell>
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
