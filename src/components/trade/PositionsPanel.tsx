import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUsd } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { usePositionsFromHistory } from '@/hooks/usePositionsFromHistory';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function PositionsPanel() {
  const { address: evm } = useAccount();
  const { publicKey } = useWallet();
  const sol = publicKey?.toBase58();
  const { connection } = useConnection();
  const { rows } = useOrderHistory({ addresses: [sol, evm] });
  const navigate = useNavigate();

  // Return wallet connection prompt if no wallet connected
  if (!sol && !evm) {
    return (
      <Card className="h-full p-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-border/40 flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-base font-semibold text-foreground">Positioner</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded border-dashed" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Anslut din wallet för att se positioner</p>
          </div>
        </div>
      </Card>
    );
  }

  const [cryptoPrices, setCryptoPrices] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await supabase.from('latest_token_prices').select('symbol, price').limit(1000);
        if (mounted) setCryptoPrices(data || []);
      } catch {}
    };
    load();
    const handler = () => load();
    window.addEventListener('wallet:refresh', handler as any);
    window.addEventListener('orders:changed', handler as any);
    return () => {
      mounted = false;
      window.removeEventListener('wallet:refresh', handler as any);
      window.removeEventListener('orders:changed', handler as any);
    };
  }, []);

  const priceMap = useMemo(() => {
    const m: Record<string, number> = {};
    (cryptoPrices || []).forEach((c: any) => { m[(c.symbol || '').toUpperCase()] = Number(c.price || 0); });
    return m;
  }, [cryptoPrices]);

  const historyPositions = usePositionsFromHistory(Array.isArray(rows) ? rows : [], priceMap).filter(p => p.amount > 0.0000001);

  const [tokenList, setTokenList] = useState<Record<string, { mint: string; decimals: number }>>({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('https://token.jup.ag/strict', { headers: { Accept: 'application/json' } });
        const arr = await res.json();
        const map: Record<string, { mint: string; decimals: number }> = {};
        (arr || []).forEach((t: any) => {
          const sym = String(t?.symbol || '').toUpperCase();
          if (sym && t?.address) map[sym] = { mint: t.address, decimals: Number(t?.decimals || 0) };
        });
        if (mounted) setTokenList(map);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const [onChain, setOnChain] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!sol || !historyPositions.length) { setOnChain({}); return; }
    (async () => {
      try {
        const owner = new (await import('@solana/web3.js')).PublicKey(sol);
        const next: Record<string, number> = {};
        for (const p of historyPositions) {
          const info = tokenList[p.symbol];
          if (!info) continue;
          try {
            const mint = new (await import('@solana/web3.js')).PublicKey(info.mint);
            const accs = await connection.getParsedTokenAccountsByOwner(owner, { mint });
            let sum = 0;
            for (const a of accs.value) {
              const ui = (a.account.data as any)?.parsed?.info?.tokenAmount?.uiAmount;
              if (Number.isFinite(ui)) sum += Number(ui);
            }
            next[p.symbol] = sum;
          } catch {}
        }
        setOnChain(next);
      } catch {}
    })();
  }, [sol, connection, historyPositions.map(p => p.symbol).join('|'), tokenList]);

  const positions = useMemo(() => historyPositions.filter(p => !(onChain[p.symbol] !== undefined && onChain[p.symbol] <= 1e-8)), [historyPositions, onChain]);

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
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-modern">
        <Table>
          <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
            <TableRow className="border-border/30 hover:bg-muted/30">
              <TableHead className="font-medium text-foreground text-xs py-2">Token</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">QTY</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Entry Price</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Market Price</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Value</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded border-dashed" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Inga positioner</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : positions.map((p) => {
              const market = priceMap[p.symbol] || 0;
              const unrealized = (market - p.avgEntry) * p.amount;
              const totalPnl = p.realizedPnl + unrealized;
              const pct = p.avgEntry > 0 ? ((market - p.avgEntry) / p.avgEntry) * 100 : 0;
              const value = p.amount * market;
              const pctDigits = Math.abs(pct) < 0.01 ? 4 : Math.abs(pct) < 0.0001 ? 6 : 2;
              const pctDisplay = Math.abs(pct) < 0.005 ? '0%' : `${pct >= 0 ? '+' : ''}${pct.toFixed(pctDigits)}%`;
              return (
                <TableRow key={p.symbol} className="border-border/20 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/crypto/${p.symbol.toLowerCase()}`)}>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">{p.symbol}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">{p.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {p.symbol}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">{p.avgEntry ? formatUsd(p.avgEntry) : '-'}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">{market ? formatUsd(market) : '-'}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm font-medium text-foreground">{value < 0.01 && value > 0 ? '<$0.01' : formatUsd(value)}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className={`text-sm font-semibold ${totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}> 
                      {totalPnl < 0.01 && totalPnl > 0 ? '<$0.01' : formatUsd(totalPnl)} ({pctDisplay})
                    </div>
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