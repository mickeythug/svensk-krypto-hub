import { useEffect, useState, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

// Global rate limiting to prevent multiple simultaneous calls
let lastFetchTime = 0;
let isCurrentlyFetching = false;
const MIN_FETCH_INTERVAL = 5000; // 5 seconds minimum between fetches

export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    async function fetchBalanceWithBackoff() {
      if (!publicKey || isCurrentlyFetching) {
        setBalance(null);
        return;
      }

      const now = Date.now();
      if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
        console.log('useSolBalance: Rate limiting - skipping fetch');
        return;
      }

      isCurrentlyFetching = true;
      lastFetchTime = now;
      setLoading(true);
      setError(null);

      try {
        console.info('useSolBalance: fetching balance for', publicKey?.toBase58());
        const lamports = await connection.getBalance(publicKey, { commitment: 'processed' } as any);
        const sol = lamports / 1_000_000_000;
        console.info('useSolBalance: balance lamports', lamports, 'SOL', sol);
        
        if (!cancelled) {
          setBalance(sol);
          retryCountRef.current = 0; // Reset retry count on success
        }
      } catch (e: any) {
        const errorMessage = String(e.message || e);
        console.error('useSolBalance error:', errorMessage);
        
        if (!cancelled) {
          // Check for rate limiting (429) or network errors
          if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
            retryCountRef.current++;
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000); // Exponential backoff, max 30s
            
            if (retryCountRef.current <= maxRetries) {
              console.log(`useSolBalance: Rate limited, retrying in ${backoffDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
              timeoutId = setTimeout(() => {
                if (!cancelled) {
                  isCurrentlyFetching = false;
                  fetchBalanceWithBackoff();
                }
              }, backoffDelay);
              return;
            } else {
              setError('Rate limited: Too many requests. Please wait before refreshing.');
            }
          } else {
            setError(errorMessage);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          isCurrentlyFetching = false;
        }
      }
    }

    // Initial fetch
    fetchBalanceWithBackoff();
    
    // Set up interval for periodic updates (reduced frequency)
    const intervalId = setInterval(() => {
      if (!cancelled && !isCurrentlyFetching) {
        fetchBalanceWithBackoff();
      }
    }, 60_000); // Increased to 60 seconds to reduce load

    // Event listener for manual refresh (with rate limiting)
    const onRefresh = () => {
      if (!isCurrentlyFetching && Date.now() - lastFetchTime >= MIN_FETCH_INTERVAL) {
        fetchBalanceWithBackoff();
      }
    };
    window.addEventListener('wallet:refresh', onRefresh);

    return () => {
      cancelled = true;
      isCurrentlyFetching = false;
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('wallet:refresh', onRefresh);
    };
  }, [connection, publicKey]);

  return { balance, loading, error };
}
