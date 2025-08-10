import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBalance() {
      if (!publicKey) {
        setBalance(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const lamports = await connection.getBalance(publicKey, { commitment: 'processed' } as any);
        if (!cancelled) setBalance(lamports / 1_000_000_000);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBalance();
    const id = setInterval(fetchBalance, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [connection, publicKey]);

  return { balance, loading, error };
}
