import React from 'react';
import { Flame, Zap, Crown, Rocket, Diamond, Trophy, Star, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Floating casino elements
const FloatingElement: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  duration?: number;
}> = ({ children, className = '', delay = 0, duration = 4 }) => (
  <div 
    className={`absolute animate-float ${className}`}
    style={{ 
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}s`
    }}
  >
    {children}
  </div>
);

// Pulsing neon text effect
const NeonText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 text-primary opacity-60 blur-sm animate-pulse">
      {children}
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// Slot machine reel effect
const SlotReelBadge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'jackpot' | 'premium' | 'gold' | 'silver';
  animate?: boolean;
}> = ({ children, variant = 'silver', animate = false }) => {
  const variants = {
    jackpot: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-shimmer',
    premium: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
    gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600',
    silver: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500'
  };

  return (
    <Badge className={`
      ${variants[variant]}
      text-black font-black px-6 py-3 text-lg
      shadow-lg border-2 border-white/20
      ${animate ? 'animate-elastic-pop' : 'hover:animate-neon-pulse'}
      transform-gpu transition-all duration-300
    `}>
      {children}
    </Badge>
  );
};

const UltraModernMemeHero = () => {
  const navigate = useNavigate();

  const scrollToExplorer = () => {
    const element = document.querySelector('[data-section="meme-explorer"]');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Ultra Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Primary neon glow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/15 via-transparent to-pink-500/15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Casino spotlight effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,225,159,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,225,159,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      </div>

      {/* Floating Casino Elements */}
      <FloatingElement className="top-20 left-[10%] text-primary" delay={0}>
        <Crown className="w-12 h-12 filter drop-shadow-lg drop-shadow-primary" />
      </FloatingElement>
      <FloatingElement className="top-32 right-[15%] text-yellow-400" delay={1000}>
        <Diamond className="w-10 h-10 filter drop-shadow-lg drop-shadow-yellow-400" />
      </FloatingElement>
      <FloatingElement className="bottom-40 left-[20%] text-purple-400" delay={2000}>
        <Star className="w-14 h-14 filter drop-shadow-lg drop-shadow-purple-400" />
      </FloatingElement>
      <FloatingElement className="top-1/2 right-[8%] text-cyan-400" delay={3000}>
        <Rocket className="w-11 h-11 filter drop-shadow-lg drop-shadow-cyan-400" />
      </FloatingElement>
      <FloatingElement className="bottom-60 right-[25%] text-pink-400" delay={4000}>
        <Trophy className="w-13 h-13 filter drop-shadow-lg drop-shadow-pink-400" />
      </FloatingElement>

      {/* Main Hero Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16 min-h-screen flex flex-col justify-center">
        
        {/* Casino Welcome Banner */}
        <div className="text-center mb-16">
          <SlotReelBadge variant="jackpot" animate>
            🎰 WELCOME TO THE MEME CASINO 🎰
          </SlotReelBadge>
        </div>

        {/* Epic Title Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/50 animate-pulse-glow">
              <Flame className="w-16 h-16 text-white" />
            </div>
            
            <NeonText className="text-8xl md:text-9xl font-black bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent">
              MEME
            </NeonText>
            
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-glow" style={{ animationDelay: '1s' }}>
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>

          <NeonText className="text-8xl md:text-9xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-8">
            ZONE
          </NeonText>

          <div className="text-3xl md:text-4xl font-bold text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            🚀 The Ultimate Solana Meme Token Casino 💎
            <br />
            <span className="text-primary">Where Fortune Meets Fun</span>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-20">
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-primary/30 rounded-2xl px-8 py-6 shadow-2xl">
            <div className="w-6 h-6 bg-primary rounded-full animate-pulse shadow-lg shadow-primary"></div>
            <span className="text-2xl font-black text-white">LIVE TRADING</span>
            <div className="w-6 h-6 bg-primary rounded-full animate-pulse shadow-lg shadow-primary"></div>
          </div>
          
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl px-8 py-6 shadow-2xl">
            <Rocket className="w-6 h-6 text-purple-400 animate-bounce" />
            <span className="text-2xl font-black text-white">REAL-TIME WINS</span>
          </div>
          
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl px-8 py-6 shadow-2xl">
            <Trophy className="w-6 h-6 text-yellow-400 animate-spin" />
            <span className="text-2xl font-black text-white">PREMIUM TOKENS</span>
          </div>
        </div>

        {/* Casino Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl border-2 border-primary/30 rounded-3xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Diamond className="w-16 h-16 mx-auto mb-6 text-primary animate-float" />
            <div className="text-5xl font-black text-white mb-4">100+</div>
            <div className="text-xl font-bold text-primary">Premium Tokens</div>
          </div>
          
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Target className="w-16 h-16 mx-auto mb-6 text-purple-400 animate-float" style={{ animationDelay: '1s' }} />
            <div className="text-5xl font-black text-white mb-4">24/7</div>
            <div className="text-xl font-bold text-purple-400">Live Action</div>
          </div>
          
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
            <DollarSign className="w-16 h-16 mx-auto mb-6 text-yellow-400 animate-float" style={{ animationDelay: '2s' }} />
            <div className="text-5xl font-black text-white mb-4">∞</div>
            <div className="text-xl font-bold text-yellow-400">Win Potential</div>
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="text-center">
          <Button
            onClick={scrollToExplorer}
            className="group relative bg-gradient-to-r from-primary via-cyan-500 to-purple-500 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-black font-black text-2xl px-16 py-8 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <Rocket className="w-8 h-8 group-hover:animate-bounce" />
              🎰 ENTER THE CASINO 🎰
              <Diamond className="w-8 h-8 group-hover:animate-spin" />
            </div>
          </Button>
          
          <div className="mt-8 text-white/80 text-lg">
            🔥 <span className="text-primary font-bold">1000+</span> Traders Online Now
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
};

export default UltraModernMemeHero;