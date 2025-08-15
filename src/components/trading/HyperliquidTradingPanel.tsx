import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
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
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Real wallet balance from backend
  const [balance, setBalance] = useState({
    usdt: balances.find(b => b.symbol === 'USDT')?.balance || 2450.00,
    token: balances.find(b => b.symbol === symbol)?.balance || 0.0,
    sol: solBalance
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

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0;
    const prc = parseFloat(price) || 0;
    return amt * prc;
  };

  const calculateMaxAmount = () => {
    if (side === 'buy') {
      const prc = parseFloat(price) || 1;
      return (balance.usdt / prc).toFixed(6);
    }
    return balance.token.toFixed(6);
  };

  const setPercentage = (percent: number) => {
    const maxAmount = parseFloat(calculateMaxAmount());
    setAmount((maxAmount * (percent / 100)).toString());
  };

  const executeOrder = () => {
    // Mock order execution
    console.log('Executing order:', {
      symbol,
      side,
      orderType,
      amount,
      price,
      leverage: leverage[0]
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Trading Panel Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Trade {symbol}</h4>
        <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50 text-gray-300">
          <Shield className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800/50 rounded-lg">
        <Button
          variant={side === 'buy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSide('buy')}
          className={`font-semibold ${
            side === 'buy' 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Buy
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSide('sell')}
          className={`font-semibold ${
            side === 'sell' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Sell
        </Button>
      </div>

      {/* Order Type Selection */}
      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="market" className="text-xs data-[state=active]:bg-primary">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs data-[state=active]:bg-primary">Limit</TabsTrigger>
          <TabsTrigger value="stop" className="text-xs data-[state=active]:bg-primary">Stop</TabsTrigger>
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

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(percent)}
                  className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
                >
                  {percent}%
                </Button>
              ))}
            </div>

            <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Price</span>
                <span className="text-white font-mono">${formatPrice(currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Total</span>
                <span className="text-white font-mono">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Max Slippage</span>
                <span className="text-white font-mono">{slippage}%</span>
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

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(percent)}
                  className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
                >
                  {percent}%
                </Button>
              ))}
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

      {/* Leverage Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-300">Leverage</Label>
          <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50 text-gray-300">
            {leverage[0]}x
          </Badge>
        </div>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-800/30 rounded-lg p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Available Balance</span>
          <span className="text-white font-mono">
            {side === 'buy' ? `$${balance.usdt.toFixed(2)}` : `${balance.token.toFixed(6)} ${symbol}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Est. Fee</span>
          <span className="text-white font-mono">$0.12</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-300">Total</span>
          <span className="text-white font-mono">${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Execute Button */}
      <Button
        onClick={executeOrder}
        disabled={!amount}
        className={`w-full font-semibold py-6 text-lg ${
          side === 'buy'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        <Target className="h-5 w-5 mr-2" />
        {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
      </Button>

      {/* Risk Warning */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-300">
            <p className="font-medium text-orange-400 mb-1">Risk Warning</p>
            <p>Trading cryptocurrencies involves substantial risk and may result in significant losses.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HyperliquidTradingPanel;