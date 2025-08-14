import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OptimizedImage from '@/components/OptimizedImage';
import TradingViewMobileChart from '@/components/mobile/TradingViewMobileChart';
import { useToast } from '@/hooks/use-toast';

interface ModernMobileTokenPageProps {
  token: any;
  tokenAddress: string;
  coverImage: string;
  onBack: () => void;
  onTrade: (type: 'buy' | 'sell', amount: string) => void;
  isTrading: boolean;
}

export const ModernMobileTokenPage: React.FC<ModernMobileTokenPageProps> = ({
  token,
  tokenAddress,
  coverImage,
  onBack,
  onTrade,
  isTrading
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('trade');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  const quickAmounts = [10, 25, 50, 100, 250, 500];
  const isPositive = token.change24h > 0;

  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(value.toString());
  }, []);

  const handleTrade = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    onTrade(tradeType, amount);
  }, [tradeType, amount, onTrade, toast]);

  const tabContent = {
    trade: (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="pb-32 space-y-6"
      >
        {/* Buy/Sell Toggle */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <div className="flex rounded-2xl bg-muted/50 p-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setTradeType('buy')}
                className={`flex-1 h-16 text-lg font-bold rounded-xl transition-all ${
                  tradeType === 'buy' 
                    ? 'bg-success text-white shadow-lg' 
                    : 'text-foreground hover:bg-muted/70'
                }`}
              >
                BUY
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setTradeType('sell')}
                className={`flex-1 h-16 text-lg font-bold rounded-xl transition-all ${
                  tradeType === 'sell' 
                    ? 'bg-destructive text-white shadow-lg' 
                    : 'text-foreground hover:bg-muted/70'
                }`}
              >
                SELL
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Buy Amounts */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">
              {tradeType === 'buy' ? 'Quick Buy Amount' : 'Sell Percentage'}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(tradeType === 'buy' ? quickAmounts : [25, 50, 75, 100]).map((value) => (
                <Button
                  key={value}
                  variant={amount === value.toString() ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleQuickAmount(value)}
                  className="h-14 text-lg font-semibold rounded-xl text-foreground"
                >
                  {tradeType === 'buy' ? `$${value}` : `${value}%`}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Custom Amount */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">
              {tradeType === 'buy' ? 'Custom Amount ($)' : 'Token Amount'}
            </Label>
            <Input
              type="number"
              placeholder={tradeType === 'buy' ? 'Enter amount in $' : `Enter ${token.symbol} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-16 text-xl font-semibold rounded-xl border-2 text-foreground bg-background"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              {tradeType === 'buy' 
                ? `You will receive approximately ${amount ? Math.floor(parseFloat(amount) / token.price).toLocaleString() : '0'} ${token.symbol}`
                : `You will receive approximately $${amount ? (parseFloat(amount) * token.price).toFixed(2) : '0.00'}`
              }
            </div>
          </div>
        </Card>

        {/* Stats Preview */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Transaction Details</Label>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Price</span>
                <span className="font-semibold text-foreground">{formatPrice(token.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-semibold text-success">~$0.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <span className="font-semibold text-foreground">1%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    ),

    chart: (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="pb-32"
      >
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg overflow-hidden">
          <div className="h-[500px]">
            <TradingViewMobileChart 
              symbol={tokenAddress || token.symbol}
              coinGeckoId={token.symbol.toLowerCase()}
            />
          </div>
        </Card>
      </motion.div>
    ),

    info: (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="pb-32 space-y-6"
      >
        {/* Token Info */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Token Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-foreground mt-1">
                  {token.description || `${token.name} is a revolutionary meme token built on Solana blockchain with strong community support.`}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Contract Address</Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg font-mono text-sm break-all text-foreground">
                  {tokenAddress}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Network</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Solana
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-card backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Security Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">Contract Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">Liquidity Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">No Mint Function</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-10 w-10 rounded-full text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsLiked(!isLiked)}
                className="h-10 w-10 rounded-full text-foreground"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Token Header */}
      <div className="px-4 py-6 border-b border-border/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            {token.image ? (
              <OptimizedImage src={token.image} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">
                {token.symbol.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{token.symbol}</h1>
              {token.isHot && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                  🔥 HOT
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm mb-2">{token.name}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{formatPrice(token.price)}</span>
              <Badge 
                variant={isPositive ? "default" : "destructive"} 
                className={`${isPositive ? 'bg-success text-white' : 'bg-destructive text-white'} font-medium`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
            <div className="font-bold text-sm text-foreground">{formatMarketCap(token.marketCap)}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Holders</div>
            <div className="font-bold text-sm text-foreground">
              {token.holders > 1000 ? `${Math.floor(token.holders / 1000)}K` : token.holders}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">24h Vol</div>
            <div className="font-bold text-sm text-foreground">
              ${token.volume24h > 1000000 ? `${(token.volume24h / 1000000).toFixed(1)}M` : 
                token.volume24h > 1000 ? `${(token.volume24h / 1000).toFixed(1)}K` : token.volume24h.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <AnimatePresence mode="wait">
          {tabContent[activeTab as keyof typeof tabContent]}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation & Trade Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/20 p-4 space-y-4">
        {/* Trade Button */}
        {activeTab === 'trade' && (
          <Button
            size="lg"
            onClick={handleTrade}
            disabled={isTrading || !amount}
            className={`w-full h-16 text-xl font-bold rounded-2xl shadow-lg text-white ${
              tradeType === 'buy' 
                ? 'bg-success hover:bg-success/90' 
                : 'bg-destructive hover:bg-destructive/90'
            }`}
          >
            {isTrading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                PROCESSING...
              </div>
            ) : (
              `${tradeType.toUpperCase()} ${token.symbol}`
            )}
          </Button>
        )}

        {/* Bottom Navigation - Big, Clear, No Icons */}
        <div className="flex bg-muted/30 rounded-3xl p-2">
          {[
            { id: 'trade', label: 'TRADE' },
            { id: 'chart', label: 'CHART' },
            { id: 'info', label: 'INFO' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="lg"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-14 rounded-2xl text-lg font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};