import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectedWallet {
  address: string;
  chain: 'SOL' | 'ETH';
  isVerified: boolean;
}

export function useWalletConnection() {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's connected wallets
  const fetchUserWallets = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setConnectedWallets([]);
        setPrimaryWallet(null);
        return;
      }

      const { data: wallets, error } = await supabase
        .from('user_wallets')
        .select('wallet_address, chain, verified_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user wallets:', error);
        return;
      }

      const formattedWallets: ConnectedWallet[] = (wallets || []).map(wallet => ({
        address: wallet.wallet_address,
        chain: wallet.chain as 'SOL' | 'ETH',
        isVerified: !!wallet.verified_at,
      }));

      setConnectedWallets(formattedWallets);
      
      // Set primary wallet (first SOL wallet if available)
      const solWallet = formattedWallets.find(w => w.chain === 'SOL');
      setPrimaryWallet(solWallet?.address || formattedWallets[0]?.address || null);

    } catch (error) {
      console.error('Error in fetchUserWallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect a new wallet
  const connectWallet = async (address: string, chain: 'SOL' | 'ETH') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First create verification proof
      const { error: proofError } = await supabase
        .from('wallet_verification_proofs')
        .insert({
          user_id: user.id,
          address: address,
          chain: chain,
        });

      if (proofError) {
        console.error('Error creating verification proof:', proofError);
        throw proofError;
      }

      // Then add wallet
      const { error: walletError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          wallet_address: address,
          chain: chain,
        });

      if (walletError) {
        console.error('Error adding wallet:', walletError);
        throw walletError;
      }

      await fetchUserWallets();
      
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  };

  // Disconnect a wallet
  const disconnectWallet = async (address: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', address);

      if (error) {
        console.error('Error disconnecting wallet:', error);
        throw error;
      }

      await fetchUserWallets();
      
      if (primaryWallet === address) {
        const remainingWallets = connectedWallets.filter(w => w.address !== address);
        setPrimaryWallet(remainingWallets[0]?.address || null);
      }
      
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  };

  // Change primary wallet
  const changePrimaryWallet = (address: string) => {
    if (connectedWallets.some(w => w.address === address)) {
      setPrimaryWallet(address);
    }
  };

  useEffect(() => {
    fetchUserWallets();
  }, []);

  return {
    connectedWallets,
    primaryWallet,
    isLoading,
    connectWallet,
    disconnectWallet,
    changePrimaryWallet,
    refreshWallets: fetchUserWallets,
  };
}