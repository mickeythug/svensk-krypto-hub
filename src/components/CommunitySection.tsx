import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, MessageCircle, BookOpen, Trophy, Star, Calendar, MapPin, Heart } from "lucide-react";

const CommunitySection = () => {
  const isMobile = useIsMobile();
  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Telegram Community",
      description: "Gå med i vår öppna Telegram-grupp där alla är välkomna att ställa frågor och lära sig tillsammans",
      count: "Alltid"
    },
    {
      icon: Users, 
      title: "Voice Chat Trading",
      description: "Möjlighet att trade tillsammans i voice chat och dela insights i realtid med andra medlemmar",
      count: "Dagligen"
    },
    {
      icon: Trophy,
      title: "Meme Token Scanning", 
      description: "Scanna och analysera nya meme tokens tillsammans - hitta nästa stora möjlighet som grupp",
      count: "24/7"
    },
    {
      icon: Heart,
      title: "Nya Vänner",
      description: "Träffa likasinnade personer och bygg vänskaper med andra som delar ditt intresse för krypto",
      count: "Öppet"
    }
  ];

  const upcomingEvents = [
    {
      title: "Voice Chat Trading Session",
      date: "Varje dag",
      time: "20:00",
      type: "Telegram VC",
      attendees: "Alla välkomna"
    },
    {
      title: "Meme Token Scanning", 
      date: "Kontinuerligt",
      time: "24/7",
      type: "Telegram Chat",
      attendees: "Community"
    },
    {
      title: "Frågor & Svar",
      date: "Alltid öppet",
      time: "Dygnet runt", 
      type: "Telegram",
      attendees: "Gratis hjälp"
    }
  ];

  const testimonials = [
    {
      name: "Anna L.",
      role: "Community Medlem",
      content: "Bästa Telegram-gruppen! Alla hjälper varandra, ställer frågor fritt och vi tradear tillsammans i voice chat. Känns som en stor familj!",
      rating: 5,
      timeInCommunity: "8 månader"
    },
    {
      name: "Erik M.", 
      role: "Meme Token Hunter",
      content: "Vi scannar meme tokens tillsammans varje dag! Gruppen har hjälpt mig hitta så många tidiga gems. Helt gratis och öppet för alla!",
      rating: 5,
      timeInCommunity: "1 år"
    },
    {
      name: "Maria S.",
      role: "Voice Chat Regular",
      content: "Voice chat sessionerna är fantastiska! Vi tradear live tillsammans och delar tips. Träffat så många nya vänner genom communityn.",
      rating: 5,
      timeInCommunity: "6 månader"
    }
  ];

  return (
    <section className={`${isMobile ? 'py-8' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-16'}`}>
          <h2 className={`font-crypto ${isMobile ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            VÅR COMMUNITY
          </h2>
          <p className={`font-display ${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            Vår Telegram-community är öppen för alla! Ställ frågor, lär dig, trade tillsammans i voice chat och hitta möjligheter. 
            Vi hjälps åt att scanna meme tokens och bygga vänskaper - allt helt gratis.
          </p>
        </div>

        {/* Community Features */}
        <div className={`grid grid-cols-2 ${isMobile ? 'gap-3 mb-6' : 'md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'}`}>
          {communityFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <Card 
                key={feature.title}
                className={`${isMobile ? 'p-3' : 'p-6'} text-center bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105 group`}
              >
                <div className={`inline-flex ${isMobile ? 'p-2' : 'p-4'} rounded-full bg-primary/10 ${isMobile ? 'mb-2' : 'mb-4'} group-hover:bg-primary/20 transition-colors`}>
                  <IconComponent className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-primary`} />
                </div>
                
                <h3 className={`font-display font-bold ${isMobile ? 'text-sm mb-1' : 'text-lg mb-2'}`}>{feature.title}</h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs mb-2' : 'text-sm mb-3'} leading-relaxed`}>
                  {feature.description}
                </p>
                
                <Badge className={`bg-primary text-primary-foreground ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
                  {feature.count}
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* Telegram Community Card */}
        <div className={`${isMobile ? 'mb-8' : 'mb-16'}`}>
          <Card className="p-8 bg-gradient-primary text-primary-foreground text-center border-border">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <img 
                  src="/lovable-uploads/9749ce60-cc5c-4316-bb4e-d89a819b14cd.png" 
                  alt="Telegram" 
                  className="h-20 w-20 mx-auto mb-4"
                />
                <h3 className="font-crypto text-3xl font-bold mb-4">
                  GÅ MED I VÅR TELEGRAM COMMUNITY
                </h3>
                <p className="font-display text-lg opacity-90 mb-6">
                  Anslut till vår växande krypto-community - vårt mål är att bli Sveriges största! Ställ frågor, lär dig, tradea tillsammans i voice chat, 
                  scanna meme tokens och träffa nya vänner. Helt gratis och öppet för alla!
                </p>
              </div>
              
              <a 
                href="https://t.me/cryptonetworksweden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xl px-12 py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/9749ce60-cc5c-4316-bb4e-d89a819b14cd.png" 
                    alt="Telegram" 
                    className="h-6 w-6 mr-3"
                  />
                  Gå med nu - Gratis!
                </Button>
              </a>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm opacity-90">
                <div>
                  <div className="font-bold">Voice Chat</div>
                  <div>Dagligen 20:00</div>
                </div>
                <div>
                  <div className="font-bold">Meme Scanning</div>
                  <div>24/7 Support</div>
                </div>
                <div>
                  <div className="font-bold">Frågor & Svar</div>
                  <div>Alltid öppet</div>
                </div>
                <div>
                  <div className="font-bold">Nya Vänner</div>
                  <div>Välkommen in!</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="font-crypto text-2xl font-bold text-center mb-8 text-primary">
            VAD SÄGER VÅRA MEDLEMMAR
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.timeInCommunity}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CommunitySection;