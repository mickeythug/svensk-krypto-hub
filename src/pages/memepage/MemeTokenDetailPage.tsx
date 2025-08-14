import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Users, Eye, Share2, Heart, Copy, ExternalLink, Shield, Zap, Target, BarChart3, Clock, DollarSign, ShoppingCart, Bookmark, AlertCircle, CheckCircle, Info, Download, Globe, MessageCircle, Award, Activity, Layers, Volume2, Calendar, PieChart, LineChart, BarChart, Maximize2, Settings, RefreshCw, Filter, Search, Bell, Flag, Lock, Unlock, Play, Pause, RotateCcw, Database, Network, Cpu, HardDrive, Wifi, Signal, Battery, CloudLightning } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMemeTokens } from './hooks/useMemeTokens';
import { useMemeTokenDetails } from './hooks/useMemeTokenDetails';
import JupiterSwapWidget from '@/components/web3/JupiterSwapWidget';
import TradingViewMobileChart from '@/components/mobile/TradingViewMobileChart';
import TradingViewChart from '@/components/TradingViewChart';
import { useToast } from '@/hooks/use-toast';
import type { PumpTradeParams } from '@/hooks/usePumpTrade';
import { usePumpTrade } from '@/hooks/usePumpTrade';
import { useTradingWallet } from '@/hooks/useTradingWallet';
import { supabase } from '@/integrations/supabase/client';
import { TokenHeader } from '@/components/TokenHeader';
import { EnhancedMarketStats } from '@/components/EnhancedMarketStats';
import { AdvancedTradingSettings } from '@/components/AdvancedTradingSettings';
import { TokenInfoSection } from '@/components/TokenInfoSection';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MarketDataToggle } from '@/components/MarketDataToggle';
import { AppStoreMobileTokenPage } from './components/mobile/AppStoreMobileTokenPage';

// Import cover images
import c1 from '@/assets/meme-covers/meme-cover-1.jpg';
import c2 from '@/assets/meme-covers/meme-cover-2.jpg';
import c3 from '@/assets/meme-covers/meme-cover-3.jpg';
import c4 from '@/assets/meme-covers/meme-cover-4.jpg';
import c5 from '@/assets/meme-covers/meme-cover-5.jpg';
import c6 from '@/assets/meme-covers/meme-cover-6.jpg';

const covers = [c1, c2, c3, c4, c5, c6];

const MemeTokenDetailPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tokens } = useMemeTokens('all');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced Trading State Management
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [marketDataTab, setMarketDataTab] = useState<'market' | 'transactions'>('market');
  const [slippage, setSlippage] = useState(1);
  const [customSlippage, setCustomSlippage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [mevProtection, setMevProtection] = useState(true);
  const [autoSlippage, setAutoSlippage] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isTrading, setIsTrading] = useState(false);

  // Price alerts and limits
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [priceAlert, setPriceAlert] = useState('');

  // Wallet balances (mock data)
  const [solBalance] = useState(2.45);
  const [tokenBalance] = useState(1234567);

  // Resolve address from query and fetch full details
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address') || undefined;
  const { data: details, loading: detailsLoading } = useMemeTokenDetails(address);
  const { toast } = useToast();

  // Find fallback token by symbol
  const found = tokens.find(t => t.symbol.toLowerCase() === (symbol ?? '').toLowerCase());

  // Resolve derived token object
  const tokenBase = found ? { ...found } : {
    id: address || '',
    symbol: (symbol ?? 'TOKEN').toUpperCase(),
    name: symbol || 'Token',
    image: found?.image,
    price: 0,
    change24h: 0,
    volume24h: 0,
    marketCap: 0,
    holders: 0,
    views: '—',
    emoji: undefined,
    tags: [],
    isHot: false,
    description: undefined,
  };

  const token = {
    ...tokenBase,
    ...(details ? {
      id: details.address,
      symbol: details.symbol,
      name: details.name,
      image: details.logo || tokenBase.image,
      price: details.price ?? tokenBase.price,
      change24h: details.variation24h ?? tokenBase.change24h,
      volume24h: details.pool?.volume24h ?? tokenBase.volume24h,
      marketCap: details.marketCap ?? tokenBase.marketCap,
      holders: details.holders ?? tokenBase.holders,
      description: details.description || tokenBase.description,
    } : {}),
  } as any;

  // Derived data from DEXTools pool price for volumes and token address
  const poolPrice = (details as any)?.raw?.poolPrice?.data ?? (details as any)?.raw?.poolPrice ?? null;
  const volume1h = typeof poolPrice?.volume1h === 'number' ? poolPrice.volume1h : undefined;
  const volume6h = typeof poolPrice?.volume6h === 'number' ? poolPrice.volume6h : undefined;
  const volume24hDerived = typeof poolPrice?.volume24h === 'number' ? poolPrice.volume24h : undefined;
  const tokenAddress = details?.address || address || (token as any)?.id || '';

// Removed Birdeye market-data fetching to respect rate limits; using central hook instead

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  useEffect(() => {
    if (!token && tokens.length > 0 && !address) {
      navigate('/meme');
    }
  }, [token, tokens, navigate, address]);

  // Enhanced Trading Functions - ALL useCallback hooks must be before early returns
  const handleAmountSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  }, []);

  const calculateTradeValue = useCallback(() => {
    if (!token) return 0;
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (tradeType === 'buy') {
      return amount * token.price;
    } else {
      return amount; // For sell, amount is in tokens
    }
  }, [selectedAmount, customAmount, tradeType, token]);

  const calculateSellPercentage = useCallback((percentage: number) => {
    const amount = tokenBalance * percentage / 100;
    setCustomAmount(amount.toString());
    setSelectedAmount(null);
  }, [tokenBalance]);
  
  const { trade, loading: tradeLoading } = usePumpTrade();
  const { createIfMissing } = useTradingWallet();
  
  const handleTrade = useCallback(async () => {
    if (!token) return;
    setIsTrading(true);
    try {
      // Ensure trading wallet exists (saved with API key)
      await createIfMissing();

      const isBuy = tradeType === 'buy';
      const amountNum = (selectedAmount || parseFloat(customAmount) || 0);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error('Ogiltigt belopp');
      }

      // Map UI -> PumpPortal params
      const prioMap: Record<typeof priority, number> = { low: 0.0001, medium: 0.0005, high: 0.001 } as const;
      const prio = prioMap[priority];
      const slip = autoSlippage ? 10 : Math.max(0, Number(slippage) || 10);

      const params: PumpTradeParams = {
        action: isBuy ? 'buy' : 'sell',
        mint: tokenAddress,
        amount: amountNum,
        denominatedInSol: isBuy ? 'true' : 'false',
        slippage: slip,
        priorityFee: prio,
        pool: 'auto',
        jitoOnly: mevProtection ? 'true' : 'false',
      };

      const res = await trade(params);
      if (res?.status !== 200) throw new Error('Trade misslyckades');

      // Reset UI on success
      setCustomAmount('');
      setSelectedAmount(null);
    } catch (error: any) {
      console.error('Trade failed:', error);
    } finally {
      setIsTrading(false);
    }
  }, [token, tradeType, selectedAmount, customAmount, priority, autoSlippage, slippage, mevProtection, tokenAddress, createIfMissing, trade]);

  const getPriorityFee = useCallback(() => {
    switch (priority) {
      case 'low':
        return '0.0001 SOL';
      case 'medium':
        return '0.0005 SOL';
      case 'high':
        return '0.001 SOL';
      default:
        return '0.0005 SOL';
    }
  }, [priority]);

  const getEstimatedGas = useCallback(() => {
    return orderType === 'market' ? '0.002 SOL' : '0.003 SOL';
  }, [orderType]);

// Removed extra OHLCV polling to respect rate limits; volumes are shown in the market section

  // Helper functions (non-hooks)
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

  // EARLY RETURN AFTER ALL HOOKS
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token...</p>
        </div>
      </div>
    );
  }

  const isPositive = token.change24h > 0;
  const coverImage = covers[Math.abs(token.symbol.charCodeAt(0)) % covers.length];

  // Use real enhanced token data instead of mockup stats

  if (isMobile) {
    // Create a new trade handler for the app store component
    const handleMobileTrade = useCallback((type: 'buy' | 'sell', amount: string) => {
      setTradeType(type);
      setCustomAmount(amount);
      handleTrade();
    }, [handleTrade]);

    return (
      <AppStoreMobileTokenPage
        token={token}
        tokenAddress={tokenAddress}
        coverImage={coverImage}
        onBack={() => navigate(-1)}
        onTrade={handleMobileTrade}
        isTrading={isTrading}
      />
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header - Full Width */}
      <div className="w-full px-8 py-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="h-12 px-6 bg-card/50 backdrop-blur-sm hover:bg-card border border-border/50 rounded-xl"
          >
            <ArrowLeft className="mr-3 h-5 w-5" />
            <span className="text-lg font-semibold">Back to Market</span>
          </Button>
        </div>
        
        {/* Modern Token Header */}
        <div className="mt-8">
          <TokenHeader token={token} />
        </div>
      </div>

      {/* Main Content Layout - Center Chart with Right Sidebar */}
      <div className="w-full flex">
        {/* Center Chart Area - Expanded */}
        <div className="flex-1 min-h-screen">
          <div className="p-8 space-y-8">
            {/* Expanded Chart */}
            <Card className="p-8 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-border/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Live Price Chart
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-full bg-success animate-pulse shadow-lg shadow-success/50"></div>
                  <span className="text-xl font-medium text-muted-foreground">Live Trading</span>
                </div>
              </div>
              <div className="h-[800px] rounded-3xl overflow-hidden border-2 border-border/20 shadow-inner">
                <TradingViewChart 
                  symbol={tokenAddress || token.symbol}
                  currentPrice={token.price}
                  coinGeckoId={token.symbol.toLowerCase()}
                />
              </div>
            </Card>

            {/* Market Data Toggle */}
            <div className="animate-fade-in">
              <MarketDataToggle 
                activeTab={marketDataTab}
                onToggle={setMarketDataTab}
              />
            </div>

            {/* Conditional Content Based on Toggle */}
            <div className="animate-fade-in">
              {marketDataTab === 'market' ? (
                  <TokenInfoSection
                    tokenAddress={tokenAddress}
                    fallbackData={{
                      price: token.price,
                      marketCap: token.marketCap,
                      holders: token.holders,
                      volume24h: token.volume24h,
                      symbol: token.symbol,
                      name: token.name,
                      description: token.description,
                    }}
                  />
              ) : (
<TransactionsTable 
  tokenAddress={tokenAddress || (token as any)?.id}
  tokenSymbol={token.symbol}
/>
              )}
            </div>

          </div>
        </div>

        {/* Right Sidebar - Fixed to Right Edge */}
        <div className="w-96 flex-shrink-0 bg-card/30 backdrop-blur-sm border-l border-border/20">
          <div className="sticky top-0 h-screen overflow-y-auto p-6">
            <AdvancedTradingSettings
              tradeType={tradeType}
              setTradeType={setTradeType}
              orderType={orderType}
              setOrderType={setOrderType}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              selectedAmount={selectedAmount}
              setSelectedAmount={setSelectedAmount}
              slippage={slippage}
              setSlippage={setSlippage}
              customSlippage={customSlippage}
              setCustomSlippage={setCustomSlippage}
              priority={priority}
              setPriority={setPriority}
              mevProtection={mevProtection}
              setMevProtection={setMevProtection}
              autoSlippage={autoSlippage}
              setAutoSlippage={setAutoSlippage}
              limitPrice={limitPrice}
              setLimitPrice={setLimitPrice}
              stopPrice={stopPrice}
              setStopPrice={setStopPrice}
              priceAlert={priceAlert}
              setPriceAlert={setPriceAlert}
              solBalance={solBalance}
              tokenBalance={tokenBalance}
              handleAmountSelect={handleAmountSelect}
              calculateSellPercentage={calculateSellPercentage}
              handleTrade={handleTrade}
              isTrading={isTrading}
              getPriorityFee={getPriorityFee}
              getEstimatedGas={getEstimatedGas}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTokenDetailPage;