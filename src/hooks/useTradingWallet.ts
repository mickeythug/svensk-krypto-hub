import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTradingWallet() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null); // one-time display
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('trading_wallets')
          .select('wallet_address, acknowledged_backup')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!error && data) {
          setWalletAddress(data.wallet_address);
          setAcknowledged(!!data.acknowledged_backup);
          setLoading(false);
          return;
        }
      }
      // Fallback to localStorage (no Supabase user)
      const lsAddr = localStorage.getItem('pump_wallet_address');
      const lsAck = localStorage.getItem('pump_ack') === 'true';
      if (lsAddr) {
        setWalletAddress(lsAddr);
        setAcknowledged(lsAck);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createIfMissing = useCallback(async () => {
    if (walletAddress) return { walletAddress, privateKey: null };
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pump-create-wallet');
      if (error) throw error;
      setWalletAddress((data as any)?.walletAddress || null);
      setPrivateKey((data as any)?.privateKey || null);
      setAcknowledged(false);
      toast({ title: 'Ny Trading Wallet skapad', description: 'Spara din private key säkert innan du fortsätter.' });
      return { walletAddress: (data as any)?.walletAddress, privateKey: (data as any)?.privateKey };
    } catch (e: any) {
      toast({ title: 'Kunde inte skapa wallet', description: String(e?.message || e), variant: 'destructive' });
      return { walletAddress: null, privateKey: null };
    } finally {
      setLoading(false);
    }
  }, [walletAddress, toast]);

  const confirmBackup = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('trading_wallets')
      .update({ acknowledged_backup: true })
      .eq('user_id', user.id);
    if (error) return false;
    setAcknowledged(true);
    setPrivateKey(null);
    return true;
  }, []);

  return { loading, walletAddress, privateKey, acknowledged, createIfMissing, confirmBackup, reload: load } as const;
}
