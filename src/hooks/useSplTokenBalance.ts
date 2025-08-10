import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

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
        const mintPk = new PublicKey(mint);
        console.info('useSplTokenBalance: fetching mint', mint, 'owner', publicKey?.toBase58());
        const resp = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: mintPk });
        console.info('useSplTokenBalance: accounts found', resp.value.length);
        const tokenAcc = resp.value.find((a) => a.account.data.parsed.info.tokenAmount);
        const tokenAmount = tokenAcc?.account.data.parsed.info.tokenAmount;
        console.info('useSplTokenBalance: amount', tokenAmount?.uiAmount);
        if (!cancelled) setAmount(tokenAmount ? Number(tokenAmount.uiAmount) : 0);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    const id = setInterval(run, 30000);
    const onRefresh = () => run();
    window.addEventListener('wallet:refresh', onRefresh);
    return () => { cancelled = true; clearInterval(id); window.removeEventListener('wallet:refresh', onRefresh); };
  }, [connection, publicKey, mint]);

  return { amount, loading, error };
}
