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
  if (!isFinite(price)) return '—';
  if (price === 0) return '$0.0000';
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
};

const formatMarketCap = (cap: number): string => {
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(1)}K`;
  return `$${cap.toFixed(0)}`;
};

const formatPercentage = (n: number): string => {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n/1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
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
    <div className="w-full bg-background">
      <div className="w-full max-w-[2000px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Modern Professional Header with Navigation */}
        <div className="relative w-full bg-card/50 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="relative z-10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-sans font-bold text-2xl md:text-3xl text-foreground">
                    Hetaste Tokens
                  </h1>
                  <p className="text-muted-foreground text-sm">15 tokens sorterade efter popularitet</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Live Data
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
              </div>
            </div>

            {/* Professional Sort Navigation */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={getSortButtonVariant('marketCap')}
                size="sm"
                onClick={() => handleSort('marketCap')}
                className={`gap-2 ${
                  sortBy === 'marketCap' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Market Cap {sortBy === 'marketCap' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('volume24h')}
                size="sm"
                onClick={() => handleSort('volume24h')}
                className={`gap-2 ${
                  sortBy === 'volume24h' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                Volume {sortBy === 'volume24h' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('change24h')}
                size="sm"
                onClick={() => handleSort('change24h')}
                className={`gap-2 ${
                  sortBy === 'change24h' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                24h Change {sortBy === 'change24h' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('holders')}
                size="sm"
                onClick={() => handleSort('holders')}
                className={`gap-2 ${
                  sortBy === 'holders' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Users className="w-4 h-4" />
                Holders {sortBy === 'holders' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
              
              <Button
                variant={getSortButtonVariant('price')}
                size="sm"
                onClick={() => handleSort('price')}
                className={`gap-2 ${
                  sortBy === 'price' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Price {sortBy === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
              </Button>
            </div>
          </div>
        </div>

        {/* Professional Token Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-modern">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 pb-4">
            {processedTokens.map((token, index) => {
              const positive = token.change24h > 0;
              const isTop3 = index < 3;
              const isTop1 = index === 0;
            
            return (
              <Card 
                key={token.id} 
                className={`group relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  isTop1 ? 'border-primary/50 bg-card shadow-glow-primary' :
                  isTop3 ? 'border-primary/30 bg-card hover:border-primary/50' : 
                  'border-border/50 bg-card/80 hover:border-primary/30'
                } rounded-xl`}
                onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
              >
                {/* Professional Rank Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <Badge className={`text-sm px-3 py-1.5 font-bold ${
                    index === 0 ? 'bg-primary text-primary-foreground shadow-glow-primary' :
                    index === 1 ? 'bg-muted-foreground text-background' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index === 0 && <Crown className="w-3 h-3 mr-1" />}
                    <span className="font-numbers">#{token.rank}</span>
                  </Badge>
                </div>

                {/* HOT Badge for top performers */}
                {isTop3 && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="text-sm bg-destructive text-destructive-foreground">
                      {isTop1 ? '👑' : '🔥'}
                    </Badge>
                  </div>
                )}

                {/* Token Image - Same as other sections */}
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={4/5}>
                    <OptimizedImage
                      src={token.image}
                      alt={`${token.name} token`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fallbackSrc="/placeholder.svg"
                    />
                  </AspectRatio>
                </div>

                {/* Token Info - Same layout as other sections */}
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-lg md:text-xl">{token.emoji} {token.symbol}</h3>
                      <p className="truncate text-xs md:text-sm text-muted-foreground">{token.name}</p>
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
                       <span className="font-numbers">
                         {positive ? '+' : ''}{formatPercentage(token.change24h)}
                       </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="tabular-nums font-bold text-lg font-numbers">{formatPrice(token.price)}</span>
                    <span className="text-muted-foreground font-medium font-numbers">{formatMarketCap(token.marketCap)}</span>
                  </div>

                  {/* Professional Action Button */}
                  <Button 
                    className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Trade
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