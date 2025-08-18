import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Secure wallet authentication status hook
 * Enhanced with security validation and proper cleanup
 */
export function useWalletAuthStatus() {
  const { address, isConnected } = useAccount();
  const { publicKey, connected } = useWallet();
  const solAddress = publicKey?.toBase58();

  // Validate session tokens for security
  const validateSolAuth = (): boolean => {
    if (!connected || !solAddress) return false;
    
    const verified = sessionStorage.getItem('siws_verified');
    const storedAddress = sessionStorage.getItem('siws_address');
    const timestamp = sessionStorage.getItem('siws_timestamp');
    
    // Check if session is expired (24 hours)
    if (timestamp) {
      const sessionAge = Date.now() - parseInt(timestamp);
      if (sessionAge > 24 * 60 * 60 * 1000) {
        // Clear expired session
        sessionStorage.removeItem('siws_verified');
        sessionStorage.removeItem('siws_address');
        sessionStorage.removeItem('siws_timestamp');
        return false;
      }
    }
    
    return verified === 'true' && storedAddress === solAddress;
  };

  const validateEvmAuth = (): boolean => {
    if (!isConnected || !address) return false;
    
    const verified = sessionStorage.getItem('siwe_verified');
    const storedAddress = sessionStorage.getItem('siwe_address');
    const signature = sessionStorage.getItem('siwe_signature');
    const timestamp = sessionStorage.getItem('siwe_timestamp');
    
    // Check if session is expired (24 hours)
    if (timestamp) {
      const sessionAge = Date.now() - parseInt(timestamp);
      if (sessionAge > 24 * 60 * 60 * 1000) {
        // Clear expired session
        sessionStorage.removeItem('siwe_verified');
        sessionStorage.removeItem('siwe_address');
        sessionStorage.removeItem('siwe_signature');
        sessionStorage.removeItem('siwe_timestamp');
        return false;
      }
    }
    
    return (
      verified === 'true' &&
      signature &&
      storedAddress &&
      storedAddress.toLowerCase() === address.toLowerCase()
    );
  };

  const authedSol = validateSolAuth();
  const authedEvm = validateEvmAuth();
  const fullyAuthed = authedSol || authedEvm;

  return {
    authedSol,
    authedEvm,
    fullyAuthed,
    solAddress,
    evmAddress: address,
    isSolConnected: connected,
    isEvmConnected: isConnected,
  } as const;
}
