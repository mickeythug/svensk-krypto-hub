import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernToggle } from '@/components/ui/modern-toggle';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Settings, Info, TrendingUp } from 'lucide-react';

interface ModernTradingPanelProps {
  symbol: string;
  currentPrice?: number;
  tokenName?: string;
  balances?: any;
  solBalance?: number;
}

const ModernTradingPanel: React.FC<ModernTradingPanelProps> = ({
  symbol,
  currentPrice = 0,
  tokenName,
  balances,
  solBalance = 0
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'advanced'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [slippage, setSlippage] = useState(20);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [advancedStrategy, setAdvancedStrategy] = useState(false);

  const quickAmounts = ['0.01', '0.1', '1', '10'];
  const slippagePresets = [0.1, 0.5, 1.0, 'Custom'];

  return (
    <GlassCard className="h-full flex flex-col" glow>
      {/* Header with Token Info */}
      <div className="p-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {symbol?.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{symbol}</h3>
              <p className="text-xs text-white/60">{tokenName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-white">
              ${currentPrice.toFixed(6)}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.45%
            </div>
          </div>
        </div>

        {/* Price, Liquidity, Supply, 24h Volume */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xs text-white/40">Price</div>
            <div className="text-xs font-mono text-white">$0.005</div>
          </div>
          <div>
            <div className="text-xs text-white/40">Liquidity</div>
            <div className="text-xs font-mono text-emerald-400">$28.6K</div>
          </div>
          <div>
            <div className="text-xs text-white/40">Supply</div>
            <div className="text-xs font-mono text-white">1B</div>
          </div>
          <div>
            <div className="text-xs text-white/40">24h Vol</div>
            <div className="text-xs font-mono text-primary">$4.71%</div>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="flex-1 p-4 space-y-4">
        {/* Buy/Sell Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl">
          <button
            onClick={() => setActiveTab('buy')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300",
              activeTab === 'buy'
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300",
              activeTab === 'sell'
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            Sell
          </button>
        </div>

        {/* Order Type Selector */}
        <div className="flex gap-1 text-xs">
          {['Market', 'Limit', 'Adv.'].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type.toLowerCase() as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all duration-300",
                orderType === type.toLowerCase()
                  ? "bg-primary/30 text-primary border border-primary/30"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
              )}
            >
              {type}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <ModernToggle />
            <span className="text-xs text-white/60">AI</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs text-white/60 font-medium">AMOUNT 0.0</label>
          <ModernInput
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className="flex-1 py-1.5 px-3 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-white/70 hover:text-white transition-all duration-300"
              >
                {amt}
              </button>
            ))}
            <button className="p-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg transition-all duration-300">
              <Settings className="w-3 h-3 text-white/70" />
            </button>
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">% Slippage</span>
            <span className="text-xs text-primary font-mono">{slippage}%</span>
          </div>
          
          {/* Slippage Slider */}
          <div className="px-2">
            <Slider
              value={[slippage]}
              onValueChange={(value) => setSlippage(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* AI Optimized & Advanced Strategy Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">AI Optimized</span>
                <Info className="w-3 h-3 text-white/40" />
              </div>
              <ModernToggle
                checked={aiOptimized}
                onCheckedChange={setAiOptimized}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Advanced Trading Strategy</span>
              <ModernToggle
                checked={advancedStrategy}
                onCheckedChange={setAdvancedStrategy}
              />
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <ModernButton
          variant={activeTab === 'buy' ? 'buy' : 'sell'}
          size="lg"
          className="w-full"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {activeTab === 'buy' ? 'Buy' : 'Sell'}
        </ModernButton>

        {/* Stats Bottom */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/[0.05]">
          <div className="text-center">
            <div className="text-xs text-white/40">Bought</div>
            <div className="text-xs font-mono text-emerald-400">$0</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40">Sold</div>
            <div className="text-xs font-mono text-red-400">$0</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40">Holding</div>
            <div className="text-xs font-mono text-white">$0</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40">PnL</div>
            <div className="text-xs font-mono text-emerald-400">+1</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ModernTradingPanel;