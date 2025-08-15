import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Zap, Target, Settings, Wallet, BarChart3, DollarSign, Percent, Clock, Shield, Activity, Calculator, Lock, Unlock, AlertTriangle, CheckCircle, Info, Sparkles, ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [slippage, setSlippage] = useState(0.5);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Auto-update price for market orders
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  const formatPrice = (price: number) => {
    // Use Intl.NumberFormat for proper comma separators and consistent formatting
    if (price < 0.01) {
      return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 6, 
        maximumFractionDigits: 6 
      }).format(price);
    }
    if (price < 1) {
      return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(volume / 1e9)}B`;
    if (volume >= 1e6) return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(volume / 1e6)}M`;
    if (volume >= 1e3) return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(volume / 1e3)}K`;
    return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(volume)}`;
  };

  const quickAmounts = ['25%', '50%', '75%', 'MAX'];
  
  const calculateTotal = () => {
    const amountValue = parseFloat(amount) || 0;
    const priceValue = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    return amountValue * priceValue;
  };

  const handleExecuteTrade = async () => {
    setIsExecuting(true);
    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExecuting(false);
    setAmount('');
  };

  return (
    <div className="h-full w-full p-5 bg-card/95 border border-border backdrop-blur-sm rounded-2xl shadow-elevation-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none rounded-2xl"></div>
      
      <div className="relative z-10 grid grid-cols-3 gap-5 h-full max-h-[480px]">
        
        {/* Left Column - Order Entry */}
        <motion.div 
          className="space-y-4 h-full overflow-y-auto pr-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Modern Token Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground font-binance section-title">{symbol}</h3>
              <Badge 
                variant={priceChange24h >= 0 ? "default" : "destructive"} 
                className="px-3 py-1.5 text-sm font-medium shadow-lg animate-fade-in"
              >
                {priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-4xl font-binance font-bold text-foreground important-number tabular-nums">
                ${formatPrice(currentPrice)}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                Vol: {formatVolume(volume24h)}
              </div>
            </div>
          </div>

          {/* Advanced Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant={side === 'buy' ? 'default' : 'outline'} 
                onClick={() => setSide('buy')} 
                className={`h-14 text-base font-semibold transition-all duration-300 relative overflow-hidden ${
                  side === 'buy' 
                    ? 'bg-gradient-to-br from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white border-0 shadow-lg shadow-success/25' 
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <ArrowUp className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-bold text-binance-body">{t('trading.buy')}</div>
                  </div>
                </div>
                {side === 'buy' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                )}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant={side === 'sell' ? 'default' : 'outline'} 
                onClick={() => setSide('sell')} 
                className={`h-14 text-base font-semibold transition-all duration-300 relative overflow-hidden ${
                  side === 'sell' 
                    ? 'bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white border-0 shadow-lg shadow-destructive/25' 
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <ArrowDown className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-bold text-binance-body">{t('trading.sell')}</div>
                  </div>
                </div>
                {side === 'sell' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Compact Order Type & Advanced Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-binance-secondary">
                {t('trading.orderType')}
              </Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="h-11 bg-muted/50 border-border text-foreground font-medium hover:bg-accent/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border backdrop-blur-sm">
                  <SelectItem value="market" className="text-foreground hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-medium">{t('trading.market')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="limit" className="text-foreground hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{t('trading.limit')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="stop" className="text-foreground hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">Stop Loss</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-binance-secondary">
                Mode
              </Label>
              <div className="flex items-center justify-center h-11 bg-muted/50 border border-border rounded-lg px-3 hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={advancedMode} 
                    onCheckedChange={setAdvancedMode} 
                    className="data-[state=checked]:bg-primary" 
                  />
                  <Label className="text-foreground font-medium text-binance-secondary cursor-pointer">
                    Advanced
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Amount Input */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium text-binance-secondary">
              {t('trading.amount')} (USDT)
            </Label>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="h-12 bg-muted/50 border-border text-foreground text-lg font-binance placeholder:text-muted-foreground/50 font-medium pr-16 hover:bg-accent/30 focus:bg-card transition-colors" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                USDT
              </div>
            </div>
            
            {/* Compact Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(pct => (
                <motion.div key={pct} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 bg-muted/30 border-border text-foreground font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" 
                    onClick={() => {
                      const percentage = pct === 'MAX' ? 100 : parseInt(pct) / 100;
                      const availableBalance = 1000;
                      setAmount((availableBalance * percentage).toString());
                    }}
                  >
                    {pct}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Middle Column - Price & Risk Management */}
        <motion.div 
          className="space-y-4 h-full overflow-y-auto pr-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Price Input (if limit order) */}
          <AnimatePresence>
            {orderType === 'limit' && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-foreground font-medium text-binance-secondary">
                  {t('trading.price')} (USDT)
                </Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="h-12 bg-muted/50 border-border text-foreground text-lg font-binance placeholder:text-muted-foreground/50 font-medium pr-16 hover:bg-accent/30 focus:bg-card transition-colors" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    USD
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Stop Loss & Take Profit */}
          <AnimatePresence>
            {advancedMode && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <Label className="text-foreground font-medium text-binance-secondary flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    Stop Loss (USDT)
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={stopLoss} 
                    onChange={e => setStopLoss(e.target.value)} 
                    className="h-11 bg-destructive/5 border-destructive/30 text-foreground font-binance placeholder:text-muted-foreground/50 font-medium hover:bg-destructive/10 focus:bg-card transition-colors" 
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-foreground font-medium text-binance-secondary flex items-center gap-2">
                    <Target className="h-4 w-4 text-success" />
                    Take Profit (USDT)
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={takeProfit} 
                    onChange={e => setTakeProfit(e.target.value)} 
                    className="h-11 bg-success/5 border-success/30 text-foreground font-binance placeholder:text-muted-foreground/50 font-medium hover:bg-success/10 focus:bg-card transition-colors" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modern Slippage */}
          <div className="space-y-3 p-4 bg-muted/30 border border-border rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium text-binance-secondary flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                {t('trading.slippage')}
              </Label>
              <span className="text-primary font-binance text-base important-number">
                {slippage}%
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.5, 1.0, 2.0].map(value => (
                <motion.div key={value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant={slippage === value ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 text-xs font-medium transition-all duration-200"
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Order Summary & Execute */}
        <motion.div 
          className="space-y-4 h-full overflow-y-auto pl-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Modern Order Summary */}
          <Card className="p-5 bg-muted/30 border-border backdrop-blur-sm shadow-elevation-2">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 section-title">
              <Calculator className="h-5 w-5 text-primary" />
              Order Summary
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-binance-secondary">Order Type:</span>
                <span className="text-foreground font-bold capitalize text-binance-body">{orderType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-binance-secondary">Side:</span>
                <span className={`font-bold text-binance-body ${side === 'buy' ? 'text-success' : 'text-destructive'}`}>
                  {side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium text-binance-secondary">Amount:</span>
                <span className="text-foreground font-bold text-binance-body tabular-nums">
                  {amount || '0.00'} USDT
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium text-binance-secondary">Price:</span>
                <span className="text-foreground font-bold text-binance-body tabular-nums">
                  ${formatPrice(orderType === 'market' ? currentPrice : parseFloat(price) || 0)}
                </span>
              </div>
              
              <Separator className="bg-border my-3" />
              
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium text-binance-secondary">Est. Total:</span>
                <span className="text-primary font-bold text-lg important-number tabular-nums">
                  ${formatPrice(calculateTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium text-binance-secondary">Est. Fee:</span>
                <span className="text-muted-foreground font-medium text-binance-body tabular-nums">
                  ${formatPrice(calculateTotal() * 0.001)}
                </span>
              </div>
            </div>
          </Card>

          {/* Premium Execute Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className={`w-full h-14 text-lg font-bold transition-all duration-300 shadow-elevation-3 relative overflow-hidden ${
                side === 'buy' 
                  ? 'bg-gradient-to-br from-success via-success/90 to-success/80 hover:from-success/90 hover:via-success/80 hover:to-success/70 shadow-success/25' 
                  : 'bg-gradient-to-br from-destructive via-destructive/90 to-destructive/80 hover:from-destructive/90 hover:via-destructive/80 hover:to-destructive/70 shadow-destructive/25'
              }`}
              disabled={!amount || parseFloat(amount) <= 0 || isExecuting}
              onClick={handleExecuteTrade}
            >
              <AnimatePresence mode="wait">
                {isExecuting ? (
                  <motion.div
                    key="executing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    <span>Executing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Zap className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold text-binance-body">
                        {side === 'buy' ? t('trading.buyNow') : t('trading.sellNow')} {symbol}
                      </div>
                      <div className="text-sm opacity-90 font-medium">
                        {orderType === 'market' ? 'Instant Execution' : 'Place Order'}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            </Button>
          </motion.div>

          {/* Compact Account Balance Info */}
          <div className="p-4 bg-muted/20 border border-border rounded-xl backdrop-blur-sm">
            <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 text-binance-secondary">
              <Wallet className="h-4 w-4 text-primary" />
              Account Balance
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-binance-secondary">Available USDT:</span>
                <span className="text-foreground font-binance important-number tabular-nums">$1,247.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-binance-secondary">Available {symbol}:</span>
                <span className="text-foreground font-binance important-number tabular-nums">2.45891</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-binance-secondary">Buying Power:</span>
                <span className="text-success font-binance important-number tabular-nums">
                  $1,247.50
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComprehensiveTradingPanel;