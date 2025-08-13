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
  return `$${n.toLocaleString(undefined, {
    maximumFractionDigits: 4
  })}`;
}
function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(n);
}
function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}
const Grid: React.FC<{
  category: MemeCategory;
}> = ({
  category
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const {
    tokens,
    loading,
    error,
    hasMore
  } = useMemeTokens(category, 50, page);
  console.log('[MemeZoneTabs] Grid rendering:', {
    category,
    loading,
    error,
    tokensCount: tokens.length
  });

  // Reset to first page on category change
  useEffect(() => {
    setPage(1);
  }, [category]);
  if (loading && tokens.length === 0) {
    return <div className="space-y-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
          {Array.from({
          length: 6
        }).map((_, i) => <Card key={i} className="overflow-hidden">
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
            </Card>)}
        </div>
      </div>;
  }
  if (error) return <p className="text-destructive text-sm">{error}</p>;
  return <div className="space-y-8">
      {/* Ultra Large Gaming Grid - Full Screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 md:gap-8">
        {tokens.map((t, index) => {
        const positive = t.change24h > 0;
        const isTop = index < 3;
        const isTop1 = index === 0;
        return <Card key={t.id} className={`group relative overflow-hidden border-4 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow cursor-pointer rounded-2xl ${isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/30 to-yellow-400/20 shadow-glow-gold animate-pulse' : isTop ? 'border-primary bg-gradient-to-br from-card via-primary/20 to-primary/10 shadow-glow-primary' : 'border-border/50 bg-card/90 hover:border-primary/50'}`} onClick={() => navigate(`/meme/token/${t.symbol.toLowerCase()}?address=${encodeURIComponent(t.id)}`)}>
              {/* Enhanced Gaming Rank Badge */}
              {isTop && <div className="absolute top-3 left-3 z-20">
                  <Badge className={`text-sm font-sans font-black px-3 py-2 shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold animate-pulse' : index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' : 'bg-gradient-to-r from-orange-400 to-orange-600 text-black'}`}>
                    {index === 0 && <Crown className="w-4 h-4 mr-1 animate-pulse" />}
                    #{index + 1}
                  </Badge>
                </div>}

              {/* Ultra Gaming HOT Badge */}
              {t.isHot && <div className="absolute top-3 right-3 z-20">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-sm font-sans font-black px-3 py-2 shadow-glow-destructive">
                    🔥 HOT
                  </Badge>
                </div>}

              {/* Extra Large Token Image - Like MemeTopCoins */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16 / 12}>
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <OptimizedImage src={t.image || '/placeholder.svg'} alt={`${t.name} logo`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" fallbackSrc="/placeholder.svg" />
                  {isTop1 && <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent pointer-events-none animate-pulse"></div>}
                </AspectRatio>
              </div>

              {/* Enhanced Gaming Token Details */}
              <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4">
                {/* Symbol and Change */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-sans font-black text-white ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} ${isTop1 ? 'text-blue-300' : ''} truncate`}>
                    {t.symbol}
                  </h3>
                  
                  {/* Modern Large Percentage Display */}
                  <div className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} font-sans font-black ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {positive ? <TrendingUp className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} animate-pulse`} /> : <TrendingDown className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} animate-pulse`} />}
                    <span className="drop-shadow-lg">
                      {positive ? '+' : ''}{formatPercentage(t.change24h)}
                    </span>
                  </div>
                </div>

                {/* Token Name */}
                <p className="text-gray-300 text-sm font-sans font-medium truncate mb-1">{t.name}</p>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gray-900/60 rounded-lg p-2 md:p-3 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 md:mb-2">
                      <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                      PRIS
                    </div>
                    <div className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-sans font-black text-white`}>{formatPrice(t.price)}</div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-2 md:p-3 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 md:mb-2">
                      <Star className="w-3 h-3 md:w-4 md:h-4" />
                      MCAP
                    </div>
                    <div className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-sans font-black text-white`}>{formatCompact(t.marketCap)}</div>
                  </div>
                </div>

                {/* Volume and Holders Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gray-900/60 rounded-lg p-2 md:p-3 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 md:mb-2">
                      <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                      VOL 24H
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-sans font-black text-white`}>{formatCompact(t.volume24h)}</div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-2 md:p-3 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 md:mb-2">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      HOLDERS
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-sans font-black text-white`}>{formatCompact(t.holders)}</div>
                  </div>
                </div>

                {/* Gaming Tags */}
                {t.tags && t.tags.length > 0 && <div className="flex flex-wrap gap-2">
                    {t.tags.slice(0, 2).map((tag: string, i: number) => <Badge key={i} variant="secondary" className="text-xs font-sans font-medium">
                        {tag}
                      </Badge>)}
                  </div>}

                {/* Gaming Action Button */}
                <Button className={`w-full font-sans bg-gradient-casino-gold text-black hover:shadow-glow-gold transition-all duration-300 rounded-lg font-bold h-12 text-base ${isTop1 ? 'animate-pulse shadow-glow-gold' : ''}`} size="lg">
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  <span className="font-bold tracking-wide">
                    HANDLA NU
                  </span>
                </Button>
              </div>
            </Card>;
      })}
      </div>

      {/* Modern Pagination with Icons */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <Button variant="outline" disabled={loading || page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="flex items-center gap-2 font-sans font-bold px-6 py-3 rounded-full border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 text-white transition-all duration-300">
          <ChevronLeft className="w-4 h-4" />
          Föregående
        </Button>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-black/60 rounded-full border-2 border-yellow-400/50 shadow-glow-gold">
          <span className="text-sm font-sans font-bold text-yellow-200">Sida</span>
          <span className="text-lg font-sans font-black text-yellow-400">{page}</span>
        </div>
        
        <Button disabled={loading || !hasMore} onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 font-sans font-bold px-6 py-3 rounded-full bg-gradient-casino-gold text-black hover:shadow-glow-gold transition-all duration-300">
          Nästa
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>;
};
const MemeZoneTabs: React.FC = () => {
  const isMobile = useIsMobile();
  const [trendingCat, setTrendingCat] = useState<MemeCategory>('trending');
  const options: Array<{
    label: string;
    value: MemeCategory;
    icon: React.ComponentType<any>;
  }> = [{
    label: 'Trending',
    value: 'trending',
    icon: TrendingUp
  }, {
    label: 'Gainers',
    value: 'gainers',
    icon: Activity
  }, {
    label: 'Market Cap High',
    value: 'marketcap_high',
    icon: Crown
  }, {
    label: 'Market Cap Low',
    value: 'marketcap_low',
    icon: BarChart3
  }, {
    label: 'Liquidity High',
    value: 'liquidity_high',
    icon: DollarSign
  }, {
    label: 'Liquidity Low',
    value: 'liquidity_low',
    icon: Eye
  }, {
    label: 'Volume',
    value: 'volume',
    icon: Star
  }, {
    label: 'Txns',
    value: 'txns',
    icon: Zap
  }, {
    label: 'Boosted',
    value: 'boosted',
    icon: Crown
  }, {
    label: 'Newest',
    value: 'newest',
    icon: SortDesc
  }];
  return <section className="w-full min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 py-8 md:py-16">
      {/* Golden Gaming Background */}
      <div className="absolute inset-0 bg-gradient-casino-gold opacity-15 animate-shimmer pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="text-center mb-8 md:mb-16">
          
        </div>
        <Tabs defaultValue="trending" className="w-full">
          {/* Modern Tab Navigation */}
          <div className="flex justify-center mb-10">
            
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
              
            </div>
            <Grid category={trendingCat} />
          </TabsContent>
          
          <TabsContent value="potential" forceMount className={trendingCat !== 'potential' ? 'hidden' : ''}>
            <Grid category="potential" />
          </TabsContent>
        </Tabs>
      </div>
    </section>;
};
export default MemeZoneTabs;