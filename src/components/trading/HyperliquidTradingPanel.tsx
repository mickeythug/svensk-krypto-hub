import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield, 
  Target,
  AlertTriangle,
  Settings,
  Plus,
  Minus,
  Info,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTradingCalculations } from '@/hooks/useTradingCalculations';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

interface HyperliquidTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  balances?: any[];
  solBalance?: number;
}

const HyperliquidTradingPanel: React.FC<HyperliquidTradingPanelProps> = ({
  symbol,
  currentPrice,
  tokenName,
  balances = [],
  solBalance = 0
}) => {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();
  
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  // Real-time trading calculations with backend data
  const calculations = useTradingCalculations({
    symbol,
    side,
    orderType,
    amount,
    price,
    currentPrice
  });

  useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatBalance = (balance: number, symbol: string) => {
    if (balance < 0.001) return `${balance.toFixed(6)} ${symbol}`;
    if (balance < 1) return `${balance.toFixed(4)} ${symbol}`;
    return `${balance.toFixed(2)} ${symbol}`;
  };

  const setPercentage = (percent: number) => {
    const maxAmount = side === 'buy' ? calculations.maxBuyAmount : calculations.maxSellAmount;
    setAmount((maxAmount * (percent / 100)).toString());
  };

  const executeOrder = async () => {
    if (!calculations.isValidAmount) return;
    
    try {
      const tradeData = {
        symbol,
        side,
        orderType,
        amount: parseFloat(amount),
        price: parseFloat(price),
        userAddress: `${publicKey?.toBase58() || evmAddress || ''}`,
        chain: symbol === 'SOL' ? 'SOL' : 'ETH',
        estimatedTotal: calculations.estimatedTotal,
        estimatedFee: calculations.estimatedFee,
        netTotal: calculations.netTotal,
        feeBreakdown: calculations.feeStructure
      };

      console.log('Executing trade with real backend:', tradeData);

      // Call the execute-trade edge function
      const response = await fetch('https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/execute-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Trade executed successfully:', result);
        // You could show a success toast here
        // Reset form
        setAmount('');
      } else {
        console.error('Trade execution failed:', result.error);
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      // You could show an error toast here
    }
  };

  return (
    <div className="h-full flex flex-col space-y-5">
      {/* Trading Panel Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Trade {symbol}</h4>
        <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50 text-gray-300">
          <Shield className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/30">
        <Button
          variant={side === 'buy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSide('buy')}
          className={`font-bold py-3 transition-all duration-200 ${
            side === 'buy' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Buy
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSide('sell')}
          className={`font-bold py-3 transition-all duration-200 ${
            side === 'sell' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Sell
        </Button>
      </div>

      {/* Order Type Selection */}
      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700/30 rounded-xl p-1">
          <TabsTrigger value="market" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:shadow-lg transition-all duration-200">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:shadow-lg transition-all duration-200">Limit</TabsTrigger>
          <TabsTrigger value="stop" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:shadow-lg transition-all duration-200">Stop</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4 mt-4">
          {/* Market Order Content */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Amount ({symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            {/* Smart Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(percent)}
                  className="text-xs font-medium bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white hover:border-gray-600 transition-all duration-200"
                >
                  {percent}%
                </Button>
              ))}
            </div>
            
            {/* Max Amount Info */}
            <div className="text-xs text-gray-400 text-center">
              Max: {side === 'buy' ? 
                `${calculations.maxBuyAmount.toFixed(6)} ${symbol}` : 
                `${calculations.maxSellAmount.toFixed(6)} ${symbol}`
              }
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-700/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Est. Price</span>
                <span className="text-white font-mono font-medium">${formatPrice(calculations.estimatedPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Est. Total</span>
                <span className="text-white font-mono font-medium">${calculations.estimatedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  Trading Fee
                  <Info className="h-3 w-3" />
                </span>
                <span className="text-white font-mono">${calculations.feeStructure.tradingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white font-mono">${calculations.feeStructure.networkFee.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4 mt-4">
          {/* Limit Order Content */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Price (USDT)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Amount ({symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            {/* Smart Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(percent)}
                  className="text-xs font-medium bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white hover:border-gray-600 transition-all duration-200"
                >
                  {percent}%
                </Button>
              ))}
            </div>
            
            {/* Max Amount Info */}
            <div className="text-xs text-gray-400 text-center">
              Max: {side === 'buy' ? 
                `${calculations.maxBuyAmount.toFixed(6)} ${symbol}` : 
                `${calculations.maxSellAmount.toFixed(6)} ${symbol}`
              }
            </div>

            {/* Advanced Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-300">Post Only</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPostOnly(!postOnly)}
                  className={`text-xs ${
                    postOnly 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-300'
                  }`}
                >
                  {postOnly ? 'ON' : 'OFF'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-300">Reduce Only</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReduceOnly(!reduceOnly)}
                  className={`text-xs ${
                    reduceOnly 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-300'
                  }`}
                >
                  {reduceOnly ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stop" className="space-y-4 mt-4">
          {/* Stop Order Content */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Stop Price (USDT)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Limit Price (USDT)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Amount ({symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>


      {/* Real-time Order Summary */}
      <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-700/20">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Available Balance</span>
          <span className="text-white font-mono font-medium">
            {side === 'buy' ? (
              symbol === 'SOL' ? 
                `${formatBalance(calculations.availableSolBalance, 'SOL')}` :
                `$${calculations.availableUsdBalance.toFixed(2)}`
            ) : (
              formatBalance(calculations.availableTokenBalance, symbol)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Est. Fee ({calculations.feeStructure.totalFeePercent.toFixed(3)}%)</span>
          <span className="text-white font-mono">${calculations.estimatedFee.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
          <span className="text-gray-300 font-medium">{side === 'buy' ? 'Total Cost' : 'You Receive'}</span>
          <span className="text-white font-mono font-bold text-lg">${calculations.netTotal.toFixed(2)}</span>
        </div>
        {!calculations.isValidAmount && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2 mt-2">
            <p className="text-red-400 text-xs">{calculations.errorMessage}</p>
          </div>
        )}
      </div>

      {/* Enhanced Execute Button */}
      <Button
        onClick={executeOrder}
        disabled={!amount || parseFloat(amount) <= 0 || !calculations.isValidAmount}
        className={`w-full font-bold py-6 text-lg transition-all duration-200 shadow-lg ${
          side === 'buy'
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-green-500/25'
            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-500/25'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
      >
        <Target className="h-5 w-5 mr-2" />
        {side === 'buy' ? 'Buy' : 'Sell'} {amount ? parseFloat(amount).toFixed(4) : '0'} {symbol}
        {calculations.netTotal > 0 && (
          <span className="ml-2 opacity-80">
            (${calculations.netTotal.toFixed(2)})
          </span>
        )}
      </Button>

      {/* Risk Warning */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <p className="font-semibold text-orange-400 mb-1">Risk Warning</p>
            <p>Trading cryptocurrencies involves substantial risk. Only trade with funds you can afford to lose.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HyperliquidTradingPanel;