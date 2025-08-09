import { useEffect, useState } from 'react';
import { Address, createPublicClient, formatUnits, http } from 'viem';
import { ERC20_ABI } from '@/lib/erc20';

export function useErc20Balance(chain: any, token: Address | 'native', owner?: Address) {
  const [amount, setAmount] = useState<string>('0');
  const [decimals, setDecimals] = useState<number>(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!owner) { setAmount('0'); return; }
      setLoading(true);
      setError(null);
      try {
        const client = createPublicClient({ chain, transport: http() });
        if (token === 'native') {
          const wei = await client.getBalance({ address: owner });
          if (!cancelled) { setAmount(formatUnits(wei, 18)); setDecimals(18); }
        } else {
          const [raw, dec] = await Promise.all([
            client.readContract({ address: token, abi: ERC20_ABI as any, functionName: 'balanceOf', args: [owner] }) as Promise<bigint>,
            client.readContract({ address: token, abi: ERC20_ABI as any, functionName: 'decimals', args: [] }) as Promise<number>,
          ]);
          if (!cancelled) { setAmount(formatUnits(raw, dec)); setDecimals(dec); }
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    const id = setInterval(run, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [chain, token, owner]);

  return { amount: parseFloat(amount), decimals, loading, error };
}
