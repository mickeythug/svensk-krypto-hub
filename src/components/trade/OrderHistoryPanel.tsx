import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatUsd } from '@/lib/utils';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { useTradeHistory } from '@/hooks/useTradeHistory';

export default function OrderHistoryPanel({ symbol }: { symbol?: string }) {
  const { address: evm } = useAccount();
  const { publicKey } = useWallet();
  const sol = publicKey?.toBase58();
  const symUpper = (symbol || '').toUpperCase();
  const { rows, loading } = useOrderHistory({ addresses: [sol, evm], symbol });
  const { history: localHistory } = useTradeHistory([sol || '', evm || '']);

  // Return wallet connection prompt if no wallet connected
  if (!sol && !evm) {
    return (
    <Card className="p-0 bg-card border border-border flex flex-col">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-base font-semibold text-foreground">Orderhistorik</h3>
        <span className="text-sm text-muted-foreground ml-2">Senaste transaktioner</span>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded border-dashed" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Anslut din wallet för att se orderhistorik</p>
        </div>
      </div>
    </Card>
    );
  }

  const items = useMemo(() => {
    const mappedLocal = (localHistory || [])
      .filter((t) => !symUpper || (t.symbol || '').toUpperCase() === symUpper)
      .map((t) => ({
        id: `local-${t.id}`,
        created_at: new Date(t.ts).toISOString(),
        user_address: t.address || '',
        chain: t.chain,
        symbol: t.symbol,
        side: t.side,
        event_type: 'local_trade',
        source: 'LOCAL',
        base_amount: t.amount,
        price_usd: t.amountUsd ?? undefined,
        price_quote: undefined,
        fee_quote: undefined,
        tx_hash: t.txHash,
        meta: undefined,
      }));
    const merged = [...rows, ...mappedLocal];
    return merged
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }, [rows, localHistory, symUpper]);

  return (
    <Card className="p-0 bg-card border border-border flex flex-col">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-base font-semibold text-foreground">Orderhistorik</h3>
        <span className="text-sm text-muted-foreground ml-2">Senaste transaktioner</span>
      </div>
      <div className={`overflow-y-auto scrollbar-modern ${items.length > 0 ? 'max-h-[40vh]' : ''}`}>
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow className="border-border/30 hover:bg-muted/30">
              <TableHead className="font-medium text-foreground text-xs py-2">Tid</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Typ</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Side</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Pris</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Belopp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-muted-foreground/30 rounded border-dashed" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{loading ? 'Laddar…' : 'Ingen historik'}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.map((r) => (
              <TableRow key={r.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-muted-foreground">{new Date(r.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="font-medium">{r.event_type.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell className="py-2">
                  {r.side ? (
                    <Badge className={`font-medium shadow-sm text-xs ${r.side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                      {r.side === 'buy' ? 'KÖP' : 'SÄLJ'}
                    </Badge>
                  ) : <span className="text-sm text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-foreground">{typeof r.price_usd === 'number' && r.price_usd > 0 ? formatUsd(r.price_usd) : (typeof r.price_quote === 'number' ? r.price_quote.toFixed(6) : '-')}</div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-foreground">{typeof r.base_amount === 'number' ? `${r.base_amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${r.symbol || ''}` : '-'}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
