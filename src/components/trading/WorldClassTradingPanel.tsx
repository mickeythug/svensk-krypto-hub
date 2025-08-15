import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Edit } from 'lucide-react';

interface WorldClassTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  volume24h?: number;
  priceChange24h?: number;
}

const WorldClassTradingPanel: React.FC<WorldClassTradingPanelProps> = ({
  symbol,
  currentPrice,
  tokenName,
  volume24h = 28800,
  priceChange24h = 64.77
}) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Adv'>('Market');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(20);
  const [aiDeployment, setAiDeployment] = useState(false);
  const [advancedTrading, setAdvancedTrading] = useState(false);

  const quickAmounts = ['0.01', '0.1', '1', '10'];

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(3);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  return (
    <Card className="bg-[#0A0B0F] border-gray-800 p-4 space-y-4 text-white font-medium">
      {/* Token Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{symbol}</span>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </Badge>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs">Price</div>
            <div className="text-white font-mono">${formatPrice(currentPrice)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Liquidity</div>
            <div className="text-white font-mono">{formatVolume(volume24h)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Supply</div>
            <div className="text-white font-mono">1B</div>
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setSide('buy')}
          className={`h-10 font-semibold ${
            side === 'buy'
              ? 'bg-[#6366F1] hover:bg-[#5B5CF1] text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          Buy
        </Button>
        <Button
          onClick={() => setSide('sell')}
          className={`h-10 font-semibold ${
            side === 'sell'
              ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          Sell
        </Button>
      </div>

      {/* Order Type Toggle */}
      <div className="flex bg-gray-800 rounded-lg p-1">
        {['Market', 'Limit', 'Adv'].map((type) => (
          <Button
            key={type}
            onClick={() => setOrderType(type as any)}
            variant="ghost"
            className={`flex-1 h-8 text-sm ${
              orderType === type
                ? 'bg-[#6366F1] text-white hover:bg-[#5B5CF1]'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {type}
          </Button>
        ))}
        <div className="flex items-center ml-2 text-xs text-gray-400">
          <Switch className="h-4 w-4" />
          <span className="ml-1">145</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="number"
            placeholder="AMOUNT 0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12 text-center font-mono text-lg focus:border-[#6366F1] focus:ring-[#6366F1]"
          />
          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              onClick={() => setAmount(quickAmount)}
              variant="outline"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white h-8 text-sm"
            >
              {quickAmount}
            </Button>
          ))}
        </div>
      </div>

      {/* Slippage */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[#6366F1] text-sm font-medium">%</span>
          <span className="text-sm text-gray-300">Slippage</span>
          <span className="text-sm text-white font-medium">{slippage}%</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-2">
          <input
            type="range"
            min="1"
            max="50"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${(slippage / 50) * 100}%, #374151 ${(slippage / 50) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>

      {/* AI Deployment Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#6366F1] text-sm">🤖</span>
          <span className="text-sm text-gray-300">AI Deployment</span>
        </div>
        <Switch
          checked={aiDeployment}
          onCheckedChange={setAiDeployment}
          className="data-[state=checked]:bg-[#6366F1]"
        />
      </div>

      {/* Advanced Trading Strategies */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={advancedTrading}
          onChange={(e) => setAdvancedTrading(e.target.checked)}
          className="mt-1 rounded border-gray-600 bg-gray-800 text-[#6366F1] focus:ring-[#6366F1]"
        />
        <div className="text-sm">
          <div className="text-gray-300">⚠️ 0.00%</div>
          <div className="text-xs text-gray-400">
            ⚠️ Advanced Trading Strategies
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <Button
        className={`w-full h-12 font-bold text-lg ${
          side === 'buy'
            ? 'bg-[#6366F1] hover:bg-[#5B5CF1] text-white'
            : 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
        }`}
        disabled={!amount}
      >
        ⚡ {side === 'buy' ? 'Buy' : 'Sell'}
      </Button>

      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #6366F1;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #6366F1;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
          }
        `
      }} />
    </Card>
  );
};

export default WorldClassTradingPanel;