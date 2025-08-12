import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { TrendingUp, TrendingDown, Users, DollarSign, Eye, Crown, Zap, Star, ArrowUpDown, BarChart3, Activity, Droplets } from 'lucide-react';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';

import doge from '@/assets/meme-tokens/doge.png';
import shib from '@/assets/crypto-logos/shib.png';
import link from '@/assets/crypto-logos/link.png';
import bnb from '@/assets/crypto-logos/bnb.png';
import sol from '@/assets/crypto-logos/sol.png';
import ada from '@/assets/crypto-logos/ada.png';

// Cover images for tokens without specific logos
import cover1 from '@/assets/meme-covers/meme-cover-1.jpg';
import cover2 from '@/assets/meme-covers/meme-cover-2.jpg';
import cover3 from '@/assets/meme-covers/meme-cover-3.jpg';
import cover4 from '@/assets/meme-covers/meme-cover-4.jpg';
import cover5 from '@/assets/meme-covers/meme-cover-5.jpg';
import cover6 from '@/assets/meme-covers/meme-cover-6.jpg';

const tokenImages: Record<string, string> = {
  doge, shib, link, bnb, sol, ada,
};

const covers = [cover1, cover2, cover3, cover4, cover5, cover6];

const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const formatMarketCap = (cap: number): string => {
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(1)}K`;
  return `$${cap.toFixed(0)}`;
};

type SortOption = 'marketCap' | 'price' | 'volume24h' | 'holders' | 'change24h';
type SortDirection = 'asc' | 'desc';

const MemeTopCoins = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 15);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const processedTokens = useMemo(() => {
    let sortedTokens = [...tokens];
    
    // Sort tokens based on selected criteria
    sortedTokens.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'marketCap':
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'volume24h':
          aValue = a.volume24h || 0;
          bValue = b.volume24h || 0;
          break;
        case 'holders':
          aValue = a.holders || 0;
          bValue = b.holders || 0;
          break;
        case 'change24h':
          aValue = a.change24h || 0;
          bValue = b.change24h || 0;
          break;
        default:
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sortedTokens.map((token, index) => ({
      ...token,
      image: token.image || tokenImages[token.symbol.toLowerCase()] || covers[index % covers.length],
      rank: index + 1,
    }));
  }, [tokens, sortBy, sortDirection]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const getSortButtonVariant = (option: SortOption) => {
    return sortBy === option ? 'default' : 'outline';
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/20 p-4 md:p-8">
        <div className="max-w-[2000px] mx-auto space-y-8">
          {/* Loading Header */}
          <div className="h-32 bg-gradient-casino-gold rounded-2xl animate-pulse"></div>
          
          {/* Loading Sort Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-32 bg-muted rounded-full animate-pulse"></div>
            ))}
          </div>
          
          {/* Loading Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse border-2">
                <div className="h-48 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded mb-3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/20 p-4 md:p-8">
        <div className="max-w-[2000px] mx-auto">
          <div className="text-center text-destructive p-8 bg-destructive/10 rounded-xl border-2 border-destructive/20">
            Failed to load top meme coins
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="w-full max-w-[2000px] mx-auto p-4 md:p-8 space-y-8">
        {/* Casino-Style Header */}
        <div className="text-center space-y-6 p-8 md:p-12 bg-gradient-casino-gold rounded-3xl border-4 border-yellow-400/50 shadow-glow-gold relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-10 animate-shimmer"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className="w-10 h-10 text-yellow-400 animate-pulse" />
              <h2 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                🏆 HETASTE TOKENS 🏆
              </h2>
              <Crown className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3 text-xl font-bold text-yellow-100">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span>CASINO-KVALITET • HÖGSTA VINSTER • LIVE DATA • 15 HETASTE</span>
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Advanced Sorting Controls */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border-2 border-primary/20 p-6 shadow-glow-primary">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ArrowUpDown className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-orbitron font-bold text-primary">SORTERA & FILTRERA</h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Button
              variant={getSortButtonVariant('marketCap')}
              size={isMobile ? "sm" : "lg"}
              onClick={() => handleSort('marketCap')}
              className={`font-orbitron font-bold transition-all duration-300 ${
                sortBy === 'marketCap' 
                  ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                  : 'border-primary/50 hover:border-primary hover:shadow-glow-primary'
              }`}
            >
              <BarChart3 className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              MARKET CAP {sortBy === 'marketCap' && (sortDirection === 'desc' ? '↓' : '↑')}
            </Button>
            
            <Button
              variant={getSortButtonVariant('volume24h')}
              size={isMobile ? "sm" : "lg"}
              onClick={() => handleSort('volume24h')}
              className={`font-orbitron font-bold transition-all duration-300 ${
                sortBy === 'volume24h' 
                  ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                  : 'border-primary/50 hover:border-primary hover:shadow-glow-primary'
              }`}
            >
              <Activity className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              VOLYM {sortBy === 'volume24h' && (sortDirection === 'desc' ? '↓' : '↑')}
            </Button>
            
            <Button
              variant={getSortButtonVariant('change24h')}
              size={isMobile ? "sm" : "lg"}
              onClick={() => handleSort('change24h')}
              className={`font-orbitron font-bold transition-all duration-300 ${
                sortBy === 'change24h' 
                  ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                  : 'border-primary/50 hover:border-primary hover:shadow-glow-primary'
              }`}
            >
              <TrendingUp className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              FÖRÄNDRING {sortBy === 'change24h' && (sortDirection === 'desc' ? '↓' : '↑')}
            </Button>
            
            <Button
              variant={getSortButtonVariant('holders')}
              size={isMobile ? "sm" : "lg"}
              onClick={() => handleSort('holders')}
              className={`font-orbitron font-bold transition-all duration-300 ${
                sortBy === 'holders' 
                  ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                  : 'border-primary/50 hover:border-primary hover:shadow-glow-primary'
              }`}
            >
              <Users className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              INNEHAVARE {sortBy === 'holders' && (sortDirection === 'desc' ? '↓' : '↑')}
            </Button>
            
            <Button
              variant={getSortButtonVariant('price')}
              size={isMobile ? "sm" : "lg"}
              onClick={() => handleSort('price')}
              className={`font-orbitron font-bold transition-all duration-300 ${
                sortBy === 'price' 
                  ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                  : 'border-primary/50 hover:border-primary hover:shadow-glow-primary'
              }`}
            >
              <DollarSign className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              PRIS {sortBy === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
            </Button>
          </div>
        </div>

        {/* Ultra-Responsive Grid - Full Screen Gaming Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {processedTokens.map((token, index) => {
            const positive = token.change24h > 0;
            const isTop3 = index < 3;
            const isTop1 = index === 0;
          
          return (
            <Card 
              key={token.id} 
              className={`group relative overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow cursor-pointer ${
                isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/20 to-yellow-400/10 shadow-glow-gold' :
                isTop3 ? 'border-primary bg-gradient-to-br from-card via-card/90 to-primary/10 shadow-glow-primary' : 
                'border-border/50 bg-card hover:border-primary/50'
              }`}
              onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
            >
              {/* Enhanced Rank Badge */}
              <div className="absolute top-3 left-3 z-20">
                <Badge className={`text-base font-bold px-3 py-1.5 shadow-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold' :
                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                  'bg-primary text-primary-foreground shadow-glow-primary'
                }`}>
                  {index === 0 && <Crown className="w-4 h-4 mr-1 animate-pulse" />}
                  #{token.rank}
                </Badge>
              </div>

              {/* Enhanced HOT Badge for top 3 */}
              {isTop3 && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge className={`bg-gradient-to-r text-white animate-pulse shadow-lg px-3 py-1.5 ${
                    isTop1 ? 'from-yellow-500 to-red-500' : 'from-red-500 to-orange-500'
                  }`}>
                    {isTop1 ? '👑 KUNG' : '🔥 HOT'}
                  </Badge>
                </div>
              )}

              {/* Enhanced Token Image with Effects */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16/10}>
                  <div className={`absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent`}></div>
                  <OptimizedImage
                    src={token.image}
                    alt={`${token.name} token image`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    fallbackSrc="/placeholder.svg"
                  />
                  {isTop1 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent pointer-events-none"></div>
                  )}
                </AspectRatio>
              </div>

              {/* Enhanced Token Details */}
              <div className={`${isMobile ? 'p-4 space-y-3' : 'p-6 space-y-4'}`}>
                {/* Token symbol and name */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-orbitron font-black ${isMobile ? 'text-xl' : 'text-2xl'} ${isTop1 ? 'text-yellow-400' : 'text-foreground'}`}>
                    {token.symbol}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`${positive ? 'border-success text-success bg-success/20' : 'border-destructive text-destructive bg-destructive/20'} font-bold ${isMobile ? 'text-sm px-2 py-1' : 'text-base px-3 py-1.5'} shadow-lg`}
                  >
                    {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {positive ? '+' : ''}{token.change24h.toFixed(2)}%
                  </Badge>
                </div>
                <p className={`text-muted-foreground truncate font-orbitron font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {token.name}
                </p>
              
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <DollarSign className="w-3 h-3" />
                      Pris
                    </div>
                    <div className={`font-orbitron font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {formatPrice(token.price)}
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <BarChart3 className="w-3 h-3" />
                      Market Cap
                    </div>
                    <div className={`font-orbitron font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {formatMarketCap(token.marketCap)}
                    </div>
                  </div>
                </div>

                {/* Enhanced Secondary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                      <Users className="w-3 h-3" />
                      Innehavare
                    </div>
                    <div className={`font-orbitron font-bold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {token.holders.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                      <Activity className="w-3 h-3" />
                      Volym 24h
                    </div>
                    <div className={`font-orbitron font-bold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {token.volume24h ? formatMarketCap(token.volume24h) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Enhanced Tags */}
                {token.tags && token.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {token.tags.slice(0, 3).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-primary/20 text-primary border-primary/30`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Enhanced Action Button */}
                <Button 
                  className={`w-full font-orbitron bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 rounded-xl font-bold ${
                    isMobile ? 'h-10 text-sm px-4' : 'h-12 text-base px-6'
                  } ${
                    isTop1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold' : ''
                  }`}
                  size={isMobile ? "default" : "lg"}
                >
                  <Zap className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'} animate-pulse`} />
                  <span className={`${isMobile ? 'text-xs font-bold tracking-wide' : 'text-base font-bold tracking-wide'}`}>
                    {isMobile ? 'HANDLA' : 'HANDLA NU'}
                  </span>
                </Button>
              </div>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default MemeTopCoins;