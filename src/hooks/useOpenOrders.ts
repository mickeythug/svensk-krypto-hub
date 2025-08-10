import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SOL_MINT } from '@/lib/tokenMaps';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';

export type DbLimitOrder = {
  id: string;
  chain: 'SOL' | 'EVM';
  symbol: string;
  side: 'buy' | 'sell';
  limit_price: number;
  amount: number;
  user_address: string;
  status: 'open' | 'triggered' | 'canceled' | 'filled';
  created_at: string;
  updated_at: string;
  tx_hash?: string | null;
  sol_mint?: string | null;
  evm_from_token?: string | null;
  evm_to_token?: string | null;
};

export type JupOrder = {
  order: string; // Jupiter order id
  status: string; // active/canceled/filled
  inputMint?: string;
  outputMint?: string;
  makingAmount?: string; // base units
  takingAmount?: string; // base units
  createdAt?: string;
  side?: 'buy' | 'sell';
};

export function useOpenOrders(params: {
  symbol: string;
  solAddress?: string;
  evmAddress?: string;
  solMint?: string;
}) {
  const symbolUpper = (params.symbol || '').toUpperCase();
  const [dbOrders, setDbOrders] = useState<DbLimitOrder[]>([]);
  const [jupOrders, setJupOrders] = useState<JupOrder[]>([]);
  const [loading, setLoading] = useState({ db: false, jup: false });
  const { publicKey, signTransaction, sendTransaction } = useWallet() as any;
  const { connection } = useConnection();

  const addresses = useMemo(() => [params.solAddress, params.evmAddress].filter(Boolean) as string[], [params.solAddress, params.evmAddress]);

  const loadDb = async () => {
    try {
      setLoading((s) => ({ ...s, db: true }));
      const { data, error } = await supabase
        .from('limit_orders')
        .select('*')
        .in('user_address', addresses.length ? addresses : ['-'])
        .eq('symbol', symbolUpper)
        .in('status', ['open', 'triggered'])
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) setDbOrders(data as any);
    } finally {
      setLoading((s) => ({ ...s, db: false }));
    }
  };

  const loadJup = async () => {
    try {
      setLoading((s) => ({ ...s, jup: true }));
      if (!params.solAddress) { setJupOrders([]); return; }
      const aggregated: JupOrder[] = [];
      for (let page = 1; page <= 5; page++) {
        const { data, error } = await supabase.functions.invoke('jup-lo-open', { body: { user: params.solAddress, orderStatus: 'active', page } });
        if (error) break;
        const raw = (data as any)?.data?.data || (data as any)?.data?.orders || (data as any)?.data || [];
        const pageItems: JupOrder[] = Array.isArray(raw)
          ? raw.map((o: any) => {
              const inMint = o.inputMint || o.inMint || o.input;
              const outMint = o.outputMint || o.outMint || o.output;
              const statusRaw = String(o.status || 'active').toLowerCase();
              const status = statusRaw === 'open' ? 'active' : statusRaw;
              let side: 'buy' | 'sell' | undefined;
              if (params.solMint && inMint && outMint) {
                if (inMint === SOL_MINT && outMint === params.solMint) side = 'buy';
                else if (inMint === params.solMint && outMint === SOL_MINT) side = 'sell';
              }
              return {
                order: o.order || o.id || o.orderId || o.orderKey || '',
                status,
                inputMint: inMint,
                outputMint: outMint,
                makingAmount: o.makingAmount || o.inAmount || o.rawMakingAmount || undefined,
                takingAmount: o.takingAmount || o.outAmount || o.rawTakingAmount || undefined,
                createdAt: o.createdAt || o.time || undefined,
                side,
              } as JupOrder;
            })
          : [];
        if (pageItems.length === 0) break;
        aggregated.push(...pageItems);
        // Stop early if less than a typical page size (avoid endless loops)
        if (pageItems.length < 50) break;
      }
      setJupOrders(aggregated);
    } finally {
      setLoading((s) => ({ ...s, jup: false }));
    }
  };
  useEffect(() => {
    loadDb();
    // Realtime updates for DB orders on this symbol (+ safe polling fallback)
    const channel = supabase
      .channel(`orders-${symbolUpper}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'limit_orders', filter: `symbol=eq.${symbolUpper}` }, () => {
        loadDb();
      })
      .subscribe();

    // Fallback polling to ensure immediate UI updates even if realtime drops
    const pollId = setInterval(loadDb, 5000);

    return () => {
      clearInterval(pollId);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolUpper, addresses.join('|')]);

  useEffect(() => {
    loadJup();
    const id = setInterval(loadJup, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.solAddress, params.solMint, symbolUpper]);

  // Cancel helpers
  const cancelDbOrder = async (id: string, user_address: string) => {
    // Optimistic UI update
    setDbOrders((list) => list.map((o) => (o.id === id ? { ...o, status: 'canceled', updated_at: new Date().toISOString() } : o)));
    const { data, error } = await supabase.functions.invoke('limit-order-cancel', { body: { id, user_address } });
    if (error || !(data as any)?.ok) {
      toast({ title: 'Misslyckades att avbryta order', description: String((error as any)?.message || (data as any)?.error || 'Okänt fel'), variant: 'destructive' });
      // Re-sync from server on failure
      await loadDb();
    } else {
      toast({ title: 'Order avbruten', description: `Order ${id} avbröts` });
    }
    return { data, error };
  };

  const cancelJupOrder = async (order: string, maker: string) => {
    const { data, error } = await supabase.functions.invoke('jup-lo-cancel', { body: { maker, order } });
    if (error || !(data as any)?.ok) {
      const msg = (error as any)?.message || (data as any)?.error || (data as any)?.details || 'Okänt fel';
      toast({ title: 'Kunde inte avbryta Jupiter‑order', description: msg, variant: 'destructive' });
    } else {
      toast({ title: 'Jupiter‑order avbruten', description: `Order ${order} avbröts` });
      // Force immediate wallet refresh so användaren ser pengarna tillbaka
      window.dispatchEvent(new CustomEvent('wallet:refresh'));
    }
    // Alltid hämta om från kedjan så att UI speglar verkligheten
    await loadJup();
    return { data, error };
  };
  return { dbOrders, jupOrders, loading, cancelDbOrder, cancelJupOrder };
}
