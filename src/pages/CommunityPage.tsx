import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Heart, 
  Star, 
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const CommunityPage = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const communityFeatures = [
    {
      icon: MessageCircle,
      title: t('community.telegramCommunity.title'),
      description: t('community.telegramCommunity.description'),
      count: t('community.telegramCommunity.count'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users, 
      title: t('community.voiceChat.title'),
      description: t('community.voiceChat.description'),
      count: t('community.voiceChat.count'),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Trophy,
      title: t('community.memeScanning.title'), 
      description: t('community.memeScanning.description'),
      count: t('community.memeScanning.count'),
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Heart,
      title: t('community.newFriends.title'),
      description: t('community.newFriends.description'),
      count: t('community.newFriends.count'),
      color: "from-red-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: t('community.testimonial1.name'),
      role: t('community.testimonial1.role'),
      content: t('community.testimonial1.content'),
      rating: 5,
      timeInCommunity: t('community.testimonial1.time'),
      avatar: "AL"
    },
    {
      name: t('community.testimonial2.name'), 
      role: t('community.testimonial2.role'),
      content: t('community.testimonial2.content'),
      rating: 5,
      timeInCommunity: t('community.testimonial2.time'),
      avatar: "EM"
    },
    {
      name: t('community.testimonial3.name'),
      role: t('community.testimonial3.role'),
      content: t('community.testimonial3.content'),
      rating: 5,
      timeInCommunity: t('community.testimonial3.time'),
      avatar: "MS"
    }
  ];

  const events = [
    {
      title: t('community.events.voiceChat'),
      time: t('community.events.voiceChatTime'),
      participants: t('community.events.voiceChatParticipants'),
      type: t('community.events.voiceChatType')
    },
    {
      title: t('community.events.memeScanning'),
      time: t('community.events.memeScanningTime'),
      participants: t('community.events.memeScanningParticipants'),
      type: t('community.events.memeScanningType')
    },
    {
      title: t('community.events.qa'),
      time: t('community.events.qaTime'),
      participants: t('community.events.qaParticipants'),
      type: t('community.events.qaType')
    }
  ];

  return (
    <Layout title={t('community.page.title')} showTicker={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <div className={`relative overflow-hidden ${isMobile ? 'pt-8 pb-12' : 'pt-16 pb-20'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
          
          <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'} relative z-10`}>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('community.page.subtitle')}</span>
              </div>
              
              <h1 className={`font-orbitron ${isMobile ? 'text-3xl' : 'text-5xl md:text-6xl'} font-bold ${isMobile ? 'mb-4' : 'mb-6'} tracking-wider`}>
                <span className="text-white">CRY</span><span className="text-[#12E19F]">PTO</span><span className="text-white"> NE</span><span className="text-[#12E19F]">TWO</span><span className="text-white">RK </span><span className="text-[#12E19F]">COM</span><span className="text-white">MUN</span><span className="text-[#12E19F]">ITY</span>
              </h1>
              
              <p className={`${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-2xl mx-auto ${isMobile ? 'mb-8' : 'mb-10'} leading-relaxed`}>
                {t('community.page.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="https://t.me/cryptonetworksweden" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    size={isMobile ? "default" : "lg"} 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  >
                    <img 
                      src="/lovable-uploads/9749ce60-cc5c-4316-bb4e-d89a819b14cd.png" 
                      alt="Telegram" 
                      className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
                    />
                    {t('community.joinNowFree')}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{t('community.memberCount')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{t('community.rating')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`${isMobile ? 'pb-12' : 'pb-20'}`}>
          <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'}`}>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 lg:grid-cols-4 gap-6'}`}>
              {communityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                
                return (
                  <Card 
                    key={feature.title}
                    className={`${isMobile ? 'p-6' : 'p-8'} relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex ${isMobile ? 'p-3' : 'p-4'} rounded-2xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
                      </div>
                      
                      <h3 className={`font-display font-bold ${isMobile ? 'text-lg' : 'text-xl'} mb-2 group-hover:text-primary transition-colors`}>
                        {feature.title}
                      </h3>
                      
                      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                        {feature.description}
                      </p>
                      
                      <Badge className={`bg-primary/10 text-primary border-primary/20 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {feature.count}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className={`${isMobile ? 'py-12' : 'py-20'} bg-gradient-to-r from-muted/30 to-muted/10`}>
          <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'}`}>
            <div className="text-center mb-12">
              <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-4 text-primary`}>
                {t('community.ongoingActivities')}
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground max-w-2xl mx-auto`}>
                {t('community.ongoingActivitiesDesc')}
              </p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} max-w-5xl mx-auto`}>
              {events.map((event, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg mb-1">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{event.participants}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className={`${isMobile ? 'py-12' : 'py-20'}`}>
          <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'}`}>
            <div className="text-center mb-12">
              <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-4 text-primary`}>
                {t('community.whatMembersSay')}
              </h2>
            </div>
            
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'} max-w-6xl mx-auto`}>
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-display font-semibold">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
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

        {/* CTA Section */}
        <div className={`${isMobile ? 'py-12' : 'py-20'} bg-gradient-to-r from-primary/10 to-accent/10`}>
          <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'} text-center`}>
            <div className="max-w-3xl mx-auto">
              <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
                {t('community.readyToJoin')}
              </h2>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground mb-8 leading-relaxed`}>
                {t('community.readyToJoinDesc')}
              </p>
              
              <a 
                href="https://t.me/cryptonetworksweden" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-8 py-6 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                >
                  <img 
                    src="/lovable-uploads/9749ce60-cc5c-4316-bb4e-d89a819b14cd.png" 
                    alt="Telegram" 
                    className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform"
                  />
                  {t('community.joinTelegramCommunity')}
                  <Zap className="h-5 w-5 ml-3 group-hover:scale-110 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPage;