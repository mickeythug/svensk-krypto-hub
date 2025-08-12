import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Zap, Shield, Target, DollarSign, Settings2, AlertTriangle, Info, Clock } from 'lucide-react';

interface AdvancedTradingSettingsProps {
  tradeType: 'buy' | 'sell';
  setTradeType: (type: 'buy' | 'sell') => void;
  orderType: 'market' | 'limit' | 'stop';
  setOrderType: (type: 'market' | 'limit' | 'stop') => void;
  customAmount: string;
  setCustomAmount: (amount: string) => void;
  selectedAmount: number | null;
  setSelectedAmount: (amount: number | null) => void;
  slippage: number;
  setSlippage: (slippage: number) => void;
  customSlippage: string;
  setCustomSlippage: (slippage: string) => void;
  priority: 'low' | 'medium' | 'high';
  setPriority: (priority: 'low' | 'medium' | 'high') => void;
  mevProtection: boolean;
  setMevProtection: (enabled: boolean) => void;
  autoSlippage: boolean;
  setAutoSlippage: (enabled: boolean) => void;
  limitPrice: string;
  setLimitPrice: (price: string) => void;
  stopPrice: string;
  setStopPrice: (price: string) => void;
  priceAlert: string;
  setPriceAlert: (alert: string) => void;
  solBalance: number;
  tokenBalance: number;
  handleAmountSelect: (amount: number) => void;
  calculateSellPercentage: (percentage: number) => void;
  handleTrade: () => Promise<void>;
  isTrading: boolean;
  getPriorityFee: () => string;
  getEstimatedGas: () => string;
}

export const AdvancedTradingSettings = ({
  tradeType,
  setTradeType,
  orderType,
  setOrderType,
  customAmount,
  setCustomAmount,
  selectedAmount,
  slippage,
  setSlippage,
  customSlippage,
  setCustomSlippage,
  priority,
  setPriority,
  mevProtection,
  setMevProtection,
  autoSlippage,
  setAutoSlippage,
  limitPrice,
  setLimitPrice,
  stopPrice,
  setStopPrice,
  priceAlert,
  setPriceAlert,
  solBalance,
  tokenBalance,
  handleAmountSelect,
  calculateSellPercentage,
  handleTrade,
  isTrading,
  getPriorityFee,
  getEstimatedGas,
}: AdvancedTradingSettingsProps) => {
  const quickAmounts = tradeType === 'buy' 
    ? [0.1, 0.5, 1, 2, 5] 
    : [10, 25, 50, 75, 100];

  return (
    <div className="space-y-6 sticky top-6">
      {/* Main Trading Card */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Smart Trading</h3>
            <p className="text-sm text-muted-foreground">Professional trading tools</p>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            size="lg"
            variant={tradeType === 'buy' ? 'default' : 'outline'}
            onClick={() => setTradeType('buy')}
            className={`h-14 font-semibold text-base transition-all duration-200 ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'
            }`}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Buy
          </Button>
          <Button
            size="lg"
            variant={tradeType === 'sell' ? 'default' : 'outline'}
            onClick={() => setTradeType('sell')}
            className={`h-14 font-semibold text-base transition-all duration-200 ${
              tradeType === 'sell'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
            }`}
          >
            <TrendingDown className="mr-2 h-5 w-5" />
            Sell
          </Button>
        </div>

        {/* Order Type */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-foreground mb-3 block">Order Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'market', label: 'Market', desc: 'Instant execution' },
              { key: 'limit', label: 'Limit', desc: 'Set price target' },
              { key: 'stop', label: 'Stop', desc: 'Stop loss order' }
            ].map(({ key, label, desc }) => (
              <Button
                key={key}
                variant={orderType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderType(key as any)}
                className="h-auto py-3 px-2 flex flex-col items-center text-xs"
              >
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70 mt-1">{desc}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            {tradeType === 'buy' ? 'Amount (SOL)' : 'Percentage (%)'}
          </Label>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {quickAmounts.slice(0, 3).map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (tradeType === 'sell' && amount <= 100) {
                    calculateSellPercentage(amount);
                  } else {
                    handleAmountSelect(amount);
                  }
                }}
                className="text-sm font-semibold h-10"
              >
                {tradeType === 'sell' && amount <= 100 ? `${amount}%` : `${amount} SOL`}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickAmounts.slice(3).map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (tradeType === 'sell' && amount <= 100) {
                    calculateSellPercentage(amount);
                  } else {
                    handleAmountSelect(amount);
                  }
                }}
                className="text-sm font-semibold h-10"
              >
                {tradeType === 'sell' && amount <= 100 ? `${amount}%` : `${amount} SOL`}
              </Button>
            ))}
          </div>

          <div className="relative">
            <Input
              type="number"
              placeholder={tradeType === 'buy' ? 'Custom SOL amount' : 'Custom token amount'}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="text-base font-semibold pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {tradeType === 'buy' ? 'SOL' : 'TOKENS'}
            </div>
          </div>
        </div>

        {/* Price Inputs for Limit/Stop Orders */}
        {orderType === 'limit' && (
          <div className="mb-6">
            <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
              <Target className="h-4 w-4" />
              Limit Price
            </Label>
            <Input
              type="number"
              placeholder="Set your target price"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="text-base font-semibold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Order will execute when price reaches this level
            </p>
          </div>
        )}

        {orderType === 'stop' && (
          <div className="mb-6">
            <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stop Price
            </Label>
            <Input
              type="number"
              placeholder="Set your stop loss price"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="text-base font-semibold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Order will trigger when price hits this level
            </p>
          </div>
        )}

        {/* Execute Trade Button */}
        <Button
          onClick={handleTrade}
          disabled={isTrading || !customAmount}
          size="lg"
          className={`w-full h-16 text-lg font-bold transition-all duration-200 ${
            tradeType === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTrading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `${tradeType === 'buy' ? 'Buy' : 'Sell'} Now`
          )}
        </Button>

        <Separator className="my-6" />

        {/* Wallet Balance Info */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Wallet Balance</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">SOL Balance:</span>
              <span className="text-sm font-semibold">{solBalance.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Token Balance:</span>
              <span className="text-sm font-semibold">{tokenBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced Settings Card */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-orange-500/10">
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Advanced Settings</h3>
            <p className="text-sm text-muted-foreground">Fine-tune your trading parameters</p>
          </div>
        </div>

        {/* Slippage Tolerance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-semibold text-foreground">Slippage Tolerance</Label>
            </div>
            <Switch
              checked={autoSlippage}
              onCheckedChange={setAutoSlippage}
            />
          </div>
          
          {!autoSlippage && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 5].map((slip) => (
                  <Button
                    key={slip}
                    variant={slippage === slip ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSlippage(slip)}
                    className="text-sm font-semibold"
                  >
                    {slip}%
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Slider
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                  max={20}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  Current: {slippage}%
                </div>
              </div>
            </div>
          )}
          {autoSlippage && (
            <div className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3">
              <Info className="h-4 w-4 inline mr-2" />
              Auto slippage will adjust based on market conditions
            </div>
          )}
        </div>

        {/* Priority Fee */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-500" />
            <Label className="text-sm font-semibold text-foreground">Transaction Priority</Label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'low', label: 'Economy', fee: '0.0001 SOL', desc: 'Slower execution' },
              { key: 'medium', label: 'Standard', fee: '0.0005 SOL', desc: 'Balanced speed' },
              { key: 'high', label: 'Fast', fee: '0.001 SOL', desc: 'Quick execution' }
            ].map(({ key, label, fee, desc }) => (
              <Button
                key={key}
                variant={priority === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriority(key as typeof priority)}
                className="h-auto py-3 px-2 flex flex-col items-center text-xs"
              >
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70 mt-1">{fee}</span>
                <span className="text-xs opacity-70">{desc}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* MEV Protection */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <span className="text-sm font-semibold text-foreground">MEV Protection</span>
                <p className="text-xs text-muted-foreground">Protects against front-running attacks</p>
              </div>
            </div>
            <Switch
              checked={mevProtection}
              onCheckedChange={setMevProtection}
            />
          </div>
        </div>

        {/* Price Alert */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Price Alert
          </Label>
          <Input
            type="number"
            placeholder="Set price notification"
            value={priceAlert}
            onChange={(e) => setPriceAlert(e.target.value)}
            className="text-base font-semibold"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Get notified when price reaches this level
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Transaction Summary</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority Fee:</span>
              <span className="font-semibold">{getPriorityFee()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Gas:</span>
              <span className="font-semibold">{getEstimatedGas()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage:</span>
              <span className="font-semibold">{autoSlippage ? 'Auto' : `${slippage}%`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MEV Protection:</span>
              <span className="font-semibold">{mevProtection ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};