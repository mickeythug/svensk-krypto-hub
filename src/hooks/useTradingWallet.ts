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
        console.log('Loading trading wallet for user:', user.id);
        
        // FIRST: Check if trading wallet exists in database
        const { data, error } = await supabase
          .from('trading_wallets')
          .select('wallet_address, acknowledged_backup')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          console.log('Found existing trading wallet in DB:', data.wallet_address);
          setWalletAddress(data.wallet_address);
          setAcknowledged(!!data.acknowledged_backup);
          
          // If backup not acknowledged, try to fetch decrypted private key for one-time display
          if (!data.acknowledged_backup) {
            try {
              const { data: getData } = await supabase.functions.invoke('pump-get-wallet');
              const pkServer = (getData as any)?.privateKey || null;
              if (pkServer) setPrivateKey(pkServer);
            } catch (err) {
              console.log('Could not retrieve private key:', err);
            }
          }
          setLoading(false);
          return;
        }
        
        console.log('No trading wallet found in DB for user');
        
        // SECOND: Check localStorage for migration
        const lsAddr = localStorage.getItem('pump_wallet_address');
        const lsPk = localStorage.getItem('pump_private_key');
        const lsKey = localStorage.getItem('pump_api_key');
        const lsAck = localStorage.getItem('pump_ack') === 'true';
        
        if (lsAddr && lsKey) {
          console.log('Found wallet in localStorage, migrating to DB');
          try {
            await supabase.functions.invoke('pump-store-wallet', { 
              body: { walletAddress: lsAddr, privateKey: lsPk, apiKey: lsKey } 
            });
            setWalletAddress(lsAddr);
            setAcknowledged(lsAck);
            if (!lsAck && lsPk) setPrivateKey(lsPk);
            setLoading(false);
            return;
          } catch (err) {
            console.error('Failed to migrate wallet to DB:', err);
          }
        }
        
        console.log('No existing trading wallet found for authenticated user');
      } else {
        // Not authenticated - check localStorage only
        const lsAddr = localStorage.getItem('pump_wallet_address');
        const lsAck = localStorage.getItem('pump_ack') === 'true';
        if (lsAddr) {
          console.log('Found wallet in localStorage (not authenticated)');
          setWalletAddress(lsAddr);
          setAcknowledged(lsAck);
          if (!lsAck) {
            try {
              const lsPk = localStorage.getItem('pump_private_key');
              if (lsPk) setPrivateKey(lsPk);
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error('Error loading trading wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createIfMissing = useCallback(async () => {
    console.log('createIfMissing called, current walletAddress:', walletAddress);
    
    // If wallet already exists, don't create a new one
    if (walletAddress) {
      console.log('Trading wallet already exists, not creating new one');
      // Ensure we retrieve private key if not acknowledged yet
      if (!acknowledged && !privateKey) {
        try {
          const { data: getData } = await supabase.functions.invoke('pump-get-wallet');
          const pkServer = (getData as any)?.privateKey || null;
          if (pkServer) setPrivateKey(pkServer);
          return { walletAddress, privateKey: pkServer, apiKey };
        } catch {}
      }
      return { walletAddress, privateKey, apiKey };
    }
    
    // Double-check database before creating new wallet
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('trading_wallets')
        .select('wallet_address, acknowledged_backup')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (data) {
        console.log('Found existing wallet in DB during create check:', data.wallet_address);
        setWalletAddress(data.wallet_address);
        setAcknowledged(!!data.acknowledged_backup);
        return { walletAddress: data.wallet_address, privateKey: null, apiKey: null };
      }
    }
    
    console.log('Creating NEW trading wallet...');
    setLoading(true);
    try {
      // Try via edge function first (saves to DB when user is authenticated)
      const { data, error } = await supabase.functions.invoke('pump-create-wallet');
      if (!error && data) {
        const wa = (data as any)?.walletAddress || null;
        // Normalize private key from possible formats
        const pkRaw = (data as any)?.privateKey ?? (data as any)?.private_key ?? (data as any)?.secretKey ?? (data as any)?.sk ?? null;
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
        const wa = body.walletPublicKey || body.walletAddress || body.publicKey || body.address || body.pubkey || null;
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
        // If user is authenticated, persist securely to DB as well
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.functions.invoke('pump-store-wallet', { body: { walletAddress: wa, privateKey: pk, apiKey: key } });
          }
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
