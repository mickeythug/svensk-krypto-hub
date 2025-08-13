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
        
      </div>

      
    </section>;
};
export default MemeHeroNew;