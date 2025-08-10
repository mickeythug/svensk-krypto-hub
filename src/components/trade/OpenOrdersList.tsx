import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DbLimitOrder, JupOrder } from '@/hooks/useOpenOrders';
import { useMemo } from 'react';
import { formatUsd } from '@/lib/utils';
import { SOL_MINT } from '@/lib/tokenMaps';
import { useNavigate } from 'react-router-dom';

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

  const baseSymbol = useMemo(() => (symbol || '').toUpperCase(), [symbol]);
  const navigate = useNavigate();

  return (
    <Card className="h-full p-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-border/40 flex flex-col">
      <div className="p-3 border-b border-border/30 flex-shrink-0">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Öppna Ordrar
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-modern">
        <Table>
          <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
            <TableRow className="border-border/30 hover:bg-muted/30">
              <TableHead className="font-medium text-foreground text-xs py-2">Källa</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Typ</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Pris</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Belopp</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Status</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Åtgärd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded border-dashed" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Inga öppna ordrar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.key} className="border-border/20 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/crypto/${baseSymbol.toLowerCase()}`)}>

                  <TableCell className="py-2">
                  <Badge 
                    variant="outline" 
                    className={`font-medium ${
                      r.source === 'JUP' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary/10 text-secondary-foreground border-secondary/30'
                    }`}
                  >
                    {r.source}
                  </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    {r.side ? (
                      <Badge 
                        className={`font-medium shadow-sm text-xs ${
                          r.side === 'buy' 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {r.side === 'buy' ? 'KÖP' : 'SÄLJ'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">
                      {typeof r.price === 'number' ? formatUsd(r.price) : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {typeof r.amount === 'number' ? `${r.amount.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${baseSymbol}` : '-'}
                      </div>
                      {r.source === 'JUP' && (r.data as any)?.makingAmount ? (
                        <div className="">
                          <span className="text-sm font-semibold text-foreground">
                            Betalar {(r.data as any).makingAmount} {((r.data as any).inputMint === SOL_MINT ? 'SOL' : 'USDC')}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                  <Badge 
                    variant={r.status === 'open' || r.status === 'active' ? 'default' : 'secondary'}
                    className={`font-medium ${
                      r.status === 'open' || r.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' 
                        : ''
                    }`}
                  >
                    {r.status === 'open' ? 'AKTIV' : r.status === 'active' ? 'AKTIV' : r.status.toUpperCase()}
                  </Badge>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    {r.cancelable ? (
                      r.source === 'DB' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                          onClick={() => onCancelDb((r.data as DbLimitOrder).id, (r.data as DbLimitOrder).user_address)}
                        >
                          Avbryt
                        </Button>
                      ) : currentUser?.sol ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                          onClick={() => onCancelJup((r.data as JupOrder).order, currentUser.sol!)}
                        >
                          Avbryt
                        </Button>
                      ) : (
                        <div className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                          Solana wallet
                        </div>
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
      </div>
    </Card>
  );
}

export default OpenOrdersList;
