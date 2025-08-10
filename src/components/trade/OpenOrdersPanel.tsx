import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import OpenOrdersList from './OpenOrdersList';
import { useCryptoData } from '@/hooks/useCryptoData';

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
        const side: 'buy'|'sell'|undefined = (inMint === 'So11111111111111111111111111111111111111112' && outMint === solInfo?.mint)
          ? 'buy'
          : (inMint === solInfo?.mint && outMint === 'So11111111111111111111111111111111111111112')
          ? 'sell'
          : o.side;
        const mk = parseFloat(o.makingAmount || o.rawMakingAmount || '0');
        const tk = parseFloat(o.takingAmount || o.rawTakingAmount || '0');
        let priceUsd: number | undefined;
        if (solUsd > 0 && mk > 0 && tk > 0) {
          if (side === 'buy') priceUsd = (mk * solUsd) / tk;
          if (side === 'sell') priceUsd = (tk * solUsd) / mk;
        }
        const amountDisplay = side === 'buy' ? tk : side === 'sell' ? mk : undefined;
        return { ...o, side, priceUsd, amountDisplay };
      });
    } catch {
      return jupOrders;
    }
  }, [jupOrders, solInfo?.mint, solUsd]);

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
