import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Settings,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  volume24h?: number;
  priceChange24h?: number;
}

const SimpleTradingPanel: React.FC<SimpleTradingPanelProps> = ({ 
  symbol, 
  currentPrice, 
  tokenName, 
  volume24h = 0, 
  priceChange24h = 0 
}) => {
  const { t } = useLanguage();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [slippage, setSlippage] = useState([0.5]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const quickAmounts = ['25%', '50%', '75%', '100%'];

  return (
    <Card className="p-6 bg-gray-900/95 border-gray-800/50 backdrop-blur-sm">
      {/* Token Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{symbol}</h3>
            <Badge 
              variant={priceChange24h >= 0 ? "default" : "destructive"}
              className="px-2 py-1 text-xs"
            >
              {priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-white">
            ${formatPrice(currentPrice)}
          </div>
          <div className="text-sm text-gray-400">
            Vol: {formatVolume(volume24h)}
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Button
          variant={side === 'buy' ? 'default' : 'outline'}
          onClick={() => setSide('buy')}
          className={`h-12 text-base font-semibold transition-all ${
            side === 'buy' 
              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0 shadow-lg shadow-green-500/25' 
              : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          {t('trading.buy')}
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'outline'}
          onClick={() => setSide('sell')}
          className={`h-12 text-base font-semibold transition-all ${
            side === 'sell' 
              ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0 shadow-lg shadow-red-500/25' 
              : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <TrendingDown className="h-5 w-5 mr-2" />
          {t('trading.sell')}
        </Button>
      </div>

      {/* Order Type */}
      <div className="mb-6">
        <Label className="text-gray-300 mb-2 block text-sm font-medium">
          {t('trading.orderType')}
        </Label>
        <Select value={orderType} onValueChange={setOrderType}>
          <SelectTrigger className="h-12 bg-gray-800/50 border-gray-700/50 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="market" className="text-white hover:bg-gray-700">
              {t('trading.market')}
            </SelectItem>
            <SelectItem value="limit" className="text-white hover:bg-gray-700">
              {t('trading.limit')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <Label className="text-gray-300 mb-2 block text-sm font-medium">
          {t('trading.amount')} (USDT)
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 bg-gray-800/50 border-gray-700/50 text-white text-lg font-mono placeholder:text-gray-500"
        />
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {quickAmounts.map((pct) => (
          <Button
            key={pct}
            variant="outline"
            size="sm"
            className="h-10 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => {
              // Calculate percentage of available balance
              const percentage = parseInt(pct) / 100;
              // For demo, use $1000 as available balance
              const availableBalance = 1000;
              setAmount((availableBalance * percentage).toString());
            }}
          >
            {pct}
          </Button>
        ))}
      </div>

      {/* Limit Price (if limit order) */}
      {orderType === 'limit' && (
        <div className="mb-6">
          <Label className="text-gray-300 mb-2 block text-sm font-medium">
            {t('trading.price')} (USDT)
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-12 bg-gray-800/50 border-gray-700/50 text-white text-lg font-mono placeholder:text-gray-500"
          />
        </div>
      )}

      {/* Slippage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-gray-300 text-sm font-medium">
            {t('trading.slippage')}
          </Label>
          <span className="text-primary font-mono text-sm">
            {slippage[0]}%
          </span>
        </div>
        <Slider
          value={slippage}
          onValueChange={setSlippage}
          max={5}
          min={0.1}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1%</span>
          <span>5%</span>
        </div>
      </div>

      {/* Trade Button */}
      <Button
        className={`w-full h-14 text-lg font-bold transition-all shadow-lg ${
          side === 'buy' 
            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-500/25' 
            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-500/25'
        }`}
      >
        <Zap className="h-5 w-5 mr-2" />
        {side === 'buy' ? t('trading.buyNow') : t('trading.sellNow')} {symbol}
      </Button>

      {/* Trade Summary */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>{t('trading.estimatedFee')}:</span>
            <span className="text-white">~$2.50</span>
          </div>
          <div className="flex justify-between">
            <span>{t('trading.totalCost')}:</span>
            <span className="text-white font-mono">
              ${amount ? (parseFloat(amount) + 2.5).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimpleTradingPanel;