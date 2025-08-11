import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

export type VerifiedWallet = {
  id: string;
  user_id: string;
  wallet_address: string;
  chain: 'SOL' | 'EVM';
  verified_at: string;
  created_at: string;
};

export function useWalletVerification() {
  const { address: evmAddress } = useAccount();
  const { publicKey: solanaPublicKey } = useWallet();
  const [verifiedWallets, setVerifiedWallets] = useState<VerifiedWallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current wallet addresses
  const currentWallets = [
    evmAddress ? { address: evmAddress, chain: 'EVM' as const } : null,
    solanaPublicKey ? { address: solanaPublicKey.toString(), chain: 'SOL' as const } : null,
  ].filter(Boolean);

  async function loadVerifiedWallets() {
    try {
      setLoading(true);
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVerifiedWallets([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setVerifiedWallets(data as VerifiedWallet[]);
      }
    } catch (e) {
      console.warn('Failed to load verified wallets:', e);
    } finally {
      setLoading(false);
    }
  }

  async function verifyWallet(address: string, chain: 'SOL' | 'EVM') {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot verify wallet');
        return false;
      }

      const { data, error } = await supabase
        .from('user_wallets')
        .insert({ 
          wallet_address: address, 
          chain,
          user_id: user.id 
        })
        .select()
        .single();
      
      if (!error && data) {
        setVerifiedWallets(prev => [data as VerifiedWallet, ...prev]);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to verify wallet:', e);
      return false;
    }
  }

  async function removeWallet(walletId: string) {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('id', walletId);
      
      if (!error) {
        setVerifiedWallets(prev => prev.filter(w => w.id !== walletId));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to remove wallet:', e);
      return false;
    }
  }

  // Auto-verify current wallets if not already verified
  useEffect(() => {
    if (currentWallets.length > 0 && verifiedWallets.length > 0) {
      currentWallets.forEach(wallet => {
        const isVerified = verifiedWallets.some(
          vw => vw.wallet_address === wallet.address && vw.chain === wallet.chain
        );
        if (!isVerified) {
          verifyWallet(wallet.address, wallet.chain);
        }
      });
    }
  }, [currentWallets.map(w => w?.address).join(','), verifiedWallets.length]);

  useEffect(() => {
    loadVerifiedWallets();
  }, []);

  const isWalletVerified = (address: string, chain: 'SOL' | 'EVM') => {
    return verifiedWallets.some(w => w.wallet_address === address && w.chain === chain);
  };

  return {
    verifiedWallets,
    loading,
    verifyWallet,
    removeWallet,
    isWalletVerified,
    refresh: loadVerifiedWallets,
  };
}