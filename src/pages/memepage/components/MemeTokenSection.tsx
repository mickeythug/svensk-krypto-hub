import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, TrendingDown, Flame, Star, Zap } from "lucide-react";
import memeTokens from "@/assets/meme-tokens.jpg";

const MemeTokenSection = () => {
  const isMobile = useIsMobile();
  const memeCoins = [
    {
      symbol: "DOGE",
      name: "Dogecoin", 
      price: 1.25,
      change24h: 8.34,
      volume: "2.1B",
      emoji: "🐕",
      trend: "hot"
    },
    {
      symbol: "SHIB",
      name: "Shiba Inu",
      price: 0.000012,
      change24h: -3.21,
      volume: "890M",
      emoji: "🐕",
      trend: "cool"
    },
    {
      symbol: "PEPE",
      name: "Pepe",
      price: 0.0000089,
      change24h: 15.67,
      volume: "1.5B",
      emoji: "🐸",
      trend: "fire"
    },
    {
      symbol: "FLOKI",
      name: "Floki Inu",
      price: 0.00023,
      change24h: 5.43,
      volume: "156M",
      emoji: "🐺",
      trend: "hot"
    },
    {
      symbol: "BONK",
      name: "Bonk",
      price: 0.000034,
      change24h: -7.89,
      volume: "234M",
      emoji: "🦴",
      trend: "cool"
    },
    {
      symbol: "WIF",
      name: "dogwifhat",
      price: 2.89,
      change24h: 12.45,
      volume: "567M",
      emoji: "🐕‍🦺",
      trend: "fire"
    }
  ];

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toExponential(2);
    }
    return price.toFixed(price < 1 ? 6 : 2);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "fire":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "hot":
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "fire":
        return "border-orange-500/30 bg-orange-500/10";
      case "hot":
        return "border-yellow-500/30 bg-yellow-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  return (
    <section className={`${isMobile ? 'py-12' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-6' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-4' : 'mb-6'} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            MEME TOKEN ZON
          </h2>
          <p className={`font-display ${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            Håll koll på de roligaste och mest volatila meme-tokens på marknaden. 
            Från klassiska som DOGE till nya sensationer som PEPE!
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-6 mb-8' : 'lg:grid-cols-3 gap-8 mb-12'}`}>
          {/* Meme Token Image */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm">
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${memeTokens})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-primary text-primary-foreground mb-2">
                    🚀 Trending Now
                  </Badge>
                  <h3 className="font-crypto text-lg font-bold text-foreground">
                    Meme Season is Here!
                  </h3>
                </div>
              </div>
              
              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <p className="text-muted-foreground text-sm mb-4">
                  Meme-tokens har blivit en betydande del av kryptomarknaden. 
                  Följ de senaste trenderna och upptäck nästa stora meme-coin!
                </p>
                
                <Button 
                  className="w-full bg-gradient-primary hover:shadow-glow-primary"
                  onClick={() => window.location.href = '/meme'}
                >
                  Se vad som trendar
                </Button>
              </div>
            </Card>
          </div>

          {/* Meme Token List */}
          <div className="lg:col-span-2">
            <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-crypto text-xl font-bold text-primary">
                  TRENDANDE MEME TOKENS
                </h3>
                <Badge variant="outline" className="font-crypto">
                  Live Data
                </Badge>
              </div>
              
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-4'}`}>
                {memeCoins.map((coin) => (
                  <div 
                    key={coin.symbol}
                    className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border transition-all duration-300 hover:scale-105 ${getTrendColor(coin.trend)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{coin.emoji}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-crypto font-bold text-primary">
                              {coin.symbol}
                            </span>
                            {getTrendIcon(coin.trend)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {coin.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                         <div className="font-numbers font-semibold text-sm">
                           {formatPrice(coin.price)} SEK
                         </div>
                        <div className={`flex items-center justify-end space-x-1 text-xs ${
                          coin.change24h >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {coin.change24h >= 0 ? (
                            <TrendingUp size={10} />
                          ) : (
                            <TrendingDown size={10} />
                          )}
                           <span className="font-numbers">
                             {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>24h Vol:</span>
                      <span className="font-semibold font-numbers">{coin.volume} SEK</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-warning" />
                  <span className="font-display font-semibold text-warning text-sm">
                    Riskvarning
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Meme-tokens är extremt volatila och spekulativa. Investera aldrig mer än du har råd att förlora. 
                  DYOR (Do Your Own Research) och handelenbart på egen risk.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Fun Stats */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
          <Card className={`${isMobile ? 'p-4' : 'p-6'} text-center bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300`}>
            <div className="text-3xl mb-2">🚀</div>
            <h4 className="font-numbers text-lg font-bold text-primary mb-1">500+</h4>
            <p className="text-muted-foreground text-sm">Aktiva Meme Tokens</p>
          </Card>
          
          <Card className={`${isMobile ? 'p-4' : 'p-6'} text-center bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300`}>
            <div className="text-3xl mb-2">💎</div>
            <h4 className="font-numbers text-lg font-bold text-primary mb-1">50B+</h4>
            <p className="text-muted-foreground text-sm">Total Marknadskapital</p>
          </Card>
          
          <Card className={`${isMobile ? 'p-4' : 'p-6'} text-center bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300`}>
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-numbers text-lg font-bold text-primary mb-1">1000%+</h4>
            <p className="text-muted-foreground text-sm">Genomsnittlig Volatilitet</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MemeTokenSection;