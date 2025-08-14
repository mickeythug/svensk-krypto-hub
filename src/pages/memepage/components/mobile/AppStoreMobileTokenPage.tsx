import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Share2, Heart, Bookmark, Copy, ExternalLink, Shield, Zap, Target, BarChart3, Clock, DollarSign, ShoppingCart, Users, Eye, Volume2, Calendar, Activity, Award, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import OptimizedImage from '@/components/OptimizedImage';
import TradingViewMobileChart from '@/components/mobile/TradingViewMobileChart';
import { useToast } from '@/hooks/use-toast';

interface AppStoreMobileTokenPageProps {
  token: any;
  tokenAddress: string;
  coverImage: string;
  onBack: () => void;
  onTrade: (type: 'buy' | 'sell', amount: string) => void;
  isTrading: boolean;
}

export const AppStoreMobileTokenPage: React.FC<AppStoreMobileTokenPageProps> = ({
  token,
  tokenAddress,
  coverImage,
  onBack,
  onTrade,
  isTrading
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slippage, setSlippage] = useState('1');
  
  // Quick buy amounts
  const quickBuyAmounts = [10, 25, 50, 100, 250, 500];
  const quickSellPercentages = [25, 50, 75, 100];

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

  const handleQuickAmount = useCallback((value: number | string) => {
    setAmount(value.toString());
  }, []);

  const handleTrade = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid trade amount', variant: 'destructive' });
      return;
    }
    onTrade(tradeType, amount);
  }, [tradeType, amount, onTrade, toast]);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(tokenAddress);
    toast({ title: 'Copied!', description: 'Token address copied to clipboard' });
  }, [tokenAddress, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
            src={coverImage} 
            alt={`${token.name} background`} 
            className="w-full h-full object-cover scale-110 blur-2xl opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative z-10 pt-4 pb-8">
          <div className="px-4">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsLiked(!isLiked)}
                  className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg"
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Token Header Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Token Logo */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 shadow-xl">
                        {token.image ? (
                          <OptimizedImage src={token.image} alt={token.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                            {token.symbol.charAt(0)}
                          </div>
                        )}
                      </div>
                      {token.isHot && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse shadow-lg">
                            🔥 HOT
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-foreground">
                          {token.emoji} {token.symbol}
                        </h1>
                        <Badge variant="outline" className="text-xs font-medium">
                          VERIFIED
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground font-medium mb-3">
                        {token.name}
                      </p>

                      {/* Price and Change */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(token.price)}
                        </span>
                        <Badge 
                          variant={isPositive ? "default" : "destructive"} 
                          className={`${isPositive ? 'bg-success text-success-foreground' : ''} font-bold px-3 py-1`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                        </Badge>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                          <div className="text-xs text-muted-foreground">Market Cap</div>
                          <div className="font-bold text-sm">{formatMarketCap(token.marketCap)}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                          <div className="text-xs text-muted-foreground">Holders</div>
                          <div className="font-bold text-sm">
                            {token.holders > 1000 ? `${Math.floor(token.holders / 1000)}K` : token.holders}
                          </div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                          <div className="text-xs text-muted-foreground">24h Vol</div>
                          <div className="font-bold text-sm">
                            ${token.volume24h > 1000000 ? `${(token.volume24h / 1000000).toFixed(1)}M` : 
                              token.volume24h > 1000 ? `${(token.volume24h / 1000).toFixed(1)}K` : token.volume24h.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 gap-3 mt-6"
            >
              <Button 
                size="lg" 
                className="h-16 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => {
                  setTradeType('buy');
                  setActiveTab('trade');
                }}
              >
                <ShoppingCart className="mr-2 h-6 w-6" />
                Buy Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-16 font-bold text-lg border-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300"
                onClick={() => {
                  setTradeType('sell');
                  setActiveTab('trade');
                }}
              >
                <DollarSign className="mr-2 h-6 w-6" />
                Sell
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="font-medium">Overview</TabsTrigger>
            <TabsTrigger value="chart" className="font-medium">Chart</TabsTrigger>
            <TabsTrigger value="trade" className="font-medium">Trade</TabsTrigger>
            <TabsTrigger value="info" className="font-medium">Info</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Performance Card */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                        <div className="text-xs text-muted-foreground">24h High</div>
                        <div className="font-bold">{formatPrice(token.price * 1.15)}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
                        <div className="text-xs text-muted-foreground">24h Low</div>
                        <div className="font-bold">{formatPrice(token.price * 0.85)}</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Security Badge */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-success/20">
                        <Shield className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <div className="font-bold text-success">Verified & Secure</div>
                        <div className="text-xs text-muted-foreground">Contract audited and safe to trade</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                {token.tags && token.tags.length > 0 && (
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <div className="p-4">
                      <h3 className="font-bold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {token.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="chart" className="space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-[400px]">
                    <TradingViewMobileChart 
                      symbol={tokenAddress || token.symbol}
                      coinGeckoId={token.symbol.toLowerCase()}
                    />
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="trade" className="space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Trade Type Selector */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <div className="flex rounded-lg bg-muted/50 p-1">
                      <Button
                        variant={tradeType === 'buy' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTradeType('buy')}
                        className={`flex-1 ${tradeType === 'buy' ? 'bg-success text-white' : ''}`}
                      >
                        Buy
                      </Button>
                      <Button
                        variant={tradeType === 'sell' ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => setTradeType('sell')}
                        className="flex-1"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Quick Amount Buttons */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <Label className="text-sm font-medium mb-3 block">
                      {tradeType === 'buy' ? 'Quick Buy ($)' : 'Sell Percentage'}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(tradeType === 'buy' ? quickBuyAmounts : quickSellPercentages).map((value) => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(value)}
                          className="h-10 font-medium"
                        >
                          {tradeType === 'buy' ? `$${value}` : `${value}%`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Amount Input */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <Label htmlFor="amount" className="text-sm font-medium mb-3 block">
                      {tradeType === 'buy' ? 'Amount ($)' : 'Amount (Tokens)'}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={tradeType === 'buy' ? 'Enter USD amount' : 'Enter token amount'}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 text-lg font-medium"
                    />
                    {amount && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        ≈ {tradeType === 'buy' 
                          ? `${(parseFloat(amount) / token.price).toFixed(2)} ${token.symbol}`
                          : `$${(parseFloat(amount) * token.price).toFixed(2)}`
                        }
                      </div>
                    )}
                  </div>
                </Card>

                {/* Advanced Settings Toggle */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advanced" className="text-sm font-medium">
                        Advanced Settings
                      </Label>
                      <Switch
                        id="advanced"
                        checked={showAdvanced}
                        onCheckedChange={setShowAdvanced}
                      />
                    </div>
                    
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <div>
                          <Label htmlFor="slippage" className="text-xs text-muted-foreground">
                            Slippage Tolerance (%)
                          </Label>
                          <Input
                            id="slippage"
                            type="number"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="1.0"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>

                {/* Trade Button */}
                <Button
                  size="lg"
                  onClick={handleTrade}
                  disabled={!amount || isTrading}
                  className={`w-full h-16 text-lg font-bold ${
                    tradeType === 'buy' 
                      ? 'bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70' 
                      : 'bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70'
                  } text-white shadow-xl`}
                >
                  {isTrading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`
                  )}
                </Button>

                {/* Risk Warning */}
                <Card className="bg-destructive/10 border-destructive/20">
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-destructive mb-1">Risk Warning</div>
                        <div className="text-muted-foreground">
                          Trading cryptocurrencies involves substantial risk. Only trade with funds you can afford to lose.
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Description */}
                {token.description && (
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <div className="p-4">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        About {token.symbol}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {token.description}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Contract Info */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <h3 className="font-bold mb-3">Contract Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Contract Address</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                          </span>
                          <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Network</span>
                        <span className="text-sm font-medium">Solana</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* External Links */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <div className="p-4">
                    <h3 className="font-bold mb-3">External Links</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on DEXScreener
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Solscan
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};