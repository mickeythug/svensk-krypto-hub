import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Add cover images to tokens
  const tokensWithCovers = tokens.map((token, index) => ({
    ...token,
    cover: covers[index % covers.length]
  }));

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

  const getTrendColor = (change: number): string => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(limit || 12)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <AspectRatio ratio={4/5}>
              <div className="h-full w-full bg-muted animate-pulse" />
            </AspectRatio>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4">⚠️ Error loading tokens</div>
        <Button variant="outline" onClick={() => window.location.reload()} className="font-crypto">
          TRY AGAIN
        </Button>
      </Card>
    );
  }

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'}`}>
      {tokensWithCovers.map((token, index) => (
        <motion.div
          key={token.id}
          whileHover={{ scale: 1.02 }}
          className="group"
        >
          <Card className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-glow-primary hover:border-primary/40 transition-all duration-300 cursor-pointer"
               onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}`)}
               role="button"
               tabIndex={0}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   navigate(`/meme/token/${token.symbol.toLowerCase()}`);
                 }
               }}
               aria-label={`View details for ${token.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <AspectRatio ratio={4/5}>
              <OptimizedImage
                src={token.image || tokenImages[token.symbol.toLowerCase()] || token.cover}
                alt={`${token.name} – logotyp / omslagsbild`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackSrc={token.cover}
              />
            </AspectRatio>
            
            {/* Token info below image */}
            <div className={`${isMobile ? 'p-2' : 'p-3 md:p-4'} relative`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className={`truncate font-crypto font-extrabold ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} tracking-wide group-hover:text-primary transition-colors`}>
                    {token.emoji} {token.symbol}
                  </h3>
                  <p className={`truncate ${isMobile ? 'text-xs' : 'text-sm md:text-base'} text-muted-foreground font-crypto font-medium`}>
                    {token.name}
                  </p>
                </div>
                {token.isHot && (
                  <Badge className="shrink-0 bg-primary/20 text-primary border border-primary/30 font-crypto font-bold animate-pulse">
                    HOT
                  </Badge>
                )}
              </div>
              
              <div className={`flex items-center justify-between ${isMobile ? 'text-sm' : 'text-base md:text-lg'} mb-3`}>
                 <span className={`tabular-nums font-numbers font-black ${isMobile ? 'text-lg' : 'text-xl'} group-hover:text-primary transition-colors`}>
                   {formatPrice(token.price)}
                 </span>
                <div className={`flex items-center gap-1 ${getTrendColor(token.change24h)}`}>
                  {getTrendIcon(token.change24h)}
                   <span className={`font-numbers font-bold tabular-nums ${isMobile ? 'text-sm' : 'text-base'} group-hover:scale-110 transition-transform`}>
                     {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                   </span>
                </div>
              </div>
              
              <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm md:text-base'} text-muted-foreground mb-3`}>
                <span className="font-crypto font-semibold text-[#12E19F] group-hover:text-primary transition-colors">
                  MC: <span className="font-numbers">{formatMarketCap(token.marketCap)}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                      <span className="font-numbers font-bold text-foreground group-hover:text-primary transition-colors">
                       {token.holders > 1000 ? `${Math.floor(token.holders/1000)}K` : token.holders}
                     </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                     <span className="font-numbers font-bold text-foreground group-hover:text-primary transition-colors">
                       {token.views}
                     </span>
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {token.tags.slice(0, 2).map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} font-crypto font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className={`w-full font-crypto bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-bold ${isMobile ? 'text-xs h-8 px-2' : 'text-sm h-10'} shadow-lg hover:shadow-glow-primary transition-all duration-300 group/btn rounded-full`}
                size={isMobile ? "sm" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/meme/token/${token.symbol.toLowerCase()}`);
                }}
              >
                <Eye className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'} group-hover/btn:scale-110 transition-transform`} />
                <span className={`${isMobile ? 'text-xs font-semibold tracking-tight' : ''}`}>
                  {isMobile ? 'VISA' : 'VISA DETALJER'}
                </span>
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default MemeTokenGrid;