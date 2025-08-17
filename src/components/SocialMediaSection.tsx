import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageCircle, Video, Twitter, Instagram, Youtube, Users } from "lucide-react";

const SocialMediaSection = () => {
  const isMobile = useIsMobile();
  const socialPlatforms = [
    {
      name: "Telegram",
      icon: MessageCircle,
      description: "Ställ frågor, lär dig, få gratis krypto-information och hjälp. Vi hjälps åt att hitta möjligheter tillsammans!",
      link: "https://t.me/cryptonetworksweden",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      name: "TikTok",
      icon: Video,
      description: "Följ våra senaste krypto-tips, analyser och utbildningsinnehåll",
      link: "#",
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      description: "Håll dig uppdaterad med senaste nyheterna och marknadsanalyser",
      link: "#",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  return (
    <section className={`${isMobile ? 'py-8' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 className={`font-orbitron ${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-4' : 'mb-6'} text-foreground tracking-wider`}>
            FÖLJ OSS ÖVERALLT
          </h2>
          <p className={`font-display ${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto ${isMobile ? 'mb-4' : 'mb-6'}`}>
            Vi tänker bli den största krypto-communityn i Sverige! Gå med i våra sociala kanaler där vi hjälps åt att hitta möjligheter tillsammans.
            En gemenskap med ett och samma mål - att växa och lära inom krypto.
          </p>
          <p className={`font-display ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground/80 max-w-2xl mx-auto`}>
            Hör alltid av dig på Telegram för frågor, lärande och gratis krypto-information. Vi hjälps åt!
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4 mb-8' : 'md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'}`}>
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <Card
                key={platform.name}
                className={`group ${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105 hover:border-primary/50`}
              >
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-full ${platform.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${platform.color}`} />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl mb-2">{platform.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {platform.description}
                  </p>
                  
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
                    onClick={() => window.open(platform.link, '_blank')}
                  >
                    Följ oss
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SocialMediaSection;