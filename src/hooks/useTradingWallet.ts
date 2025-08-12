import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import bs58 from 'bs58';

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
    if (walletAddress) return { walletAddress, privateKey, apiKey };
    setLoading(true);
    try {
      // Try via edge function first (saves to DB when user is authenticated)
      const { data, error } = await supabase.functions.invoke('pump-create-wallet');
      if (!error && data) {
        const wa = (data as any)?.walletAddress || null;
        const pk = (data as any)?.privateKey || null;
        setWalletAddress(wa);
        setPrivateKey(pk);
        setAcknowledged(false);
        return { walletAddress: wa, privateKey: pk, apiKey: null };
      }
      throw error || new Error('Edge function failed');
    } catch (_) {
      // Public fallback: create directly on client and persist locally
      try {
        const res = await fetch('https://pumpportal.fun/api/create-wallet', { method: 'GET' });
        if (!res.ok) throw new Error(`PumpPortal create failed: ${res.status}`);
        const body = await res.json();
        const wa = body.walletAddress || body.publicKey || body.address || body.pubkey || null;
        const key = body.apiKey || body.api_key || body.key || null;
        // Normalize private key from various possible formats
        const pkRaw = body.privateKey ?? body.private_key ?? body.secretKey ?? body.sk ?? null;
        let pk: string | null = null;
        try {
          if (pkRaw) {
            if (Array.isArray(pkRaw)) {
              pk = bs58.encode(Uint8Array.from(pkRaw));
            } else if (typeof pkRaw === 'string') {
              pk = pkRaw;
            } else if (pkRaw?.type === 'Buffer' && Array.isArray(pkRaw?.data)) {
              pk = bs58.encode(Uint8Array.from(pkRaw.data));
            }
          }
        } catch {}
        if (!wa || !key) throw new Error('Ogiltigt svar från PumpPortal');
        setWalletAddress(wa);
        setPrivateKey(pk);
        setAcknowledged(false);
        setApiKey(key);
        try {
          localStorage.setItem('pump_wallet_address', wa);
          if (pk) localStorage.setItem('pump_private_key', pk);
          localStorage.setItem('pump_api_key', key);
          localStorage.setItem('pump_ack', 'false');
        } catch {}
        return { walletAddress: wa, privateKey: pk, apiKey: key };
      } catch (e) {
        return { walletAddress: null, privateKey: null, apiKey: null };
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const confirmBackup = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      try { localStorage.setItem('pump_ack', 'true'); } catch {}
      setAcknowledged(true);
      setPrivateKey(null);
      return true;
    }
    const { error } = await supabase
      .from('trading_wallets')
      .update({ acknowledged_backup: true })
      .eq('user_id', user.id);
    if (error) return false;
    setAcknowledged(true);
    setPrivateKey(null);
    return true;
  }, []);

  return { loading, walletAddress, privateKey, apiKey, acknowledged, createIfMissing, confirmBackup, reload: load } as const;
}
