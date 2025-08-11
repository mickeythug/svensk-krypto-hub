import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWalletVerification } from './useWalletVerification';

export type OrderHistoryRow = {
  id: string;
  created_at: string;
  user_address: string;
  chain: 'SOL' | 'EVM' | string;
  symbol?: string | null;
  base_mint?: string | null;
  quote_mint?: string | null;
  side?: 'buy' | 'sell' | null;
  event_type: 'limit_create' | 'limit_cancel' | 'limit_execute' | 'market_trade' | string;
  source?: string | null;
  base_amount?: number | null;
  quote_amount?: number | null;
  price_quote?: number | null;
  price_usd?: number | null;
  fee_quote?: number | null;
  tx_hash?: string | null;
  meta?: any;
};

export function useOrderHistory(params: { addresses?: (string | undefined)[]; symbol?: string }) {
  const addresses = useMemo(() => (params.addresses || []).filter(Boolean) as string[], [params.addresses]);
  const symbol = (params.symbol || '').toUpperCase();
  const [rows, setRows] = useState<OrderHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { verifiedWallets } = useWalletVerification();

  // Get verified wallet addresses for secure querying
  const verifiedAddresses = useMemo(() => 
    verifiedWallets.map(w => w.wallet_address),
    [verifiedWallets]
  );

  async function load() {
    // Only load if user has verified wallets and is authenticated
    if (!verifiedAddresses.length) {
      setRows([]);
      return;
    }
    
    try {
      setLoading(true);
      let q = supabase.from('order_history').select('*').order('created_at', { ascending: false }).limit(100);
      
      // Only query for verified wallet addresses
      q = q.in('user_address', verifiedAddresses);
      if (symbol) q = q.eq('symbol', symbol);
      
      const { data, error } = await q;
      if (!error && Array.isArray(data)) {
        setRows(data as any);
      } else if (error) {
        console.warn('Order history query failed:', error.message);
        setRows([]);
      }
    } catch (e) {
      console.warn('load order history failed', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [symbol, verifiedAddresses.join('|')]);

  useEffect(() => {
    if (!verifiedAddresses.length) return;
    const channel = supabase
      .channel('order_history_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_history' }, (payload) => {
        const row = payload.new as any;
        if (!row) return;
        const matchesAddr = verifiedAddresses.includes(row.user_address);
        const matchesSymbol = !symbol || row.symbol === symbol;
        if (matchesAddr && matchesSymbol) {
          setRows((prev) => {
            const next = [row, ...prev.filter((r) => r.id !== row.id)];
            return next.slice(0, 100);
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [symbol, verifiedAddresses.join('|')]);

  // Force refresh when wallet or orders change
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('wallet:refresh', handler as any);
    window.addEventListener('orders:changed', handler as any);
    return () => {
      window.removeEventListener('wallet:refresh', handler as any);
      window.removeEventListener('orders:changed', handler as any);
    };
  }, []);

  return { rows, loading, refresh: load } as const;
}
