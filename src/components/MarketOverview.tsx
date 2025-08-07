import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import cryptoCharts from "@/assets/crypto-charts.jpg";

const MarketOverview = () => {
  const marketStats = [
    {
      title: "Total Marknadskapital",
      value: "2.1T",
      unit: "USD",
      change: "+2.34%",
      positive: true,
      icon: DollarSign
    },
    {
      title: "24h Volym",
      value: "95.2B",
      unit: "USD", 
      change: "-5.67%",
      positive: false,
      icon: BarChart3
    },
    {
      title: "Bitcoin Dominans",
      value: "52.8",
      unit: "%",
      change: "+0.12%",
      positive: true,
      icon: PieChart
    },
    {
      title: "DeFi TVL",
      value: "48.9B",
      unit: "USD",
      change: "+8.91%",
      positive: true,
      icon: Activity
    }
  ];

  const topCoins = [
    { rank: 1, symbol: "BTC", name: "Bitcoin", price: 645000, change: 2.34, cap: "12.5T" },
    { rank: 2, symbol: "ETH", name: "Ethereum", price: 35000, change: -1.45, cap: "4.2T" },
    { rank: 3, symbol: "BNB", name: "Binance Coin", price: 3200, change: 0.87, cap: "492B" },
    { rank: 4, symbol: "XRP", name: "Ripple", price: 8.5, change: 5.23, cap: "389B" },
    { rank: 5, symbol: "ADA", name: "Cardano", price: 4.2, change: 3.21, cap: "147B" },
    { rank: 6, symbol: "SOL", name: "Solana", price: 1100, change: 5.67, cap: "523B" },
    { rank: 7, symbol: "DOT", name: "Polkadot", price: 85, change: -2.11, cap: "98B" },
    { rank: 8, symbol: "AVAX", name: "Avalanche", price: 450, change: 1.99, cap: "178B" },
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toFixed(2);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-crypto text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MARKNADSÖVERSIKT
          </h2>
          <p className="font-display text-xl text-muted-foreground max-w-3xl mx-auto">
            Få en komplett bild av kryptomarknaden med realtidsdata, 
            analyser och insikter från de största digitala tillgångarna.
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {marketStats.map((stat) => {
            const IconComponent = stat.icon;
            
            return (
              <Card 
                key={stat.title}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                  <div className={`flex items-center space-x-1 ${
                    stat.positive ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.positive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className="font-crypto text-2xl font-bold">{stat.value}</span>
                  <span className="text-muted-foreground ml-1">{stat.unit}</span>
                </div>
                
                <p className="text-muted-foreground text-sm">{stat.title}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Cryptocurrencies */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="font-crypto text-xl font-bold mb-6 text-primary">
              TOP 8 KRYPTOVALUTOR
            </h3>
            
            <div className="space-y-4">
              {topCoins.map((coin) => (
                <div 
                  key={coin.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-crypto text-xs">
                      #{coin.rank}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-crypto font-bold text-primary">
                          {coin.symbol}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {coin.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Cap: {coin.cap} SEK
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-display font-semibold">
                      {formatPrice(coin.price)} SEK
                    </div>
                    <div className={`flex items-center justify-end space-x-1 text-sm ${
                      coin.change >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {coin.change >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      <span>{coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Analysis */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="font-crypto text-xl font-bold mb-6 text-primary">
              MARKNADSANALYS
            </h3>
            
            <div 
              className="rounded-lg overflow-hidden mb-4 h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${cryptoCharts})` }}
            >
              <div className="w-full h-full bg-gradient-to-t from-card/90 to-transparent flex items-end p-4">
                <div className="text-foreground">
                  <Badge className="bg-success text-success-foreground mb-2">
                    Bullish Trend
                  </Badge>
                  <p className="text-sm font-display">
                    Marknaden visar stark återhämtning med ökad institutionell adoption
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-display font-semibold text-success">Positiva Signaler</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bitcoin ETF inflöden och ökad DeFi-aktivitet driver marknaden uppåt
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-warning" />
                  <span className="font-display font-semibold text-warning">Att Bevaka</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regulatoriska utvecklingar i EU och USA kan påverka volatiliteten
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;