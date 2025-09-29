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
      title: 'Telegram Chat',
      description: 'Active daily discussions about crypto',
      count: '5000+ members'
    },
    {
      icon: Users, 
      title: 'Voice Chat',
      description: 'Weekly voice discussions',
      count: 'Every Sunday'
    },
    {
      icon: Trophy,
      title: 'Meme Scanner',
      description: 'Find the next big meme coin',
      count: 'Live tracking'
    },
    {
      icon: Heart,
      title: 'New Friends',
      description: 'Meet fellow crypto enthusiasts',
      count: 'Daily connections'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Weekly Voice Chat',
      date: 'Every Sunday',
      time: "20:00",
      type: "Telegram VC",
      attendees: '50+ participants'
    },
    {
      title: 'Meme Token Scanning', 
      date: 'Daily',
      time: "24/7",
      type: "Telegram Chat",
      attendees: 'All members'
    },
    {
      title: 'Q&A Sessions',
      date: 'As needed',
      time: 'Support', 
      type: "Telegram",
      attendees: 'Community members'
    }
  ];

  const testimonials = [
    {
      name: 'Alex L.',
      role: 'Crypto Trader',
      content: 'Amazing community with great insights and friendly members. Learned so much about crypto here!',
      rating: 5,
      timeInCommunity: '6 months'
    },
    {
      name: 'Emma M.', 
      role: 'DeFi Enthusiast',
      content: 'The voice chats are incredibly valuable. Real discussions about market trends and opportunities.',
      rating: 5,
      timeInCommunity: '1 year'
    },
    {
      name: 'Marcus S.',
      role: 'NFT Collector',
      content: 'Found some amazing meme tokens through this community. The scanning tools are top-notch!',
      rating: 5,
      timeInCommunity: '8 months'
    }
  ];

  return (
    <section className={`${isMobile ? 'py-8' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-16'}`}>
          <h2 className={`font-orbitron ${isMobile ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} tracking-wider`}>
            <span className="text-white">VE</span><span className="text-[#12E19F]">LO</span><span className="text-white"> COM</span><span className="text-[#12E19F]">MUN</span><span className="text-white">ITY</span>
          </h2>
          <p className={`font-display ${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            Join our growing crypto community and connect with fellow enthusiasts
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
                <h3 className="font-orbitron text-3xl font-bold mb-4 tracking-wider">
                  JOIN TELEGRAM COMMUNITY
                </h3>
                <p className="font-display text-lg opacity-90 mb-6">
                  Connect with fellow crypto enthusiasts and never miss an opportunity
                </p>
              </div>
              
              <a 
                href="https://t.me/velo_sweden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-black/90 text-xl px-12 py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/9749ce60-cc5c-4316-bb4e-d89a819b14cd.png" 
                    alt="Telegram" 
                    className="h-6 w-6 mr-3"
                  />
                  Join Now - Free
                </Button>
              </a>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm opacity-90">
                <div>
                  <div className="font-bold">Voice Chat</div>
                  <div>Every Sunday</div>
                </div>
                <div>
                  <div className="font-bold">Token Scanning</div>
                  <div>24/7 Available</div>
                </div>
                <div>
                  <div className="font-bold">Q&A</div>
                  <div>Daily Support</div>
                </div>
                <div>
                  <div className="font-bold">New Friends</div>
                  <div>5000+ Members</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="font-orbitron text-2xl font-bold text-center mb-8 text-primary tracking-wider">
            WHAT MEMBERS SAY
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