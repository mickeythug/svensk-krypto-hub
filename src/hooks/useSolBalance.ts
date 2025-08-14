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
        console.info('useSolBalance: fetching balance for', publicKey?.toBase58());
        const lamports = await connection.getBalance(publicKey, { commitment: 'processed' } as any);
        const sol = lamports / 1_000_000_000;
        console.info('useSolBalance: balance lamports', lamports, 'SOL', sol);
        if (!cancelled) setBalance(sol);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBalance();
    const id = setInterval(fetchBalance, 30_000);
    const onRefresh = () => fetchBalance();
    window.addEventListener('wallet:refresh', onRefresh);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('wallet:refresh', onRefresh);
    };
  }, [connection, publicKey]);

  return { balance, loading, error };
}
