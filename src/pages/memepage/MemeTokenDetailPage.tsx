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
import { MemeTokenSidebar } from '@/components/MemeTokenSidebar';

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

  // Prefer full details when available (with Birdeye fallback from local state)
  const [beMarket, setBeMarket] = useState<any>(null);
  
  // Resolve derived token object with Birdeye merge even if DEXTools is missing
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

  const beMerged = beMarket ? {
    price: tokenBase.price || beMarket?.price || beMarket?.priceUsd || beMarket?.value || 0,
    marketCap: tokenBase.marketCap || beMarket?.marketCap || beMarket?.marketcap || beMarket?.mc || 0,
    volume24h: tokenBase.volume24h || beMarket?.volume24h || beMarket?.volume_24h || beMarket?.volume || 0,
  } : {};

  const token = {
    ...tokenBase,
    ...beMerged,
    ...(details ? {
      id: details.address,
      symbol: details.symbol,
      name: details.name,
      image: details.logo || tokenBase.image,
      price: details.price ?? (beMerged as any).price ?? tokenBase.price,
      change24h: details.variation24h ?? tokenBase.change24h,
      volume24h: details.pool?.volume24h ?? (beMerged as any).volume24h ?? tokenBase.volume24h,
      marketCap: details.marketCap ?? (beMerged as any).marketCap ?? tokenBase.marketCap,
      holders: details.holders ?? tokenBase.holders,
      description: details.description || tokenBase.description,
    } : {}),
  } as any;

  // Derived data from DEXTools pool price for volumes and token address
  const poolPrice = (details as any)?.raw?.poolPrice?.data ?? (details as any)?.raw?.poolPrice ?? null;
  const volume1h = typeof poolPrice?.volume1h === 'number' ? poolPrice.volume1h : undefined;
  const volume6h = typeof poolPrice?.volume6h === 'number' ? poolPrice.volume6h : undefined;
  const volume24hDerived = typeof poolPrice?.volume24h === 'number' ? poolPrice.volume24h : (beMarket?.volume24h ?? beMarket?.volume_24h ?? undefined);
  const tokenAddress = details?.address || address || (token as any)?.id || '';

  // Fetch Birdeye market data (public plan 1 req/s handled by edge function throttle)
  useEffect(() => {
    if (!tokenAddress) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('birdeye-proxy', {
          body: { action: 'market-data', address: tokenAddress },
        });
        if (!cancelled) {
          setBeMarket(data?.data?.data ?? data?.data ?? null);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [tokenAddress]);

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

  // Birdeye OHLCV volumes
  const [volumes, setVolumes] = useState<{ v1h?: number; v6h?: number; v24h?: number }>({});
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!tokenAddress) return;
      try {
        const { data } = await supabase.functions.invoke('birdeye-proxy', {
          body: { action: 'ohlcv', address: tokenAddress, params: { type: '1H' } },
        });
        const items: any[] = (data?.data?.data?.items ?? data?.data?.items ?? data?.data ?? data?.items ?? []) as any[];
        if (Array.isArray(items) && items.length) {
          // items oldest->newest or vice versa; take last N safely
          const last = (n: number) => items.slice(-n);
          const sumV = (arr: any[]) => arr.reduce((s, c) => s + (typeof c?.v === 'number' ? c.v : (typeof c?.volume === 'number' ? c.volume : 0)), 0);
          const v1 = sumV(last(1));
          const v6 = sumV(last(6));
          const v24 = sumV(last(24));
          if (!cancelled) setVolumes({ v1h: v1, v6h: v6, v24h: v24 });
        }
      } catch {}
    };
    run();
    return () => { cancelled = true; };
  }, [tokenAddress]);

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

  // Enhanced statistics for desktop
  const getEnhancedStats = () => ({
    volume1h: typeof (volumes.v1h ?? volume1h) === 'number' ? `$${Number(volumes.v1h ?? volume1h).toLocaleString()}` : '—',
    volume6h: typeof (volumes.v6h ?? volume6h) === 'number' ? `$${Number(volumes.v6h ?? volume6h).toLocaleString()}` : '—',
    volume24h: typeof (volumes.v24h ?? volume24hDerived ?? token.volume24h) === 'number' ? `$${Number((volumes.v24h ?? volume24hDerived ?? token.volume24h)).toLocaleString()}` : '—',
    marketCapRank: '—',
    holders: token.holders,
    maxSupply: token?.description ? undefined : '—',
    circulatingSupply: token?.description ? undefined : '—',
    ath: formatPrice(token.price * 2.5),
    atl: formatPrice(token.price * 0.1),
    athDate: '—',
    atlDate: '—',
    priceChange1h: '—',
    priceChange7d: '—',
    priceChange30d: '—',
    volatility: '—',
    liquidityScore: '—',
    riskScore: '—',
    sentiment: '—'
  });

  const stats = getEnhancedStats();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background font-inter">
        {/* Mobile Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <OptimizedImage src={coverImage} alt={`${token.name} background`} className="w-full h-full object-cover scale-110 blur-xl opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>

          <div className="relative z-10 pt-6 pb-8">
            <div className="container mx-auto px-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card">
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
                        {token.image ? (
                          <OptimizedImage src={token.image} alt={token.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                            {token.symbol.charAt(0)}
                          </div>
                        )}
                      </div>
                      {token.isHot && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse">
                            🔥
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold">
                          {token.emoji} {token.symbol}
                        </h1>
                        <Button variant="ghost" size="sm" onClick={() => setIsLiked(!isLiked)} className="h-8 w-8 rounded-full p-0">
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>
                      
                      <p className="text-lg text-muted-foreground font-medium mb-3">
                        {token.name}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">
                          {formatPrice(token.price)}
                        </span>
                        <Badge variant={isPositive ? "default" : "destructive"} className={`${isPositive ? 'bg-success text-success-foreground' : ''} font-bold text-sm px-3 py-1`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsBookmarked(!isBookmarked)} className="h-8 w-8 rounded-full p-0">
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                      <div className="font-bold text-sm">{formatMarketCap(token.marketCap)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Holders</div>
                      <div className="font-bold text-sm">
                        {token.holders > 1000 ? `${Math.floor(token.holders / 1000)}K` : token.holders}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Views</div>
                      <div className="font-bold text-sm">{token.views}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button size="lg" className="h-14 bg-success hover:bg-success/90 text-success-foreground font-bold text-lg">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Buy
                    </Button>
                    <Button size="lg" variant="destructive" className="h-14 font-bold text-lg">
                      <TrendingDown className="mr-2 h-5 w-5" />
                      Sell
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Content Tabs */}
        <div className="container mx-auto px-4 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Market Cap</span>
                      </div>
                      <div className="text-lg font-bold">{formatMarketCap(token.marketCap)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">24h Volume</span>
                      </div>
                      <div className="text-lg font-bold">{stats.volume24h}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-muted-foreground">Holders</span>
                      </div>
                      <div className="text-lg font-bold">{token.holders.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Views</span>
                      </div>
                      <div className="text-lg font-bold">{token.views}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {token.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-semibold">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="chart" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="h-[400px]">
                  <TradingViewMobileChart 
                    symbol={tokenAddress || token.symbol}
                    coinGeckoId={token.symbol.toLowerCase()}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="trade" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6">Trade {token.symbol}</h3>
                  <JupiterSwapWidget />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              {/* Description */}
              {token.description && (
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{token.description}</p>
                  </div>
                </Card>
              )}

              {/* Contract Info */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Contract Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            navigator.clipboard.writeText(tokenAddress);
                            toast({ title: 'Copied!', description: 'Token address copied to clipboard' });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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

      {/* Main Content Layout - Full Width with Edge-to-Edge Sidebars */}
      <div className="w-full flex">
        {/* Left Sidebar - Fixed to Left Edge */}
        <div className="w-80 flex-shrink-0 bg-card/30 backdrop-blur-sm border-r border-border/20">
          <div className="sticky top-0 h-screen overflow-y-auto p-6">
            <MemeTokenSidebar 
              token={token}
              volumes={volumes}
              beMarket={beMarket}
            />
          </div>
        </div>

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

            {/* Enhanced Market Stats - Full Width */}
            <div className="animate-fade-in">
              <EnhancedMarketStats 
                token={token}
                volumes={volumes}
                beMarket={beMarket}
              />
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