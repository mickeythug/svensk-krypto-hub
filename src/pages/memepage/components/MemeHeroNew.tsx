import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, TrendingUp, Star, Crown } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import heroImage from '@/assets/meme-hero.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
const MemeHeroNew = () => {
  const isMobile = useIsMobile();
  return <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-yellow-900/30 to-gray-900">
      {/* Modern Background Layers */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage src={heroImage} alt="Meme Token Universe Background" className="w-full h-full object-cover opacity-30" fallbackSrc="/placeholder.svg" />
        <div className="absolute inset-0 bg-gradient-casino-gold opacity-20 animate-shimmer"></div>
        <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 z-5 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8 py-8 md:py-16 lg:py-20">
        <div className="text-center space-y-6 md:space-y-10 lg:space-y-12">
          {/* Modern Badge */}
          <div className="flex justify-center">
            <Badge className="font-sans font-bold text-base md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4 bg-gradient-casino-gold text-black shadow-glow-gold border-2 border-yellow-400/50 rounded-full">
              <Crown className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              MEME TOKEN HUB
              <Zap className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
            </Badge>
          </div>

          {/* Massive Gaming Title */}
          <div className="space-y-6">
            <h1 className={`font-sans font-black text-white drop-shadow-lg leading-tight ${isMobile ? 'text-5xl' : 'text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]'}`}>
              MEME<br />
              <span className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-7xl lg:text-8xl xl:text-[8rem]'} text-yellow-300`}>
                TOKEN
              </span><br />
              <span className="text-orange-300">
                MADNESS
              </span>
            </h1>
          </div>

          {/* Gaming Subtitle */}
          <div className="max-w-6xl mx-auto">
            
          </div>

          {/* Ultra Gaming Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-8'} justify-center items-center pt-8`}>
            
            
            
          </div>

          {/* Gaming Stats Grid */}
          

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
    </section>;
};
export default MemeHeroNew;