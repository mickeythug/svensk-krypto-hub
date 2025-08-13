import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, type MemeCategory } from '../hooks/useMemeTokens';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, DollarSign, Zap, Star, BarChart3, Activity, Crown, Eye, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from 'lucide-react';

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

const Grid: React.FC<{ category: MemeCategory }> = ({ category }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { tokens, loading, error, hasMore } = useMemeTokens(category, 50, page);

  console.log('[MemeZoneTabs] Grid rendering:', { category, loading, error, tokensCount: tokens.length });

  // Reset to first page on category change
  useEffect(() => { setPage(1); }, [category]);

  if (loading && tokens.length === 0) {
    return (
      <div className="space-y-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48 rounded-none" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="text-destructive text-sm">{error}</p>;

  return (
    <div className="space-y-8">
      {/* Ultra Large Gaming Grid - Full Screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 md:gap-8">
        {tokens.map((t, index) => {
          const positive = t.change24h > 0;
          const isTop = index < 3;
          const isTop1 = index === 0;
          
          return (
            <Card 
              key={t.id} 
              className={`group relative overflow-hidden border-4 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow cursor-pointer rounded-2xl ${
                isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/30 to-yellow-400/20 shadow-glow-gold animate-pulse' :
                isTop ? 'border-primary bg-gradient-to-br from-card via-primary/20 to-primary/10 shadow-glow-primary' : 
                'border-border/50 bg-card/90 hover:border-primary/50'
              }`}
              onClick={() => navigate(`/meme/token/${t.symbol.toLowerCase()}?address=${encodeURIComponent(t.id)}`)}
            >
              {/* Enhanced Gaming Rank Badge */}
              {isTop && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge className={`text-sm font-orbitron font-black px-3 py-2 shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold animate-pulse' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                    'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                  }`}>
                    {index === 0 && <Crown className="w-4 h-4 mr-1 animate-pulse" />}
                    #{index + 1}
                  </Badge>
                </div>
              )}

              {/* Ultra Gaming HOT Badge */}
              {t.isHot && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-sm font-orbitron font-black px-3 py-2 shadow-glow-destructive">
                    🔥 HOT
                  </Badge>
                </div>
              )}

              {/* Extra Large Token Image - Like MemeTopCoins */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16/12}>
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <OptimizedImage
                    src={t.image || '/placeholder.svg'}
                    alt={`${t.name} logo`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    fallbackSrc="/placeholder.svg"
                  />
                  {isTop1 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent pointer-events-none animate-pulse"></div>
                  )}
                </AspectRatio>
              </div>

              {/* Enhanced Gaming Token Details */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Symbol and Change */}
                <div className="flex items-center justify-between">
                  <h3 className={`font-orbitron font-black text-xl md:text-2xl ${isTop1 ? 'text-yellow-400' : 'text-foreground'} truncate`}>
                    {t.symbol}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`${positive ? 'border-success text-success bg-success/20' : 'border-destructive text-destructive bg-destructive/20'} font-orbitron font-bold text-sm px-3 py-1.5 shadow-lg`}
                  >
                    {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {positive ? '+' : ''}{t.change24h.toFixed(2)}%
                  </Badge>
                </div>

                {/* Token Name */}
                <p className="text-muted-foreground text-sm font-orbitron font-medium truncate">{t.name}</p>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <DollarSign className="w-4 h-4" />
                      PRIS
                    </div>
                    <div className="text-base font-orbitron font-bold text-foreground">{formatPrice(t.price)}</div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Star className="w-4 h-4" />
                      MCAP
                    </div>
                    <div className="text-base font-orbitron font-bold text-foreground">{formatCompact(t.marketCap)}</div>
                  </div>
                </div>

                {/* Volume and Holders Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <BarChart3 className="w-4 h-4" />
                      VOL 24H
                    </div>
                    <div className="text-sm font-orbitron font-bold text-foreground">{formatCompact(t.volume24h)}</div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Users className="w-4 h-4" />
                      HOLDERS
                    </div>
                    <div className="text-sm font-orbitron font-bold text-foreground">{formatCompact(t.holders)}</div>
                  </div>
                </div>

                {/* Gaming Tags */}
                {t.tags && t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {t.tags.slice(0, 2).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs font-orbitron font-medium">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Gaming Action Button */}
                <Button 
                  className={`w-full font-orbitron bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 rounded-lg font-bold h-12 text-base ${
                    isTop1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold animate-pulse' : ''
                  }`}
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  <span className="font-bold tracking-wide">
                    HANDLA NU
                  </span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modern Pagination with Icons */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <Button 
          variant="outline" 
          disabled={loading || page === 1} 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex items-center gap-2 font-crypto font-bold px-6 py-3 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Föregående
        </Button>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full border-2 border-border">
          <span className="text-sm font-crypto font-bold text-muted-foreground">Sida</span>
          <span className="text-lg font-crypto font-black text-foreground">{page}</span>
        </div>
        
        <Button 
          disabled={loading || !hasMore} 
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-2 font-crypto font-bold px-6 py-3 rounded-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
        >
          Nästa
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const MemeZoneTabs: React.FC = () => {
  const isMobile = useIsMobile();
  const [trendingCat, setTrendingCat] = useState<MemeCategory>('trending');
  
  const options: Array<{ label: string; value: MemeCategory; icon: React.ComponentType<any> }> = [
    { label: 'Trending', value: 'trending', icon: TrendingUp },
    { label: 'Gainers', value: 'gainers', icon: Activity },
    { label: 'Market Cap High', value: 'marketcap_high', icon: Crown },
    { label: 'Market Cap Low', value: 'marketcap_low', icon: BarChart3 },
    { label: 'Liquidity High', value: 'liquidity_high', icon: DollarSign },
    { label: 'Liquidity Low', value: 'liquidity_low', icon: Eye },
    { label: 'Volume', value: 'volume', icon: Star },
    { label: 'Txns', value: 'txns', icon: Zap },
    { label: 'Boosted', value: 'boosted', icon: Crown },
    { label: 'Newest', value: 'newest', icon: SortDesc },
  ];

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 py-8 md:py-16">
      {/* Gaming Background */}
      <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-10 animate-shimmer pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-15 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 md:px-8">
        {/* Ultra Gaming Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="bg-gradient-casino-gold rounded-3xl border-4 border-yellow-400/50 shadow-glow-gold p-8 md:p-12 mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Crown className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-pulse" />
              <h2 className={`font-orbitron font-black bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto] ${
                isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'
              }`}>
                UTFORSKA ALLA TOKENS
              </h2>
              <Crown className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-pulse" />
            </div>
            <p className={`text-yellow-100 font-orbitron font-bold ${isMobile ? 'text-lg' : 'text-2xl'} max-w-4xl mx-auto`}>
              🎰 STORA BILDER • LIVE DATA • GAMING UPPLEVELSE 🎰
            </p>
          </div>
        </div>
        <Tabs defaultValue="trending" className="w-full">
          {/* Modern Tab Navigation */}
          <div className="flex justify-center mb-10">
            <TabsList className={`bg-card/80 backdrop-blur-sm border-2 border-border/50 ${isMobile ? 'h-12' : 'h-14'} rounded-full p-2`}>
              <TabsTrigger 
                value="newest" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-crypto font-bold rounded-full transition-all duration-300 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground`}
              >
                <SortDesc className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                Nyast
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-crypto font-bold rounded-full transition-all duration-300 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground`}
              >
                <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="potential" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-crypto font-bold rounded-full transition-all duration-300 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground`}
              >
                <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                Potential
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="newest" forceMount className={trendingCat !== 'newest' ? 'hidden' : ''}>
            <Grid category="newest" />
          </TabsContent>
          
          <TabsContent value="trending" forceMount className={trendingCat === 'newest' || trendingCat === 'potential' ? 'hidden' : ''}>
            {/* Modern Filter Buttons */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="font-crypto font-bold text-foreground">Sortera efter:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {options.map((opt) => {
                  const IconComponent = opt.icon;
                  return (
                    <Button
                      key={opt.value}
                      size={isMobile ? 'sm' : 'default'}
                      variant={trendingCat === opt.value ? 'default' : 'outline'}
                      onClick={() => setTrendingCat(opt.value)}
                      className={`flex items-center gap-2 font-crypto font-bold rounded-full transition-all duration-300 ${
                        trendingCat === opt.value 
                          ? 'bg-gradient-primary text-primary-foreground shadow-glow-primary' 
                          : 'border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10'
                      } ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
                    >
                      <IconComponent className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Grid category={trendingCat} />
          </TabsContent>
          
          <TabsContent value="potential" forceMount className={trendingCat !== 'potential' ? 'hidden' : ''}>
            <Grid category="potential" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default MemeZoneTabs;
