import { supabase } from '@/integrations/supabase/client';

interface SecureKeyStorage {
  storeKeys: (walletAddress: string, privateKey?: string, pumpApiKey?: string) => Promise<boolean>;
  retrieveKey: (walletAddress: string, keyType: 'private_key' | 'pump_api_key') => Promise<string | null>;
  deleteKeys: (walletAddress?: string) => Promise<boolean>;
}

/**
 * Hook for secure key management using server-side storage
 * Keys are never stored in client-accessible database tables
 */
export function useSecureKeyManagement(): SecureKeyStorage {
  
  const storeKeys = async (
    walletAddress: string, 
    privateKey?: string, 
    pumpApiKey?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-wallet-store', {
        body: {
          wallet_address: walletAddress,
          private_key_encrypted: privateKey ? btoa(privateKey) : undefined,
          pump_api_key_encrypted: pumpApiKey ? btoa(pumpApiKey) : undefined,
        },
      });

      if (error || !data?.success) {
        console.error('Failed to store keys securely:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing keys:', error);
      return false;
    }
  };

  const retrieveKey = async (
    walletAddress: string, 
    keyType: 'private_key' | 'pump_api_key'
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-wallet-retrieve', {
        body: {
          wallet_address: walletAddress,
          key_type: keyType,
        },
      });

      if (error || !data?.success || !data?.encrypted_key) {
        console.error('Failed to retrieve key:', error);
        return null;
      }

      // Decrypt the base64 encoded key
      return atob(data.encrypted_key);
    } catch (error) {
      console.error('Error retrieving key:', error);
      return null;
    }
  };

  const deleteKeys = async (walletAddress?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-wallet-delete', {
        method: 'DELETE',
        body: {
          wallet_address: walletAddress,
        },
      });

      if (error || !data?.success) {
        console.error('Failed to delete keys:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting keys:', error);
      return false;
    }
  };

  return {
    storeKeys,
    retrieveKey,
    deleteKeys,
  };
}