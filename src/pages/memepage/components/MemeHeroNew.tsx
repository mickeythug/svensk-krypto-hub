import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Rocket, Zap, TrendingUp, TrendingDown, Star, Crown, Flame, Sparkles, Target, DollarSign, Users, BarChart3 } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import heroImage from '@/assets/meme-hero.jpg';
import hexPattern from '@/assets/hex-pattern.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

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

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(n);
}

const MemeHeroNew = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens('trending', 20, 1);

  // Sort tokens by hotness score (volume × absolute change)
  const hottestTokens = tokens
    .filter(token => token.volume24h && token.change24h)
    .sort((a, b) => {
      const scoreA = (a.volume24h || 0) * Math.abs(a.change24h || 0);
      const scoreB = (b.volume24h || 0) * Math.abs(b.change24h || 0);
      return scoreB - scoreA;
    })
    .slice(0, 20);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-yellow-900/30 to-gray-900 pt-32 pb-16">
      {/* Modern Background Layers */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImage} 
          alt="Meme Token Universe Background" 
          className="w-full h-full object-cover opacity-30" 
          fallbackSrc="/placeholder.svg" 
        />
        <div className="absolute inset-0 bg-gradient-casino-gold opacity-20 animate-shimmer"></div>
        <div className={`absolute inset-0 bg-[url('${hexPattern}')] opacity-20`}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 animate-float">
        <Flame className="w-10 h-10 text-orange-400 opacity-60" />
      </div>
      <div className="absolute top-48 right-20 animate-float delay-1000">
        <Sparkles className="w-8 h-8 text-yellow-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-1/4 animate-float delay-2000">
        <Zap className="w-9 h-9 text-blue-400 opacity-60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 py-16">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-2xl">
              <Flame className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              HETASTE TOKENS
            </h1>
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-2xl">
              <Crown className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-2xl text-white/90 max-w-4xl mx-auto mb-8 font-medium">
            De 20 mest explosiva meme tokens just nu – Live data från marknaden
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xl font-bold text-green-400">LIVE UPPDATERINGAR</span>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Hottest Tokens Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="w-full h-[420px] rounded-3xl bg-white/10" />
              </div>
            ))}
          </div>
        ) : error || hottestTokens.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/80 text-2xl mb-6">Laddar hetaste tokens...</p>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-4">
              Försök igen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {hottestTokens.map((token, index) => {
              const positive = token.change24h > 0;
              const isTop3 = index < 3;
              const isTop1 = index === 0;

              return (
                <Card
                  key={token.id}
                  className={`group relative overflow-hidden border-3 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer rounded-3xl bg-card/95 backdrop-blur-sm ${
                    isTop1 ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/60 to-yellow-400/40 shadow-2xl animate-pulse' :
                    isTop3 ? 'border-orange-400 bg-gradient-to-br from-orange-900/50 to-orange-400/30 shadow-xl' :
                    'border-white/30 hover:border-primary/70'
                  }`}
                  onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className={`text-lg font-bold px-4 py-3 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black animate-pulse' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                      'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                    }`}>
                      {index === 0 && <Crown className="w-5 h-5 mr-2 animate-pulse" />}
                      <span className="font-numbers">#{index + 1}</span>
                    </Badge>
                  </div>

                  {/* Hot Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-sm font-bold px-3 py-2">
                      🔥
                    </Badge>
                  </div>

                  {/* Token Image */}
                  <div className="relative overflow-hidden">
                    <AspectRatio ratio={16 / 12}>
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
                  <div className="p-6 space-y-4">
                    {/* Symbol and Change */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-2xl text-foreground truncate max-w-[140px]">
                        {token.symbol}
                      </h3>
                      <div className={`flex items-center gap-2 text-xl font-black ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {positive ? (
                          <TrendingUp className="w-5 h-5 animate-pulse" />
                        ) : (
                          <TrendingDown className="w-5 h-5 animate-pulse" />
                        )}
                        <span className="text-lg font-numbers">
                          {positive ? '+' : ''}{formatPercentage(token.change24h)}
                        </span>
                      </div>
                    </div>

                    {/* Token Name */}
                    <p className="text-muted-foreground text-lg font-medium truncate">{token.name}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/60 rounded-xl p-4 border-2 border-white/10">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold">PRIS</span>
                        </div>
                         <div className="text-xl font-black text-foreground font-numbers">{formatPrice(token.price)}</div>
                      </div>
                      <div className="bg-muted/60 rounded-xl p-4 border-2 border-white/10">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <Star className="w-4 h-4" />
                          <span className="font-bold">MCAP</span>
                        </div>
                        <div className="text-xl font-black text-foreground font-numbers">{formatCompact(token.marketCap)}</div>
                      </div>
                    </div>

                    {/* Hotness Indicator */}
                    <div className={`text-center py-3 rounded-xl font-bold text-sm ${
                      isTop1 ? 'bg-gradient-to-r from-yellow-400/40 to-orange-400/40 text-yellow-200 animate-pulse' :
                      isTop3 ? 'bg-gradient-to-r from-orange-400/40 to-red-400/40 text-orange-200' :
                      'bg-gradient-to-r from-primary/40 to-accent/40 text-primary'
                    }`}>
                      {isTop1 ? '🔥 EXPLOSIV' : isTop3 ? '🚀 HET' : '⭐ TRENDING'}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className={`w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold h-12 rounded-xl transition-all duration-300 text-lg ${
                        isTop1 ? 'animate-pulse shadow-lg' : ''
                      }`}
                    >
                      <Target className="w-5 h-5 mr-2" />
                      HANDLA NU
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground font-bold px-12 py-6 text-xl rounded-full shadow-2xl"
            onClick={() => {
              const element = document.querySelector('[data-section="token-explorer"]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Rocket className="w-6 h-6 mr-3" />
            UTFORSKA ALLA TOKENS
          </Button>
          <p className="text-white/70 text-lg mt-6">
            Uppdateras varje minut • {hottestTokens.length} hetaste tokens
          </p>
        </div>
      </div>
    </section>
  );
};

export default MemeHeroNew;