import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Share2, 
  Heart,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Target,
  BarChart3,
  Clock,
  DollarSign,
  ShoppingCart,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Globe,
  MessageCircle,
  Award,
  Activity,
  Layers,
  Volume2,
  Calendar,
  PieChart,
  LineChart,
  BarChart,
  Maximize2,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Flag,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  Database,
  Network,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  CloudLightning
} from 'lucide-react';
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
import JupiterSwapWidget from '@/components/web3/JupiterSwapWidget';
import TradingViewMobileChart from '@/components/mobile/TradingViewMobileChart';
import TradingViewChart from '@/components/TradingViewChart';

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

  // Find the token based on symbol
  const token = tokens.find(t => t.symbol.toLowerCase() === symbol?.toLowerCase());

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  useEffect(() => {
    if (!token && tokens.length > 0) {
      navigate('/meme');
    }
  }, [token, tokens, navigate]);

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
    const amount = (tokenBalance * percentage) / 100;
    setCustomAmount(amount.toString());
    setSelectedAmount(null);
  }, [tokenBalance]);

  const handleTrade = useCallback(async () => {
    if (!token) return;
    setIsTrading(true);
    try {
      // Simulate trading delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = selectedAmount || parseFloat(customAmount) || 0;
      console.log(`${tradeType.toUpperCase()} ${amount} ${tradeType === 'buy' ? 'SOL' : token.symbol}`, {
        orderType,
        slippage: autoSlippage ? 'auto' : slippage,
        priority,
        mevProtection,
        limitPrice: orderType === 'limit' ? limitPrice : null,
        stopPrice: orderType === 'stop' ? stopPrice : null
      });
      
      // Reset form after successful trade
      setCustomAmount('');
      setSelectedAmount(null);
    } catch (error) {
      console.error('Trade failed:', error);
    } finally {
      setIsTrading(false);
    }
  }, [tradeType, selectedAmount, customAmount, orderType, slippage, autoSlippage, priority, mevProtection, limitPrice, stopPrice, token]);

  const getPriorityFee = useCallback(() => {
    switch (priority) {
      case 'low': return '0.0001 SOL';
      case 'medium': return '0.0005 SOL';
      case 'high': return '0.001 SOL';
      default: return '0.0005 SOL';
    }
  }, [priority]);

  const getEstimatedGas = useCallback(() => {
    return orderType === 'market' ? '0.002 SOL' : '0.003 SOL';
  }, [orderType]);

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
          <p className="text-muted-foreground">Laddar token...</p>
        </div>
      </div>
    );
  }

  const isPositive = token.change24h > 0;
  const coverImage = covers[Math.abs(token.symbol.charCodeAt(0)) % covers.length];

  // Enhanced statistics for desktop
  const getEnhancedStats = () => ({
    volume24h: '$2.4M',
    volume7d: '$18.7M',
    marketCapRank: '#42',
    holders: token.holders,
    maxSupply: '1,000,000,000',
    circulatingSupply: '856,420,000',
    ath: formatPrice(token.price * 2.5),
    atl: formatPrice(token.price * 0.1),
    athDate: '2024-03-15',
    atlDate: '2024-01-08',
    priceChange1h: '+2.34%',
    priceChange7d: '+15.67%',
    priceChange30d: '+89.12%',
    volatility: 'Hög',
    liquidityScore: '8.5/10',
    riskScore: 'Medel-Hög',
    sentiment: 'Positiv'
  });

  const stats = getEnhancedStats();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              src={coverImage}
              alt={`${token.name} background`}
              className="w-full h-full object-cover scale-110 blur-xl opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>

          <div className="relative z-10 pt-6 pb-8">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-6 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
                        <OptimizedImage
                          src={coverImage}
                          alt={`${token.name} logo`}
                          className="w-full h-full object-cover"
                        />
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
                        <h1 className="text-3xl font-crypto font-black">
                          {token.emoji} {token.symbol}
                        </h1>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsLiked(!isLiked)}
                          className="h-8 w-8 rounded-full p-0"
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>
                      
                      <p className="text-lg text-muted-foreground font-crypto font-medium mb-3">
                        {token.name}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-crypto font-black">
                          {formatPrice(token.price)}
                        </span>
                        <Badge 
                          variant={isPositive ? "default" : "destructive"}
                          className={`${isPositive ? 'bg-success text-success-foreground' : ''} font-bold text-sm px-3 py-1`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                      <div className="font-crypto font-bold text-sm">{formatMarketCap(token.marketCap)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Holders</div>
                      <div className="font-crypto font-bold text-sm">
                        {token.holders > 1000 ? `${Math.floor(token.holders/1000)}K` : token.holders}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Views</div>
                      <div className="font-crypto font-bold text-sm">{token.views}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button 
                      className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-crypto font-bold h-11 rounded-xl shadow-lg"
                      onClick={() => setActiveTab('trade')}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      KÖP TOKEN
                    </Button>
                    <Button 
                      variant="outline"
                      className="font-crypto font-bold h-11 rounded-xl border-2"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      ANALYS
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="container mx-auto px-4 pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/80 backdrop-blur-sm rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg font-crypto font-semibold">Översikt</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-lg font-crypto font-semibold">Stats</TabsTrigger>
              <TabsTrigger value="trade" className="rounded-lg font-crypto font-semibold">Handel</TabsTrigger>
              <TabsTrigger value="community" className="rounded-lg font-crypto font-semibold">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-crypto font-bold">Live Chart - {token.symbol}</h3>
                  </div>
                  
                  <div className="bg-[#0f0f23] rounded-xl overflow-hidden shadow-lg border border-border/20">
                    <div className="h-[400px] relative">
                      <TradingViewMobileChart 
                        symbol={token.symbol} 
                        coinGeckoId={token.symbol.toLowerCase()} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Live prisdata från TradingView för {token.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {/* Token Description */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-crypto font-bold mb-4">Om {token.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {token.name} ({token.symbol}) är en meme-token som har tagit krypto-communityn med storm. 
                    Med sitt unika koncept och starka community-support, representerar denna token en ny våg av 
                    decentraliserad innovation inom meme-ekonomin.
                  </p>
                </div>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-crypto font-bold mb-4">Nyckelstatistik</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Pris</span>
                      </div>
                      <div className="text-lg font-crypto font-bold">{formatPrice(token.price)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-emerald-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-muted-foreground">24h Förändring</span>
                      </div>
                      <div className={`text-lg font-crypto font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-muted-foreground">Holders</span>
                      </div>
                      <div className="text-lg font-crypto font-bold">{token.holders.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Visningar</span>
                      </div>
                      <div className="text-lg font-crypto font-bold">{token.views.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-crypto font-bold mb-4">Kategorier</h3>
                  <div className="flex flex-wrap gap-2">
                    {token.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-crypto font-semibold">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Detailed Statistics */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-crypto font-bold mb-6">Detaljerad Statistik</h3>
                  
                  {/* Market Cap Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Market Cap Progress</span>
                      <span className="text-sm font-crypto font-bold">{formatMarketCap(token.marketCap)}</span>
                    </div>
                    <Progress value={Math.min((token.marketCap / 10000000) * 100, 100)} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">Till $10M market cap</div>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Ranking</span>
                      <span className="font-crypto font-bold">#42</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Volym 24h</span>
                      <span className="font-crypto font-bold">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">ATH</span>
                      <span className="font-crypto font-bold">{formatPrice(token.price * 2.5)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">ATL</span>
                      <span className="font-crypto font-bold">{formatPrice(token.price * 0.1)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="trade" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-crypto font-bold">Handla {token.symbol}</h3>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4">
                    <JupiterSwapWidget height={500} />
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-crypto font-bold text-amber-500 mb-1">Säkerhetsvarning</h4>
                        <p className="text-sm text-muted-foreground">
                          Kom ihåg att alltid DYOR (Do Your Own Research) innan du investerar i meme-tokens. 
                          Dessa investeringar är högrisk och kan resultera i total förlust.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-xl font-crypto font-bold mb-4">Community</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 font-crypto font-semibold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Telegram
                    </Button>
                    <Button variant="outline" className="h-12 font-crypto font-semibold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" className="h-12 font-crypto font-semibold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Discord
                    </Button>
                    <Button variant="outline" className="h-12 font-crypto font-semibold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION - Modern Meme Trading Platform (Axiom/BullX inspired)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/30">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(-1)}
                className="h-12 px-6 rounded-2xl bg-card/60 hover:bg-card/80 border border-border/30 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                <span className="text-lg font-semibold">Tillbaka</span>
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
                  <OptimizedImage
                    src={coverImage}
                    alt={token.symbol}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{token.emoji} {token.symbol}</h1>
                  <p className="text-lg text-muted-foreground font-medium">{token.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/60 border border-border/30">
                <span className="text-3xl font-black">{formatPrice(token.price)}</span>
                <Badge 
                  variant={isPositive ? "default" : "destructive"}
                  className={`${isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white font-bold text-lg px-4 py-2 rounded-xl`}
                >
                  {isPositive ? <TrendingUp className="w-5 h-5 mr-2" /> : <TrendingDown className="w-5 h-5 mr-2" />}
                  {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsLiked(!isLiked)}
                  className="h-12 w-12 rounded-2xl bg-card/60 hover:bg-card/80 border border-border/30"
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="h-12 w-12 rounded-2xl bg-card/60 hover:bg-card/80 border border-border/30"
                >
                  <Bookmark className={`h-6 w-6 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-12 rounded-2xl bg-card/60 hover:bg-card/80 border border-border/30"
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-120px)]">
          
          {/* Left Panel - Chart (Takes 3/4 width) */}
          <div className="lg:col-span-3">
            <Card className="h-full bg-card/40 backdrop-blur-xl border-border/30 shadow-2xl rounded-3xl overflow-hidden">
              {/* Chart Header */}
              <div className="flex items-center justify-between p-8 border-b border-border/20 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/40">
                      <LineChart className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-oblivion font-black mb-1">Live Trading Chart</h2>
                      <p className="text-xl text-muted-foreground font-oblivion font-medium">Professional {token.symbol} Analysis</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="lg" className="h-14 px-6 rounded-2xl text-lg font-oblivion font-semibold border-2">
                    Fullscreen
                  </Button>
                  <Button variant="outline" size="lg" className="h-14 px-6 rounded-2xl text-lg font-oblivion font-semibold border-2">
                    Settings
                  </Button>
                  <Button variant="outline" size="lg" className="h-14 px-6 rounded-2xl text-lg font-oblivion font-semibold border-2">
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Chart Container with NO padding - only chart visible */}
              <div className="flex-1 bg-[#0f0f23] rounded-b-3xl overflow-hidden">
                <div className="h-[600px] w-full">
                  <TradingViewChart 
                    symbol={token.symbol} 
                    currentPrice={token.price}
                    coinGeckoId={token.symbol.toLowerCase()} 
                  />
                </div>
              </div>

              {/* Chart Analytics Footer */}
              <div className="p-8 border-t border-border/20 bg-gradient-to-r from-card/60 to-card/40">
                <div className="grid grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Signal className="w-6 h-6 text-blue-500" />
                      <span className="text-lg font-oblivion font-bold text-blue-500">Technical Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-oblivion">RSI, MACD, Moving Averages</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Volume2 className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-oblivion font-bold text-green-500">Volume Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-oblivion">Real-time trading volume</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-500" />
                      <span className="text-lg font-oblivion font-bold text-purple-500">Market Depth</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-oblivion">Order book analysis</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <CloudLightning className="w-6 h-6 text-orange-500" />
                      <span className="text-lg font-oblivion font-bold text-orange-500">AI Insights</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-oblivion">Smart market predictions</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Trading Interface (Takes 1/4 width) */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* Quick Stats Card */}
              <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/30 shadow-xl rounded-3xl">
                <h3 className="text-2xl font-oblivion font-black mb-6 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Market Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20">
                    <span className="text-lg font-oblivion font-semibold text-muted-foreground">Market Cap</span>
                    <span className="text-xl font-oblivion font-black">{formatMarketCap(token.marketCap)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20">
                    <span className="text-lg font-oblivion font-semibold text-muted-foreground">24h Volume</span>
                    <span className="text-xl font-oblivion font-black">{stats.volume24h}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20">
                    <span className="text-lg font-oblivion font-semibold text-muted-foreground">Holders</span>
                    <span className="text-xl font-oblivion font-black">{token.holders.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Advanced Trading Panel */}
              <Card className="p-8 bg-card/40 backdrop-blur-xl border-border/30 shadow-xl rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-oblivion font-black flex items-center gap-4">
                    <ShoppingCart className="w-8 h-8 text-primary" />
                    Professional Trading
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="text-primary hover:text-primary/80 font-oblivion"
                  >
                    Advanced
                  </Button>
                </div>
                
                {/* Order Type Selection */}
                <div className="mb-8">
                  <label className="text-xl font-oblivion font-bold text-muted-foreground mb-4 block">Order Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['market', 'limit', 'stop'].map((type) => (
                      <Button
                        key={type}
                        variant={orderType === type ? "default" : "outline"}
                        size="lg"
                        onClick={() => setOrderType(type as typeof orderType)}
                        className={`h-14 text-lg font-oblivion font-bold rounded-2xl border-2 transition-all duration-300 ${
                          orderType === type 
                            ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                            : 'hover:bg-primary/10 hover:border-primary/50'
                        }`}
                      >
                        {type.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Buy/Sell Toggle - FIXED text overflow and removed icons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Button 
                    size="lg"
                    onClick={() => setTradeType('buy')}
                    className={`h-20 font-oblivion font-black text-xl rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 px-4 ${
                      tradeType === 'buy'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
                  >
                    <span className="truncate">BUY {token.symbol}</span>
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => setTradeType('sell')}
                    className={`h-20 font-oblivion font-black text-xl rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 px-4 ${
                      tradeType === 'sell'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                    }`}
                  >
                    <span className="truncate">SELL {token.symbol}</span>
                  </Button>
                </div>

                {/* Dynamic Amount Selection based on Buy/Sell */}
                <div className="space-y-6 mb-8">
                  <label className="text-xl font-oblivion font-bold text-muted-foreground">
                    {tradeType === 'buy' ? 'Buy Amount (SOL)' : 'Sell Amount (%)'}
                  </label>
                  
                  {tradeType === 'buy' ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 5, 10, 25].map((amount) => (
                        <Button 
                          key={amount}
                          variant={selectedAmount === amount ? "default" : "outline"}
                          size="lg"
                          onClick={() => handleAmountSelect(amount)}
                          className={`h-16 text-xl font-oblivion font-bold rounded-2xl border-2 transition-all duration-300 ${
                            selectedAmount === amount
                              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                              : 'hover:bg-primary/10 hover:border-primary/50'
                          }`}
                        >
                          {amount} SOL
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[25, 50, 75, 100].map((percentage) => (
                        <Button 
                          key={percentage}
                          variant="outline"
                          size="lg"
                          onClick={() => calculateSellPercentage(percentage)}
                          className="h-16 text-xl font-oblivion font-bold rounded-2xl border-2 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                        >
                          {percentage === 100 ? 'SELL ALL' : `${percentage}%`}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Custom Amount Input */}
                  <div className="space-y-3">
                    <label className="text-lg font-oblivion font-bold text-muted-foreground">
                      Custom {tradeType === 'buy' ? 'SOL Amount' : 'Token Amount'}
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder={tradeType === 'buy' ? "Enter SOL amount" : "Enter token amount"}
                        className="w-full h-16 px-6 text-xl font-oblivion font-semibold bg-muted/20 border-2 border-border/30 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      />
                      <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xl font-oblivion font-bold text-muted-foreground">
                        {tradeType === 'buy' ? 'SOL' : token.symbol}
                      </span>
                    </div>
                    {tradeType === 'sell' && (
                      <p className="text-sm font-oblivion text-muted-foreground">
                        Available: {tokenBalance.toLocaleString()} {token.symbol}
                      </p>
                    )}
                  </div>
                </div>

                {/* Limit/Stop Price Inputs */}
                {orderType !== 'market' && (
                  <div className="space-y-4 mb-8">
                    {orderType === 'limit' && (
                      <div className="space-y-3">
                        <label className="text-lg font-oblivion font-bold text-muted-foreground">Limit Price</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder={`Enter limit price (current: ${formatPrice(token.price)})`}
                            className="w-full h-14 px-6 text-lg font-oblivion font-semibold bg-muted/20 border-2 border-border/30 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          />
                          <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-lg font-oblivion font-bold text-muted-foreground">USD</span>
                        </div>
                      </div>
                    )}
                    
                    {orderType === 'stop' && (
                      <div className="space-y-3">
                        <label className="text-lg font-oblivion font-bold text-muted-foreground">Stop Price</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={stopPrice}
                            onChange={(e) => setStopPrice(e.target.value)}
                            placeholder={`Enter stop price (current: ${formatPrice(token.price)})`}
                            className="w-full h-14 px-6 text-lg font-oblivion font-semibold bg-muted/20 border-2 border-border/30 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          />
                          <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-lg font-oblivion font-bold text-muted-foreground">USD</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Settings Panel */}
                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10 border border-border/30"
                    >
                      <h4 className="text-xl font-oblivion font-bold mb-6 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        Advanced Trading Settings
                      </h4>
                      
                      {/* Slippage Settings */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-oblivion font-bold text-muted-foreground">Slippage Tolerance</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAutoSlippage(!autoSlippage)}
                              className={`h-8 px-3 text-sm rounded-lg font-oblivion ${autoSlippage ? 'bg-primary text-primary-foreground' : ''}`}
                            >
                              Auto
                            </Button>
                          </div>
                        </div>
                        
                        {!autoSlippage && (
                          <div className="flex gap-2">
                            {[1, 2, 5].map((percentage) => (
                              <Button 
                                key={percentage}
                                variant={slippage === percentage ? "default" : "outline"}
                                size="sm" 
                                onClick={() => setSlippage(percentage)}
                                className="h-10 px-4 text-sm font-oblivion font-bold rounded-xl"
                              >
                                {percentage}%
                              </Button>
                            ))}
                            <div className="relative flex-1">
                              <input 
                                type="number" 
                                value={customSlippage}
                                onChange={(e) => setCustomSlippage(e.target.value)}
                                placeholder="Custom"
                                className="w-full h-10 px-3 text-sm font-oblivion font-semibold bg-muted/20 border border-border/30 rounded-xl focus:border-primary/50 transition-all duration-300"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Priority Fee */}
                      <div className="space-y-4 mb-6">
                        <span className="text-lg font-oblivion font-bold text-muted-foreground">Priority Fee</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'low', label: 'Low', desc: '0.0001 SOL' },
                            { key: 'medium', label: 'Medium', desc: '0.0005 SOL' },
                            { key: 'high', label: 'High', desc: '0.001 SOL' }
                          ].map(({ key, label, desc }) => (
                            <Button
                              key={key}
                              variant={priority === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPriority(key as typeof priority)}
                              className={`h-12 flex flex-col items-center justify-center text-xs font-oblivion font-bold rounded-xl transition-all duration-300 ${
                                priority === key ? 'bg-primary text-primary-foreground' : ''
                              }`}
                            >
                              <span>{label}</span>
                              <span className="text-xs opacity-70">{desc}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* MEV Protection */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-500" />
                          <div>
                            <span className="text-lg font-oblivion font-bold">MEV Protection</span>
                            <p className="text-sm font-oblivion text-muted-foreground">Protect against frontrunning</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMevProtection(!mevProtection)}
                          className={`h-8 w-16 rounded-full ${
                            mevProtection 
                              ? 'bg-green-500 text-white' 
                              : 'bg-muted border border-border'
                          }`}
                          >
                            {mevProtection ? 'ON' : 'OFF'}
                          </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trade Summary */}
                <div className="space-y-4 mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                  <h4 className="text-xl font-oblivion font-bold mb-4">Trade Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-oblivion">
                        {tradeType === 'buy' ? 'You Pay' : 'You Sell'}
                      </span>
                      <span className="font-oblivion font-bold text-lg">
                        {customAmount || selectedAmount || 0} {tradeType === 'buy' ? 'SOL' : token.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-oblivion">
                        {tradeType === 'buy' ? 'You Receive' : 'You Receive'}
                      </span>
                      <span className="font-oblivion font-bold text-lg">
                        {tradeType === 'buy' 
                          ? `~${((parseFloat(customAmount) || selectedAmount || 0) / token.price).toLocaleString()} ${token.symbol}`
                          : `~${((parseFloat(customAmount) || 0) * token.price).toFixed(4)} SOL`
                        }
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-oblivion">Priority Fee</span>
                      <span className="font-oblivion">{getPriorityFee()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-oblivion">Est. Gas</span>
                      <span className="font-oblivion">{getEstimatedGas()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-oblivion">Slippage</span>
                      <span className="font-oblivion">{autoSlippage ? 'Auto' : `${customSlippage || slippage}%`}</span>
                    </div>
                  </div>
                </div>

                {/* Execute Trade Button - FIXED text overflow and removed icons */}
                <Button 
                  size="lg"
                  onClick={handleTrade}
                  disabled={!customAmount && !selectedAmount || isTrading}
                  className={`w-full h-20 text-2xl font-oblivion font-black rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 px-4 ${
                    tradeType === 'buy'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {isTrading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <span className="truncate">
                      {tradeType === 'buy' ? 'BUY' : 'SELL'} {token.symbol}
                    </span>
                  )}
                </Button>

                {/* Wallet Balance Info */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-oblivion text-muted-foreground">Wallet Balance</span>
                    <div className="text-right">
                      <div className="text-sm font-oblivion font-bold">{solBalance.toFixed(4)} SOL</div>
                      <div className="text-xs font-oblivion text-muted-foreground">{tokenBalance.toLocaleString()} {token.symbol}</div>
                    </div>
                  </div>
                </div>

                {/* Risk Warning */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-oblivion font-bold text-amber-500 mb-1">Trading Risk</h4>
                      <p className="text-sm font-oblivion text-muted-foreground">
                        Meme tokens are highly volatile. Only invest what you can afford to lose.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Additional Trading Tools */}
              <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/30 shadow-xl rounded-3xl">
                <h3 className="text-2xl font-oblivion font-black mb-6 flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Trading Tools
                </h3>
                
                <div className="space-y-4">
                  {/* Price Alerts */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Bell className="w-5 h-5 text-blue-500" />
                      <span className="font-oblivion font-bold text-blue-500">Price Alerts</span>
                    </div>
                    <div className="space-y-2">
                      <input 
                        type="number" 
                        value={priceAlert}
                        onChange={(e) => setPriceAlert(e.target.value)}
                        placeholder="Set price alert"
                        className="w-full h-10 px-3 text-sm font-oblivion bg-muted/20 border border-border/30 rounded-xl focus:border-primary/50 transition-all duration-300"
                      />
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs font-oblivion rounded-lg">
                        Set Alert
                      </Button>
                    </div>
                  </div>

                  {/* Copy Trade Address */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Copy className="w-5 h-5 text-purple-500" />
                      <span className="font-oblivion font-bold text-purple-500">Token Address</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        readOnly
                        value="7xKXt..."
                        className="flex-1 h-8 px-3 text-xs font-oblivion bg-muted/20 border border-border/30 rounded-lg"
                      />
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-oblivion rounded-lg">
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-5 h-5 text-green-500" />
                      <span className="font-oblivion font-bold text-green-500">Performance</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-oblivion">1h:</span>
                        <span className="text-green-500 font-oblivion font-bold">+2.34%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-oblivion">7d:</span>
                        <span className="text-green-500 font-oblivion font-bold">+15.67%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-oblivion">30d:</span>
                        <span className="text-green-500 font-oblivion font-bold">+89.12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-oblivion">ATH:</span>
                        <span className="font-oblivion font-bold">{formatPrice(token.price * 2.5)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTokenDetailPage;
