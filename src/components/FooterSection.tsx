import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import { MessageCircle, Video, Twitter } from "lucide-react";

const FooterSection = () => {
  const isMobile = useIsMobile();
  const socialLinks = [
    { icon: MessageCircle, name: "Telegram", link: "https://t.me/cryptonetworksweden", color: "text-blue-400" },
    { icon: Video, name: "TikTok", link: "#", color: "text-pink-400" },
    { icon: Twitter, name: "Twitter/X", link: "#", color: "text-blue-500" }
  ];


  return (
    <footer className="bg-gradient-secondary border-t border-border">
      <div className={`container mx-auto ${isMobile ? 'px-6 py-8' : 'px-4 py-12'}`}>

        {/* Social Media Links */}
        <div className="border-t border-border pt-8 mb-8">
          <h4 className="font-crypto font-bold text-primary text-center mb-6">
            FÖLJ OSS PÅ SOCIALA MEDIER
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
              © 2024 Crypto Network Sweden. Alla rättigheter förbehållna.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Integritetspolicy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Användarvillkor
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-center text-muted-foreground">
              <strong>Riskvarning:</strong> Handel med kryptovalutor är förknippat med höga risker. 
              Investeringar kan både öka och minska i värde. Investera aldrig mer än vad du har råd att förlora. 
              Crypto Network Sweden tillhandahåller endast utbildningsinnehåll och är inte finansiell rådgivning.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;