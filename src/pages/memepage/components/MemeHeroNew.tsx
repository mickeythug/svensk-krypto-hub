import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, TrendingUp, Star } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

import heroImage from '@/assets/meme-hero.jpg';

const MemeHeroNew = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImage} 
          alt="Meme Token Universe Background" 
          className="w-full h-full object-cover opacity-30"
          fallbackSrc="/placeholder.svg"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/30"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <Badge className="font-display text-lg px-6 py-2 bg-gradient-rainbow text-foreground animate-pulse-glow">
              🌟 VÄRLDENS BÄSTA MEME TOKEN SIDA 🌟
            </Badge>
            <h1 className="font-crypto text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-rainbow bg-clip-text text-transparent animate-float leading-tight">
              MEME<br />
              <span className="text-5xl md:text-7xl lg:text-8xl">TOKEN</span><br />
              UNIVERSE
            </h1>
          </div>

          {/* Subtitle */}
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-foreground/90 max-w-4xl mx-auto leading-relaxed">
            Upptäck de hetaste meme-coinsen med <span className="text-primary font-bold">stora bilder</span>, 
            <span className="text-accent font-bold"> live-data</span> och 
            <span className="text-secondary font-bold"> interaktiv design</span>!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Button size="lg" className="font-display text-xl px-12 py-6 bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 animate-pulse-glow">
              <Rocket className="mr-3 h-6 w-6" />
              Utforska Tokens
            </Button>
            <Button variant="outline" size="lg" className="font-display text-xl px-12 py-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              <TrendingUp className="mr-3 h-6 w-6" />
              Live Trender
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/30 hover:shadow-glow-primary transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="font-display text-sm text-muted-foreground">Meme Tokens</div>
              </div>
            </Card>
            <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/30 hover:shadow-glow-secondary transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent">24/7</div>
                <div className="font-display text-sm text-muted-foreground">Live Data</div>
              </div>
            </Card>
            <Card className="p-4 bg-card/80 backdrop-blur-sm border-secondary/30 hover:shadow-glow-secondary transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">1M+</div>
                <div className="font-display text-sm text-muted-foreground">Daily Views</div>
              </div>
            </Card>
            <Card className="p-4 bg-card/80 backdrop-blur-sm border-success/30 hover:shadow-glow-secondary transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-success">99.9%</div>
                <div className="font-display text-sm text-muted-foreground">Uptime</div>
              </div>
            </Card>
          </div>

          {/* Floating Icons */}
          <div className="absolute top-20 left-10 animate-bounce">
            <Zap className="h-8 w-8 text-accent" />
          </div>
          <div className="absolute top-32 right-20 animate-float">
            <Star className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute bottom-20 left-20 animate-pulse">
            <Rocket className="h-12 w-12 text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemeHeroNew;