import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Zap, Shield, Target } from 'lucide-react';

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
    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Advanced Trading</h3>
      </div>

      <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="buy" className="text-success">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="text-destructive">Sell</TabsTrigger>
        </TabsList>

        <TabsContent value={tradeType} className="space-y-6">
          {/* Order Type */}
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">Order Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['market', 'limit', 'stop'].map((type) => (
                <Button
                  key={type}
                  variant={orderType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderType(type as any)}
                  className="text-xs"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">
              Amount ({tradeType === 'buy' ? 'SOL' : 'Tokens'})
            </Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="mb-3"
            />
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amount) => (
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
                  className="text-xs"
                >
                  {tradeType === 'sell' && amount <= 100 ? `${amount}%` : amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Inputs for Limit/Stop Orders */}
          {orderType === 'limit' && (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block">Limit Price</Label>
              <Input
                type="number"
                placeholder="Enter limit price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          {orderType === 'stop' && (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block">Stop Price</Label>
              <Input
                type="number"
                placeholder="Enter stop price"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
              />
            </div>
          )}

          {/* Slippage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-foreground">Slippage Tolerance</Label>
              <Switch
                checked={autoSlippage}
                onCheckedChange={setAutoSlippage}
              />
            </div>
            {!autoSlippage && (
              <div className="space-y-3">
                <Slider
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                  max={20}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {slippage}%
                </div>
              </div>
            )}
          </div>

          {/* Priority Fee */}
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">Priority Fee</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={priority === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(level)}
                  className="text-xs"
                >
                  <div className="flex items-center gap-1">
                    {level === 'low' && <Zap className="h-3 w-3" />}
                    {level === 'medium' && <Target className="h-3 w-3" />}
                    {level === 'high' && <Shield className="h-3 w-3" />}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {getPriorityFee()}
            </div>
          </div>

          {/* MEV Protection */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-foreground">MEV Protection</Label>
              <p className="text-xs text-muted-foreground">Protect against front-running</p>
            </div>
            <Switch
              checked={mevProtection}
              onCheckedChange={setMevProtection}
            />
          </div>

          {/* Price Alert */}
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">Price Alert</Label>
            <Input
              type="number"
              placeholder="Set price alert"
              value={priceAlert}
              onChange={(e) => setPriceAlert(e.target.value)}
            />
          </div>

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            disabled={isTrading || !customAmount}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3"
          >
            {isTrading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${tradeType === 'buy' ? 'Token' : 'Tokens'}`}
          </Button>

          {/* Balance Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>SOL Balance:</span>
              <span>{solBalance.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span>Token Balance:</span>
              <span>{tokenBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Gas:</span>
              <span>{getEstimatedGas()}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};