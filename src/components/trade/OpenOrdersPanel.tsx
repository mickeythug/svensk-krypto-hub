import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import OpenOrdersList from './OpenOrdersList';
import { useCryptoData } from '@/hooks/useCryptoData';
import { SOL_MINT } from '@/lib/tokenMaps';
import { Card } from '@/components/ui/card';

export default function OpenOrdersPanel({ symbol }: { symbol: string }) {
  const { publicKey } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { address: evmAddress } = useAccount();
  const { info: solInfo } = useSolanaTokenInfo(symbol);

  // Return wallet connection prompt if no wallet connected
  if (!solAddress && !evmAddress) {
    return (
      <Card className="h-full p-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-border/40 flex flex-col">
        <div className="p-3 border-b border-border/30 flex-shrink-0">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Öppna Ordrar
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded border-dashed" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Anslut din wallet för att se öppna ordrar</p>
          </div>
        </div>
      </Card>
    );
  }

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

        // Best-effort side detection relative to current token
        const side: 'buy' | 'sell' | undefined =
          outMint === solInfo?.mint ? 'buy'
          : inMint === solInfo?.mint ? 'sell'
          : (inMint === SOL_MINT && outMint === solInfo?.mint)
          ? 'buy'
          : (inMint === solInfo?.mint && outMint === SOL_MINT)
          ? 'sell'
          : o.side;

        // Prefer raw amounts if available; otherwise use human amounts directly
        const hasRaw = o.rawMakingAmount != null && o.rawTakingAmount != null;

        const inDec = inMint === SOL_MINT
          ? 9
          : inMint === solInfo?.mint
          ? (solInfo?.decimals ?? 0)
          : 6; // default to 6 for common SPLs like USDC/USDT

        const outDec = outMint === SOL_MINT
          ? 9
          : outMint === solInfo?.mint
          ? (solInfo?.decimals ?? 0)
          : 6;

        const mk = hasRaw
          ? Number(o.rawMakingAmount ?? 0) / Math.pow(10, inDec)
          : Number(o.makingAmount ?? 0);

        const tk = hasRaw
          ? Number(o.rawTakingAmount ?? 0) / Math.pow(10, outDec)
          : Number(o.takingAmount ?? 0);

        // Compute USD price per token
        let priceUsd: number | undefined;
        if (mk > 0 && tk > 0) {
          if (inMint === SOL_MINT && solUsd > 0) {
            priceUsd = (mk * solUsd) / tk; // SOL -> USD
          } else {
            // Treat input as USD stable if not SOL (best effort)
            priceUsd = mk / tk; // USD per token when input is USDC/USDT
          }
        }

        // Display token amount to match DB rows (amount in base token)
        const amountDisplay = side === 'buy' ? tk : mk;

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
