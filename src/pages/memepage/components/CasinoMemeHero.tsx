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
      {/* Ultra Modern Casino Background with better layering */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient layers with improved opacity */}
        <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-15 animate-shimmer"></div>
        <div className="absolute inset-0 bg-gradient-web3-cyber opacity-12"></div>
        <div className="absolute inset-0 bg-gradient-meme-energy opacity-8 animate-pulse"></div>
        
        {/* Enhanced animated patterns with better positioning */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(330_100%_65%/0.25)_0%,transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(186_100%_60%/0.25)_0%,transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,hsl(270_100%_65%/0.15)_0%,transparent_40%)]"></div>
      </div>

      {/* Floating Web3 Elements with improved responsive positioning */}
      <FloatingIcon icon={Flame} className="top-16 left-4 sm:top-20 sm:left-10 text-orange-400" delay={0} />
      <FloatingIcon icon={Sparkles} className="top-24 right-4 sm:top-32 sm:right-20 text-yellow-400" delay={1000} />
      <FloatingIcon icon={Zap} className="bottom-32 left-1/6 sm:bottom-40 sm:left-1/4 text-cyan-400" delay={2000} />
      <FloatingIcon icon={Diamond} className="top-48 right-1/4 sm:top-60 sm:right-1/3 text-purple-400" delay={3000} />
      <FloatingIcon icon={Coins} className="bottom-48 right-4 sm:bottom-60 sm:right-10 text-green-400" delay={4000} />

      {/* Main Content with improved responsive spacing */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
        
        {/* Epic Hero Header with enhanced typography */}
        <div className="text-center mb-16 sm:mb-20">
          {/* Main Title with improved responsive sizing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-casino-gold flex items-center justify-center shadow-glow-casino-gold animate-pulse">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
            </div>
            
            <h1 className="responsive-title font-black bg-gradient-casino-rainbow bg-clip-text text-transparent text-glow">
              MEME ZONE
            </h1>
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-web3-cyber flex items-center justify-center shadow-glow-rainbow animate-pulse">
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          {/* Subtitle with improved readability */}
          <p className="responsive-subtitle text-white/95 max-w-5xl mx-auto mb-6 sm:mb-8 font-bold leading-relaxed px-4">
            🎰 Ultimate Casino Experience for Solana Meme Tokens 🚀
          </p>

          {/* Live Indicator with enhanced spacing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-12 px-4">
            <div className="flex items-center gap-3 bg-green-500/25 px-6 py-3 rounded-full border border-green-400/60 backdrop-blur-sm">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-glow-primary"></div>
              <span className="text-green-300 font-bold text-base sm:text-lg">LIVE CASINO</span>
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-glow-primary"></div>
            </div>
            <div className="flex items-center gap-3 bg-purple-500/25 px-6 py-3 rounded-full border border-purple-400/60 backdrop-blur-sm">
              <Timer className="w-5 h-5 text-purple-300" />
              <span className="text-purple-300 font-bold text-base sm:text-lg">REAL-TIME ODDS</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <CasinoCard variant="golden" glow className="p-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <div className="text-3xl font-black text-yellow-400 font-numbers">
                  {hottestTokens.length}
                </div>
                <div className="text-yellow-200 font-bold">HOT TOKENS</div>
              </div>
            </CasinoCard>
            
            <CasinoCard variant="platinum" glow className="p-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
                <div className="text-3xl font-black text-cyan-400 font-numbers">
                  24/7
                </div>
                <div className="text-cyan-200 font-bold">LIVE TRADING</div>
              </div>
            </CasinoCard>
            
            <CasinoCard variant="diamond" glow className="p-6">
              <div className="text-center">
                <Flame className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <div className="text-3xl font-black text-purple-400 font-numbers">
                  🔥🔥
                </div>
                <div className="text-purple-200 font-bold">MEGA GAINS</div>
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
            <div className="text-6xl mb-6">🎲</div>
            <p className="text-white/80 text-2xl mb-8">Loading Casino...</p>
            <NeonButton variant="casino-rainbow" glow pulse className="text-xl px-12 py-6">
              🎰 Enter Casino 🎰
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
                  className="group cursor-pointer h-[480px] flex flex-col"
                  onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
                >
                  {/* Header with Rank and Status */}
                  <div className="relative p-4 flex justify-between items-start">
                    <Badge className={`text-lg font-black px-4 py-3 shadow-lg ${
                      isJackpot ? 'bg-gradient-casino-rainbow text-white animate-pulse' :
                      isGolden ? 'bg-gradient-casino-gold text-black' :
                      isPlatinum ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    }`}>
                      {isJackpot && <Crown className="w-5 h-5 mr-2" />}
                      <span className="font-numbers">#{index + 1}</span>
                    </Badge>

                    <div className="flex gap-2">
                      {isJackpot && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse text-sm font-bold px-3 py-2">
                          💎 JACKPOT
                        </Badge>
                      )}
                      <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-2">
                        🔥 HOT
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
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 animate-pulse"></div>
                      )}
                      {isGolden && !isJackpot && (
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/25 to-orange-400/25"></div>
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

                    {/* Casino Status with improved styling */}
                    <div className={`text-center py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm border-2 ${
                      isJackpot ? 'bg-gradient-casino-rainbow border-purple-400 text-white animate-pulse text-mega-glow' :
                      isGolden ? 'bg-gradient-casino-gold border-yellow-400 text-black text-glow' :
                      isPlatinum ? 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-400 text-white' :
                      'bg-gradient-web3-cyber border-cyan-400 text-white'
                    }`}>
                      {isJackpot ? '💎 MEGA JACKPOT' : isGolden ? '🏆 GOLDEN CHIP' : isPlatinum ? '🥈 PLATINUM' : '⭐ PLAYER'}
                    </div>

                    {/* Bet Button with improved responsive sizing */}
                    <NeonButton 
                      variant={isJackpot ? 'casino-rainbow' : isGolden ? 'neon-gold' : isPlatinum ? 'neon-cyan' : 'neon-purple'}
                      glow={isGolden}
                      pulse={isJackpot}
                      size="md"
                      className="w-full font-black"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      🎰 PLACE BET
                    </NeonButton>
                  </div>
                </CasinoCard>
              );
            })}
          </div>
        )}

        {/* Bottom Casino CTA with enhanced responsive design */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="mb-6 sm:mb-8">
            <NeonButton 
              variant="casino-rainbow" 
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
              🎰 ENTER FULL CASINO 🎰
            </NeonButton>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-glow-primary"></div>
              <span className="font-bold text-sm sm:text-base">Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-sm sm:text-base">{hottestTokens.length} Hot Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-sm sm:text-base">Mega Jackpots</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CasinoMemeHero;