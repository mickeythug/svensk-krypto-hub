import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot,
  Zap,
  Bell,
  Newspaper,
  TrendingUp,
  Shield,
  Clock,
  Target,
  ExternalLink,
  Star,
  Users,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Download,
  Smartphone,
  ChevronRight,
  Play
} from "lucide-react";
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import MobileHeader from "@/components/mobile/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import JupiterSwapWidget from "@/components/web3/JupiterSwapWidget";

const ToolsPage = () => {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const telegramBots = [
    {
      id: "trading-bot",
      name: "Trading Bot",
      description: "Köp och sälj tokens blixtsnabbt direkt från Telegram. Automatiska order med smart routing för bästa priser.",
      icon: Bot,
      features: ["Snabba transaktioner", "Smart routing", "Multi-DEX support", "Säker wallet integration"],
      price: "Gratis att testa",
      link: "https://t.me/your_trading_bot",
      popular: true,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "snipe-bot",
      name: "Snipe Bot",
      description: "Snipea nya token launches och få försprång på marknaden. Automatisk detektering av nya listings.",
      icon: Target,
      features: ["Auto-detect launches", "MEV protection", "Gas optimization", "Instant execution"],
      price: "Premium",
      link: "https://t.me/your_snipe_bot",
      popular: false,
      gradient: "from-red-500 to-pink-500"
    },
    {
      id: "price-alert",
      name: "Price Alert Bot",
      description: "Få instant notifikationer när dina tokens når specifika prisnivåer. Aldrig missa en bra möjlighet igen.",
      icon: Bell,
      features: ["Custom alerts", "Multi-token tracking", "Technical indicators", "Portfolio monitoring"],
      price: "Gratis",
      link: "https://t.me/your_alert_bot",
      popular: false,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      id: "news-bot",
      name: "Nyhets Bot",
      description: "Få de senaste krypto-nyheterna direkt till Telegram. AI-filtrerade nyheter baserat på dina intressen.",
      icon: Newspaper,
      features: ["AI-filtrerade nyheter", "Real-time alerts", "Market analysis", "Social sentiment"],
      price: "Gratis",
      link: "https://t.me/your_news_bot",
      popular: false,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "portfolio-bot",
      name: "Portfolio Bot",
      description: "Spåra din portfolio i realtid med avancerad analys och insikter. Perfect för aktiva traders.",
      icon: TrendingUp,
      features: ["Real-time tracking", "P&L analysis", "Risk management", "Tax reporting"],
      price: "Premium",
      link: "https://t.me/your_portfolio_bot",
      popular: false,
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      id: "security-bot",
      name: "Security Bot",
      description: "Skanna tokens för säkerhetsrisker innan du investerar. Skydda dig från rug pulls och scams.",
      icon: Shield,
      features: ["Contract scanning", "Rug pull detection", "Team verification", "Risk scoring"],
      price: "Gratis",
      link: "https://t.me/your_security_bot",
      popular: false,
      gradient: "from-gray-500 to-slate-500"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Blixtsnabb Execution",
      description: "Våra bots är optimerade för hastighet och kan utföra trades på millisekunder"
    },
    {
      icon: Shield,
      title: "Bank-nivå Säkerhet", 
      description: "All kommunikation är krypterad och vi lagrar aldrig dina privata nycklar"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Över 50,000+ aktiva användare som förlitar sig på våra verktyg dagligen"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Vårt team är alltid tillgängligt för att hjälpa dig med dina frågor"
    }
  ];

  // Mobile Bot Card Component
  const MobileBotCard = ({ bot }: { bot: typeof telegramBots[0] }) => {
    const IconComponent = bot.icon;
    
    return (
      <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bot.gradient} opacity-10`} />
        
        {bot.popular && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              HOT
            </Badge>
          </div>
        )}

        <div className="relative z-10 p-4">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bot.gradient} p-3 flex-shrink-0 shadow-lg`}>
              <IconComponent className="w-full h-full text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-crypto text-lg font-bold mb-1 truncate">{bot.name}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
                {bot.description}
              </p>

              {/* Features - Mobile optimized */}
              <div className="grid grid-cols-2 gap-1 mb-4">
                {bot.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-success mr-1 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-primary text-sm">{bot.price}</span>
                
                <Button 
                  size="sm"
                  asChild
                  className={`bg-gradient-to-r ${bot.gradient} hover:opacity-90 text-white shadow-lg text-xs px-4 py-2`}
                >
                  <a 
                    href={bot.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-3 h-3" />
                    Starta
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Desktop Bot Card Component  
  const DesktopBotCard = ({ bot }: { bot: typeof telegramBots[0] }) => {
    const IconComponent = bot.icon;
    
    return (
      <Card 
        className={`relative p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden group ${
          hoveredBot === bot.id ? 'ring-2 ring-primary/50' : ''
        }`}
        onMouseEnter={() => setHoveredBot(bot.id)}
        onMouseLeave={() => setHoveredBot(null)}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bot.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Popular Badge */}
        {bot.popular && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-success/20 text-success border-success/30 text-xs">
              <Star className="w-3 h-3 mr-1" />
              POPULÄR
            </Badge>
          </div>
        )}

        <div className="relative z-10">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bot.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-full h-full text-white" />
          </div>

          {/* Content */}
          <h3 className="font-crypto text-xl font-bold mb-2">{bot.name}</h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {bot.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {bot.features.map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-success mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display font-semibold text-primary">{bot.price}</span>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              asChild
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
            >
              <a 
                href={bot.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Starta Bot
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader title="VERKTYG" /> : <Header />}
      {!isMobile && <CryptoPriceTicker />}
      
      <div className={`${isMobile ? 'pt-4 pb-20' : 'pt-20 pb-12'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
          {/* Mobile Hero Section */}
          {isMobile ? (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  VERKTYG
                </Badge>
              </div>
              
              <h1 className="font-crypto text-2xl sm:text-3xl font-bold mb-3">
                <span className="text-brand-turquoise">TELEGRAM</span>
                <span className="text-brand-white"> BOTS</span>
              </h1>
              
              <p className="font-display text-sm text-muted-foreground mb-6 leading-relaxed px-2">
                Automatisera din kryptohandel med våra kraftfulla Telegram bots
              </p>

              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>50k+ Användare</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Hero Section */
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  VERKTYG
                </Badge>
              </div>
              
              <h1 className="font-crypto text-4xl md:text-6xl font-bold mb-6">
                <span className="text-brand-turquoise">TELEGRAM</span>
                <span className="text-brand-white"> BOTS</span>
              </h1>
              
              <p className="font-display text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
                Automatisera din kryptohandel med våra kraftfulla Telegram bots. Från snabb trading till price alerts - allt du behöver för att hålla dig steget före marknaden.
              </p>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>50,000+ Aktiva användare</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Säker & Pålitlig</span>
                </div>
              </div>
            </div>
          )}

          {/* Bots Grid - Responsive */}
          <div className={`${
            isMobile 
              ? 'space-y-4 mb-8' 
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'
          }`}>
            {telegramBots.map((bot) => (
              isMobile ? (
                <MobileBotCard key={bot.id} bot={bot} />
              ) : (
                <DesktopBotCard key={bot.id} bot={bot} />
              )
            ))}
          </div>

          {/* Jupiter Swap - Buy/Sell (Solana) */}
          <Card className={`${isMobile ? 'p-2 mb-8' : 'p-6 mb-16'} bg-card/80 border-border`}>            
            <div className="mb-4 text-center">
              <h2 className={`font-crypto ${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>Köp/Sälj på Solana (Jupiter)</h2>
              <p className={`font-display text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Smidig swap via Jupiter DEX-aggregatorn</p>
            </div>
            <JupiterSwapWidget height={isMobile ? 560 : 660} />
          </Card>

          {/* Features Section - Responsive */}
          <Card className={`${isMobile ? 'p-4 mb-8' : 'p-8 mb-16'} bg-gradient-secondary border-border shadow-lg`}>
            <div className="text-center mb-8">
              <h2 className={`font-crypto ${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-4`}>
                Varför Välja Våra Verktyg?
              </h2>
              <p className={`font-display text-muted-foreground ${isMobile ? 'text-sm' : 'text-lg'} max-w-2xl mx-auto`}>
                Vi har byggt plattformen som traders behöver - snabb, säker och användarvänlig
              </p>
            </div>

            <div className={`${
              isMobile 
                ? 'grid grid-cols-2 gap-4' 
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
            }`}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                
                return (
                  <div key={index} className="text-center">
                    <div className={`${
                      isMobile ? 'w-10 h-10' : 'w-16 h-16'
                    } rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-primary`} />
                    </div>
                    <h3 className={`font-display font-semibold ${isMobile ? 'text-sm' : 'text-lg'} mb-2`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CTA Section - Responsive */}
          <Card className={`${isMobile ? 'p-4' : 'p-8'} bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center`}>
            <h2 className={`font-crypto ${isMobile ? 'text-lg' : 'text-2xl'} font-bold mb-4`}>
              Redo att Börja?
            </h2>
            <p className={`font-display text-muted-foreground ${isMobile ? 'text-sm mb-4' : 'mb-6'} max-w-2xl mx-auto`}>
              Gå med i tusentals traders som redan använder våra verktyg
            </p>
            
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
              <Button 
                size={isMobile ? "default" : "lg"}
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <a 
                  href="https://t.me/your_main_channel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  Gå med i Telegram
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"}
                asChild
              >
                <a 
                  href="/marknad" 
                  className="flex items-center gap-2"
                >
                  Utforska Marknaden
                  <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default ToolsPage;