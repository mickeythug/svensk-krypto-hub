import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, BookOpen, Trophy, Star, Calendar, MapPin, Heart } from "lucide-react";

const CommunitySection = () => {
  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Dagliga Diskussioner",
      description: "Delta i livliga diskussioner om marknadsrörelser, nya projekt och investeringsstrategier",
      count: "200+"
    },
    {
      icon: BookOpen, 
      title: "Utbildningsresurser",
      description: "Gratis guider, tutorials och kurser för alla nivåer - från nybörjare till avancerade traders",
      count: "100+"
    },
    {
      icon: Trophy,
      title: "Trading Tävlingar", 
      description: "Månadsvis trading-tävlingar med riktiga priser och erkännande för bästa performance",
      count: "12/år"
    },
    {
      icon: Users,
      title: "Mentor Program",
      description: "Erfarna traders hjälper nya medlemmar att navigera kryptovärlden säkert",
      count: "50+"
    }
  ];

  const upcomingEvents = [
    {
      title: "Bitcoin Halving Workshop",
      date: "15 Mars",
      time: "19:00",
      type: "Online",
      attendees: 245
    },
    {
      title: "DeFi Deep Dive",
      date: "22 Mars", 
      time: "18:30",
      type: "Stockholm",
      attendees: 89
    },
    {
      title: "Trading Psychology",
      date: "29 Mars",
      time: "20:00", 
      type: "Online",
      attendees: 167
    }
  ];

  const testimonials = [
    {
      name: "Anna L.",
      role: "Nybörjare → Erfaren Trader",
      content: "Crypto Network Sweden hjälpte mig gå från att inte veta något om krypto till att göra lönsamma trades. Communityn är otroligt välkomnande!",
      rating: 5,
      timeInCommunity: "8 månader"
    },
    {
      name: "Erik M.", 
      role: "DeFi Entusiast",
      content: "Bästa svenska krypto-communityn! Lärde mig allt om DeFi och yield farming. Nu tjänar jag passiv inkomst på mina krypton.",
      rating: 5,
      timeInCommunity: "1 år"
    },
    {
      name: "Maria S.",
      role: "NFT Samlare",
      content: "Tack vare CNS upptäckte jag NFT-världen tidigt. Gemenskapen delar fantastiska projekt innan de blir mainstream.",
      rating: 5,
      timeInCommunity: "6 månader"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-crypto text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            VÅR COMMUNITY
          </h2>
          <p className="font-display text-xl text-muted-foreground max-w-3xl mx-auto">
            Gå med i Sveriges mest välkomnande och utbildande krypto-community. 
            Tillsammans bygger vi kunskap, delar erfarenheter och navigerar kryptovärlden.
          </p>
        </div>

        {/* Community Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <Card 
                key={feature.title}
                className="p-6 text-center bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105 group"
              >
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                
                <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  {feature.description}
                </p>
                
                <Badge className="bg-primary text-primary-foreground">
                  {feature.count} per månad
                </Badge>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Upcoming Events */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="font-crypto text-xl font-bold text-primary">
                KOMMANDE EVENTS
              </h3>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{event.date} kl {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{event.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>{event.attendees}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Anmäl
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Se alla events
              </Button>
            </div>
          </Card>

          {/* Community Stats */}
          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <h3 className="font-crypto text-xl font-bold mb-6">
              COMMUNITY STATISTIK
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="font-crypto text-3xl font-bold mb-1">5,247</div>
                <div className="text-sm opacity-90">Aktiva Medlemmar</div>
              </div>
              <div className="text-center">
                <div className="font-crypto text-3xl font-bold mb-1">892</div>
                <div className="text-sm opacity-90">Dagliga Meddelanden</div>
              </div>
              <div className="text-center">
                <div className="font-crypto text-3xl font-bold mb-1">156</div>
                <div className="text-sm opacity-90">Genomsnittlig Support</div>
              </div>
              <div className="text-center">
                <div className="font-crypto text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm opacity-90">Community Support</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary-foreground/20">
              <div className="text-center">
                <Badge className="bg-primary-foreground text-primary mb-2">
                  🏆 Top Rated Community
                </Badge>
                <p className="text-sm opacity-90">
                  4.9/5 rating från över 1,000 medlemsrecensioner
                </p>
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

        {/* CTA Section */}
        <Card className="p-8 text-center bg-gradient-secondary border-border">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-crypto text-2xl font-bold mb-4">
              REDO ATT GÅ MED I OSS?
            </h3>
            <p className="font-display text-muted-foreground mb-6">
              Börja din krypto-resa idag med Sveriges vänligaste och mest hjälpsamma community. 
              Det är gratis att gå med och du får omedelbar tillgång till alla våra resurser.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow-primary">
                Gå med nu - Gratis!
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Läs mer om medlemskap
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CommunitySection;