import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CasinoCard } from '@/components/ui/casino-card';
import { NeonButton } from '@/components/ui/neon-button';
import { 
  Flame, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Crown, 
  Sparkles, 
  Target, 
  DollarSign,
  Rocket,
  Coins,
  Trophy,
  Diamond,
  Timer,
  BarChart3
} from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

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

// Floating animation component
const FloatingIcon: React.FC<{ 
  icon: React.ComponentType<any>; 
  className?: string; 
  delay?: number 
}> = ({ icon: Icon, className, delay = 0 }) => (
  <div 
    className={`absolute animate-float ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <Icon className="w-8 h-8 opacity-60" />
  </div>
);

const CasinoMemeHero = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens('trending', 16, 1);
  const { t } = useLanguage();

  // Sort tokens by hotness score (volume × absolute change)
  const hottestTokens = tokens
    .filter(token => token.volume24h && token.change24h)
    .sort((a, b) => {
      const scoreA = (a.volume24h || 0) * Math.abs(a.change24h || 0);
      const scoreB = (b.volume24h || 0) * Math.abs(b.change24h || 0);
      return scoreB - scoreA;
    })
    .slice(0, 16);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Premium Web3 Background with mature styling */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient layers with professional opacity */}
        <div className="absolute inset-0 bg-gradient-premium-dark opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-premium-purple opacity-15 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-premium-cyan opacity-10"></div>
        
        {/* Enhanced animated patterns with mature positioning */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(270_70%_45%/0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(190_75%_50%/0.12)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,hsl(210_20%_55%/0.08)_0%,transparent_45%)]"></div>
      </div>

      {/* Premium Web3 Elements with mature positioning */}
      <FloatingIcon icon={Flame} className="top-16 left-4 sm:top-20 sm:left-10 text-purple-400" delay={0} />
      <FloatingIcon icon={Sparkles} className="top-24 right-4 sm:top-32 sm:right-20 text-cyan-400" delay={1000} />
      <FloatingIcon icon={Zap} className="bottom-32 left-1/6 sm:bottom-40 sm:left-1/4 text-blue-400" delay={2000} />
      <FloatingIcon icon={Diamond} className="top-48 right-1/4 sm:top-60 sm:right-1/3 text-violet-400" delay={3000} />
      <FloatingIcon icon={Coins} className="bottom-48 right-4 sm:bottom-60 sm:right-10 text-slate-400" delay={4000} />

        {/* Main Content with optimized responsive spacing */}
        <div className="relative z-10 w-full max-w-[1800px] mx-auto container-spacing-normal pt-20 sm:pt-28 pb-16 sm:pb-20">
          
          {/* Epic Hero Header with enhanced typography and spacing */}
          <div className="text-center section-spacing-lg">
            {/* Main Title with improved visual hierarchy */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 mb-12 sm:mb-16">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-premium-purple flex items-center justify-center shadow-glow-premium-purple animate-pulse hover-lift">
                <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>
              
              <h1 className="responsive-title font-black bg-gradient-premium-purple bg-clip-text text-transparent text-glow tracking-tight">
                MEME ZONE
              </h1>
              
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-premium-cyan flex items-center justify-center shadow-glow-premium-cyan animate-pulse hover-lift">
                <Rocket className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>
            </div>

            {/* Subtitle with enhanced readability and contrast */}
            <p className="responsive-subtitle text-contrast-high max-w-5xl mx-auto mb-8 sm:mb-10 font-bold leading-relaxed px-4 tracking-wide">
              ⚡ Premium Web3 Trading Platform for Solana Meme Tokens 💎
            </p>

            {/* Live Indicators with enhanced spacing and contrast */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
              <div className="flex items-center gap-4 bg-purple-500/30 px-8 py-4 rounded-2xl border-2 border-purple-400/70 backdrop-blur-sm hover-lift">
                <div className="w-5 h-5 bg-purple-400 rounded-full animate-pulse shadow-glow-premium-purple"></div>
                <span className="text-contrast-high font-black text-lg sm:text-xl tracking-wide">LIVE TRADING</span>
                <div className="w-5 h-5 bg-purple-400 rounded-full animate-pulse shadow-glow-premium-purple"></div>
              </div>
              <div className="flex items-center gap-4 bg-cyan-500/30 px-8 py-4 rounded-2xl border-2 border-cyan-400/70 backdrop-blur-sm hover-lift">
                <Timer className="w-6 h-6 text-cyan-300" />
                <span className="text-contrast-high font-black text-lg sm:text-xl tracking-wide">REAL-TIME DATA</span>
              </div>
            </div>

            {/* Enhanced Stats Bar with better visual hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto section-spacing-md">
              <CasinoCard variant="golden" glow className="container-spacing-normal hover-lift">
                <div className="text-center space-y-4">
                  <Trophy className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-4xl font-black text-contrast-high number-display">
                    {hottestTokens.length}
                  </div>
                  <div className="text-slate-300 font-bold text-lg tracking-wide">PREMIUM TOKENS</div>
                </div>
              </CasinoCard>
              
              <CasinoCard variant="platinum" glow className="container-spacing-normal hover-lift">
                <div className="text-center space-y-4">
                  <BarChart3 className="w-10 h-10 mx-auto text-cyan-400" />
                  <div className="text-4xl font-black text-cyan-400 number-display">
                    24/7
                  </div>
                  <div className="text-cyan-300 font-bold text-lg tracking-wide">LIVE ANALYTICS</div>
                </div>
              </CasinoCard>
              
              <CasinoCard variant="diamond" glow className="container-spacing-normal hover-lift">
                <div className="text-center space-y-4">
                  <Diamond className="w-10 h-10 mx-auto text-purple-400" />
                  <div className="text-4xl font-black text-purple-400 number-display">
                    💎
                  </div>
                  <div className="text-purple-300 font-bold text-lg tracking-wide">EXCLUSIVE</div>
                </div>
              </CasinoCard>
            </div>
          </div>

        {/* Casino Token Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="w-full h-[480px] rounded-3xl bg-white/10" />
              </div>
            ))}
          </div>
        ) : error || hottestTokens.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">💎</div>
            <p className="text-white/80 text-2xl mb-8">Loading Premium Tokens...</p>
            <NeonButton variant="neon-purple" glow pulse className="text-xl px-12 py-6">
              💎 Enter Platform 💎
            </NeonButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {hottestTokens.map((token, index) => {
              const positive = token.change24h > 0;
              const isJackpot = index === 0;
              const isGolden = index < 3;
              const isPlatinum = index < 6;

              const cardVariant = isJackpot ? 'diamond' : isGolden ? 'golden' : isPlatinum ? 'platinum' : 'default';

              return (
                <CasinoCard
                  key={token.id}
                  variant={cardVariant}
                  glow={isGolden}
                  animate={isJackpot}
                  className="group cursor-pointer h-[520px] flex flex-col hover-lift"
                  onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
                >
                  {/* Header with enhanced spacing and better visual hierarchy */}
                  <div className="relative container-spacing-tight flex justify-between items-start">
                    <Badge className={`text-lg font-black px-5 py-3 shadow-lg rounded-xl ${
                      isJackpot ? 'bg-gradient-premium-purple text-white animate-pulse shadow-glow-premium-purple' :
                      isGolden ? 'bg-gradient-premium-silver text-slate-900 shadow-glow-premium-silver' :
                      isPlatinum ? 'bg-gradient-premium-cyan text-white shadow-glow-premium-cyan' :
                      'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                    }`}>
                      {isJackpot && <Crown className="w-5 h-5 mr-2" />}
                      <span className="number-display">#{index + 1}</span>
                    </Badge>

                    <div className="flex flex-col gap-2">
                      {isJackpot && (
                        <Badge className="bg-gradient-premium-purple text-white animate-pulse text-sm font-bold px-4 py-2 rounded-lg shadow-glow-premium-purple">
                          💎 PREMIUM
                        </Badge>
                      )}
                      <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
                        ⚡ TRENDING
                      </Badge>
                    </div>
                  </div>

                  {/* Token Image with enhanced Vegas Style */}
                  <div className="relative mx-3 sm:mx-4 mb-3 sm:mb-4 overflow-hidden rounded-xl sm:rounded-2xl">
                    <AspectRatio ratio={16 / 10}>
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <OptimizedImage
                        src={token.image || '/placeholder.svg'}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        fallbackSrc="/placeholder.svg"
                      />
                      {/* Enhanced Sparkle Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      {/* Rank-specific overlay effects */}
                      {isJackpot && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 animate-pulse"></div>
                      )}
                      {isGolden && !isJackpot && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-400/15 to-slate-500/15"></div>
                      )}
                    </AspectRatio>
                  </div>

                  {/* Token Info with improved spacing and typography */}
                  <div className="flex-1 px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                    {/* Symbol and Change with better alignment */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg sm:text-xl lg:text-2xl text-white truncate max-w-[120px] sm:max-w-[140px]">
                        {token.symbol}
                      </h3>
                      <div className={`flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-black ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {positive ? (
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                        ) : (
                          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                        )}
                        <span className="text-sm sm:text-lg number-display">
                          {positive ? '+' : ''}{formatPercentage(token.change24h)}
                        </span>
                      </div>
                    </div>

                    {/* Token Name with improved contrast */}
                    <p className="text-white/90 text-sm sm:text-base font-medium truncate leading-relaxed">{token.name}</p>

                    {/* Casino Stats with enhanced grid and better spacing */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-black/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 backdrop-blur-sm">
                        <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-xs mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-bold">BET</span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-white number-display">{formatPrice(token.price)}</div>
                      </div>
                      <div className="bg-black/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 backdrop-blur-sm">
                        <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-xs mb-1">
                          <Star className="w-3 h-3" />
                          <span className="font-bold">POT</span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-white number-display">{formatCompact(token.marketCap)}</div>
                      </div>
                    </div>

                    {/* Premium Status with improved styling */}
                    <div className={`text-center py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm border-2 ${
                      isJackpot ? 'bg-gradient-premium-purple border-purple-400 text-white animate-pulse text-mega-glow' :
                      isGolden ? 'bg-gradient-premium-silver border-slate-400 text-slate-900 text-glow' :
                      isPlatinum ? 'bg-gradient-premium-cyan border-cyan-400 text-white' :
                      'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-400 text-white'
                    }`}>
                      {isJackpot ? '💎 DIAMOND TIER' : isGolden ? '🥈 PLATINUM' : isPlatinum ? '⚡ PREMIUM' : '⭐ STANDARD'}
                    </div>

                    {/* Trade Button with improved responsive sizing */}
                    <NeonButton 
                      variant={isJackpot ? 'neon-purple' : isGolden ? 'neon-gold' : isPlatinum ? 'neon-cyan' : 'neon-purple'}
                      glow={isGolden}
                      pulse={isJackpot}
                      size="md"
                      className="w-full font-black"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      💎 START TRADING
                    </NeonButton>
                  </div>
                </CasinoCard>
              );
            })}
          </div>
        )}

        {/* Bottom Premium CTA with enhanced responsive design */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="mb-6 sm:mb-8">
            <NeonButton 
              variant="neon-purple" 
              glow 
              pulse 
              size="xl"
              className="font-black px-8 sm:px-16 py-6 sm:py-8 text-xl sm:text-2xl"
              onClick={() => {
                const element = document.querySelector('[data-section="token-explorer"]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Rocket className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
              💎 EXPLORE PREMIUM TOKENS 💎
            </NeonButton>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-glow-premium-purple"></div>
              <span className="font-bold text-sm sm:text-base">Live Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm sm:text-base">{hottestTokens.length} Premium Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm sm:text-base">Exclusive Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CasinoMemeHero;