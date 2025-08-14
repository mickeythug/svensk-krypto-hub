import { useState, useEffect, useCallback } from 'react';
import { useHeliusWebSocket } from './useHeliusWebSocket';
import { supabase } from '@/integrations/supabase/client';

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

const HELIUS_API_KEY = '8abd09a9-730e-4bd6-8d24-b67216d33f20'; // Use from the provided key

export function useRealPortfolio(walletAddress?: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use WebSocket for real-time updates
  const { wsManager, isConnected: wsConnected } = useHeliusWebSocket();

  // Fetch initial portfolio data
  const fetchPortfolioData = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Supabase RPC proxy for Solana calls
      const solResponse = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      if (!solResponse.ok) {
        throw new Error('Failed to fetch SOL balance');
      }

      const solData = await solResponse.json();
      const solBalance = solData.result?.value / 1e9 || 0;

      // Fetch token accounts using RPC proxy
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
            { encoding: 'jsonParsed' },
          ],
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch token accounts');
      }

      const tokenData = await tokenResponse.json();
      const tokenAccounts = tokenData.result?.value || [];

      // Get current SOL price
      const solPrice = await getCurrentPrice('solana');
      
      // Process token balances
      const tokenBalances: TokenBalance[] = [];
      for (const account of tokenAccounts) {
        const tokenInfo = account.account.data.parsed.info;
        if (parseFloat(tokenInfo.tokenAmount.uiAmount) > 0) {
          const tokenMint = tokenInfo.mint;
          const balance = parseFloat(tokenInfo.tokenAmount.amount);
          const decimals = tokenInfo.tokenAmount.decimals;
          const uiAmount = parseFloat(tokenInfo.tokenAmount.uiAmount);
          
          // Try to get token metadata
          const { symbol, name, image, price } = await getTokenMetadata(tokenMint);
          
          tokenBalances.push({
            mint: tokenMint,
            symbol: symbol || tokenMint.slice(0, 8),
            name: name || 'Unknown Token',
            balance,
            decimals,
            uiAmount,
            price,
            value: price ? uiAmount * price : 0,
            image,
          });
        }
      }

      const totalValue = (solBalance * solPrice) + 
        tokenBalances.reduce((sum, token) => sum + (token.value || 0), 0);

      setPortfolioData({
        solBalance: {
          balance: solBalance,
          value: solBalance * solPrice,
          price: solPrice,
        },
        tokenBalances,
        totalValue,
        lastUpdated: new Date(),
      });

      // Fetch transaction history
      await fetchTransactionHistory(address);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current token price from CoinGecko
  const getCurrentPrice = async (coinId: string): Promise<number> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch {
      return 0;
    }
  };

  // Get token metadata
  const getTokenMetadata = async (mint: string) => {
    try {
      // First try to get from our tokens catalog
      const { data: catalogData } = await supabase
        .from('tokens_catalog')
        .select('symbol, name, image, last_price')
        .eq('address', mint)
        .single();

      if (catalogData) {
        const priceData = catalogData.last_price as any;
        return {
          symbol: catalogData.symbol,
          name: catalogData.name,
          image: catalogData.image,
          price: priceData?.price || 0,
        };
      }

      // Fallback to Helius metadata API via RPC proxy
      const response = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAsset',
          params: { id: mint },
        }),
      });

      if (!response.ok) {
        return { symbol: '', name: '', image: '', price: 0 };
      }

      const data = await response.json();
      const metadata = data.result;

      return {
        symbol: metadata?.token_info?.symbol || '',
        name: metadata?.content?.metadata?.name || '',
        image: metadata?.content?.links?.image || '',
        price: 0, // Would need additional price API
      };
    } catch {
      return { symbol: '', name: '', image: '', price: 0 };
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (address: string) => {
    try {
      const response = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 100 }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction signatures');
      }

      const data = await response.json();
      const signatures = data.result || [];

      // Process recent transactions for P&L calculation
      const recentTransactions: WalletTransaction[] = [];
      
      for (const sig of signatures.slice(0, 20)) { // Limit to recent 20
        const txResponse = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/solana-rpc-proxy', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [sig.signature, { encoding: 'jsonParsed' }],
          }),
        });

        if (!txResponse.ok) continue;

        const txData = await txResponse.json();
        const transaction = txData.result;

        if (transaction) {
          // Basic transaction parsing - would need more sophisticated parsing for DEX trades
          recentTransactions.push({
            signature: sig.signature,
            timestamp: new Date(sig.blockTime * 1000),
            type: 'transfer',
            amount: 0,
            value: 0,
          });
        }
      }

      setTransactions(recentTransactions);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    }
  };

  // WebSocket connection with fallback
  useEffect(() => {
    if (wsManager && walletAddress) {
      // Subscribe to account changes for real-time updates
      const subscriptionId = wsManager.subscribe(
        'accountSubscribe',
        [walletAddress, { encoding: 'jsonParsed' }],
        (data) => {
          console.log('Account updated:', data);
          // Refresh portfolio when account changes
          fetchPortfolioData(walletAddress);
        }
      );

      return () => {
        if (subscriptionId) {
          wsManager.unsubscribe(subscriptionId);
        }
      };
    }
  }, [wsManager, walletAddress, fetchPortfolioData]);

  // Initial data fetch
  useEffect(() => {
    if (walletAddress) {
      fetchPortfolioData(walletAddress);
    }
  }, [walletAddress, fetchPortfolioData]);

  // Calculate P&L
  const calculatePnL = () => {
    if (!portfolioData || !transactions.length) return { pnl: 0, percentage: 0 };
    
    // Basic P&L calculation - would need more sophisticated tracking
    const totalInvested = transactions
      .filter(tx => tx.type === 'buy')
      .reduce((sum, tx) => sum + tx.value, 0);
    
    const currentValue = portfolioData.totalValue;
    const pnl = currentValue - totalInvested;
    const percentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    
    return { pnl, percentage };
  };

  return {
    portfolioData,
    transactions,
    isLoading,
    error,
    isConnected: wsConnected,
    pnl: calculatePnL(),
    refreshPortfolio: () => walletAddress && fetchPortfolioData(walletAddress),
  };
}