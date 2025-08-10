import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

export function useWalletAuthStatus() {
  const { address, isConnected } = useAccount();
  const { publicKey, connected } = useWallet();
  const solAddress = publicKey?.toBase58();

  const authedSol = Boolean(
    connected &&
    solAddress &&
    sessionStorage.getItem('siws_verified') === 'true' &&
    sessionStorage.getItem('siws_address') === solAddress
  );

  const authedEvm = Boolean(
    isConnected &&
    address &&
    sessionStorage.getItem('siwe_signature') &&
    sessionStorage.getItem('siwe_address') &&
    sessionStorage.getItem('siwe_address')!.toLowerCase() === (address || '').toLowerCase()
  );

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
