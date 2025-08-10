import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import OpenOrdersList from './OpenOrdersList';
import { useCryptoData } from '@/hooks/useCryptoData';
import { SOL_MINT } from '@/lib/tokenMaps';

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

  // Beräkna USD‑pris och belopp för JUP‑orders så att UI visar korrekt data
  const { cryptoPrices } = useCryptoData();
  const solUsd = useMemo(() => {
    const row = cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === 'SOL');
    return row?.price ? Number(row.price) : 0;
  }, [cryptoPrices]);

  const enrichedJup = useMemo(() => {
    try {
      return (jupOrders || []).map((o: any) => {
        const inMint = o.inputMint;
        const outMint = o.outputMint;
        const side: 'buy'|'sell'|undefined = (inMint === SOL_MINT && outMint === solInfo?.mint)
          ? 'buy'
          : (inMint === solInfo?.mint && outMint === SOL_MINT)
          ? 'sell'
          : o.side;

        const inDec = inMint === SOL_MINT ? 9 : (inMint === solInfo?.mint ? (solInfo?.decimals ?? 0) : 0);
        const outDec = outMint === SOL_MINT ? 9 : (outMint === solInfo?.mint ? (solInfo?.decimals ?? 0) : 0);

        const mkAtoms = Number(o.makingAmount ?? o.rawMakingAmount ?? 0);
        const tkAtoms = Number(o.takingAmount ?? o.rawTakingAmount ?? 0);
        const mk = inDec > 0 ? mkAtoms / Math.pow(10, inDec) : mkAtoms;    // input amount (e.g., SOL for buy)
        const tk = outDec > 0 ? tkAtoms / Math.pow(10, outDec) : tkAtoms;   // output amount (e.g., token for buy)

        let priceUsd: number | undefined;
        if (solUsd > 0 && mk > 0 && tk > 0) {
          if (side === 'buy') priceUsd = (mk * solUsd) / tk; // USD per token
          if (side === 'sell') priceUsd = (tk * solUsd) / mk; // USD per token
        }

        const amountDisplay = Number.isFinite(mk) ? mk : undefined; // Show input amount (e.g., 0.05 SOL)
        return { ...o, side, priceUsd, amountDisplay };
      });
    } catch {
      return jupOrders;
    }
  }, [jupOrders, solInfo?.mint, solInfo?.decimals, solUsd]);

  return (
    <OpenOrdersList
      symbol={symbol}
      dbOrders={dbOrders}
      jupOrders={enrichedJup as any}
      currentUser={user}
      onCancelDb={cancelDbOrder}
      onCancelJup={cancelJupOrder}
    />
  );
}
