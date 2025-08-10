import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DbLimitOrder, JupOrder } from '@/hooks/useOpenOrders';
import { useMemo } from 'react';

export function OpenOrdersList({
  symbol,
  dbOrders,
  jupOrders,
  currentUser,
  onCancelDb,
  onCancelJup,
}: {
  symbol: string;
  dbOrders: DbLimitOrder[];
  jupOrders: JupOrder[];
  currentUser?: { sol?: string; evm?: string };
  onCancelDb: (id: string, user: string) => void | Promise<any>;
  onCancelJup: (order: string, maker: string) => void | Promise<any>;
}) {
  const rows = useMemo(() => {
    const db = (dbOrders || []).map((o) => ({
      key: `db:${o.id}`,
      source: 'DB',
      side: o.side,
      price: Number(o.limit_price),
      amount: Number(o.amount),
      status: o.status,
      time: o.created_at,
      cancelable: o.status === 'open',
      data: o,
    }));
    const jup = (jupOrders || []).map((o) => {
      const rawPrice = Number((o as any).priceUsd);
      const price = Number.isFinite(rawPrice) ? rawPrice : (undefined as any);
      const rawAmount = Number((o as any).amountDisplay);
      const amount = Number.isFinite(rawAmount) ? rawAmount : (undefined as any);
      return {
        key: `jup:${o.order}`,
        source: 'JUP',
        side: (o as any).side as any,
        price,
        amount,
        status: o.status,
        time: o.createdAt || '',
        cancelable: ['active', 'open'].includes(String(o.status || '').toLowerCase()),
        data: o,
      };
    });
    return [...db, ...jup];
  }, [dbOrders, jupOrders]);

  return (
    <Card className="h-full p-0 bg-card/60 backdrop-blur-sm border-border/30 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Källa</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Pris</TableHead>
            <TableHead>Belopp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tid</TableHead>
            <TableHead className="text-right">Åtgärd</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-8">
                Inga öppna ordrar
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.key}>
                <TableCell><Badge variant="outline">{r.source}</Badge></TableCell>
                <TableCell>
                  {r.side ? (
                    <Badge className={r.side === 'buy' ? 'bg-success text-white' : 'bg-destructive text-white'}>
                      {r.side.toUpperCase()}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>{typeof r.price === 'number' ? `$${r.price}` : '-'}</TableCell>
                <TableCell>{typeof r.amount === 'number' ? r.amount : '-'}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'open' || r.status === 'active' ? 'secondary' : 'outline'}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.time ? new Date(r.time).toLocaleString() : '-'}</TableCell>
                <TableCell className="text-right">
                  {r.cancelable ? (
                    r.source === 'DB' ? (
                      <Button size="sm" variant="outline" onClick={() => onCancelDb((r.data as DbLimitOrder).id, (r.data as DbLimitOrder).user_address)}>Avbryt</Button>
                    ) : currentUser?.sol ? (
                      <Button size="sm" variant="outline" onClick={() => onCancelJup((r.data as JupOrder).order, currentUser.sol!)}>Avbryt</Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Kräver Solana‑wallet</span>
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export default OpenOrdersList;
