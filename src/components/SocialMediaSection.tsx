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
      description: "Ask questions, learn, get free crypto information and help. We help each other find opportunities together!",
      link: "https://t.me/velo_sweden",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      name: "TikTok",
      icon: Video,
      description: "Follow our latest crypto tips, analysis and educational content",
      link: "#",
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      description: "Stay updated with the latest news and market analysis",
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
            FOLLOW US EVERYWHERE
          </h2>
          <p className={`font-display ${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto ${isMobile ? 'mb-4' : 'mb-6'}`}>
            We aim to become the largest crypto community in Sweden! Join our social channels where we help each other find opportunities together.
            {' '}
            A community with one goal - to grow and learn within crypto.
          </p>
          <p className={`font-display ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground/80 max-w-2xl mx-auto`}>
            Always reach out on Telegram for questions, learning and free crypto information. We help each other!
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
                    Follow us
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