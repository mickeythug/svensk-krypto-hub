import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { TrendingUp, TrendingDown, Users, DollarSign, Eye, Crown, Zap, Star } from 'lucide-react';
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

const MemeTopCoins = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 6);
  const isMobile = useIsMobile();

  const processedTokens = useMemo(() => {
    return tokens.map((token, index) => ({
      ...token,
      image: tokenImages[token.symbol.toLowerCase()] || covers[index % covers.length],
      rank: index + 1,
    }));
  }, [tokens]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-48 bg-muted rounded-lg mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">Failed to load top meme coins</div>;
  }

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
      {processedTokens.map((token, index) => {
        const positive = token.change24h > 0;
        const isTop3 = index < 3;
        
        return (
          <Card 
            key={token.id} 
            className={`group relative overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow ${
              isTop3 ? 'border-primary bg-gradient-to-br from-card via-card/90 to-primary/10 shadow-glow-primary' : 'border-border/50 bg-card hover:border-primary/50'
            }`}
          >
            {/* Rank Badge */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className={`text-lg font-bold ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                'bg-primary text-primary-foreground'
              }`}>
                {index === 0 && <Crown className="w-4 h-4 mr-1" />}
                #{token.rank}
              </Badge>
            </div>

            {/* HOT Badge for top 3 */}
            {isTop3 && (
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse">
                  🔥 HOT
                </Badge>
              </div>
            )}

            {/* Token Image */}
            <div className="relative overflow-hidden">
              <AspectRatio ratio={16/10}>
                <OptimizedImage
                  src={token.image}
                  alt={`${token.name} token image`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackSrc="/placeholder.svg"
                />
              </AspectRatio>
            </div>

            {/* Token Details */}
            <div className={`${isMobile ? 'p-4 space-y-3' : 'p-6 space-y-4'}`}>
              {/* Token symbol and name */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-crypto font-black">{token.symbol}</h3>
                <Badge 
                  variant="outline" 
                  className={`${positive ? 'border-success text-success bg-success/20' : 'border-destructive text-destructive bg-destructive/20'} font-bold text-lg`}
                >
                  {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {positive ? '+' : ''}{token.change24h.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm truncate font-crypto font-medium">{token.name}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </div>
                  <div className="text-xl font-crypto font-bold text-foreground">{formatPrice(token.price)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Star className="w-4 h-4" />
                    Market Cap
                  </div>
                  <div className="text-xl font-crypto font-bold text-foreground">{formatMarketCap(token.marketCap)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Holders:</span>
                  <span className="font-crypto font-bold text-foreground">{token.holders.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Views:</span>
                  <span className="font-crypto font-bold text-foreground">{token.views?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {token.tags?.slice(0, 3).map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                className="w-full font-crypto bg-gradient-primary hover:shadow-glow-primary transition-all duration-300" 
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                VISA DETALJER
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MemeTopCoins;