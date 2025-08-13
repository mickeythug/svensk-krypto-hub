import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, TrendingUp, Star, Crown } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import heroImage from '@/assets/meme-hero.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
const MemeHeroNew = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-casino-gold">
      {/* Gaming Background Layers */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImage} 
          alt="Meme Token Universe Background" 
          className="w-full h-full object-cover opacity-40" 
          fallbackSrc="/placeholder.svg" 
        />
        <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-20 animate-shimmer"></div>
        <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Gaming Grid Pattern Overlay */}
      <div className="absolute inset-0 z-5 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center space-y-8 md:space-y-12">
          {/* Ultra Gaming Badge */}
          <div className="flex justify-center">
            <Badge className="font-orbitron text-lg md:text-2xl px-8 py-4 bg-gradient-casino-gold text-black shadow-glow-gold animate-pulse border-4 border-yellow-400/50 rounded-full">
              <Crown className="w-6 h-6 mr-3 animate-bounce" />
              MEME TOKEN CASINO
              <Zap className="w-6 h-6 ml-3 animate-pulse" />
            </Badge>
          </div>

          {/* Massive Gaming Title */}
          <div className="space-y-6">
            <h1 className={`font-orbitron font-black bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto] leading-tight ${
              isMobile ? 'text-6xl' : 'text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem]'
            }`}>
              MEME<br />
              <span className={`${isMobile ? 'text-5xl' : 'text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem]'} text-white drop-shadow-glow`}>
                TOKEN
              </span><br />
              <span className="bg-gradient-casino-rainbow bg-clip-text text-transparent animate-shimmer">
                MADNESS
              </span>
            </h1>
          </div>

          {/* Gaming Subtitle */}
          <div className="max-w-6xl mx-auto">
            <p className={`font-orbitron font-bold text-yellow-100 leading-relaxed ${
              isMobile ? 'text-lg' : 'text-2xl md:text-3xl lg:text-4xl'
            }`}>
              🎰 <span className="text-yellow-400 font-black">STORA BILDER</span> • 
              <span className="text-yellow-300 font-black"> LIVE DATA</span> • 
              <span className="text-yellow-200 font-black"> CASINO KÄNSLA</span> 🎰
            </p>
          </div>

          {/* Ultra Gaming Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-8'} justify-center items-center pt-8`}>
            <Button 
              size="lg" 
              className={`font-orbitron font-black bg-gradient-casino-gold text-black shadow-glow-gold hover:shadow-glow-rainbow transition-all duration-300 animate-pulse border-4 border-yellow-400/50 rounded-full ${
                isMobile ? 'text-xl px-12 py-6 h-16' : 'text-2xl px-16 py-8 h-20'
              }`}
            >
              <Rocket className={`mr-4 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} animate-bounce`} />
              SPELA NU!
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className={`font-orbitron font-black border-4 border-yellow-400/70 text-yellow-200 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300 rounded-full ${
                isMobile ? 'text-xl px-12 py-6 h-16' : 'text-2xl px-16 py-8 h-20'
              }`}
            >
              <TrendingUp className={`mr-4 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} animate-pulse`} />
              LIVE ODDS
            </Button>
          </div>

          {/* Gaming Stats Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4 pt-12' : 'grid-cols-4 gap-8 pt-16'} max-w-6xl mx-auto`}>
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-4 border-yellow-400/50 hover:shadow-glow-gold transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-orbitron font-black text-yellow-400 animate-pulse`}>
                  500+
                </div>
                <div className={`font-orbitron font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-yellow-200`}>
                  TOKENS
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-4 border-green-400/50 hover:shadow-glow-primary transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-orbitron font-black text-green-400 animate-pulse`}>
                  24/7
                </div>
                <div className={`font-orbitron font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-green-200`}>
                  LIVE
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-4 border-purple-400/50 hover:shadow-glow-secondary transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-orbitron font-black text-purple-400 animate-pulse`}>
                  1M+
                </div>
                <div className={`font-orbitron font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-purple-200`}>
                  SPELARE
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-4 border-red-400/50 hover:shadow-glow-destructive transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-orbitron font-black text-red-400 animate-pulse`}>
                  99.9%
                </div>
                <div className={`font-orbitron font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-red-200`}>
                  UPTIME
                </div>
              </div>
            </Card>
          </div>

          {/* Floating Gaming Icons */}
          <div className="absolute top-10 left-10 animate-bounce">
            <Star className="h-12 w-12 text-yellow-400 opacity-70" />
          </div>
          <div className="absolute top-20 right-20 animate-pulse">
            <Zap className="h-16 w-16 text-yellow-300 opacity-60" />
          </div>
          <div className="absolute bottom-20 left-20 animate-spin-slow">
            <Rocket className="h-20 w-20 text-yellow-200 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};
export default MemeHeroNew;