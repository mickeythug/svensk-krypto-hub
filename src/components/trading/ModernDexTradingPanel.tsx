import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Info,
  Zap,
  AlertTriangle,
  Wallet,
  Heart,
  Target
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';

interface ModernDexTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  crypto?: any;
}

const ModernDexTradingPanel: React.FC<ModernDexTradingPanelProps> = ({
  symbol,
  currentPrice,
  tokenName,
  crypto
}) => {
  const { connected } = useWallet();
  const { fullyAuthed } = useWalletAuthStatus();
  const { isAuthenticated: supabaseAuthed } = useSupabaseAuth();
  const { t } = useLanguage();

  // States for DEX trading
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState([0.5]);
  const [tip, setTip] = useState([0]);
  const [customSlippage, setCustomSlippage] = useState('');
  const [customTip, setCustomTip] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Combined authentication status
  const isFullyAuthenticated = fullyAuthed && supabaseAuthed;

  // Predefined slippage and tip options
  const slippagePresets = [0.1, 0.5, 1.0];
  const tipPresets = [0, 0.01, 0.05, 0.1];

  // Mock balances - replace with real data
  const mockBalances = {
    sol: 2.5,
    usdc: 1250.00,
    [symbol.toLowerCase()]: 0.0
  };

  // Calculate total and fees
  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceWithSlippage = side === 'buy' 
      ? currentPrice * (1 + slippage[0] / 100)
      : currentPrice * (1 - slippage[0] / 100);
    const subtotal = amountNum * priceWithSlippage;
    const tipAmount = subtotal * (tip[0] / 100);
    return subtotal + tipAmount;
  };

  const setQuickPercentage = (percent: number) => {
    const maxAmount = side === 'buy' 
      ? mockBalances.usdc / currentPrice 
      : mockBalances[symbol.toLowerCase()];
    const calculatedAmount = (maxAmount * percent) / 100;
    setAmount(calculatedAmount.toFixed(6));
  };

  const handleTrade = async () => {
    if (!isFullyAuthenticated) return;
    
    console.log('Executing DEX trade:', {
      symbol,
      side,
      amount: parseFloat(amount),
      currentPrice,
      slippage: slippage[0],
      tip: tip[0],
      total: calculateTotal()
    });
    
    // Reset form after successful trade
    setAmount('');
  };

  return (
    <div className="h-full flex flex-col space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Trading Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{t('trading.trade')} {symbol}</h3>
          <p className="text-sm text-gray-400">{t('trading.currentPrice')}: ${currentPrice.toFixed(6)}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-gray-800/50 rounded-xl">
        <Button
          variant={side === 'buy' ? 'default' : 'ghost'}
          onClick={() => setSide('buy')}
          className={`font-bold py-4 text-lg transition-all duration-200 ${
            side === 'buy' 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          {t('trading.buy')}
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'ghost'}
          onClick={() => setSide('sell')}
          className={`font-bold py-4 text-lg transition-all duration-200 ${
            side === 'sell' 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <TrendingDown className="h-5 w-5 mr-2" />
          {t('trading.sell')}
        </Button>
      </div>

      {/* Amount Input */}
      <Card className="p-4 bg-gray-800/30 border-gray-700/30">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">
              {t('trading.amount')} ({symbol})
            </Label>
            <Input
              type="number"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-900/50 border-gray-600/50 text-white text-lg font-mono h-12"
            />
          </div>

          {/* Quick Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                onClick={() => setQuickPercentage(percent)}
                className="bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70 hover:text-white font-medium"
              >
                {percent}%
              </Button>
            ))}
          </div>

          {/* Available Balance */}
          <div className="text-sm text-gray-400 text-center">
            {t('trading.available')}: {
              side === 'buy' 
                ? `$${mockBalances.usdc.toFixed(2)} USDC`
                : `${mockBalances[symbol.toLowerCase()].toFixed(6)} ${symbol}`
            }
          </div>
        </div>
      </Card>

      {/* Slippage Settings */}
      <Card className="p-4 bg-gray-800/30 border-gray-700/30">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            <Label className="text-sm font-medium text-gray-300">
              {t('trading.slippage')}: {slippage[0]}%
            </Label>
            <div className="ml-auto">
              <Info className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Preset Slippage Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {slippagePresets.map((preset) => (
              <Button
                key={preset}
                variant={slippage[0] === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippage([preset])}
                className={`font-medium ${
                  slippage[0] === preset 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
                }`}
              >
                {preset}%
              </Button>
            ))}
          </div>

          {/* Custom Slippage */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom %"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value);
                if (e.target.value) {
                  setSlippage([parseFloat(e.target.value)]);
                }
              }}
              className="bg-gray-900/50 border-gray-600/50 text-white text-sm"
            />
          </div>

          {/* Slippage Slider */}
          <div className="px-2">
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
        </div>
      </Card>

      {/* MEV Protection Tip */}
      <Card className="p-4 bg-gray-800/30 border-gray-700/30">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-gray-400" />
            <Label className="text-sm font-medium text-gray-300">
              {t('trading.tip')}: {tip[0]}%
            </Label>
            <div className="ml-auto">
              <Info className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Preset Tip Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {tipPresets.map((preset) => (
              <Button
                key={preset}
                variant={tip[0] === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setTip([preset])}
                className={`font-medium ${
                  tip[0] === preset 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
                }`}
              >
                {preset}%
              </Button>
            ))}
          </div>

          {/* Custom Tip */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom %"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                if (e.target.value) {
                  setTip([parseFloat(e.target.value)]);
                }
              }}
              className="bg-gray-900/50 border-gray-600/50 text-white text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="p-4 bg-gray-800/30 border-gray-700/30">
        <div className="space-y-3">
          <h4 className="font-semibold text-white">{t('trading.orderSummary')}</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{t('trading.amount')}:</span>
              <span className="text-white font-mono">
                {amount || '0'} {symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('trading.estimatedPrice')}:</span>
              <span className="text-white font-mono">
                ${(currentPrice * (1 + (side === 'buy' ? slippage[0] : -slippage[0]) / 100)).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('trading.slippage')}:</span>
              <span className="text-white font-mono">{slippage[0]}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('trading.tip')}:</span>
              <span className="text-white font-mono">{tip[0]}%</span>
            </div>
            <div className="border-t border-gray-600/50 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-300">{t('trading.total')}:</span>
                <span className="text-white font-mono text-lg">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Execute Button or Connect Wallet */}
      {!isFullyAuthenticated ? (
        <div className="space-y-3">
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">
              {t('trading.connectWalletMessage')}
            </p>
          </div>
          <ConnectWalletButton />
        </div>
      ) : (
        <Button
          onClick={handleTrade}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full font-bold py-6 text-xl transition-all duration-200 shadow-lg ${
            side === 'buy'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Zap className="h-5 w-5 mr-2" />
          {side === 'buy' ? t('trading.buy') : t('trading.sell')} {symbol}
        </Button>
      )}

      {/* Trading Warning */}
      <Card className="p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-amber-400">
              {t('trading.tradingWarning')}
            </h4>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              {t('trading.tradingWarningText')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernDexTradingPanel;