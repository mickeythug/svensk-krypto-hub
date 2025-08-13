import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, type MemeCategory } from '../hooks/useMemeTokens';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Zap, 
  Star, 
  BarChart3, 
  Activity, 
  Crown, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Layers,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Flame,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
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

type ViewMode = 'grid' | 'list';
type SortBy = 'marketCap' | 'volume24h' | 'change24h' | 'holders' | 'price';
type SortDirection = 'asc' | 'desc';

const TokenGrid: React.FC<{
  category: MemeCategory;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
}> = ({ category, viewMode, sortBy, sortDirection }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const { tokens, loading, error, hasMore } = useMemeTokens(category, 50, page);

  // Reset to first page on category change
  useEffect(() => {
    setPage(1);
  }, [category]);

  // Sort tokens
  const sortedTokens = React.useMemo(() => {
    const sorted = [...tokens].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'marketCap':
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
          break;
        case 'volume24h':
          aValue = a.volume24h || 0;
          bValue = b.volume24h || 0;
          break;
        case 'change24h':
          aValue = a.change24h || 0;
          bValue = b.change24h || 0;
          break;
        case 'holders':
          aValue = a.holders || 0;
          bValue = b.holders || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        default:
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted.map((token, index) => ({
      ...token,
      rank: index + 1,
    }));
  }, [tokens, sortBy, sortDirection]);

  if (loading && tokens.length === 0) {
    return (
      <div className="space-y-8">
        <div className={`grid ${viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
          : 'grid-cols-1 gap-4'
        }`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Försök igen
        </Button>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {sortedTokens.map((token, index) => {
          const positive = token.change24h > 0;
          const isTop3 = index < 3;
          
          return (
            <Card 
              key={token.id}
              className={`group relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                isTop3 ? 'border-primary/50 bg-card shadow-lg' : 'border-border/50 bg-card/80 hover:border-primary/30'
              } rounded-xl p-4`}
              onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge className={`${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xl font-bold px-5 py-3 animate-pulse' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black text-lg font-bold px-5 py-3' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black text-lg font-bold px-5 py-3' :
                    'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-base font-bold px-4 py-2'
                  }`}>
                    {index === 0 && <Crown className="w-6 h-6 mr-2 animate-pulse" />}
                    #{token.rank}
                  </Badge>
                </div>

                {/* Token Image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={token.image || '/placeholder.svg'}
                    alt={`${token.name} logo`}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.svg"
                  />
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-2xl truncate">{token.symbol}</h3>
                    {isTop3 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">
                        {index === 0 ? '👑' : '🔥'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg truncate">{token.name}</p>
                </div>

                {/* Stats Grid */}
                <div className="hidden md:flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-base font-bold text-muted-foreground">PRIS</p>
                    <p className="font-black text-xl">{formatPrice(token.price)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-muted-foreground">MCAP</p>
                    <p className="font-black text-xl">{formatCompact(token.marketCap)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-muted-foreground">24H VOL</p>
                    <p className="font-black text-xl">{formatCompact(token.volume24h)}</p>
                  </div>
                </div>

                {/* Change */}
                  <div className={`flex items-center gap-3 text-2xl font-black ${
                  positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {positive ? (
                    <TrendingUp className="w-7 h-7" />
                  ) : (
                    <TrendingDown className="w-7 h-7" />
                  )}
                  <span className="text-xl font-black">{positive ? '+' : ''}{formatPercentage(token.change24h)}</span>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 pt-8">
          <Button 
            variant="outline" 
            disabled={loading || page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Föregående
          </Button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full border">
            <span className="text-sm font-medium text-muted-foreground">Sida</span>
            <span className="text-lg font-bold text-foreground">{page}</span>
          </div>
          
          <Button 
            disabled={loading || !hasMore} 
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-2"
          >
            Nästa
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
        {sortedTokens.map((token, index) => {
          const positive = token.change24h > 0;
          const isTop3 = index < 3;
          const isTop1 = index === 0;
          
          return (
            <Card 
              key={token.id} 
              className={`group relative overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer rounded-2xl ${
                isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/30 to-yellow-400/20 shadow-lg animate-pulse' : 
                isTop3 ? 'border-primary bg-gradient-to-br from-card via-primary/20 to-primary/10 shadow-lg' : 
                'border-border/50 bg-card/90 hover:border-primary/50'
              }`}
              onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
            >
              {/* Rank Badge */}
              {isTop3 && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge className={`text-sm font-bold px-3 py-2 shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg animate-pulse' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' : 
                    'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                  }`}>
                    {index === 0 && <Crown className="w-4 h-4 mr-1 animate-pulse" />}
                    #{token.rank}
                  </Badge>
                </div>
              )}

              {/* Hot Badge */}
              {token.isHot && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-sm font-bold px-3 py-2">
                    🔥 HOT
                  </Badge>
                </div>
              )}

              {/* Token Image */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16 / 12}>
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <OptimizedImage 
                    src={token.image || '/placeholder.svg'} 
                    alt={`${token.name} logo`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    fallbackSrc="/placeholder.svg" 
                  />
                  {isTop1 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent pointer-events-none animate-pulse"></div>
                  )}
                </AspectRatio>
              </div>

              {/* Token Details */}
              <div className="p-4 space-y-3">
                {/* Symbol and Change */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-2xl text-foreground truncate">
                    {token.symbol}
                  </h3>
                  
                  <div className={`flex items-center gap-3 text-2xl font-black ${
                    positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {positive ? (
                      <TrendingUp className="w-7 h-7 animate-pulse" />
                    ) : (
                      <TrendingDown className="w-7 h-7 animate-pulse" />
                    )}
                    <span className="drop-shadow-lg text-xl font-black">
                      {positive ? '+' : ''}{formatPercentage(token.change24h)}
                    </span>
                  </div>
                </div>

                {/* Token Name */}
                <p className="text-muted-foreground text-lg font-medium truncate mb-2">{token.name}</p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-3">
                      <DollarSign className="w-5 h-5" />
                      PRIS
                    </div>
                    <div className="text-xl font-black text-foreground">{formatPrice(token.price)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-3">
                      <Star className="w-5 h-5" />
                      MCAP
                    </div>
                    <div className="text-xl font-black text-foreground">{formatCompact(token.marketCap)}</div>
                  </div>
                </div>

                {/* Volume and Holders */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <BarChart3 className="w-4 h-4" />
                      VOL 24H
                    </div>
                    <div className="text-sm font-black text-foreground">{formatCompact(token.volume24h)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Users className="w-4 h-4" />
                      HOLDERS
                    </div>
                    <div className="text-sm font-black text-foreground">{formatCompact(token.holders)}</div>
                  </div>
                </div>

                {/* Tags */}
                {token.tags && token.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {token.tags.slice(0, 2).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className={`w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold h-14 rounded-lg transition-all duration-300 text-xl ${
                    isTop1 ? 'animate-pulse shadow-lg' : ''
                  }`}
                >
                  <Target className="w-6 h-6 mr-3" />
                  HANDLA NU
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <Button 
          variant="outline" 
          disabled={loading || page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Föregående
        </Button>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full border">
          <span className="text-sm font-medium text-muted-foreground">Sida</span>
          <span className="text-lg font-bold text-foreground">{page}</span>
        </div>
        
        <Button 
          disabled={loading || !hasMore} 
          onClick={() => setPage(p => p + 1)}
          className="flex items-center gap-2"
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
  const [activeTab, setActiveTab] = useState<MemeCategory>('trending');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const categories: Array<{ label: string; value: MemeCategory; icon: React.ComponentType<any>; }> = [
    { label: 'Trending', value: 'trending', icon: Flame },
    { label: 'Gainers', value: 'gainers', icon: TrendingUp },
    { label: 'Market Cap High', value: 'marketcap_high', icon: Crown },
    { label: 'Market Cap Low', value: 'marketcap_low', icon: BarChart3 },
    { label: 'Volume', value: 'volume', icon: Activity },
    { label: 'Newest', value: 'newest', icon: Sparkles },
  ];

  const sortOptions: Array<{ label: string; value: SortBy; icon: React.ComponentType<any>; }> = [
    { label: 'Market Cap', value: 'marketCap', icon: BarChart3 },
    { label: 'Volume 24h', value: 'volume24h', icon: Activity },
    { label: '24h Change', value: 'change24h', icon: TrendingUp },
    { label: 'Holders', value: 'holders', icon: Users },
    { label: 'Price', value: 'price', icon: DollarSign },
  ];

  const handleSort = (option: SortBy) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  return (
    <section data-section="token-explorer" className="w-full min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-casino-gold opacity-15 animate-shimmer pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 lg:px-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border/40 rounded-full px-6 py-3 mb-6">
            <Rocket className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">TOKEN EXPLORER</span>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-black text-4xl md:text-6xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            UPPTÄCK TOKENS
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Utforska alla meme tokens med avancerade filter och sortering
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-6 mb-8">
          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">Kategorier</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant={activeTab === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(category.value)}
                    className={`gap-2 transition-all duration-300 ${
                      activeTab === category.value 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sort & View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Sort Controls */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">Sortera</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort(option.value)}
                      className={`gap-2 transition-all duration-300 ${
                        sortBy === option.value 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                      {sortBy === option.value && (
                        sortDirection === 'desc' ? (
                          <SortDesc className="w-3 h-3" />
                        ) : (
                          <SortAsc className="w-3 h-3" />
                        )
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">Vy</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Rutnät
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Display */}
        <TokenGrid 
          category={activeTab} 
          viewMode={viewMode}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </section>
  );
};

export default MemeZoneTabs;