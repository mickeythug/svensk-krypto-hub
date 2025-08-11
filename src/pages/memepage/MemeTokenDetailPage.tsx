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
  Info
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
      // Token not found, redirect to meme page
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

  return (
    <div className="min-h-screen bg-background">{/* Header managed by Layout component */}

      {/* Hero Section with Apple-style design */}
      <div className="relative overflow-hidden">
        {/* Background Image with Blur Effect */}
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
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Token Hero Card */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Token Image */}
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

                  {/* Token Info */}
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

                    {/* Price and Change */}
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

                  {/* Action Buttons */}
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

                {/* Quick Stats */}
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

                {/* Action Buttons */}
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

      {/* Content Tabs */}
      <div className="container mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/80 backdrop-blur-sm rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg font-crypto font-semibold">Översikt</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg font-crypto font-semibold">Stats</TabsTrigger>
            <TabsTrigger value="trade" className="rounded-lg font-crypto font-semibold">Handel</TabsTrigger>
            <TabsTrigger value="community" className="rounded-lg font-crypto font-semibold">Community</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Trading Chart */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-crypto font-bold">Live Chart - {token.symbol}</h3>
                </div>
                
                {/* TradingView Chart Container */}
                <div className="bg-[#0f0f23] rounded-xl overflow-hidden shadow-lg border border-border/20">
                  <div className="h-[400px] relative">
                    <TradingViewMobileChart 
                      symbol={token.symbol} 
                      coinGeckoId={token.symbol.toLowerCase()} 
                    />
                  </div>
                </div>
                
                {/* Chart Info */}
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

          {/* Stats Tab */}
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

          {/* Trade Tab */}
          <TabsContent value="trade" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-crypto font-bold">Handla {token.symbol}</h3>
                </div>
                
                {/* Trading Widget */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4">
                  <JupiterSwapWidget height={500} />
                </div>

                {/* Safety Notice */}
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

          {/* Community Tab */}
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
};

export default MemeTokenDetailPage;