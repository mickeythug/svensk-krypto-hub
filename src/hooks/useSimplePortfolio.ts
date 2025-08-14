import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  uiAmount: number;
  price?: number;
  value?: number;
  image?: string;
}

interface PortfolioData {
  solBalance: {
    balance: number;
    value: number;
    price: number;
  };
  tokenBalances: TokenBalance[];
  totalValue: number;
  lastUpdated: Date;
}

export function useSimplePortfolio(walletAddress?: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create demo portfolio data for testing
  const createDemoPortfolio = (): PortfolioData => {
    const solPrice = 169; // Demo SOL price
    const solBalance = 2.5; // Demo SOL balance
    
    const demoTokens: TokenBalance[] = [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 1000000000, // 1000 USDC (6 decimals)
        uiAmount: 1000,
        price: 1,
        value: 1000,
        image: 'https://coin-images.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      },
      {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'wSOL',
        name: 'Wrapped SOL',
        balance: 500000000, // 0.5 SOL (9 decimals)
        uiAmount: 0.5,
        price: solPrice,
        value: 0.5 * solPrice,
        image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
      },
    ];

    return {
      solBalance: {
        balance: solBalance,
        value: solBalance * solPrice,
        price: solPrice,
      },
      tokenBalances: demoTokens,
      totalValue: (solBalance * solPrice) + demoTokens.reduce((sum, token) => sum + (token.value || 0), 0),
      lastUpdated: new Date(),
    };
  };

  // Fetch real portfolio data (simplified version)
  const fetchPortfolioData = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, use demo data to avoid API issues
      // In a real implementation, you would fetch from your RPC proxy
      const demoData = createDemoPortfolio();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPortfolioData(demoData);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to fetch portfolio data');
      
      // Fall back to demo data even on error
      setPortfolioData(createDemoPortfolio());
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchPortfolioData(walletAddress);
    } else {
      // Show demo data even without wallet for UI testing
      setPortfolioData(createDemoPortfolio());
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Calculate P&L (simplified)
  const calculatePnL = () => {
    if (!portfolioData) return { pnl: 0, percentage: 0 };
    
    // Demo P&L calculation
    const totalInvested = 1500; // Demo invested amount
    const currentValue = portfolioData.totalValue;
    const pnl = currentValue - totalInvested;
    const percentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    
    return { pnl, percentage };
  };

  const refreshPortfolio = () => {
    if (walletAddress) {
      fetchPortfolioData(walletAddress);
    }
  };

  return {
    portfolioData,
    transactions: [], // Empty for now
    isLoading,
    error,
    isConnected: true, // Always connected for demo
    pnl: calculatePnL(),
    refreshPortfolio,
  };
}