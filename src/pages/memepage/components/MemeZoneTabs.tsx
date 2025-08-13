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
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n/1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

const Grid: React.FC<{ category: MemeCategory }> = ({ category }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
      {/* Professional Token Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {tokens.map((t, index) => {
          const positive = t.change24h > 0;
          const isTop = index < 3;
          const isTop1 = index === 0;
          
          return (
            <Card 
              key={t.id} 
              className={`group relative overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-xl ${
                isTop1 ? 'border-primary/50 bg-card shadow-glow-primary' :
                isTop ? 'border-primary/30 bg-card hover:border-primary/50' : 
                'border-border/50 bg-card/80 hover:border-primary/30'
              }`}
              onClick={() => navigate(`/meme/token/${t.symbol.toLowerCase()}?address=${encodeURIComponent(t.id)}`)}
            >
              {/* Professional Rank Badge */}
              {isTop && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge className={`text-sm px-3 py-1.5 font-bold ${
                    index === 0 ? 'bg-primary text-primary-foreground shadow-glow-primary' :
                    index === 1 ? 'bg-muted-foreground text-background' :
                    'bg-orange-500 text-white'
                  }`}>
                    {index === 0 && <Crown className="w-3 h-3 mr-1" />}
                    #{index + 1}
                  </Badge>
                </div>
              )}

              {/* HOT Badge for trending tokens */}
              {t.isHot && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge className="bg-destructive text-destructive-foreground">
                    🔥
                  </Badge>
                </div>
              )}

              {/* Token Image - Same as other sections */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={4/5}>
                  <OptimizedImage
                    src={t.image || '/placeholder.svg'}
                    alt={`${t.name} logo`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    fallbackSrc="/placeholder.svg"
                  />
                </AspectRatio>
              </div>

              {/* Token Info - Same layout as other sections */}
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-lg md:text-xl">{t.emoji} {t.symbol}</h3>
                    <p className="truncate text-xs md:text-sm text-muted-foreground">{t.name}</p>
                  </div>
                  
                  {/* Large Percentage Display */}
                  <div className={`flex items-center gap-1 text-2xl font-black drop-shadow-lg ${
                    positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {positive ? (
                      <TrendingUp className="w-5 h-5 animate-pulse" />
                    ) : (
                      <TrendingDown className="w-5 h-5 animate-pulse" />
                    )}
                    <span>
                      {positive ? '+' : ''}{formatPercentage(t.change24h)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="tabular-nums font-bold text-lg">{formatPrice(t.price)}</span>
                  <span className="text-muted-foreground font-medium">{formatCompact(t.marketCap)}</span>
                </div>

                {/* Volume and Holders - Compact */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Vol 24H</div>
                    <div className="text-sm font-bold">{formatCompact(t.volume24h)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Holders</div>
                    <div className="text-sm font-bold">{formatCompact(t.holders)}</div>
                  </div>
                </div>

                {/* Professional Action Button */}
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Handla
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Professional Pagination */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <Button 
          variant="outline" 
          disabled={loading || page === 1} 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex items-center gap-2 font-medium px-6 py-3 rounded-full border border-border hover:bg-muted transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Föregående
        </Button>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full border border-border">
          <span className="text-sm font-medium text-muted-foreground">Sida</span>
          <span className="text-lg font-bold text-foreground">{page}</span>
        </div>
        
        <Button 
          disabled={loading || !hasMore} 
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-2 font-medium px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
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
    <section className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Professional Header */}
        <div className="text-center mb-12">
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Crown className="w-8 h-8 text-primary" />
              <h2 className={`font-sans font-bold text-foreground ${
                isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
              }`}>
                Utforska Alla Tokens
              </h2>
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <p className={`text-muted-foreground font-medium ${
              isMobile ? 'text-base' : 'text-lg md:text-xl'
            } max-w-3xl mx-auto`}>
              Stora bilder • Live data • Premium upplevelse
            </p>
          </div>
        </div>
        <Tabs defaultValue="trending" className="w-full">
          {/* Professional Tab Navigation */}
          <div className="flex justify-center mb-10">
            <TabsList className={`bg-muted/50 backdrop-blur-sm border border-border/30 ${
              isMobile ? 'h-12' : 'h-14'
            } rounded-full p-2`}>
              <TabsTrigger 
                value="newest" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-sans font-medium rounded-full transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`}
              >
                <SortDesc className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                Nyast
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-sans font-medium rounded-full transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`}
              >
                <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="potential" 
                className={`${isMobile ? 'text-sm px-4' : 'text-base px-6'} font-sans font-medium rounded-full transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`}
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
                <span className="font-sans font-bold text-foreground">Sortera efter:</span>
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
                      className={`flex items-center gap-2 font-medium rounded-full transition-all duration-300 ${
                        trendingCat === opt.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border border-border hover:bg-muted'
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
