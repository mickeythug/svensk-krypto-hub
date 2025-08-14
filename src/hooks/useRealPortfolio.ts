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

const HELIUS_API_KEY = 'c5fb7dc1-05c9-4bcc-89a7-a8fdaeb30871'; // Replace with your actual API key

export function useRealPortfolio(walletAddress?: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { wsManager, isConnected } = useHeliusWebSocket(HELIUS_API_KEY);

  // Fetch initial portfolio data
  const fetchPortfolioData = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch SOL balance
      const solResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      const solData = await solResponse.json();
      const solBalance = solData.result?.value / 1e9 || 0;

      // Fetch token accounts
      const tokenResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Fallback to Helius metadata API
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAsset',
          params: { id: mint },
        }),
      });

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
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 100 }],
        }),
      });

      const data = await response.json();
      const signatures = data.result || [];

      // Process recent transactions for P&L calculation
      const recentTransactions: WalletTransaction[] = [];
      
      for (const sig of signatures.slice(0, 20)) { // Limit to recent 20
        const txResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [sig.signature, { encoding: 'jsonParsed' }],
          }),
        });

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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!wsManager || !isConnected || !walletAddress) return;

    // Subscribe to SOL balance changes
    const solSubscription = wsManager.subscribe(
      'accountSubscribe',
      [walletAddress, { commitment: 'confirmed' }],
      (data) => {
        const newBalance = data.value.lamports / 1e9;
        setPortfolioData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            solBalance: {
              ...prev.solBalance,
              balance: newBalance,
              value: newBalance * prev.solBalance.price,
            },
            totalValue: (newBalance * prev.solBalance.price) + 
              prev.tokenBalances.reduce((sum, token) => sum + (token.value || 0), 0),
            lastUpdated: new Date(),
          };
        });
      }
    );

    // Subscribe to token account changes
    const tokenSubscription = wsManager.subscribe(
      'programSubscribe',
      [
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        {
          encoding: 'jsonParsed',
          commitment: 'confirmed',
          filters: [
            { memcmp: { offset: 32, bytes: walletAddress } }
          ]
        }
      ],
      (data) => {
        // Handle token balance updates
        console.log('Token account updated:', data);
        // Would need to update specific token balance
      }
    );

    return () => {
      wsManager.unsubscribe(solSubscription);
      wsManager.unsubscribe(tokenSubscription);
    };
  }, [wsManager, isConnected, walletAddress]);

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
    isConnected,
    pnl: calculatePnL(),
    refreshPortfolio: () => walletAddress && fetchPortfolioData(walletAddress),
  };
}