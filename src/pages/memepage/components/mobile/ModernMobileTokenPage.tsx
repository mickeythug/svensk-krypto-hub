import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, ShoppingCart, DollarSign, Info, Heart, Star, Zap, Shield } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('buy');
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

  const handleTrade = useCallback((type: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    onTrade(type, amount);
  }, [amount, onTrade, toast]);

  const tabContent = {
    buy: (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="pb-32 space-y-6"
      >
        {/* Quick Buy Amounts */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Quick Buy Amount</Label>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  variant={amount === value.toString() ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleQuickAmount(value)}
                  className="h-14 text-lg font-semibold rounded-xl"
                >
                  ${value}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Custom Amount */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Custom Amount</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount in $"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 text-xl font-semibold pl-8 rounded-xl border-2"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              You will receive approximately {amount ? Math.floor(parseFloat(amount) / token.price).toLocaleString() : '0'} {token.symbol}
            </div>
          </div>
        </Card>

        {/* Stats Preview */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Transaction Details</Label>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Price</span>
                <span className="font-semibold">{formatPrice(token.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-semibold text-success">~$0.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <span className="font-semibold">1%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    ),

    sell: (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="pb-32 space-y-6"
      >
        {/* Sell Percentages */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Sell Percentage</Label>
            <div className="grid grid-cols-2 gap-3">
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="lg"
                  onClick={() => setAmount((1000 * percentage / 100).toString())}
                  className="h-14 text-lg font-semibold rounded-xl"
                >
                  {percentage}%
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Token Amount */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <Label className="text-lg font-semibold mb-4 block text-foreground">Token Amount</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder={`Enter ${token.symbol} amount`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 text-xl font-semibold rounded-xl border-2"
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              You will receive approximately ${amount ? (parseFloat(amount) * token.price).toFixed(2) : '0.00'}
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
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg overflow-hidden">
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
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Token Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-foreground mt-1">
                  {token.description || `${token.name} is a revolutionary meme token built on Solana blockchain with strong community support.`}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Contract Address</Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg font-mono text-sm break-all">
                  {tokenAddress}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Network</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    Solana
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-success" />
              <h3 className="text-lg font-semibold">Security Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">Contract Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">Liquidity Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">No Mint Function</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsLiked(!isLiked)}
                className="h-10 w-10 rounded-full"
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
              <h1 className="text-2xl font-bold">{token.symbol}</h1>
              {token.isHot && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                  🔥 HOT
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm mb-2">{token.name}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{formatPrice(token.price)}</span>
              <Badge 
                variant={isPositive ? "default" : "destructive"} 
                className={`${isPositive ? 'bg-success text-success-foreground' : ''} font-medium`}
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
            <div className="font-bold text-sm">{formatMarketCap(token.marketCap)}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Holders</div>
            <div className="font-bold text-sm">
              {token.holders > 1000 ? `${Math.floor(token.holders / 1000)}K` : token.holders}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">24h Vol</div>
            <div className="font-bold text-sm">
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
        {(activeTab === 'buy' || activeTab === 'sell') && (
          <Button
            size="lg"
            onClick={() => handleTrade(activeTab as 'buy' | 'sell')}
            disabled={isTrading || !amount}
            className={`w-full h-14 text-lg font-bold rounded-xl shadow-lg ${
              activeTab === 'buy' 
                ? 'bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white' 
                : 'bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70'
            }`}
          >
            {isTrading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <>
                {activeTab === 'buy' ? (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy {token.symbol}
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-5 w-5" />
                    Sell {token.symbol}
                  </>
                )}
              </>
            )}
          </Button>
        )}

        {/* Bottom Navigation */}
        <div className="flex bg-muted/50 rounded-2xl p-1">
          {[
            { id: 'buy', label: 'Buy', icon: ShoppingCart },
            { id: 'sell', label: 'Sell', icon: DollarSign },
            { id: 'chart', label: 'Chart', icon: BarChart3 },
            { id: 'info', label: 'Info', icon: Info }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-12 rounded-xl font-medium ${
                activeTab === tab.id 
                  ? 'bg-background shadow-sm' 
                  : 'hover:bg-muted/70'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};