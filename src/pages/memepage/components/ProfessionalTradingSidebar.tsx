import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, TrendingUp, TrendingDown, Settings, Shield, 
  Zap, Target, Clock, DollarSign, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ProfessionalTradingSidebarProps {
  tokenSymbol: string;
  currentPrice: number;
  onTrade: (type: 'buy' | 'sell', amount: string) => void;
  isTrading: boolean;
}

export const ProfessionalTradingSidebar: React.FC<ProfessionalTradingSidebarProps> = ({
  tokenSymbol,
  currentPrice,
  onTrade,
  isTrading
}) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [mevProtection, setMevProtection] = useState(true);
  const [priorityFee, setPriorityFee] = useState('medium');

  const quickAmounts = tradeType === 'buy' 
    ? [0.1, 0.5, 1, 2, 5] 
    : [25, 50, 75, 100];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    if (tradeType === 'buy') {
      return amountNum; // SOL amount
    } else {
      return amountNum * currentPrice; // Token amount * price
    }
  };

  const getFeeEstimate = () => {
    const fees = {
      low: '~0.0001 SOL',
      medium: '~0.0005 SOL',
      high: '~0.001 SOL'
    };
    return fees[priorityFee as keyof typeof fees] || fees.medium;
  };

  return (
    <div className="w-96 h-screen bg-gradient-surface border-l border-gray-800 sticky top-0">
      <div className="p-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {/* Trading Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Trade {tokenSymbol}</h2>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ${currentPrice.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'ghost'}
              onClick={() => setTradeType('buy')}
              className={`${
                tradeType === 'buy'
                  ? 'bg-success hover:bg-success/90 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'ghost'}
              onClick={() => setTradeType('sell')}
              className={`${
                tradeType === 'sell'
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </Button>
          </div>
        </div>

        {/* Order Type */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-foreground mb-3 block">Order Type</Label>
          <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
              <TabsTrigger value="market" className="data-[state=active]:bg-primary">Market</TabsTrigger>
              <TabsTrigger value="limit" className="data-[state=active]:bg-primary">Limit</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground">
              Amount ({tradeType === 'buy' ? 'SOL' : tokenSymbol})
            </Label>
            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
              Balance: {tradeType === 'buy' ? '2.45 SOL' : '1.2M ' + tokenSymbol}
            </Badge>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-gray-900 border-gray-800 text-lg font-mono h-12"
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickAmounts.map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(value)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-xs"
              >
                {tradeType === 'buy' ? `${value} SOL` : `${value}%`}
              </Button>
            ))}
          </div>
        </div>

        {/* Limit Price (if limit order) */}
        {orderType === 'limit' && (
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Limit Price (USD)
            </Label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice.toFixed(6)}
              className="bg-gray-900 border-gray-800 text-lg font-mono h-12"
            />
          </div>
        )}

        <Separator className="my-6 bg-gray-800" />

        {/* Advanced Settings */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <Label className="text-sm font-medium text-foreground">Advanced Settings</Label>
          </div>
          
          <div className="space-y-4">
            {/* Slippage */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Slippage Tolerance</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-sm h-10"
                />
                <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 px-3">
                  %
                </Badge>
              </div>
            </div>

            {/* MEV Protection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <Label className="text-xs text-muted-foreground">MEV Protection</Label>
              </div>
              <Switch checked={mevProtection} onCheckedChange={setMevProtection} />
            </div>

            {/* Priority Fee */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Priority Fee</Label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800">
                {['low', 'medium', 'high'].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setPriorityFee(fee)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      priorityFee === fee
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {fee.charAt(0).toUpperCase() + fee.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-6 bg-gray-900 border-gray-800">
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono text-foreground">
                  {calculateTotal().toFixed(4)} {tradeType === 'buy' ? 'SOL' : 'USD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Fee</span>
                <span className="font-mono text-foreground">{getFeeEstimate()}</span>
              </div>
              {orderType === 'market' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Execution</span>
                  <span className="font-mono text-success">~3-5 sec</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Execute Trade Button */}
        <Button
          onClick={() => onTrade(tradeType, amount)}
          disabled={!amount || parseFloat(amount) <= 0 || isTrading}
          className={`w-full h-14 text-lg font-semibold ${
            tradeType === 'buy'
              ? 'bg-success hover:bg-success/90 text-white'
              : 'bg-destructive hover:bg-destructive/90 text-white'
          }`}
        >
          {isTrading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {tradeType === 'buy' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {tokenSymbol}
            </div>
          )}
        </Button>

        {/* Risk Warning */}
        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning">
              Trading cryptocurrencies involves substantial risk. Only trade with funds you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};