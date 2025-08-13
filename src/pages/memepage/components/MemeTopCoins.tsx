import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { TrendingUp, TrendingDown, Users, DollarSign, Eye, Crown, Zap, Star, ArrowUpDown, BarChart3, Activity, Droplets, Repeat, Target, Gamepad2, Volume2, Shuffle } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden">
      <div className="w-full h-screen p-0 md:p-2 lg:p-4 space-y-2 md:space-y-4 lg:space-y-6">
        
        {/* Ultra Gaming Header - Full Width */}
        <div className="relative w-full bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 rounded-none md:rounded-3xl border-0 md:border-2 border-blue-400/50 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-10"></div>
          
          <div className="relative z-10 p-3 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
              <Crown className="w-5 h-5 md:w-8 md:h-8 text-blue-400 animate-pulse" />
              <h1 className="font-sans font-black text-2xl md:text-4xl lg:text-6xl text-white drop-shadow-lg">
                🏆 HETASTE TOKENS 🏆
              </h1>
              <Crown className="w-5 h-5 md:w-8 md:h-8 text-blue-400 animate-pulse" />
            </div>
            
            <div className="flex items-center justify-center gap-2 md:gap-4 text-sm md:text-lg font-bold text-blue-100 mb-2 md:mb-4">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 animate-pulse" />
              <span className="text-xs md:text-base font-sans">PREMIUM KVALITET • LIVE DATA • 15 TOKENS</span>
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 animate-pulse" />
            </div>

            {/* Inline Gaming Sorter - Enhanced */}
            <div className="flex flex-wrap justify-center gap-1 md:gap-2 mt-4">
              <Button
                variant={getSortButtonVariant('marketCap')}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleSort('marketCap')}
                className={`font-sans font-bold transition-all duration-300 rounded-full ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-sm px-3 py-2 h-9'} ${
                  sortBy === 'marketCap' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-400' 
                    : 'bg-gray-700/80 text-gray-200 border-gray-600 hover:bg-blue-600/20 hover:border-blue-400'
                }`}
              >
                <BarChart3 className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
                MCAP {sortBy === 'marketCap' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('volume24h')}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleSort('volume24h')}
                className={`font-sans font-bold transition-all duration-300 rounded-full ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-sm px-3 py-2 h-9'} ${
                  sortBy === 'volume24h' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-400' 
                    : 'bg-gray-700/80 text-gray-200 border-gray-600 hover:bg-blue-600/20 hover:border-blue-400'
                }`}
              >
                <Volume2 className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
                VOLYM {sortBy === 'volume24h' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('change24h')}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleSort('change24h')}
                className={`font-sans font-bold transition-all duration-300 rounded-full ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-sm px-3 py-2 h-9'} ${
                  sortBy === 'change24h' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-400' 
                    : 'bg-gray-700/80 text-gray-200 border-gray-600 hover:bg-blue-600/20 hover:border-blue-400'
                }`}
              >
                <TrendingUp className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
                Δ24H {sortBy === 'change24h' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('holders')}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleSort('holders')}
                className={`font-sans font-bold transition-all duration-300 rounded-full ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-sm px-3 py-2 h-9'} ${
                  sortBy === 'holders' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-400' 
                    : 'bg-gray-700/80 text-gray-200 border-gray-600 hover:bg-blue-600/20 hover:border-blue-400'
                }`}
              >
                <Users className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
                HOLDERS {sortBy === 'holders' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('price')}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleSort('price')}
                className={`font-sans font-bold transition-all duration-300 rounded-full ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-sm px-3 py-2 h-9'} ${
                  sortBy === 'price' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-400' 
                    : 'bg-gray-700/80 text-gray-200 border-gray-600 hover:bg-blue-600/20 hover:border-blue-400'
                }`}
              >
                <DollarSign className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
                PRIS {sortBy === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
            </div>
          </div>
        </div>

        {/* Full Screen Gaming Grid - No Margins */}
        <div className="flex-1 overflow-y-auto scrollbar-modern px-2 md:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-2 md:gap-3 lg:gap-4 pb-4">
            {processedTokens.map((token, index) => {
              const positive = token.change24h > 0;
              const isTop3 = index < 3;
              const isTop1 = index === 0;
              const isTop5 = index < 5;
            
            return (
              <Card 
                key={token.id} 
                className={`group relative overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow cursor-pointer ${
                  isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/30 to-yellow-400/20 shadow-glow-gold animate-pulse' :
                  isTop3 ? 'border-primary bg-gradient-to-br from-card via-primary/20 to-primary/10 shadow-glow-primary' : 
                  isTop5 ? 'border-orange-400/70 bg-gradient-to-br from-card via-orange-900/20 to-card hover:border-orange-400' :
                  'border-border/50 bg-card/80 hover:border-primary/50'
                } ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}
                onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
              >
                {/* Enhanced Rank Badge - Gaming Style */}
                <div className="absolute top-1 left-1 z-20">
                  <Badge className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} font-bold shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold animate-pulse' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                    isTop5 ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white' :
                    'bg-primary text-primary-foreground shadow-glow-primary'
                  }`}>
                    {index === 0 && <Crown className="w-3 h-3 mr-1 animate-pulse" />}
                    #{token.rank}
                  </Badge>
                </div>

                {/* Ultra Gaming HOT Badge */}
                {isTop5 && (
                  <div className="absolute top-1 right-1 z-20">
                    <Badge className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-2 py-1'} bg-gradient-to-r text-white animate-pulse shadow-lg ${
                      isTop1 ? 'from-yellow-500 to-red-500' : 
                      isTop3 ? 'from-red-500 to-orange-500' :
                      'from-purple-500 to-pink-500'
                    }`}>
                      {isTop1 ? '👑' : isTop3 ? '🔥' : '⭐'}
                    </Badge>
                  </div>
                )}

                {/* Gaming Token Image */}
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={isMobile ? 16/12 : 16/10}>
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <OptimizedImage
                      src={token.image}
                      alt={`${token.name} token`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      fallbackSrc="/placeholder.svg"
                    />
                    {isTop1 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent pointer-events-none animate-pulse"></div>
                    )}
                  </AspectRatio>
                </div>

                {/* Compact Gaming Info */}
                <div className={`${isMobile ? 'p-2 space-y-2' : 'p-3 space-y-3'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-sans font-black text-white ${isMobile ? 'text-base' : 'text-xl'} ${isTop1 ? 'text-yellow-300' : ''} truncate`}>
                      {token.symbol}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`${positive ? 'border-green-400 text-green-400 bg-green-400/20' : 'border-red-400 text-red-400 bg-red-400/20'} font-bold ${isMobile ? 'text-xs px-1' : 'text-sm px-2'} ${isMobile ? 'py-0.5' : 'py-1'} shadow-lg`}
                    >
                      {positive ? <TrendingUp className="w-2 h-2 mr-0.5" /> : <TrendingDown className="w-2 h-2 mr-0.5" />}
                      {positive ? '+' : ''}{token.change24h.toFixed(1)}%
                    </Badge>
                  </div>
                
                  {/* Ultra Compact Stats */}
                  <div className={`grid grid-cols-2 ${isMobile ? 'gap-1' : 'gap-2'}`}>
                    <div className="bg-gray-900/60 rounded p-1.5 border border-gray-700">
                      <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-sans font-black text-white`}>
                        {formatPrice(token.price)}
                      </div>
                      <div className="text-xs text-gray-300 font-sans font-medium">PRIS</div>
                    </div>
                    <div className="bg-gray-900/60 rounded p-1.5 border border-gray-700">
                      <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-sans font-black text-white`}>
                        {formatMarketCap(token.marketCap)}
                      </div>
                      <div className="text-xs text-gray-300 font-sans font-medium">MCAP</div>
                    </div>
                  </div>

                  {/* Gaming Action Button */}
                  <Button 
                    className={`w-full font-orbitron bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 rounded-lg font-bold ${
                      isMobile ? 'h-8 text-xs px-2' : 'h-10 text-sm px-4'
                    } ${
                      isTop1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-glow-gold animate-pulse' : ''
                    }`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Target className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'} animate-pulse`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold tracking-wide`}>
                      {isMobile ? 'BUY' : 'HANDLA'}
                    </span>
                  </Button>
                </div>
              </Card>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTopCoins;