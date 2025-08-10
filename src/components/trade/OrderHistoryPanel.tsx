import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatUsd } from '@/lib/utils';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export default function OrderHistoryPanel({ symbol }: { symbol?: string }) {
  const { address: evm } = useAccount();
  const { publicKey } = useWallet();
  const sol = publicKey?.toBase58();
  const { rows, loading } = useOrderHistory({ addresses: [sol, evm], symbol });

  const items = useMemo(() => rows.slice(0, 6), [rows]);

  return (
    <Card className="h-full p-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-border/40 flex flex-col">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-base font-semibold text-foreground">Orderhistorik</h3>
        <span className="text-sm text-muted-foreground ml-2">Senaste transaktioner</span>
      </div>
      <div className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Tid</TableHead>
              <TableHead className="text-xs">Typ</TableHead>
              <TableHead className="text-xs">Side</TableHead>
              <TableHead className="text-xs">Pris</TableHead>
              <TableHead className="text-xs">Belopp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                  {loading ? 'Laddar…' : 'Ingen historik'}
                </TableCell>
              </TableRow>
            ) : items.map((r) => (
              <TableRow key={r.id} className="border-border/10">
                <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-[10px]">{r.event_type.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  {r.side ? (
                    <Badge className={`text-[10px] ${r.side === 'buy' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{r.side.toUpperCase()}</Badge>
                  ) : <span className="text-[10px] text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="text-xs">{typeof r.price_usd === 'number' && r.price_usd > 0 ? formatUsd(r.price_usd) : (typeof r.price_quote === 'number' ? r.price_quote.toFixed(6) : '-')}</TableCell>
                <TableCell className="text-xs">{typeof r.base_amount === 'number' ? `${r.base_amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${r.symbol || ''}` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
