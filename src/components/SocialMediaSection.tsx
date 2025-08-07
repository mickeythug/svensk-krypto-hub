import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Video, Twitter, Instagram, Youtube, Users } from "lucide-react";

const SocialMediaSection = () => {
  const socialPlatforms = [
    {
      name: "Telegram",
      icon: MessageCircle,
      description: "Gå med i vårt huvudchat för dagliga diskussioner",
      members: "3.2k",
      link: "#",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      name: "TikTok",
      icon: Video,
      description: "Följ våra senaste krypto-tips och analyser",
      members: "15k",
      link: "#",
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      description: "Håll dig uppdaterad med senaste nyheterna",
      members: "8.5k",
      link: "#",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      name: "Instagram",
      icon: Instagram,
      description: "Se våra visuella guider och infografik",
      members: "5.1k",
      link: "#",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      name: "YouTube",
      icon: Youtube,
      description: "Djupgående analyser och utbildningsvideos",
      members: "12k",
      link: "#",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      name: "Discord",
      icon: Users,
      description: "Privat community för avancerade diskussioner",
      members: "2.8k",
      link: "#",
      color: "text-indigo-400",
      bgColor: "bg-indigo-400/10"
    }
  ];

  return (
    <section className="py-20 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-crypto text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FÖLJ OSS ÖVERALLT
          </h2>
          <p className="font-display text-xl text-muted-foreground max-w-3xl mx-auto">
            Gå med i vårt växande community på alla sociala plattformar. 
            Var än du befinner dig online, vi är där för att hjälpa dig på din krypto-resa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <Card
                key={platform.name}
                className="group p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105 hover:border-primary/50"
              >
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-full ${platform.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${platform.color}`} />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl mb-2">{platform.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {platform.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="font-crypto text-primary font-bold">{platform.members}</span>
                    <span className="text-muted-foreground text-sm">följare</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    onClick={() => window.open(platform.link, '_blank')}
                  >
                    Följ oss
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Card className="inline-block p-6 bg-gradient-primary">
            <div className="flex items-center space-x-4">
              <div className="text-primary-foreground">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-left text-primary-foreground">
                <p className="font-crypto font-bold text-2xl">50,000+</p>
                <p className="font-display text-sm opacity-90">Totala följare över alla plattformar</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;