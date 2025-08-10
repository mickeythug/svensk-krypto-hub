import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatUsd } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useCryptoData } from '@/hooks/useCryptoData';
import { toast } from '@/hooks/use-toast';
import { usePositionsFromHistory } from '@/hooks/usePositionsFromHistory';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SOL_MINT } from '@/lib/tokenMaps';

export default function PositionsPanel() {
  const { address: evm } = useAccount();
  const { publicKey, sendTransaction } = useWallet() as any;
  const sol = publicKey?.toBase58();
  const { connection } = useConnection();
  const { rows } = useOrderHistory({ addresses: [sol, evm] });
  const navigate = useNavigate();

  const noWallet = !sol && !evm;

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

  const solMintMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    (rows || []).forEach((r) => {
      const chain = String(r.chain || '').toUpperCase();
      const sym = String(r.symbol || '').toUpperCase();
      const mint = typeof r.base_mint === 'string' ? r.base_mint : undefined;
      if (chain === 'SOL' && sym && mint) {
        if (!map[sym]) map[sym] = new Set<string>();
        map[sym].add(mint);
      }
    });
    return map;
  }, [rows]);

  const [extraMints, setExtraMints] = useState<Record<string, Set<string>>>({});
  const combinedMintMap = useMemo(() => {
    const combined: Record<string, Set<string>> = {};
    for (const [sym, set] of Object.entries(solMintMap)) combined[sym] = new Set(set);
    for (const [sym, set] of Object.entries(extraMints)) {
      if (!combined[sym]) combined[sym] = new Set();
      set.forEach((m) => combined[sym].add(m));
    }
    return combined;
  }, [solMintMap, extraMints]);

  const solSymbols = useMemo(() => new Set(Object.keys(combinedMintMap)), [combinedMintMap]);
  const [onChain, setOnChain] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!sol || !historyPositions.length) { setOnChain({}); return; }
    let cancelled = false;
    async function run() {
      try {
        const { PublicKey } = await import('@solana/web3.js');
        const owner = new PublicKey(sol);
        const next: Record<string, number> = {};
        for (const p of historyPositions) {
          const mints = combinedMintMap[p.symbol];
          if (!mints || mints.size === 0) continue;
          let sum = 0;
          for (const mintStr of Array.from(mints)) {
            try {
              const mint = new PublicKey(mintStr);
              const accs = await connection.getParsedTokenAccountsByOwner(owner, { mint });
              for (const a of accs.value) {
                const ui = (a.account.data as any)?.parsed?.info?.tokenAmount?.uiAmount;
                if (Number.isFinite(ui)) sum += Number(ui);
              }
            } catch {}
          }
          next[p.symbol] = sum;
        }
        if (!cancelled) setOnChain(next);
      } catch {}
    }
    run();
    const id = setInterval(run, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [sol, connection, historyPositions.map(p => p.symbol).join('|'), (rows || []).map(r => `${r.symbol}:${r.base_mint}`).join('|'), Object.keys(combinedMintMap).length]);

  const positions = useMemo(() => historyPositions.filter(p => {
    const isSol = solSymbols.has(p.symbol);
    const bal = onChain[p.symbol] ?? 0;
    return isSol ? bal > 1e-8 : true;
  }), [historyPositions, onChain, solSymbols]);

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

  const [closing, setClosing] = useState<Record<string, boolean>>({});

  const { cryptoPrices: richPrices } = useCryptoData();
  const cgIdBySymbol = useMemo(() => {
    const m: Record<string, string> = {};
    (richPrices || []).forEach((r: any) => {
      const sym = (r.symbol || '').toUpperCase();
      const cgid = (r.coinGeckoId || r.coin_gecko_id || r.data?.id);
      if (sym && cgid) m[sym] = String(cgid);
    });
    return m;
  }, [richPrices]);

  async function handleClosePosition(symbol: string, amountHint: number) {
    try {
      if (!sol) {
        toast({ variant: 'destructive', title: 'Solana‑wallet saknas', description: 'Anslut din Solana‑wallet för att stänga positioner.' });
        return;
      }
      setClosing((s) => ({ ...s, [symbol]: true }));
      const symbolUpper = symbol.toUpperCase();
      let mintStr: string | undefined = (() => {
        const set = solMintMap[symbolUpper];
        return set && set.size > 0 ? Array.from(set)[0] : undefined;
      })();
      let decimals = 9;

      if (!mintStr) {
        try {
          const cgid = cgIdBySymbol[symbolUpper];
          if (cgid) {
            const res = await fetch('https://token.jup.ag/all', { cache: 'no-cache' });
            if (res.ok) {
              const list = await res.json();
              const match = list.find((t: any) => (t?.extensions?.coingeckoId || '').toLowerCase() === String(cgid).toLowerCase());
              if (match?.address) {
                mintStr = match.address as string;
                decimals = Number(match?.decimals ?? 9);
              }
            }
          }
        } catch {}
      }

      if (!mintStr) throw new Error('Kunde inte hitta mint‑adress för token');

      const { VersionedTransaction, PublicKey } = await import('@solana/web3.js');

      // Ensure we track this mint for on-chain balance filtering
      setExtraMints((prev) => {
        const s = new Set(prev[symbolUpper] ?? []);
        s.add(mintStr!);
        return { ...prev, [symbolUpper]: s };
      });

      const onChainAmt = onChain[symbol] ?? 0;
      const closeAmt = Math.max(0, Math.min(amountHint || 0, onChainAmt > 0 ? onChainAmt : amountHint || 0));
      const amountBase = Math.floor(closeAmt * Math.pow(10, Number.isFinite(decimals) ? decimals : 9));
      if (!Number.isFinite(amountBase) || amountBase <= 0) throw new Error('Ogiltigt belopp');
      if (amountBase < 1000) throw new Error('Beloppet är för litet för Jupiter');

      const { data, error } = await supabase.functions.invoke('jupiter-swap', {
        body: { userPublicKey: sol, inputMint: mintStr, outputMint: SOL_MINT, amount: String(amountBase), slippageBps: 75 },
      });
      if (error) throw error as any;
      const swapTxB64 = (data as any)?.swapTransaction as string;
      if (!swapTxB64) throw new Error('Saknar swapTransaction');
      const txBytes = Uint8Array.from(atob(swapTxB64), (c) => c.charCodeAt(0));
      const vtx = VersionedTransaction.deserialize(txBytes);
      const sig = await (sendTransaction as any)(vtx, connection);

      // Wait for confirmation and refresh balances immediately
      try {
        const latest = await connection.getLatestBlockhash();
        await connection.confirmTransaction({ signature: sig, ...latest }, 'confirmed');
      } catch {}
      try {
        const owner = new PublicKey(sol);
        let sum = 0;
        const mints = combinedMintMap[symbolUpper] || new Set([mintStr!]);
        for (const m of Array.from(mints)) {
          try {
            const mintPk = new PublicKey(m);
            const accs = await connection.getParsedTokenAccountsByOwner(owner, { mint: mintPk });
            for (const a of accs.value) {
              const ui = (a.account.data as any)?.parsed?.info?.tokenAmount?.uiAmount;
              if (Number.isFinite(ui)) sum += Number(ui);
            }
          } catch {}
        }
        setOnChain((s) => ({ ...s, [symbolUpper]: sum }));
      } catch {}

      toast({ title: 'Position stängd', description: `Transaktion skickad: ${sig.slice(0, 8)}...` });
      try {
        window.dispatchEvent(new Event('wallet:refresh'));
        window.dispatchEvent(new Event('orders:changed'));
      } catch {}
    } catch (e: any) {
      const msg = e?.message || (e?.error) || 'Okänt fel';
      toast({ variant: 'destructive', title: 'Kunde inte stänga position', description: String(msg) });
    } finally {
      setClosing((s) => ({ ...s, [symbol]: false }));
    }
  }

  return (
    <Card className="p-0 bg-card border border-border flex flex-col">
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
      <div className={`overflow-y-auto scrollbar-modern ${positions.length > 0 ? 'max-h-[50vh]' : ''}`}>
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow className="border-border/30 hover:bg-muted/30">
              <TableHead className="font-medium text-foreground text-xs py-2">Token</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">QTY</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Entry Price</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Market Price</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Value</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">PnL</TableHead>
              <TableHead className="font-medium text-foreground text-xs py-2">Åtgärd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noWallet ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-muted-foreground/30 rounded border-dashed" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Anslut din wallet för att se positioner</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-muted-foreground/30 rounded border-dashed" />
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
                  <TableCell className="py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleClosePosition(p.symbol, p.amount); }}
                      disabled={!!closing[p.symbol] || !sol}
                      aria-label={`Stäng position ${p.symbol}`}
                    >
                      Stäng position
                    </Button>
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