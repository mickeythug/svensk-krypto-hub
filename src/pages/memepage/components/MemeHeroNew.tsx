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
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Professional Background */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImage} 
          alt="Meme Token Universe Background" 
          className="w-full h-full object-cover opacity-10" 
          fallbackSrc="/placeholder.svg" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/95"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          {/* Professional Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="font-sans font-bold text-lg md:text-xl px-6 py-3 bg-primary text-primary-foreground border border-primary/30 rounded-full">
              <Crown className="w-5 h-5 mr-2" />
              MEME TOKEN HUB
              <Zap className="w-5 h-5 ml-2" />
            </Badge>
          </div>

          {/* Professional Title */}
          <div className="space-y-4">
            <h1 className={`font-sans font-bold text-foreground leading-tight ${
              isMobile ? 'text-4xl' : 'text-6xl md:text-7xl'
            }`}>
              Upptäck<br />
              <span className="text-primary">
                Meme Tokens
              </span>
            </h1>
            
            <p className={`text-muted-foreground font-medium max-w-3xl mx-auto ${
              isMobile ? 'text-lg' : 'text-xl md:text-2xl'
            }`}>
              Handla och investera i de hetaste meme tokens med live-data och professionella verktyg
            </p>
          </div>

          {/* Professional CTA */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'} justify-center items-center pt-8`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Utforska Tokens
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-muted font-bold px-8 py-4 text-lg">
              <Star className="w-5 h-5 mr-2" />
              Marknadsstats
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default MemeHeroNew;