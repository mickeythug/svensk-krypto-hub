import { useEffect, useMemo, useState } from 'react';
import { Address, createPublicClient, formatEther, http } from 'viem';
import { mainnet } from 'viem/chains';

export type ChainBalance = {
  chainId: number;
  name: string;
  symbol: string;
  balanceWei: bigint;
  balance: string; // in ETH/BNB/MATIC etc
  error?: string;
};

const CHAINS = [
  { chain: mainnet, symbol: 'ETH' },
] as const;

export function useWalletBalances(address?: Address) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChainBalance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData([]);
      setError(null);
      return;
    }

    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const results: ChainBalance[] = await Promise.all(
          CHAINS.map(async ({ chain, symbol }) => {
            try {
              const client = createPublicClient({ chain, transport: http() });
              const balanceWei = await client.getBalance({ address });
              return {
                chainId: chain.id,
                name: chain.name,
                symbol,
                balanceWei,
                balance: formatEther(balanceWei),
              } as ChainBalance;
            } catch (e: any) {
              return {
                chainId: chain.id,
                name: chain.name,
                symbol,
                balanceWei: 0n,
                balance: '0',
                error: String(e.message || e),
              } as ChainBalance;
            }
          })
        );
        if (!cancelled) setData(results);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    const id = setInterval(run, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address]);

  return { loading, data, error };
}
