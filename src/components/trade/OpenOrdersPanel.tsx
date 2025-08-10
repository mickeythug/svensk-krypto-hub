import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import OpenOrdersList from './OpenOrdersList';

export default function OpenOrdersPanel({ symbol }: { symbol: string }) {
  const { publicKey } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { address: evmAddress } = useAccount();
  const { info: solInfo } = useSolanaTokenInfo(symbol);

  const { dbOrders, jupOrders, loading, cancelDbOrder, cancelJupOrder } = useOpenOrders({
    symbol,
    solAddress,
    evmAddress: evmAddress as string | undefined,
    solMint: solInfo?.mint,
  });

  const user = useMemo(() => ({ sol: solAddress, evm: evmAddress as string | undefined }), [solAddress, evmAddress]);

  return (
    <OpenOrdersList
      symbol={symbol}
      dbOrders={dbOrders}
      jupOrders={jupOrders}
      currentUser={user}
      onCancelDb={cancelDbOrder}
      onCancelJup={cancelJupOrder}
    />
  );
}
