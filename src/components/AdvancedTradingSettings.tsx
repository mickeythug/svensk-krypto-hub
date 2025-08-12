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
  getEstimatedGas
}: AdvancedTradingSettingsProps) => {
  const quickAmounts = tradeType === 'buy' ? [0.1, 0.5, 1, 2, 5] : [10, 25, 50, 75, 100];
  return <div className="space-y-8 sticky top-8">
      {/* Main Trading Card - World-Class Enhanced */}
      <Card className="p-8 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl border border-border/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
            <Settings2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Trading
            </h3>
            <p className="text-lg text-muted-foreground font-medium">Professional trading tools</p>
          </div>
          <div className="ml-auto h-4 w-4 rounded-full bg-success animate-pulse shadow-lg shadow-success/50"></div>
        </div>

        {/* Buy/Sell Toggle - Enhanced */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Button size="lg" variant={tradeType === 'buy' ? 'default' : 'outline'} onClick={() => setTradeType('buy')} className={`h-20 font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 rounded-2xl ${tradeType === 'buy' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30 border-0 hover:scale-[1.02]' : 'bg-background text-foreground border-2 border-border hover:bg-muted hover:border-green-500 hover:text-green-600 hover:shadow-md'}`}>
            <TrendingUp className="h-7 w-7" />
            <span className="font-bold text-xl">BUY</span>
          </Button>
          <Button size="lg" variant={tradeType === 'sell' ? 'default' : 'outline'} onClick={() => setTradeType('sell')} className={`h-20 font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 rounded-2xl ${tradeType === 'sell' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 border-0 hover:scale-[1.02]' : 'bg-background text-foreground border-2 border-border hover:bg-muted hover:border-red-500 hover:text-red-600 hover:shadow-md'}`}>
            <TrendingDown className="h-7 w-7" />
            <span className="font-bold text-xl">SELL</span>
          </Button>
        </div>

        {/* Order Type - Enhanced */}
        <div className="mb-10">
          <Label className="text-xl font-bold text-foreground mb-6 block flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent"></span>
            Order Type
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {[{
            key: 'market',
            label: 'Market',
            desc: 'Instant execution',
            icon: <Target className="h-5 w-5" />
          }, {
            key: 'limit',
            label: 'Limit',
            desc: 'Set price target',
            icon: <Target className="h-5 w-5" />
          }, {
            key: 'stop',
            label: 'Stop',
            desc: 'Stop loss order',
            icon: <Shield className="h-5 w-5" />
          }].map(({
            key,
            label,
            desc,
            icon
          }) => <Button key={key} variant={orderType === key ? 'default' : 'outline'} size="sm" onClick={() => setOrderType(key as any)} className={`h-auto py-6 px-4 flex flex-col items-center gap-2 min-h-[100px] rounded-2xl transition-all duration-300 ${orderType === key ? 'bg-primary text-primary-foreground border-0 shadow-lg shadow-primary/30 hover:scale-[1.02]' : 'bg-background text-foreground border-2 border-border hover:bg-muted hover:border-primary hover:shadow-md'}`}>
                {icon}
                <span className="font-bold text-lg">{label}</span>
                <span className="text-sm opacity-80">{desc}</span>
              </Button>)}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-8">
          <Label className="text-base font-bold text-foreground mb-4 block">
            {tradeType === 'buy' ? 'Amount (SOL)' : 'Percentage (%)'}
          </Label>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {quickAmounts.slice(0, 3).map(amount => <Button key={amount} variant={selectedAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => {
            if (tradeType === 'sell' && amount <= 100) {
              calculateSellPercentage(amount);
            } else {
              handleAmountSelect(amount);
            }
          }} className={`text-base font-bold h-12 ${selectedAmount === amount ? 'bg-primary text-primary-foreground border-0 shadow-md' : 'bg-background text-foreground border-2 border-border hover:bg-muted hover:border-primary'}`}>
                {tradeType === 'sell' && amount <= 100 ? `${amount}%` : `${amount} SOL`}
              </Button>)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {quickAmounts.slice(3).map(amount => <Button key={amount} variant={selectedAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => {
            if (tradeType === 'sell' && amount <= 100) {
              calculateSellPercentage(amount);
            } else {
              handleAmountSelect(amount);
            }
          }} className={`text-base font-bold h-12 ${selectedAmount === amount ? 'bg-primary text-primary-foreground border-0 shadow-md' : 'bg-background text-foreground border-2 border-border hover:bg-muted hover:border-primary'}`}>
                {tradeType === 'sell' && amount <= 100 ? `${amount}%` : `${amount} SOL`}
              </Button>)}
          </div>

          <div className="relative">
            <Input type="number" placeholder={tradeType === 'buy' ? 'Custom SOL amount' : 'Custom token amount'} value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="text-lg font-bold pr-20 h-14 bg-background border-2 border-border focus:border-primary" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">
              {tradeType === 'buy' ? 'SOL' : 'TOKENS'}
            </div>
          </div>
        </div>

        {/* Price Inputs for Limit/Stop Orders */}
        {orderType === 'limit' && <div className="mb-6">
            <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
              <Target className="h-4 w-4" />
              Limit Price
            </Label>
            <Input type="number" placeholder="Set your target price" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="text-base font-semibold" />
            <p className="text-xs text-muted-foreground mt-2">
              Order will execute when price reaches this level
            </p>
          </div>}

        {orderType === 'stop' && <div className="mb-6">
            <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stop Price
            </Label>
            <Input type="number" placeholder="Set your stop loss price" value={stopPrice} onChange={e => setStopPrice(e.target.value)} className="text-base font-semibold" />
            <p className="text-xs text-muted-foreground mt-2">
              Order will trigger when price hits this level
            </p>
          </div>}

        {/* Execute Trade Button - Enhanced */}
        <Button onClick={handleTrade} disabled={isTrading || !customAmount} size="lg" className={`w-full h-20 text-2xl font-bold transition-all duration-300 rounded-2xl ${tradeType === 'buy' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30'} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}>
          {isTrading ? <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
              Processing Transaction...
            </div> : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Now`}
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
            <Switch checked={autoSlippage} onCheckedChange={setAutoSlippage} />
          </div>
          
          {!autoSlippage && <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 5].map(slip => <Button key={slip} variant={slippage === slip ? 'default' : 'outline'} size="sm" onClick={() => setSlippage(slip)} className="text-sm font-semibold">
                    {slip}%
                  </Button>)}
              </div>
              <div className="space-y-2">
                <Slider value={[slippage]} onValueChange={value => setSlippage(value[0])} max={20} min={0.1} step={0.1} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">
                  Current: {slippage}%
                </div>
              </div>
            </div>}
          {autoSlippage && <div className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3">
              <Info className="h-4 w-4 inline mr-2" />
              Auto slippage will adjust based on market conditions
            </div>}
        </div>

        {/* Priority Fee */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-500" />
            <Label className="text-sm font-semibold text-foreground">Transaction Priority</Label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{
            key: 'low',
            label: 'Economy',
            fee: '0.0001 SOL',
            desc: 'Slower execution'
          }, {
            key: 'medium',
            label: 'Standard',
            fee: '0.0005 SOL',
            desc: 'Balanced speed'
          }, {
            key: 'high',
            label: 'Fast',
            fee: '0.001 SOL',
            desc: 'Quick execution'
          }].map(({
            key,
            label,
            fee,
            desc
          }) => <Button key={key} variant={priority === key ? 'default' : 'outline'} size="sm" onClick={() => setPriority(key as typeof priority)} className="h-auto py-3 px-2 flex flex-col items-center text-xs">
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70 mt-1">{fee}</span>
              </Button>)}
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
            <Switch checked={mevProtection} onCheckedChange={setMevProtection} />
          </div>
        </div>

        {/* Price Alert */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Price Alert
          </Label>
          <Input type="number" placeholder="Set price notification" value={priceAlert} onChange={e => setPriceAlert(e.target.value)} className="text-base font-semibold" />
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
    </div>;
};