import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

import { MessageCircle, Video, Twitter } from "lucide-react";

const FooterSection = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const socialLinks = [
    { icon: MessageCircle, name: "Telegram", link: "https://t.me/cryptonetworksweden", color: "text-blue-400" },
    { icon: Video, name: "TikTok", link: "#", color: "text-pink-400" },
    { icon: Twitter, name: "Twitter/X", link: "#", color: "text-blue-500" }
  ];


  return (
    <footer className={`bg-background border-t border-border ${isMobile ? 'pb-20' : ''}`}>
      <div className={`container mx-auto ${isMobile ? 'px-4 py-6' : 'px-4 py-12'}`}>

        {/* Social Media Links */}
        <div className="border-t border-border pt-8 mb-8">
          <h4 className="font-crypto font-bold text-primary text-center mb-6">
            {t('footer.followUs')}
          </h4>
          
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              
              return (
                <Button
                  key={social.name}
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary group"
                  onClick={() => window.open(social.link, '_blank')}
                >
                  <IconComponent className={`h-4 w-4 ${social.color} mr-2`} />
                  {social.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.cookies')}
              </a>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-center text-muted-foreground">
              <strong>{t('footer.riskWarning')}</strong> {t('footer.riskDescription')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;