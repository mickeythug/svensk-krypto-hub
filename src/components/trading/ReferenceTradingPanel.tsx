import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit } from 'lucide-react';

interface ReferenceTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  volume24h?: number;
  priceChange24h?: number;
}

const ReferenceTradingPanel: React.FC<ReferenceTradingPanelProps> = ({
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

  return (
    <Card className="bg-[#0A0B0F] border-gray-800 p-4 space-y-4 text-white">
      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setSide('buy')}
          className={`h-10 font-semibold transition-all ${
            side === 'buy'
              ? 'bg-[#7B3FF2] hover:bg-[#6B2FE2] text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          Buy
        </Button>
        <Button
          onClick={() => setSide('sell')}
          className={`h-10 font-semibold transition-all ${
            side === 'sell'
              ? 'bg-[#FF3B5C] hover:bg-[#EF2B4C] text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          Sell
        </Button>
      </div>

      {/* Order Type Toggle */}
      <div className="flex bg-gray-800 rounded-lg p-1 items-center">
        {['Market', 'Limit', 'Adv'].map((type) => (
          <Button
            key={type}
            onClick={() => setOrderType(type as any)}
            variant="ghost"
            size="sm"
            className={`flex-1 h-8 text-sm transition-all ${
              orderType === type
                ? 'bg-[#7B3FF2] text-white hover:bg-[#6B2FE2]'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {type}
          </Button>
        ))}
        
        {/* 145 Toggle */}
        <div className="flex items-center ml-3 text-xs text-gray-400">
          <Switch 
            checked={false}
            className="h-4 w-6 data-[state=checked]:bg-[#7B3FF2]"
          />
          <span className="ml-1">145</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="AMOUNT 0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12 text-center font-mono text-lg focus:border-[#7B3FF2] focus:ring-[#7B3FF2] pr-10"
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
              size="sm"
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
          <span className="text-[#7B3FF2] text-sm font-medium">%</span>
          <span className="text-sm text-gray-300">Slippage</span>
          <span className="text-sm text-white font-medium">{slippage}%</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="50"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7B3FF2 0%, #7B3FF2 ${(slippage / 50) * 100}%, #374151 ${(slippage / 50) * 100}%, #374151 100%)`
            }}
          />
        </div>
        
        {/* AI Deployment Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#7B3FF2] text-sm">⚡</span>
            <span className="text-sm text-gray-300">AI Deployment</span>
          </div>
          <Switch
            checked={aiDeployment}
            onCheckedChange={setAiDeployment}
            className="data-[state=checked]:bg-[#7B3FF2]"
          />
        </div>
      </div>

      {/* 0.001 Section */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className="rounded border-gray-600 bg-gray-800 text-[#7B3FF2] focus:ring-[#7B3FF2]"
        />
        <span className="text-sm text-gray-300">0.001</span>
        <span className="text-xs text-yellow-400">⚠️</span>
        <span className="text-xs text-gray-400">0.001 ⚠️</span>
      </div>

      {/* Advanced Trading Strategies */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={advancedTrading}
          onChange={(e) => setAdvancedTrading(e.target.checked)}
          className="rounded border-gray-600 bg-gray-800 text-[#7B3FF2] focus:ring-[#7B3FF2]"
        />
        <span className="text-sm text-gray-300">Advanced Trading Strategies</span>
      </div>

      {/* Buy Button */}
      <Button
        className={`w-full h-12 font-bold text-lg transition-all ${
          side === 'buy'
            ? 'bg-gradient-to-r from-[#7B3FF2] to-[#9D5FFE] hover:from-[#6B2FE2] hover:to-[#8D4FEE] text-white shadow-lg shadow-purple-500/30'
            : 'bg-gradient-to-r from-[#FF3B5C] to-[#FF5B7C] hover:from-[#EF2B4C] hover:to-[#EF4B6C] text-white shadow-lg shadow-red-500/30'
        }`}
        disabled={!amount}
      >
        ⚡ {side === 'buy' ? 'Buy' : 'Sell'}
      </Button>

      <style dangerouslySetInnerHTML={{
        __html: `
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #7B3FF2;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(123, 63, 242, 0.3);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #7B3FF2;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(123, 63, 242, 0.3);
          }
        `
      }} />
    </Card>
  );
};

export default ReferenceTradingPanel;