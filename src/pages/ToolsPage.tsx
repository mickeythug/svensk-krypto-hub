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
import { useIsMobile } from "@/hooks/use-mobile";
import JupiterSwapWidget from "@/components/web3/JupiterSwapWidget";

const ToolsPage = () => {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const telegramBots = [
    {
      id: "trading-bot",
      name: "Trading Bot",
      description: "Fast trading bot for Solana",
      icon: Bot,
      features: [
        "Fast transactions",
        "Smart routing",
        "Multi DEX support",
        "Wallet integration"
      ],
      price: "Free",
      link: "https://t.me/your_trading_bot",
      popular: true,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "snipe-bot",
      name: "Snipe Bot",
      description: "Snipe new tokens automatically",
      icon: Target,
      features: [
        "Auto detect new tokens",
        "MEV protection",
        "Gas optimization",
        "Instant execution"
      ],
      price: "Premium",
      link: "https://t.me/your_snipe_bot",
      popular: false,
      gradient: "from-red-500 to-pink-500"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast Execution",
      description: "Lightning fast trade execution"
    },
    {
      icon: Shield,
      title: "Bank Security",
      description: "Military grade security"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by the community"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round the clock support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className={`${isMobile ? 'pt-0 pb-20' : 'pt-0 pb-12'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-crypto text-4xl md:text-6xl font-bold mb-6">
              <span className="text-brand-turquoise">Telegram</span>
              <span className="text-brand-white"> Bots</span>
            </h1>
            
            <p className="font-display text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              Automate your crypto trading with our powerful Telegram bots.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>50,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>

          {/* Bots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {telegramBots.map((bot) => (
              <Card 
                key={bot.id}
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
                      Popular
                    </Badge>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bot.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <bot.icon className="w-full h-full text-white" />
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
                        Start Bot
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Jupiter Swap Widget */}
          <Card className="p-6 mb-16 bg-card/80 border-border">            
            <div className="mb-4 text-center">
              <h2 className="font-crypto text-3xl font-bold">Buy/Sell Solana Tokens</h2>
              <p className="font-display text-muted-foreground text-sm">Smooth swaps powered by Jupiter</p>
            </div>
            <JupiterSwapWidget height={660} />
          </Card>

          {/* Features Section */}
          <Card className="p-8 mb-16 bg-gradient-secondary border-border shadow-lg">
            <div className="text-center mb-8">
              <h2 className="font-crypto text-3xl font-bold mb-4">
                Why Choose Our Bots?
              </h2>
              <p className="font-display text-muted-foreground text-lg max-w-2xl mx-auto">
                Built by traders, for traders. Our bots are designed for maximum efficiency and security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center">
            <h2 className="font-crypto text-2xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="font-display text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of traders using our bots to maximize their profits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <a 
                  href="https://t.me/your_main_channel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Join Telegram
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;