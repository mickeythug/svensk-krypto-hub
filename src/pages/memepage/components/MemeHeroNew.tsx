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
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Modern Background Layers */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImage} 
          alt="Meme Token Universe Background" 
          className="w-full h-full object-cover opacity-30" 
          fallbackSrc="/placeholder.svg" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/hex-pattern.jpg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 z-5 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8 py-8 md:py-16 lg:py-20">
        <div className="text-center space-y-6 md:space-y-10 lg:space-y-12">
          {/* Modern Badge */}
          <div className="flex justify-center">
            <Badge className="font-sans font-bold text-base md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-2 border-blue-400/50 rounded-full">
              <Crown className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              MEME TOKEN HUB
              <Zap className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
            </Badge>
          </div>

          {/* Massive Gaming Title */}
          <div className="space-y-6">
            <h1 className={`font-sans font-black text-white drop-shadow-lg leading-tight ${
              isMobile ? 'text-5xl' : 'text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]'
            }`}>
              MEME<br />
              <span className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-7xl lg:text-8xl xl:text-[8rem]'} text-blue-300`}>
                TOKEN
              </span><br />
              <span className="text-purple-300">
                MADNESS
              </span>
            </h1>
          </div>

          {/* Gaming Subtitle */}
          <div className="max-w-6xl mx-auto">
            <p className={`font-sans font-bold text-blue-100 leading-relaxed ${
              isMobile ? 'text-lg' : 'text-2xl md:text-3xl lg:text-4xl'
            }`}>
              💎 <span className="text-blue-300 font-black">STORA BILDER</span> • 
              <span className="text-blue-200 font-black"> LIVE DATA</span> • 
              <span className="text-purple-200 font-black"> PREMIUM KÄNSLA</span> 💎
            </p>
          </div>

          {/* Ultra Gaming Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-8'} justify-center items-center pt-8`}>
            <Button 
              size="lg" 
              className={`font-sans font-black bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-400/50 rounded-full ${
                isMobile ? 'text-xl px-12 py-6 h-16' : 'text-2xl px-16 py-8 h-20'
              }`}
            >
              <Rocket className={`mr-4 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              SPELA NU!
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className={`font-sans font-black border-2 border-blue-400/70 text-blue-200 hover:bg-blue-400/20 hover:border-blue-400 transition-all duration-300 rounded-full ${
                isMobile ? 'text-xl px-12 py-6 h-16' : 'text-2xl px-16 py-8 h-20'
              }`}
            >
              <TrendingUp className={`mr-4 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              LIVE ODDS
            </Button>
          </div>

          {/* Gaming Stats Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4 pt-12' : 'grid-cols-4 gap-8 pt-16'} max-w-6xl mx-auto`}>
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-2 border-blue-400/50 hover:shadow-lg transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-sans font-black text-blue-400`}>
                  500+
                </div>
                <div className={`font-sans font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-blue-200`}>
                  TOKENS
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-2 border-green-400/50 hover:shadow-lg transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-sans font-black text-green-400`}>
                  24/7
                </div>
                <div className={`font-sans font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-green-200`}>
                  LIVE
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-2 border-purple-400/50 hover:shadow-lg transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-sans font-black text-purple-400`}>
                  1M+
                </div>
                <div className={`font-sans font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-purple-200`}>
                  SPELARE
                </div>
              </div>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-black/40 backdrop-blur-sm border-2 border-red-400/50 hover:shadow-lg transition-all duration-300 rounded-xl`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-sans font-black text-red-400`}>
                  99.9%
                </div>
                <div className={`font-sans font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-red-200`}>
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