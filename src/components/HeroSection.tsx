import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hexagon, Users, TrendingUp, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import hexPattern from "@/assets/hex-pattern.jpg";

const HeroSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className={`relative ${isMobile ? 'min-h-screen pt-20' : 'min-h-screen'} flex items-center justify-center overflow-hidden`}>
      {/* Background with hex pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${hexPattern})` }}
      />
      
      {/* Animated floating hexagons */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 text-primary/30 animate-float">
            <Hexagon size={40} />
          </div>
          <div className="absolute top-40 right-20 text-primary/20 animate-float" style={{ animationDelay: '1s' }}>
            <Hexagon size={60} />
          </div>
          <div className="absolute bottom-32 left-20 text-primary/25 animate-float" style={{ animationDelay: '2s' }}>
            <Hexagon size={35} />
          </div>
          <div className="absolute bottom-20 right-10 text-primary/15 animate-float" style={{ animationDelay: '0.5s' }}>
            <Hexagon size={50} />
          </div>
        </div>
      )}

      <div className={`container mx-auto ${isMobile ? 'px-6' : 'px-4'} text-center relative z-30`}>
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'} animate-fade-in`}>
            <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
              <img 
                src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                alt="Crypto Network Sweden"
                className={`${isMobile ? 'h-32 w-32' : 'h-[400px] w-auto'} mx-auto object-contain drop-shadow-[0_0_30px_rgba(18,225,159,0.5)]`}
              />
            </div>
            
            <h1 className={`font-crypto ${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <span style={{ color: '#12E19F' }}>CRY</span>
              <span className="text-white">PTO</span>
              <span className="text-white"> </span>
              <span className="text-white">NET</span>
              <span style={{ color: '#12E19F' }}>WORK</span>
            </h1>
            <h2 className={`font-crypto ${isMobile ? 'text-lg' : 'text-2xl md:text-4xl'} text-muted-foreground ${isMobile ? 'mb-4' : 'mb-6'}`}>
              SWEDEN
            </h2>
          </div>

          {/* Description */}
          <p className={`font-display ${isMobile ? 'text-base px-2' : 'text-xl md:text-2xl'} text-muted-foreground ${isMobile ? 'mb-6' : 'mb-8'} leading-relaxed animate-fade-in`} style={{ animationDelay: '0.3s' }}>
            Vårt mål är att bli Sveriges ledande krypto community där du lär dig om kryptovalutor, 
            följer marknaden i realtid och träffar nya vänner med samma passion för Web3
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col ${isMobile ? 'gap-3' : 'sm:flex-row gap-4'} justify-center ${isMobile ? 'mb-8 px-4' : 'mb-12'} animate-fade-in`} style={{ animationDelay: '0.6s' }}>
            <Button size={isMobile ? "default" : "lg"} className={`font-display font-semibold ${isMobile ? 'text-base py-3' : 'text-lg px-8 py-4'} bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 transform hover:scale-105`}>
              Gå med i Communityn
            </Button>
            <Button variant="outline" size={isMobile ? "default" : "lg"} className={`font-display font-semibold ${isMobile ? 'text-base py-3' : 'text-lg px-8 py-4'} border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300`}>
              Lär dig mer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4 px-4' : 'md:grid-cols-3 gap-6'} animate-fade-in`} style={{ animationDelay: '0.9s' }}>
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105`}>
              <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary mx-auto mb-3`} />
              <h3 className={`font-display font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>5000+</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Aktiva Medlemmar</p>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105`}>
              <TrendingUp className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-success mx-auto mb-3`} />
              <h3 className={`font-display font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>24/7</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Marknadsanalys</p>
            </Card>
            
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105`}>
              <BookOpen className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-accent mx-auto mb-3`} />
              <h3 className={`font-display font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>100+</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Utbildningsresurser</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;