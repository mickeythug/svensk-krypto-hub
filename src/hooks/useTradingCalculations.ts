import { useMemo } from 'react';
import { useCryptoData } from './useCryptoData';
import { useWalletBalances } from './useWalletBalances';
import { useSolBalance } from './useSolBalance';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

interface TradingCalculationsProps {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  amount: string;
  price: string;
  currentPrice: number;
}

interface TradingCalculations {
  // Available balances in USD equivalent
  availableUsdBalance: number;
  availableTokenBalance: number;
  availableSolBalance: number;
  
  // Real-time calculations
  estimatedPrice: number;
  estimatedTotal: number;
  estimatedFee: number;
  netTotal: number; // Total including fees
  
  // Validation
  maxBuyAmount: number; // Maximum tokens we can buy with available balance
  maxSellAmount: number; // Maximum tokens we can sell
  isValidAmount: boolean;
  errorMessage?: string;
  
  // Fee breakdown
  feeStructure: {
    tradingFee: number; // 0.1% trading fee
    networkFee: number; // Gas/SOL transaction fee
    totalFeeUsd: number;
    totalFeePercent: number;
  };
}

export function useTradingCalculations({
  symbol,
  side,
  orderType,
  amount,
  price,
  currentPrice
}: TradingCalculationsProps): TradingCalculations {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();
  const { data: evmBalances = [] } = useWalletBalances(evmAddress as any);
  const { balance: solBalance } = useSolBalance();
  const { cryptoPrices } = useCryptoData();

  return useMemo(() => {
    // Get real-time price data
    const tokenPrice = symbol === 'SOL' ? currentPrice : 
      cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === symbol.toUpperCase())?.price || currentPrice;
    
    const solUsdPrice = cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === 'SOL')?.price || currentPrice;
    
    // Parse amounts
    const amountNum = parseFloat(amount) || 0;
    const priceNum = orderType === 'market' ? tokenPrice : parseFloat(price) || tokenPrice;

    // Calculate available balances in USD
    const ethBalance = evmBalances.find(b => b.symbol === 'ETH');
    const ethUsdPrice = cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === 'ETH')?.price || 0;
    const availableUsdBalance = ethBalance ? parseFloat(ethBalance.balance) * ethUsdPrice : 0;
    
    const availableSolBalance = solBalance || 0;
    const availableSolUsd = availableSolBalance * solUsdPrice;
    
    // For token balance (if trading a specific token)
    const availableTokenBalance = symbol === 'SOL' ? availableSolBalance : 0; // Could be expanded for other tokens

    // Calculate estimated price and total
    const estimatedPrice = priceNum;
    const estimatedTotal = amountNum * estimatedPrice;

    // Fee calculations (realistic fee structure)
    const tradingFeePercent = 0.001; // 0.1% trading fee
    const tradingFee = estimatedTotal * tradingFeePercent;
    
    // Network fees (estimated)
    const networkFee = symbol === 'SOL' ? 
      0.000005 * solUsdPrice : // 0.000005 SOL for Solana transactions
      15 * (ethUsdPrice / 1_000_000_000_000_000_000); // ~15 gwei for ETH transactions
    
    const totalFeeUsd = tradingFee + networkFee;
    const totalFeePercent = estimatedTotal > 0 ? (totalFeeUsd / estimatedTotal) * 100 : 0;
    
    const netTotal = side === 'buy' ? 
      estimatedTotal + totalFeeUsd : 
      estimatedTotal - totalFeeUsd;

    // Calculate maximum amounts
    const maxBuyAmount = side === 'buy' ? 
      (symbol === 'SOL' ? 
        Math.max(0, (availableSolUsd - totalFeeUsd) / estimatedPrice) :
        Math.max(0, (availableUsdBalance - totalFeeUsd) / estimatedPrice)
      ) : 0;
    
    const maxSellAmount = side === 'sell' ? availableTokenBalance : 0;

    // Validation
    let isValidAmount = true;
    let errorMessage: string | undefined;

    if (amountNum <= 0) {
      isValidAmount = false;
      errorMessage = 'Amount must be greater than 0';
    } else if (side === 'buy') {
      const requiredBalance = netTotal;
      const availableBalance = symbol === 'SOL' ? availableSolUsd : availableUsdBalance;
      
      if (requiredBalance > availableBalance) {
        isValidAmount = false;
        errorMessage = `Insufficient balance. Required: $${requiredBalance.toFixed(2)}, Available: $${availableBalance.toFixed(2)}`;
      }
    } else if (side === 'sell') {
      if (amountNum > availableTokenBalance) {
        isValidAmount = false;
        errorMessage = `Insufficient ${symbol} balance. Available: ${availableTokenBalance.toFixed(6)} ${symbol}`;
      }
    }

    // Minimum order checks
    const minOrderUsd = 1; // $1 minimum order
    if (estimatedTotal < minOrderUsd) {
      isValidAmount = false;
      errorMessage = `Minimum order value is $${minOrderUsd}`;
    }

    return {
      availableUsdBalance,
      availableTokenBalance,
      availableSolBalance,
      
      estimatedPrice,
      estimatedTotal,
      estimatedFee: totalFeeUsd,
      netTotal,
      
      maxBuyAmount,
      maxSellAmount,
      isValidAmount,
      errorMessage,
      
      feeStructure: {
        tradingFee,
        networkFee,
        totalFeeUsd,
        totalFeePercent
      }
    };
  }, [
    symbol,
    side,
    orderType,
    amount,
    price,
    currentPrice,
    evmBalances,
    solBalance,
    cryptoPrices
  ]);
}