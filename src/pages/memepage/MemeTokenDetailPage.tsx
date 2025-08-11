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

  // DESKTOP VERSION - World-class App Store like design
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/5">
      {/* Desktop Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={coverImage}
            alt={`${token.name} background`}
            className="w-full h-full object-cover scale-105 blur-3xl opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/98 to-background/95" />
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgb(255,255,255)_1px,_transparent_0)]" style={{backgroundSize: '40px 40px'}} />
        </div>

        <div className="relative z-10 pt-8 pb-12">
          <div className="container mx-auto px-8 max-w-7xl">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(-1)}
                className="h-12 px-6 rounded-2xl bg-card/80 backdrop-blur-md hover:bg-card border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium">Tillbaka</span>
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsLiked(!isLiked)}
                  className="h-12 w-12 rounded-2xl bg-card/80 backdrop-blur-md hover:bg-card border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} transition-colors`} />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="h-12 w-12 rounded-2xl bg-card/80 backdrop-blur-md hover:bg-card border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'} transition-colors`} />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-12 rounded-2xl bg-card/80 backdrop-blur-md hover:bg-card border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Hero Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Token Info */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Token Header */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30 shadow-2xl border border-border/30">
                      <OptimizedImage
                        src={coverImage}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {token.isHot && (
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 text-sm font-bold rounded-xl shadow-lg">
                          🔥 HOT
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-5xl font-crypto font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {token.emoji} {token.symbol}
                      </h1>
                      <Badge variant="secondary" className="px-3 py-1 text-sm font-bold rounded-xl">
                        Rank {stats.marketCapRank}
                      </Badge>
                    </div>
                    
                    <h2 className="text-2xl text-muted-foreground font-crypto font-semibold mb-6">
                      {token.name}
                    </h2>

                    {/* Price Section */}
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-crypto font-black">
                          {formatPrice(token.price)}
                        </span>
                        <Badge 
                          variant={isPositive ? "default" : "destructive"}
                          className={`${isPositive ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'} font-bold text-lg px-4 py-2 rounded-xl shadow-lg`}
                        >
                          {isPositive ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                          {isPositive ? '+' : ''}{token.change24h.toFixed(2)}% 24h
                        </Badge>
                      </div>

                      {/* Additional Price Changes */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">1h:</span>
                          <span className="text-sm font-bold text-green-500">{stats.priceChange1h}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">7d:</span>
                          <span className="text-sm font-bold text-green-500">{stats.priceChange7d}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">30d:</span>
                          <span className="text-sm font-bold text-green-500">{stats.priceChange30d}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-4 mt-8">
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-primary via-primary-glow to-primary hover:from-primary-glow hover:via-primary hover:to-primary-glow text-white font-crypto font-bold h-14 px-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-primary/20"
                        onClick={() => setActiveTab('trade')}
                      >
                        <ShoppingCart className="w-5 h-5 mr-3" />
                        KÖP {token.symbol}
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="font-crypto font-bold h-14 px-8 rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm"
                      >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        ANALYS
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="font-crypto font-bold h-14 px-8 rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm"
                      >
                        <Bell className="w-5 h-5 mr-3" />
                        ALERT
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {token.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 font-crypto font-semibold px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Key Stats Cards */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="grid grid-cols-2 gap-6"
              >
                {/* Market Cap Card */}
                <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Market Cap</span>
                    </div>
                    <div className="text-2xl font-crypto font-black mb-2">{formatMarketCap(token.marketCap)}</div>
                    <div className="text-xs text-muted-foreground">Ranking {stats.marketCapRank}</div>
                  </div>
                </Card>

                {/* Volume Card */}
                <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                        <BarChart className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Volym 24h</span>
                    </div>
                    <div className="text-2xl font-crypto font-black mb-2">{stats.volume24h}</div>
                    <div className="text-xs text-muted-foreground">7d: {stats.volume7d}</div>
                  </div>
                </Card>

                {/* Holders Card */}
                <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Holders</span>
                    </div>
                    <div className="text-2xl font-crypto font-black mb-2">{token.holders.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Unika adresser</div>
                  </div>
                </Card>

                {/* Views Card */}
                <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Visningar</span>
                    </div>
                    <div className="text-2xl font-crypto font-black mb-2">{token.views.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total intresse</div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Content Tabs */}
      <div className="container mx-auto px-8 max-w-7xl pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Modern Tab Navigation */}
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-fit grid-cols-4 bg-card/90 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-border/50">
              <TabsTrigger value="overview" className="rounded-2xl font-crypto font-bold px-8 py-4 text-lg transition-all duration-300">
                <BarChart3 className="w-5 h-5 mr-3" />
                Översikt
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-2xl font-crypto font-bold px-8 py-4 text-lg transition-all duration-300">
                <Activity className="w-5 h-5 mr-3" />
                Statistik
              </TabsTrigger>
              <TabsTrigger value="trade" className="rounded-2xl font-crypto font-bold px-8 py-4 text-lg transition-all duration-300">
                <ShoppingCart className="w-5 h-5 mr-3" />
                Handel
              </TabsTrigger>
              <TabsTrigger value="community" className="rounded-2xl font-crypto font-bold px-8 py-4 text-lg transition-all duration-300">
                <Users className="w-5 h-5 mr-3" />
                Community
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab - Advanced Chart */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-md border border-border/50 shadow-2xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <LineChart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-crypto font-black">Live Trading Chart</h3>
                        <p className="text-muted-foreground">Professionell prisanalys för {token.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Fullskärm
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Settings className="w-4 h-4 mr-2" />
                        Inställningar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-[#0f0f23] rounded-3xl overflow-hidden shadow-2xl border border-border/20">
                    <div className="h-[600px] relative">
                      <TradingViewChart 
                        symbol={token.symbol} 
                        currentPrice={token.price}
                        coinGeckoId={token.symbol.toLowerCase()} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground font-medium">Live Data</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Realtidsdata från TradingView
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Signal className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground font-medium">Tekniska Indikatorer</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        RSI, MACD, Moving Averages
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground font-medium">Volymanalys</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Handelsvolym och liquiditet
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-violet-500/5 border border-purple-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <CloudLightning className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-muted-foreground font-medium">AI Insights</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Marknadsanalys och prognoser
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/90 backdrop-blur-md border border-border/50 shadow-2xl p-8">
                <h3 className="text-3xl font-crypto font-bold mb-6">Detaljerad Statistik</h3>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Supply</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li><strong>Max Supply:</strong> {stats.maxSupply}</li>
                      <li><strong>Circulating Supply:</strong> {stats.circulatingSupply}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Price History</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li><strong>All Time High:</strong> {stats.ath} ({stats.athDate})</li>
                      <li><strong>All Time Low:</strong> {stats.atl} ({stats.atlDate})</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Performance</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li><strong>Volatility:</strong> {stats.volatility}</li>
                      <li><strong>Liquidity Score:</strong> {stats.liquidityScore}</li>
                      <li><strong>Risk Score:</strong> {stats.riskScore}</li>
                      <li><strong>Sentiment:</strong> {stats.sentiment}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Trade Tab */}
          <TabsContent value="trade" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/90 backdrop-blur-md border border-border/50 shadow-2xl p-8">
                <h3 className="text-3xl font-crypto font-bold mb-6">Handla {token.symbol}</h3>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 shadow-lg">
                  <JupiterSwapWidget height={600} />
                </div>
                <div className="mt-8 p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <h4 className="font-crypto font-bold text-amber-500 mb-2">Säkerhetsvarning</h4>
                    <p className="text-muted-foreground text-sm max-w-xl">
                      Kom ihåg att alltid DYOR (Do Your Own Research) innan du investerar i meme-tokens. 
                      Dessa investeringar är högrisk och kan resultera i total förlust.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/90 backdrop-blur-md border border-border/50 shadow-2xl p-8">
                <h3 className="text-3xl font-crypto font-bold mb-6">Community</h3>
                <div className="grid grid-cols-4 gap-6">
                  <Button variant="outline" size="lg" className="font-crypto font-semibold flex items-center justify-center gap-3">
                    <ExternalLink className="w-5 h-5" />
                    Telegram
                  </Button>
                  <Button variant="outline" size="lg" className="font-crypto font-semibold flex items-center justify-center gap-3">
                    <ExternalLink className="w-5 h-5" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="lg" className="font-crypto font-semibold flex items-center justify-center gap-3">
                    <ExternalLink className="w-5 h-5" />
                    Discord
                  </Button>
                  <Button variant="outline" size="lg" className="font-crypto font-semibold flex items-center justify-center gap-3">
                    <ExternalLink className="w-5 h-5" />
                    Website
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MemeTokenDetailPage;
