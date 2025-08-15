import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Settings,
  Wallet,
  BarChart3,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Activity,
  TrendingUpIcon,
  Calculator,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ComprehensiveTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  volume24h?: number;
  priceChange24h?: number;
}

const ComprehensiveTradingPanel: React.FC<ComprehensiveTradingPanelProps> = ({ 
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
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [autoTrade, setAutoTrade] = useState(false);

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
  const leverageOptions = [1, 2, 5, 10, 20];

  const calculateTotal = () => {
    const amountValue = parseFloat(amount) || 0;
    const priceValue = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    return amountValue * priceValue;
  };

  const calculatePnL = () => {
    const total = calculateTotal();
    const leverageValue = leverage[0];
    return total * leverageValue * 0.1; // Example calculation
  };

  return (
    <div className="h-[500px] p-6 bg-gray-900/95 border-gray-800/50 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-8 h-full">
        
        {/* Left Column - Order Entry */}
        <div className="space-y-6">
          {/* Token Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-white">{symbol}</h3>
              <Badge 
                variant={priceChange24h >= 0 ? "default" : "destructive"}
                className="px-3 py-1 text-sm"
              >
                {priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-white">
                ${formatPrice(currentPrice)}
              </div>
              <div className="text-sm text-gray-400">
                Vol: {formatVolume(volume24h)}
              </div>
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={side === 'buy' ? 'default' : 'outline'}
              onClick={() => setSide('buy')}
              className={`h-16 text-lg font-bold transition-all ${
                side === 'buy' 
                  ? 'bg-gradient-to-br from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0 shadow-xl shadow-green-500/30' 
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <TrendingUp className="h-6 w-6 mr-3" />
              <div>
                <div>{t('trading.buy')}</div>
                <div className="text-xs opacity-80">Long Position</div>
              </div>
            </Button>
            <Button
              variant={side === 'sell' ? 'default' : 'outline'}
              onClick={() => setSide('sell')}
              className={`h-16 text-lg font-bold transition-all ${
                side === 'sell' 
                  ? 'bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0 shadow-xl shadow-red-500/30' 
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <TrendingDown className="h-6 w-6 mr-3" />
              <div>
                <div>{t('trading.sell')}</div>
                <div className="text-xs opacity-80">Short Position</div>
              </div>
            </Button>
          </div>

          {/* Order Type & Advanced Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block text-sm font-medium">
                {t('trading.orderType')}
              </Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="h-12 bg-gray-800/50 border-gray-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="market" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {t('trading.market')}
                    </div>
                  </SelectItem>
                  <SelectItem value="limit" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('trading.limit')}
                    </div>
                  </SelectItem>
                  <SelectItem value="stop" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Stop Loss
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                <Switch
                  checked={advancedMode}
                  onCheckedChange={setAdvancedMode}
                  className="data-[state=checked]:bg-primary"
                />
                <Label className="text-gray-300 text-sm">
                  Advanced Mode
                </Label>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Label className="text-gray-300 mb-2 block text-sm font-medium">
              {t('trading.amount')} (USDT)
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 bg-gray-800/50 border-gray-700/50 text-white text-xl font-mono placeholder:text-gray-500"
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  className="h-10 bg-gray-800/30 border-gray-700/30 text-gray-300 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    const percentage = parseInt(pct) / 100;
                    const availableBalance = 1000;
                    setAmount((availableBalance * percentage).toString());
                  }}
                >
                  {pct}
                </Button>
              ))}
            </div>
          </div>

          {/* Leverage Slider */}
          {advancedMode && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-300 text-sm font-medium">
                  Leverage
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-lg font-bold">
                    {leverage[0]}x
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Max: 20x
                  </Badge>
                </div>
              </div>
              <Slider
                value={leverage}
                onValueChange={setLeverage}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {leverageOptions.map(lev => (
                  <span key={lev}>{lev}x</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Price & Risk Management */}
        <div className="space-y-6">
          {/* Price Input (if limit order) */}
          {orderType === 'limit' && (
            <div>
              <Label className="text-gray-300 mb-2 block text-sm font-medium">
                {t('trading.price')} (USDT)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-14 bg-gray-800/50 border-gray-700/50 text-white text-xl font-mono placeholder:text-gray-500"
              />
            </div>
          )}

          {/* Stop Loss & Take Profit */}
          {advancedMode && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-2 block text-sm font-medium">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Stop Loss (USDT)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="h-12 bg-red-900/20 border-red-700/50 text-white font-mono placeholder:text-gray-500"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block text-sm font-medium">
                  <Target className="h-4 w-4 inline mr-1" />
                  Take Profit (USDT)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="h-12 bg-green-900/20 border-green-700/50 text-white font-mono placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          {/* Slippage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 text-sm font-medium">
                <Percent className="h-4 w-4 inline mr-1" />
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
              <span>2.5%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Auto Trading */}
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <Label className="text-gray-300 font-medium">Auto Trading</Label>
              </div>
              <Switch
                checked={autoTrade}
                onCheckedChange={setAutoTrade}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <p className="text-xs text-gray-400">
              Enable AI-powered automatic trading based on market conditions
            </p>
          </div>
        </div>

        {/* Right Column - Order Summary & Execute */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Order Summary
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Type:</span>
                <span className="text-white capitalize font-mono">{orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Side:</span>
                <span className={`font-semibold ${side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-mono">{amount || '0.00'} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-mono">
                  ${orderType === 'market' ? formatPrice(currentPrice) : (price || '0.00')}
                </span>
              </div>
              {advancedMode && leverage[0] > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Leverage:</span>
                  <span className="text-primary font-mono font-bold">{leverage[0]}x</span>
                </div>
              )}
              
              <Separator className="bg-gray-700/50" />
              
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Fee:</span>
                <span className="text-white font-mono">$2.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost:</span>
                <span className="text-white font-mono font-semibold">
                  ${amount ? (calculateTotal() + 2.5).toFixed(2) : '0.00'}
                </span>
              </div>
              
              {advancedMode && leverage[0] > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential PnL:</span>
                  <span className="text-green-400 font-mono">
                    ${calculatePnL().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Risk Warning */}
          {advancedMode && leverage[0] > 5 && (
            <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="text-orange-400 font-semibold">High Risk Warning</span>
              </div>
              <p className="text-xs text-orange-300">
                Trading with high leverage ({leverage[0]}x) involves significant risk. 
                You could lose more than your initial investment.
              </p>
            </div>
          )}

          {/* Execute Button */}
          <Button
            className={`w-full h-20 text-xl font-bold transition-all shadow-2xl ${
              side === 'buy' 
                ? 'bg-gradient-to-br from-green-600 via-green-500 to-green-400 hover:from-green-700 hover:via-green-600 hover:to-green-500 shadow-green-500/30' 
                : 'bg-gradient-to-br from-red-600 via-red-500 to-red-400 hover:from-red-700 hover:via-red-600 hover:to-red-500 shadow-red-500/30'
            }`}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <div>
                <div>{side === 'buy' ? t('trading.buyNow') : t('trading.sellNow')} {symbol}</div>
                <div className="text-sm opacity-90">
                  {orderType === 'market' ? 'Instant Execution' : 'Place Order'}
                </div>
              </div>
            </div>
          </Button>

          {/* Account Balance Info */}
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <h5 className="text-sm font-semibold text-gray-300 mb-3">Account Balance</h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Available USDT:</span>
                <span className="text-white font-mono">$1,247.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available {symbol}:</span>
                <span className="text-white font-mono">2.45891</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buying Power:</span>
                <span className="text-green-400 font-mono">
                  ${leverage[0] > 1 ? (1247.50 * leverage[0]).toFixed(2) : '1,247.50'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTradingPanel;