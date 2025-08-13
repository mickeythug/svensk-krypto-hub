import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  Crown,
  Flame,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

const HottestTokensMarquee: React.FC = () => {
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens('trending', 15, 1);

  if (loading) {
    return (
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 animate-pulse"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64">
                <Skeleton className="w-full h-80 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || tokens.length === 0) {
    return null;
  }

  // Sort tokens by volume and change to get the "hottest"
  const hottestTokens = tokens
    .filter(token => token.volume24h && token.change24h)
    .sort((a, b) => {
      const scoreA = (a.volume24h || 0) * Math.abs(a.change24h || 0);
      const scoreB = (b.volume24h || 0) * Math.abs(b.change24h || 0);
      return scoreB - scoreA;
    })
    .slice(0, 15);

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background border-b border-border/50">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 animate-pulse"></div>
      <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <Flame className="w-8 h-8 text-orange-400 opacity-60" />
      </div>
      <div className="absolute top-32 right-20 animate-float delay-1000">
        <Sparkles className="w-6 h-6 text-yellow-400 opacity-60" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float delay-2000">
        <Zap className="w-7 h-7 text-blue-400 opacity-60" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              HETASTE TOKENS
            </h2>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De 15 mest explosiva meme tokens just nu – Live data från marknaden
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">LIVE</span>
          </div>
        </div>

        {/* Horizontal Scrolling Tokens */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {hottestTokens.map((token, index) => {
              const positive = token.change24h > 0;
              const isTop3 = index < 3;
              const isTop1 = index === 0;

              return (
                <Card
                  key={token.id}
                  className={`group relative flex-shrink-0 w-64 overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer rounded-2xl ${
                    isTop1 ? 'border-yellow-400 bg-gradient-to-br from-card via-yellow-900/40 to-yellow-400/30 shadow-2xl animate-pulse' :
                    isTop3 ? 'border-orange-400 bg-gradient-to-br from-card via-orange-900/30 to-orange-400/20 shadow-xl' :
                    'border-primary/30 bg-card/95 hover:border-primary/60'
                  }`}
                  onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className={`text-sm font-bold px-3 py-2 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black animate-pulse' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                      'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                    }`}>
                      {index === 0 && <Crown className="w-4 h-4 mr-1 animate-pulse" />}
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* Hot Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-xs font-bold px-2 py-1">
                      🔥
                    </Badge>
                  </div>

                  {/* Token Image */}
                  <div className="relative overflow-hidden">
                    <AspectRatio ratio={16 / 10}>
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <OptimizedImage
                        src={token.image || '/placeholder.svg'}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        fallbackSrc="/placeholder.svg"
                      />
                      {isTop1 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-transparent pointer-events-none animate-pulse"></div>
                      )}
                      {isTop3 && !isTop1 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-transparent pointer-events-none"></div>
                      )}
                    </AspectRatio>
                  </div>

                  {/* Token Details */}
                  <div className="p-4 space-y-3">
                    {/* Symbol and Change */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xl text-foreground truncate max-w-[120px]">
                        {token.symbol}
                      </h3>
                      <div className={`flex items-center gap-1 text-lg font-black ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {positive ? (
                          <TrendingUp className="w-4 h-4 animate-pulse" />
                        ) : (
                          <TrendingDown className="w-4 h-4 animate-pulse" />
                        )}
                        <span className="text-sm">
                          {positive ? '+' : ''}{formatPercentage(token.change24h)}
                        </span>
                      </div>
                    </div>

                    {/* Token Name */}
                    <p className="text-muted-foreground text-sm font-medium truncate">{token.name}</p>

                    {/* Price */}
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Star className="w-3 h-3" />
                        PRIS
                      </div>
                      <div className="text-lg font-black text-foreground">{formatPrice(token.price)}</div>
                    </div>

                    {/* Hotness Indicator */}
                    <div className={`text-center py-2 rounded-lg font-bold text-sm ${
                      isTop1 ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 animate-pulse' :
                      isTop3 ? 'bg-gradient-to-r from-orange-400/20 to-red-400/20 text-orange-300' :
                      'bg-gradient-to-r from-primary/20 to-accent/20 text-primary'
                    }`}>
                      {isTop1 ? '🔥 EXPLOSIV' : isTop3 ? '🚀 HET' : '⭐ TRENDING'}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Gradient Overlays for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Scrolla för att se alla hetaste tokens • Uppdateras varje minut
          </p>
        </div>
      </div>
    </section>
  );
};

export default HottestTokensMarquee;