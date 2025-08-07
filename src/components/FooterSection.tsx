import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { MessageCircle, Video, Twitter, Instagram, Youtube, Users, Mail, MapPin, Phone } from "lucide-react";

const FooterSection = () => {
  const socialLinks = [
    { icon: MessageCircle, name: "Telegram", link: "#", color: "text-blue-400" },
    { icon: Video, name: "TikTok", link: "#", color: "text-pink-400" },
    { icon: Twitter, name: "Twitter/X", link: "#", color: "text-blue-500" },
    { icon: Instagram, name: "Instagram", link: "#", color: "text-purple-400" },
    { icon: Youtube, name: "YouTube", link: "#", color: "text-red-500" },
    { icon: Users, name: "Discord", link: "#", color: "text-indigo-400" }
  ];

  const quickLinks = [
    { title: "Om oss", link: "#" },
    { title: "Utbildning", link: "#" },
    { title: "Marknadsanalys", link: "#" },
    { title: "Community", link: "#" },
    { title: "Events", link: "#" },
    { title: "Support", link: "#" }
  ];

  const resources = [
    { title: "Nybörjarguide", link: "#" },
    { title: "Trading Tips", link: "#" },
    { title: "DeFi Guide", link: "#" },
    { title: "Säkerhet", link: "#" },
    { title: "API Dokumentation", link: "#" },
    { title: "Partner Program", link: "#" }
  ];

  return (
    <footer className="bg-gradient-secondary border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                alt="Crypto Network Sweden"
                className="h-40 w-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]"
              />
              <h3 className="font-crypto text-xl font-bold text-primary mb-2">
                CRYPTO NETWORK SWEDEN
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sveriges ledande krypto-community som hjälper dig navigera Web3-världen 
                med kunskap, stöd och gemenskap.
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail size={14} />
                <span>kontakt@cryptonetwork.se</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin size={14} />
                <span>Stockholm, Sverige</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone size={14} />
                <span>+46 (0) 8-123 456 78</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-crypto font-bold text-primary mb-4">SNABBLÄNKAR</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.title}>
                  <a 
                    href={link.link}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-crypto font-bold text-primary mb-4">RESURSER</h4>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.title}>
                  <a 
                    href={resource.link}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-crypto font-bold text-primary mb-4">HÅLL DIG UPPDATERAD</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Få dagliga krypto-nyheter och analyser direkt i din inkorg.
            </p>
            
            <div className="space-y-3">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Din e-postadress"
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  size="sm" 
                  className="rounded-l-none bg-primary hover:bg-primary/90"
                >
                  Prenumerera
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingen spam. Avsluta prenumeration när som helst.
              </p>
            </div>
          </div>
        </div>

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