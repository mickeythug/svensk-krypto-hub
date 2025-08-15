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
import { ModernMobileTokenPage } from './components/mobile/ModernMobileTokenPage';
import { ProfessionalTokenHeader } from './components/ProfessionalTokenHeader';
import { ProfessionalTradingChart } from './components/ProfessionalTradingChart';
import { ProfessionalTradingSidebar } from './components/ProfessionalTradingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Resolve address from query and fetch full details
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address') || undefined;
  const { data: details, loading: detailsLoading } = useMemeTokenDetails(address);
  
  // ALL STATE HOOKS FIRST
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [priceAlert, setPriceAlert] = useState('');
  const [solBalance] = useState(2.45);
  const [tokenBalance] = useState(1234567);

  // ALL CUSTOM HOOKS SECOND
  const { trade, loading: tradeLoading } = usePumpTrade();
  const { createIfMissing } = useTradingWallet();

  // ALL useCallback HOOKS THIRD
  const handleAmountSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  }, []);

  const calculateSellPercentage = useCallback((percentage: number) => {
    const amount = tokenBalance * percentage / 100;
    setCustomAmount(amount.toString());
    setSelectedAmount(null);
  }, [tokenBalance]);

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

  // Derived data
  const poolPrice = (details as any)?.raw?.poolPrice?.data ?? (details as any)?.raw?.poolPrice ?? null;
  const tokenAddress = details?.address || address || (token as any)?.id || '';

  const calculateTradeValue = useCallback(() => {
    if (!token) return 0;
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (tradeType === 'buy') {
      return amount * token.price;
    } else {
      return amount;
    }
  }, [selectedAmount, customAmount, tradeType, token]);
  
  const handleTrade = useCallback(async () => {
    if (!token) return;
    setIsTrading(true);
    try {
      await createIfMissing();

      const isBuy = tradeType === 'buy';
      const amountNum = (selectedAmount || parseFloat(customAmount) || 0);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error(t('page.token.invalidAmount'));
      }

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
      if (res?.status !== 200) throw new Error(t('page.token.tradeFailed'));

      setCustomAmount('');
      setSelectedAmount(null);
    } catch (error: any) {
      console.error('Trade failed:', error);
    } finally {
      setIsTrading(false);
    }
  }, [token, tradeType, selectedAmount, customAmount, priority, autoSlippage, slippage, mevProtection, tokenAddress, createIfMissing, trade]);

  // useEffect HOOKS LAST
  useEffect(() => {
    if (!token && tokens.length > 0 && !address) {
      navigate('/meme');
    }
  }, [token, tokens, navigate, address]);

  // Mobile trade handler - defined after all other hooks
  const handleMobileTrade = useCallback((type: 'buy' | 'sell', amount: string) => {
    setTradeType(type);
    setCustomAmount(amount);
    handleTrade();
  }, [handleTrade]);

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
          <p className="text-muted-foreground">{t('page.token.loading')}</p>
        </div>
      </div>
    );
  }

  const isPositive = token.change24h > 0;
  const coverImage = covers[Math.abs(token.symbol.charCodeAt(0)) % covers.length];

  if (isMobile) {
    return (
      <ModernMobileTokenPage
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
      {/* Professional Header */}
      <div className="border-b border-gray-800 bg-gradient-subtle">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Markets
            </Button>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Professional Trading
            </Badge>
          </div>
          
          <ProfessionalTokenHeader token={token} />
        </div>
      </div>

      {/* Main Layout - Chart + Sidebar */}
      <div className="flex">
        {/* Chart Section */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Professional Trading Chart */}
            <ProfessionalTradingChart
              symbol={tokenAddress || token.symbol}
              currentPrice={token.price}
              tokenName={token.name}
            />

            {/* Data Toggle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Overview Card */}
              <Card className="bg-gradient-surface border-gray-800 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Market Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-lg font-bold text-foreground font-mono">
                      {formatMarketCap(token.marketCap)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-lg font-bold text-foreground font-mono">
                      {formatMarketCap(token.volume24h)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Holders</p>
                    <p className="text-lg font-bold text-foreground font-mono">
                      {token.holders?.toLocaleString() || '—'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Circulating</p>
                    <p className="text-lg font-bold text-foreground font-mono">
                      1.00B {token.symbol}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Trading Activity Card */}
              <Card className="bg-gradient-surface border-gray-800 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Trading Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Buys (24h)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="font-mono text-foreground">1,247</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sells (24h)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      <span className="font-mono text-foreground">892</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Trade Size</span>
                    <span className="font-mono text-foreground">2.3 SOL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price Impact</span>
                    <span className="font-mono text-success">0.12%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Professional Trading Sidebar */}
        <ProfessionalTradingSidebar
          tokenSymbol={token.symbol}
          currentPrice={token.price}
          onTrade={handleMobileTrade}
          isTrading={isTrading}
        />
      </div>
    </div>
  );
};

export default MemeTokenDetailPage;