import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';

export function useTradingWallet() {
  const { toast } = useToast();
  const { connected: authConnected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  
  // Get authenticated Solana address from session storage
  const authenticatedSolAddress = useMemo(() => {
    const verified = sessionStorage.getItem('siws_verified') === 'true';
    const storedAddress = sessionStorage.getItem('siws_address');
    const currentAddress = publicKey?.toBase58();
    
    if (verified && storedAddress && currentAddress && storedAddress === currentAddress) {
      return storedAddress;
    }
    return null;
  }, [publicKey]);

  const load = useCallback(async () => {
    if (!authenticatedSolAddress) {
      console.log('No authenticated Solana address');
      setWalletAddress(null);
      setPrivateKey(null);
      setAcknowledged(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading trading wallet for address:', authenticatedSolAddress);
      
      // Check if trading wallet exists for this address
      const { data, error } = await supabase
        .from('trading_wallets')
        .select('wallet_address, acknowledged_backup, user_id')
        .eq('user_id', authenticatedSolAddress) // Use Solana address as user_id
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching trading wallet:', error);
        return;
      }

      if (data) {
        console.log('Found existing trading wallet:', data.wallet_address);
        setWalletAddress(data.wallet_address);
        setAcknowledged(!!data.acknowledged_backup);
        
        // If backup not acknowledged, fetch private key for one-time display
        if (!data.acknowledged_backup) {
          try {
            const { data: keyData, error: keyError } = await supabase.functions.invoke('decrypt-wallet-key', {
              body: { 
                wallet_address: data.wallet_address,
                key_type: 'private_key',
                solanaAddress: authenticatedSolAddress
              }
            });
            
            if (!keyError && keyData?.private_key) {
              setPrivateKey(keyData.private_key);
            } else {
              console.log('Could not retrieve private key:', keyError);
            }
          } catch (err) {
            console.log('Error fetching private key:', err);
          }
        }
      } else {
        console.log('No trading wallet found for user');
        setWalletAddress(null);
        setPrivateKey(null);
        setAcknowledged(false);
      }
    } catch (err) {
      console.error('Error loading trading wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedSolAddress]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const createIfMissing = useCallback(async () => {
    console.log('createIfMissing called, current walletAddress:', walletAddress);
    
    // If wallet already exists, don't create a new one
    if (walletAddress) {
      console.log('Trading wallet already exists, not creating new one');
      
      // If not acknowledged yet and no private key, fetch it
      if (!acknowledged && !privateKey) {
        try {
          const { data: keyData, error: keyError } = await supabase.functions.invoke('decrypt-wallet-key', {
            body: { 
              wallet_address: walletAddress,
              key_type: 'private_key',
              solanaAddress: authenticatedSolAddress
            }
          });
          
          if (!keyError && keyData?.private_key) {
            setPrivateKey(keyData.private_key);
            return { walletAddress, privateKey: keyData.private_key };
          }
        } catch (err) {
          console.log('Error fetching existing private key:', err);
        }
      }
      
      return { walletAddress, privateKey };
    }
    
    // Check if Solana wallet is authenticated
    if (!authenticatedSolAddress) {
      console.log('Solana wallet not authenticated, cannot create trading wallet');
      toast({
        title: "Autentisering krävs",
        description: "Du måste vara inloggad med Phantom för att skapa en trading wallet",
        variant: "destructive",
      });
      return { walletAddress: null, privateKey: null };
    }
    
    // Double-check database before creating new wallet
    const { data: existingWallet } = await supabase
      .from('trading_wallets')
      .select('wallet_address, acknowledged_backup')
      .eq('user_id', authenticatedSolAddress)
      .maybeSingle();
      
    if (existingWallet) {
      console.log('Found existing wallet in DB during create check:', existingWallet.wallet_address);
      setWalletAddress(existingWallet.wallet_address);
      setAcknowledged(!!existingWallet.acknowledged_backup);
      return { walletAddress: existingWallet.wallet_address, privateKey: null };
    }
    
    console.log('Creating NEW trading wallet...');
    setLoading(true);
    
    try {
      // Create wallet via secure edge function
      console.log('Calling pump-create-wallet with solanaAddress:', authenticatedSolAddress);
      const { data, error } = await supabase.functions.invoke('pump-create-wallet', {
        body: { solanaAddress: authenticatedSolAddress }
      });
      console.log('pump-create-wallet response:', { data, error });
      
      if (error) {
        console.error('Error creating wallet:', error);
        toast({
          title: "Fel vid skapande av wallet",
          description: error.message || "Kunde inte skapa trading wallet",
          variant: "destructive",
        });
        return { walletAddress: null, privateKey: null };
      }
      
      if (data?.walletAddress) {
        console.log('Successfully created trading wallet:', data.walletAddress);
        setWalletAddress(data.walletAddress);
        setPrivateKey(data.privateKey || null);
        setAcknowledged(false);
        
        toast({
          title: "Trading wallet skapad",
          description: "Din trading wallet har skapats framgångsrikt",
        });
        
        return { 
          walletAddress: data.walletAddress, 
          privateKey: data.privateKey || null 
        };
      } else {
        throw new Error('Invalid response from wallet creation');
      }
    } catch (error) {
      console.error('Failed to create trading wallet:', error);
      toast({
        title: "Fel vid skapande av wallet",
        description: "Kunde inte skapa trading wallet",
        variant: "destructive",
      });
      return { walletAddress: null, privateKey: null };
    } finally {
      setLoading(false);
    }
  }, [walletAddress, acknowledged, privateKey, toast, authenticatedSolAddress]);

  const confirmBackup = useCallback(async () => {
    if (!authenticatedSolAddress || !walletAddress) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('trading_wallets')
        .update({ acknowledged_backup: true })
        .eq('user_id', authenticatedSolAddress)
        .eq('wallet_address', walletAddress);
        
      
      if (error) {
        console.error('Error acknowledging backup:', error);
        return false;
      }
      
      setAcknowledged(true);
      setPrivateKey(null); // Clear private key after acknowledgment
      
      toast({
        title: "Backup bekräftad",
        description: "Din private key backup har bekräftats",
      });
      
      return true;
    } catch (error) {
      console.error('Error confirming backup:', error);
      return false;
    }
  }, [walletAddress, toast, authenticatedSolAddress]);

  const getPrivateKey = useCallback(async () => {
    if (!authenticatedSolAddress || !walletAddress || !acknowledged) {
      return null;
    }
    
    try {
      const { data: keyData, error } = await supabase.functions.invoke('decrypt-wallet-key', {
        body: { 
          wallet_address: walletAddress,
          key_type: 'private_key',
          solanaAddress: authenticatedSolAddress
        }
      });
      
      if (error || !keyData?.private_key) {
        console.error('Error fetching private key:', error);
        return null;
      }
      
      return keyData.private_key;
    } catch (error) {
      console.error('Error fetching private key:', error);
      return null;
    }
  }, [walletAddress, acknowledged, authenticatedSolAddress]);

  return { 
    loading, 
    walletAddress, 
    privateKey, 
    acknowledged, 
    createIfMissing, 
    confirmBackup,
    getPrivateKey,
    reload: load 
  } as const;
}
