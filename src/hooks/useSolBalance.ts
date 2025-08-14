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
        
        // Use our RPC proxy with better error handling
        const response = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [publicKey.toBase58(), { commitment: 'processed' }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('RPC proxy error:', response.status, errorText);
          throw new Error(`RPC request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          console.error('RPC error:', data.error);
          throw new Error(data.error.message || 'RPC request failed');
        }

        const lamports = data.result?.value || 0;
        const sol = lamports / 1_000_000_000;
        
        console.info('useSolBalance: balance lamports', lamports, 'SOL', sol);
        
        if (!cancelled) {
          setBalance(sol);
        }
      } catch (e: any) {
        console.error('Error fetching balance:', e);
        if (!cancelled) {
          setError(String(e.message || e));
          // Fallback to connection.getBalance if RPC proxy fails
          try {
            const lamports = await connection.getBalance(publicKey, { commitment: 'processed' } as any);
            const sol = lamports / 1_000_000_000;
            setBalance(sol);
            setError(null); // Clear error if fallback succeeds
          } catch (fallbackError: any) {
            console.error('Fallback balance fetch also failed:', fallbackError);
            setError(String(fallbackError.message || fallbackError));
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBalance();
    
    // Refresh balance every 30 seconds
    const id = setInterval(fetchBalance, 30_000);
    
    // Listen for manual refresh events
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