import { useState, useEffect, useCallback } from 'react';
import { useHeliusWebSocket } from './useHeliusWebSocket';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  price?: number;
  value?: number;
  image?: string;
}

interface SolBalance {
  balance: number;
  value: number;
  price: number;
}

interface PortfolioData {
  solBalance: SolBalance;
  tokenBalances: TokenBalance[];
  totalValue: number;
  lastUpdated: Date;
}

interface WalletTransaction {
  signature: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'transfer';
  tokenMint?: string;
  amount: number;
  price?: number;
  value: number;
}

export function useRealPortfolio(walletAddress?: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use WebSocket for real-time updates (optional - fallback to polling if unavailable)
  const { wsManager, isConnected: wsConnected } = useHeliusWebSocket();

  // Fetch SOL balance via RPC proxy
  const fetchSolBalance = useCallback(async (address: string): Promise<SolBalance> => {
    try {
      const solResponse = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address, { commitment: 'processed' }],
        }),
      });

      if (!solResponse.ok) {
        throw new Error(`SOL balance request failed: ${solResponse.status}`);
      }

      const solData = await solResponse.json();
      if (solData.error) {
        throw new Error(`SOL balance RPC error: ${solData.error.message}`);
      }

      const lamports = solData.result?.value || 0;
      const balance = lamports / 1_000_000_000;

      // Fetch SOL price from CoinGecko (free API)
      let solPrice = 200; // Fallback price
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          solPrice = priceData.solana?.usd || solPrice;
        }
      } catch (e) {
        console.warn('Failed to fetch SOL price, using fallback:', e);
      }

      return {
        balance,
        value: balance * solPrice,
        price: solPrice,
      };
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      throw error;
    }
  }, []);

  // Fetch SPL token balances via RPC proxy
  const fetchTokenBalances = useCallback(async (address: string): Promise<TokenBalance[]> => {
    try {
      const tokenResponse = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ],
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token balance request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        throw new Error(`Token balance RPC error: ${tokenData.error.message}`);
      }

      const accounts = tokenData.result?.value || [];
      const tokenBalances: TokenBalance[] = [];

      for (const account of accounts) {
        const parsed = account.account?.data?.parsed;
        if (!parsed?.info) continue;

        const info = parsed.info;
        const balance = parseFloat(info.tokenAmount?.uiAmountString || '0');
        
        if (balance <= 0) continue;

        tokenBalances.push({
          mint: info.mint,
          symbol: info.mint.substring(0, 8) + '...',
          name: `Token ${info.mint.substring(0, 8)}`,
          balance,
          decimals: info.tokenAmount?.decimals || 9,
          uiAmount: balance,
          price: 0,
          value: 0,
        });
      }

      return tokenBalances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }, []);

  // Fetch recent transactions
  const fetchTransactions = useCallback(async (address: string): Promise<WalletTransaction[]> => {
    try {
      const response = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 10 }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Transaction history request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Transaction history RPC error: ${data.error.message}`);
      }

      const signatures = data.result || [];
      const transactions: WalletTransaction[] = [];

      for (const sig of signatures.slice(0, 5)) {
        try {
          const txResponse = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 4,
              method: 'getTransaction',
              params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
            }),
          });

          if (txResponse.ok) {
            const txData = await txResponse.json();
            if (txData.result && !txData.error) {
              const blockTime = txData.result.blockTime;
              const meta = txData.result.meta;
              
              if (blockTime && meta) {
                // Simple transaction parsing
                const preBalance = meta.preBalances?.[0] || 0;
                const postBalance = meta.postBalances?.[0] || 0;
                const change = (postBalance - preBalance) / 1_000_000_000;
                
                if (Math.abs(change) > 0.001) { // Only include significant changes
                  transactions.push({
                    signature: sig.signature,
                    timestamp: new Date(blockTime * 1000),
                    type: change > 0 ? 'buy' : 'sell',
                    amount: Math.abs(change),
                    value: Math.abs(change) * 200, // Use SOL price estimate
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to fetch transaction details:', e);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }, []);

  // Main data fetching function
  const fetchPortfolioData = useCallback(async () => {
    if (!walletAddress) {
      setPortfolioData(null);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching portfolio data for:', walletAddress);

      // Fetch all data in parallel
      const [solBalance, tokenBalances, walletTransactions] = await Promise.all([
        fetchSolBalance(walletAddress).catch((e) => {
          console.error('SOL balance fetch failed:', e);
          return { balance: 0, value: 0, price: 200 };
        }),
        fetchTokenBalances(walletAddress).catch((e) => {
          console.error('Token balances fetch failed:', e);
          return [];
        }),
        fetchTransactions(walletAddress).catch((e) => {
          console.error('Transactions fetch failed:', e);
          return [];
        }),
      ]);

      let tokenValue = 0;
      for (const token of tokenBalances) {
        tokenValue += token.value || 0;
      }
      const totalValue = solBalance.value + tokenValue;

      const portfolio: PortfolioData = {
        solBalance,
        tokenBalances,
        totalValue,
        lastUpdated: new Date(),
      };

      setPortfolioData(portfolio);
      setTransactions(walletTransactions);
      console.log('Portfolio data updated:', portfolio);
    } catch (error: any) {
      console.error('Error fetching portfolio data:', error);
      setError(error.message || 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, fetchSolBalance, fetchTokenBalances, fetchTransactions]);

  // Setup WebSocket subscriptions for real-time updates
  useEffect(() => {
    if (!walletAddress || !wsConnected || !wsManager) {
      return;
    }

    console.log('Setting up WebSocket subscriptions for:', walletAddress);

    // Subscribe to account changes
    const accountSubId = wsManager.subscribe(
      'accountSubscribe',
      [walletAddress, { encoding: 'jsonParsed', commitment: 'processed' }],
      (data) => {
        console.log('Account update received:', data);
        // Trigger a refresh when account changes
        fetchPortfolioData();
      }
    );

    // Subscribe to transaction logs
    const logsSubId = wsManager.subscribe(
      'logsSubscribe',
      [{ mentions: [walletAddress] }, { commitment: 'processed' }],
      (data) => {
        console.log('Transaction log received:', data);
        // Trigger a refresh when new transactions occur
        setTimeout(() => fetchPortfolioData(), 1000); // Small delay to ensure data is available
      }
    );

    return () => {
      wsManager.unsubscribe(accountSubId);
      wsManager.unsubscribe(logsSubId);
    };
  }, [walletAddress, wsConnected, wsManager, fetchPortfolioData]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchPortfolioData();

    // Set up polling as fallback (every 30 seconds)
    const interval = setInterval(fetchPortfolioData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  return {
    portfolioData,
    transactions,
    isLoading,
    error,
    refresh,
    refreshPortfolio: refresh,
    isWebSocketConnected: wsConnected,
    isConnected: wsConnected,
    pnl: { pnl: 0, percentage: 0 }, // TODO: Calculate P&L based on historical data
  };
}