import { useState, useEffect } from 'react';
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

  // Find the token based on symbol
  const token = tokens.find(t => t.symbol.toLowerCase() === symbol?.toLowerCase());

  useEffect(() => {
    if (!token && tokens.length > 0) {
      navigate('/meme');
    }
  }, [token, tokens, navigate]);

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

  // DESKTOP VERSION - Modern Trading App Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="max-w-[1920px] mx-auto">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-10 px-4 rounded-xl hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10">
                  <OptimizedImage
                    src={coverImage}
                    alt={token.symbol}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{token.emoji} {token.symbol}</h1>
                  <p className="text-sm text-muted-foreground">{token.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <span className="text-2xl font-bold">{formatPrice(token.price)}</span>
                <Badge 
                  variant={isPositive ? "default" : "destructive"}
                  className={`${isPositive ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="h-10 w-10 rounded-xl"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="h-10 w-10 rounded-xl"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-xl"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100vh-81px)]">
          {/* Left Panel - Chart */}
          <div className="flex-1 border-r border-border/50">
            <div className="h-full flex flex-col">
              {/* Chart Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/30">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">Live Chart</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    <span>TradingView Professional</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Maximize2 className="w-3 h-3 mr-1" />
                    Fullskärm
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Settings className="w-3 h-3 mr-1" />
                    Inställningar
                  </Button>
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-1 bg-[#0f0f23] relative">
                <TradingViewChart 
                  symbol={token.symbol} 
                  currentPrice={token.price}
                  coinGeckoId={token.symbol.toLowerCase()} 
                />
              </div>

              {/* Chart Tools */}
              <div className="p-4 border-t border-border/50 bg-card/30">
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Signal className="w-4 h-4 text-primary" />
                    <div className="text-xs">
                      <div className="font-medium">Tekniska Indikatorer</div>
                      <div className="text-muted-foreground">RSI, MACD, EMA</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <Volume2 className="w-4 h-4 text-green-500" />
                    <div className="text-xs">
                      <div className="font-medium">Volymanalys</div>
                      <div className="text-muted-foreground">Live handelsdata</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <div className="text-xs">
                      <div className="font-medium">Marknadsdjup</div>
                      <div className="text-muted-foreground">Orderbok data</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <CloudLightning className="w-4 h-4 text-purple-500" />
                    <div className="text-xs">
                      <div className="font-medium">AI Insights</div>
                      <div className="text-muted-foreground">Smart analys</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Trading & Stats */}
          <div className="w-[400px] bg-card/20 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="p-3 border-b border-border/50">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-xl">
                  <TabsTrigger value="trade" className="rounded-lg font-medium">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Handel
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-lg font-medium">
                    <Activity className="w-4 h-4 mr-1" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="community" className="rounded-lg font-medium">
                    <Users className="w-4 h-4 mr-1" />
                    Community
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="trade" className="p-0 m-0 h-full">
                  <div className="p-4 space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                        <div className="text-sm font-bold">{formatMarketCap(token.marketCap)}</div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">24h Volym</div>
                        <div className="text-sm font-bold">{stats.volume24h}</div>
                      </Card>
                    </div>

                    {/* Trading Interface */}
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        <h3 className="font-bold">Snabbhandel</h3>
                      </div>
                      
                      {/* Large Buy/Sell Buttons */}
                      <div className="space-y-3 mb-4">
                        <Button 
                          size="lg"
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold h-12 rounded-xl shadow-lg"
                          onClick={() => setActiveTab('trade')}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          KÖP {token.symbol}
                        </Button>
                        <Button 
                          variant="outline"
                          size="lg"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 rounded-xl"
                        >
                          <TrendingDown className="w-5 h-5 mr-2" />
                          SÄLJ {token.symbol}
                        </Button>
                      </div>

                      {/* Jupiter Widget */}
                      <div className="bg-muted/20 rounded-xl p-2">
                        <JupiterSwapWidget height={400} />
                      </div>
                    </Card>

                    {/* Warning */}
                    <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-amber-600 text-sm mb-1">Riskvarning</h4>
                          <p className="text-xs text-muted-foreground">
                            Meme-tokens är högrisksinvesteringar. Investera endast vad du har råd att förlora.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="p-0 m-0 h-full">
                  <div className="p-4 space-y-4">
                    {/* Token Info */}
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10">
                          <OptimizedImage
                            src={coverImage}
                            alt={token.symbol}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{token.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      
                      {/* Price Info */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Aktuellt pris</span>
                          <span className="font-bold">{formatPrice(token.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">24h förändring</span>
                          <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Market Cap</span>
                          <span className="font-bold">{formatMarketCap(token.marketCap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Volym 24h</span>
                          <span className="font-bold">{stats.volume24h}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Holders</span>
                          <span className="font-bold">{token.holders.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Detailed Stats */}
                    <Card className="p-4">
                      <h4 className="font-bold mb-3">Detaljerad Statistik</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ATH</span>
                          <span className="font-medium">{stats.ath}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ATL</span>
                          <span className="font-medium">{stats.atl}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Supply</span>
                          <span className="font-medium">{stats.maxSupply}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volatilitet</span>
                          <span className="font-medium">{stats.volatility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Likviditetspoäng</span>
                          <span className="font-medium">{stats.liquidityScore}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Tags */}
                    <Card className="p-4">
                      <h4 className="font-bold mb-3">Kategorier</h4>
                      <div className="flex flex-wrap gap-2">
                        {token.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="community" className="p-0 m-0 h-full">
                  <div className="p-4 space-y-4">
                    <Card className="p-4">
                      <h4 className="font-bold mb-4">Community Länkar</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Telegram
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Twitter
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Discord
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Website
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-bold mb-3">Community Stats</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Visningar</span>
                          <span className="font-medium">{token.views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sentiment</span>
                          <span className="font-medium text-green-500">{stats.sentiment}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTokenDetailPage;
