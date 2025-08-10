import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';

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
      // Filter to symbol via outputMint if available
      const body: any = { user: params.solAddress, orderStatus: 'active' };
      if (params.solMint) body.outputMint = params.solMint;
      const { data, error } = await supabase.functions.invoke('jup-lo-open', { body });
      if (!error && data && (data as any).data) {
        const raw = (data as any).data?.data || (data as any).data?.orders || (data as any).data || [];
        // Normalize array
        const items: JupOrder[] = Array.isArray(raw) ? raw.map((o: any) => ({
          order: o.order || o.id || o.orderId || '',
          status: o.status || 'active',
          inputMint: o.inputMint || o.inMint || o.input || undefined,
          outputMint: o.outputMint || o.outMint || o.output || undefined,
          makingAmount: o.makingAmount || o.inAmount || undefined,
          takingAmount: o.takingAmount || o.outAmount || undefined,
          createdAt: o.createdAt || o.time || undefined,
        })) : [];
        setJupOrders(items);
      } else {
        setJupOrders([]);
      }
    } finally {
      setLoading((s) => ({ ...s, jup: false }));
    }
  };

  useEffect(() => {
    loadDb();
    // Realtime updates for DB orders on this symbol
    const channel = supabase
      .channel(`orders-${symbolUpper}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'limit_orders', filter: `symbol=eq.${symbolUpper}` }, () => {
        loadDb();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
    const { data, error } = await supabase.functions.invoke('limit-order-cancel', { body: { id, user_address } });
    if (!error && (data as any)?.ok) await loadDb();
    return { data, error };
  };

  const cancelJupOrder = async (order: string, maker: string) => {
    const { data, error } = await supabase.functions.invoke('jup-lo-cancel', { body: { maker, order } });
    if (!error && (data as any)?.ok) await loadJup();
    return { data, error };
  };

  return { dbOrders, jupOrders, loading, cancelDbOrder, cancelJupOrder };
}
