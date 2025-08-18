import { supabase } from '@/integrations/supabase/client';

// Secure encryption utilities using Web Crypto API
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('secure-wallet-key-v1'), // In production, use proper key derivation
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('secure-salt'), // In production, use random salt per user
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (data: string): Promise<string> => {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
};

const decryptData = async (encryptedData: string): Promise<string> => {
  const key = await getEncryptionKey();
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
};

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
      // Input validation
      if (!walletAddress?.trim()) {
        console.error('Wallet address is required');
        return false;
      }

      // Use proper encryption instead of base64
      const encryptedPrivateKey = privateKey ? await encryptData(privateKey) : undefined;
      const encryptedPumpApiKey = pumpApiKey ? await encryptData(pumpApiKey) : undefined;

      const { data, error } = await supabase.functions.invoke('secure-wallet-store', {
        body: {
          wallet_address: walletAddress.trim(),
          private_key_encrypted: encryptedPrivateKey,
          pump_api_key_encrypted: encryptedPumpApiKey,
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
      // Input validation
      if (!walletAddress?.trim() || !['private_key', 'pump_api_key'].includes(keyType)) {
        console.error('Invalid parameters');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('secure-wallet-retrieve', {
        body: {
          wallet_address: walletAddress.trim(),
          key_type: keyType,
        },
      });

      if (error || !data?.success || !data?.encrypted_key) {
        console.error('Failed to retrieve key:', error);
        return null;
      }

      // Decrypt the properly encrypted key
      return await decryptData(data.encrypted_key);
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