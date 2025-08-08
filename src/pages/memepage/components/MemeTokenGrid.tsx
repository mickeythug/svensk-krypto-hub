import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';

import c1 from '@/assets/meme-covers/meme-cover-1.jpg';
import c2 from '@/assets/meme-covers/meme-cover-2.jpg';
import c3 from '@/assets/meme-covers/meme-cover-3.jpg';
import c4 from '@/assets/meme-covers/meme-cover-4.jpg';
import c5 from '@/assets/meme-covers/meme-cover-5.jpg';
import c6 from '@/assets/meme-covers/meme-cover-6.jpg';
import c7 from '@/assets/meme-covers/meme-cover-7.jpg';
import c8 from '@/assets/meme-covers/meme-cover-8.jpg';
import c9 from '@/assets/meme-covers/meme-cover-9.jpg';
import c10 from '@/assets/meme-covers/meme-cover-10.jpg';
import c11 from '@/assets/meme-covers/meme-cover-11.jpg';
import c12 from '@/assets/meme-covers/meme-cover-12.jpg';

const covers = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12];

// Prefer real token logos when available
import doge from '@/assets/crypto-logos/doge.png';
import shib from '@/assets/crypto-logos/shib.png';
const tokenImages: Record<string, string> = {
  doge,
  shib,
};

interface MemeTokenGridProps {
  category: 'trending' | 'under1m' | 'all';
  limit?: number;
}

const MemeTokenGrid: React.FC<MemeTokenGridProps> = ({ category, limit }) => {
  const { tokens, loading, error } = useMemeTokens(category, limit);
  
  // Add cover images to tokens
  const tokensWithCovers = tokens.map((token, index) => ({
    ...token,
    cover: covers[index % covers.length]
  }));

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

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 mr-1" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 mr-1" />;
    return <DollarSign className="w-4 h-4 mr-1" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-4 md:gap-6">
        {[...Array(limit || 12)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <AspectRatio ratio={16/10}>
              <div className="h-full bg-muted rounded-lg mb-4"></div>
            </AspectRatio>
            <div className="h-4 bg-muted rounded mb-2 mt-4"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4">⚠️ Fel vid laddning av tokens</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="font-crypto">
          FÖRSÖK IGEN
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-4 md:gap-6 w-full">
      {tokensWithCovers.map((token, index) => {
        const positive = token.change24h > 0;
        
        return (
          <motion.div
            key={token.id}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="group relative overflow-hidden border-2 border-border/50 bg-card hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-glow-rainbow">
              {/* Hot Badge */}
              {token.isHot && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse font-crypto font-bold">
                    🔥 HOT
                  </Badge>
                </div>
              )}

              {/* Token Image */}
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16/10}>
                  <OptimizedImage
                    src={tokenImages[token.symbol.toLowerCase()] ?? token.cover}
                    alt={`${token.name} token image`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    fallbackSrc="/placeholder.svg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </AspectRatio>
                
                {/* Overlay info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-crypto font-black text-white">{token.emoji} {token.symbol}</h3>
                    <Badge 
                      variant="outline" 
                      className={`${positive ? 'border-success text-success bg-success/20' : 'border-destructive text-destructive bg-destructive/20'} font-bold text-lg backdrop-blur-sm`}
                    >
                      {getTrendIcon(token.change24h)}
                      {positive ? '+' : ''}{token.change24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-white/90 text-sm truncate font-crypto font-medium">{token.name}</p>
                </div>
              </div>

              {/* Token Details */}
              <div className="p-6 space-y-4">
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
                    <span className="font-crypto font-bold text-foreground">
                      {token.holders > 1000 ? `${Math.floor(token.holders/1000)}K` : token.holders}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Views:</span>
                    <span className="font-crypto font-bold text-foreground">{token.views}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {token.tags?.slice(0, 3).map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs font-crypto">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full font-crypto bg-gradient-primary hover:shadow-glow-primary transition-all duration-300" 
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  VISA DETALJER
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MemeTokenGrid;