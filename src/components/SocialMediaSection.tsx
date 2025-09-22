import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Video, Twitter, Instagram, Youtube, Users } from "lucide-react";

const SocialMediaSection = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const socialPlatforms = [
    {
      name: "Telegram",
      icon: MessageCircle,
      description: t('social.telegram.description'),
      link: "https://t.me/velo_sweden",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      name: "TikTok",
      icon: Video,
      description: t('social.tiktok.description'),
      link: "#",
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      description: t('social.twitter.description'),
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
            {t('social.title')}
          </h2>
          <p className={`font-display ${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto ${isMobile ? 'mb-4' : 'mb-6'}`}>
            {t('social.subtitle')}
            {' '}
            {t('social.communityGoal')}
          </p>
          <p className={`font-display ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground/80 max-w-2xl mx-auto`}>
            {t('social.telegramCall')}
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
                    {t('social.followUs')}
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