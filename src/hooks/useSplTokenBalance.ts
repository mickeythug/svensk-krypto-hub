import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function useSplTokenBalance(mint: string) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!publicKey) {
        setAmount(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const resp = await connection.getParsedTokenAccountsByOwner(publicKey, { mint });
        const tokenAcc = resp.value.find((a) => a.account.data.parsed.info.tokenAmount);
        const tokenAmount = tokenAcc?.account.data.parsed.info.tokenAmount;
        if (!cancelled) setAmount(tokenAmount ? Number(tokenAmount.uiAmount) : 0);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    const id = setInterval(run, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [connection, publicKey, mint]);

  return { amount, loading, error };
}
