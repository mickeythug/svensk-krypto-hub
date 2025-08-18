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
  const [amount, setAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
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

        {/* Simplified Buy/Sell Toggle */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setTradeType('buy')}
              className={`h-16 text-xl font-bold rounded-2xl transition-all ${
                tradeType === 'buy'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 border border-gray-700'
              }`}
            >
              BUY
            </Button>
            <Button
              onClick={() => setTradeType('sell')}
              className={`h-16 text-xl font-bold rounded-2xl transition-all ${
                tradeType === 'sell'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 border border-gray-700'
              }`}
            >
              SELL
            </Button>
          </div>
        </div>

        {/* Simple Amount Input */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-semibold text-white">
              Amount ({tradeType === 'buy' ? 'SOL' : tokenSymbol})
            </Label>
            <Badge variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-600 px-3 py-1">
              Balance: {tradeType === 'buy' ? '2.45 SOL' : '1.2M ' + tokenSymbol}
            </Badge>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="bg-gray-900/70 border-gray-700 text-2xl font-mono h-16 rounded-xl text-white placeholder:text-gray-500"
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {quickAmounts.map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(value)}
                className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/70 text-sm font-medium px-4 py-2 rounded-lg"
              >
                {tradeType === 'buy' ? `${value} SOL` : `${value}%`}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Settings - Collapsible */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-800/50 mb-4"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Settings</span>
            </div>
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </Button>
          
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 bg-gray-900/30 p-4 rounded-xl border border-gray-800"
            >
              {/* Order Type */}
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">Order Type</Label>
                <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                    <TabsTrigger value="market" className="data-[state=active]:bg-primary">Market</TabsTrigger>
                    <TabsTrigger value="limit" className="data-[state=active]:bg-primary">Limit</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Limit Price (if limit order) */}
              {orderType === 'limit' && (
                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Limit Price (USD)
                  </Label>
                  <Input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={currentPrice.toFixed(6)}
                    className="bg-gray-800 border-gray-700 text-lg font-mono h-10"
                  />
                </div>
              )}

              {/* Slippage */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Slippage Tolerance</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-sm h-10"
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
                  <Label className="text-sm text-gray-300">MEV Protection</Label>
                </div>
                <Switch checked={mevProtection} onCheckedChange={setMevProtection} />
              </div>

              {/* Priority Fee */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Priority Fee</Label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-gray-800 rounded-lg border border-gray-700">
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
            </motion.div>
          )}
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
          className={`w-full h-20 text-2xl font-bold rounded-2xl transition-all ${
            tradeType === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl shadow-green-500/30'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTrading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>PROCESSING...</span>
            </div>
          ) : (
            <span className="uppercase tracking-wide">
              {tradeType === 'buy' ? 'BUY' : 'SELL'} {tokenSymbol} NOW
            </span>
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