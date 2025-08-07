import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Trophy,
  Target,
  Clock,
  Globe,
  MessageCircle,
  Zap,
  AlertCircle,
  ChevronUp
} from "lucide-react";
import Header from "@/components/Header";

const MarketOverviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("top10");
  const navigate = useNavigate();

  const marketSentiment = {
    overall: 68,
    fearGreedIndex: 72,
    socialVolume: 85,
    newsVolume: 76,
    trend: 'bullish' as const,
    change24h: 4.2
  };
  
  const marketData = {
    totalMarketCap: "2.1T",
    totalVolume: "89.5B",
    btcDominance: 52.3,
    ethDominance: 17.8,
    activeAddresses: "1.2M",
    defiTvl: "45.2B"
  };

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

  const allCryptos = [
    { rank: 1, name: "Bitcoin", symbol: "BTC", slug: "bitcoin", price: 645000, change1h: 0.5, change24h: 2.34, change7d: 5.12, marketCap: "12.5T", volume: "28.5B", supply: "19.5M BTC" },
    { rank: 2, name: "Ethereum", symbol: "ETH", slug: "ethereum", price: 35000, change1h: -0.2, change24h: -1.45, change7d: 3.21, marketCap: "4.2T", volume: "15.2B", supply: "120.3M ETH" },
    { rank: 3, name: "Binance Coin", symbol: "BNB", slug: "binance-coin", price: 3200, change1h: 0.8, change24h: 0.87, change7d: -2.1, marketCap: "492B", volume: "8.9B", supply: "153.8M BNB" },
    { rank: 4, name: "XRP", symbol: "XRP", slug: "xrp", price: 8.5, change1h: 1.2, change24h: 5.23, change7d: 12.5, marketCap: "389B", volume: "3.2B", supply: "45.4B XRP" },
    { rank: 5, name: "Cardano", symbol: "ADA", slug: "cardano", price: 4.2, change1h: -0.5, change24h: 3.21, change7d: 8.9, marketCap: "147B", volume: "1.8B", supply: "35.0B ADA" },
    { rank: 6, name: "Solana", symbol: "SOL", slug: "solana", price: 1100, change1h: 2.1, change24h: 5.67, change7d: 15.2, marketCap: "523B", volume: "4.1B", supply: "475.2M SOL" },
    { rank: 7, name: "Polkadot", symbol: "DOT", slug: "polkadot", price: 85, change1h: -1.2, change24h: -2.11, change7d: -5.4, marketCap: "98B", volume: "892M", supply: "1.15B DOT" },
    { rank: 8, name: "Avalanche", symbol: "AVAX", slug: "avalanche", price: 450, change1h: 0.9, change24h: 1.99, change7d: 7.3, marketCap: "178B", volume: "1.2B", supply: "395.8M AVAX" },
    { rank: 9, name: "Chainlink", symbol: "LINK", slug: "chainlink", price: 180, change1h: 0.3, change24h: 4.5, change7d: 9.8, marketCap: "89B", volume: "654M", supply: "494.0M LINK" },
    { rank: 10, name: "Polygon", symbol: "MATIC", slug: "polygon", price: 12, change1h: -0.8, change24h: 2.1, change7d: 6.7, marketCap: "76B", volume: "423M", supply: "6.3B MATIC" }
  ];

  const trendingCryptos = [
    { rank: 1, name: "Pepe", symbol: "PEPE", slug: "pepe", price: 0.000024, change1h: 15.2, change24h: 45.8, change7d: 123.4, marketCap: "9.8B", volume: "2.1B", supply: "420.7T PEPE" },
    { rank: 2, name: "Bonk", symbol: "BONK", slug: "bonk", price: 0.000018, change1h: 8.9, change24h: 32.1, change7d: 89.3, marketCap: "1.2B", volume: "456M", supply: "65.5T BONK" },
    { rank: 3, name: "Floki", symbol: "FLOKI", slug: "floki", price: 0.00032, change1h: 12.5, change24h: 28.7, change7d: 67.8, marketCap: "3.1B", volume: "298M", supply: "9.7T FLOKI" }
  ];

  const memeCryptos = [
    { rank: 1, name: "Dogecoin", symbol: "DOGE", slug: "dogecoin", price: 1.2, change1h: 2.1, change24h: 8.5, change7d: 23.4, marketCap: "172B", volume: "1.8B", supply: "143.2B DOGE" },
    { rank: 2, name: "Shiba Inu", symbol: "SHIB", slug: "shiba-inu", price: 0.000034, change1h: 1.8, change24h: 12.3, change7d: 34.2, marketCap: "20.1B", volume: "892M", supply: "589.7T SHIB" },
    { rank: 3, name: "Pepe", symbol: "PEPE", slug: "pepe", price: 0.000024, change1h: 15.2, change24h: 45.8, change7d: 123.4, marketCap: "9.8B", volume: "2.1B", supply: "420.7T PEPE" }
  ];

  const topGainers = [
    { rank: 1, name: "Solana", symbol: "SOL", slug: "solana", price: 1100, change1h: 2.1, change24h: 15.67, change7d: 45.2, marketCap: "523B", volume: "4.1B", supply: "475.2M SOL" },
    { rank: 2, name: "Pepe", symbol: "PEPE", slug: "pepe", price: 0.000024, change1h: 15.2, change24h: 45.8, change7d: 123.4, marketCap: "9.8B", volume: "2.1B", supply: "420.7T PEPE" },
    { rank: 3, name: "XRP", symbol: "XRP", slug: "xrp", price: 8.5, change1h: 1.2, change24h: 15.23, change7d: 32.5, marketCap: "389B", volume: "3.2B", supply: "45.4B XRP" }
  ];

  const topLosers = [
    { rank: 1, name: "Polkadot", symbol: "DOT", slug: "polkadot", price: 85, change1h: -1.2, change24h: -8.11, change7d: -15.4, marketCap: "98B", volume: "892M", supply: "1.15B DOT" },
    { rank: 2, name: "Ethereum", symbol: "ETH", slug: "ethereum", price: 35000, change1h: -0.2, change24h: -5.45, change7d: -8.21, marketCap: "4.2T", volume: "15.2B", supply: "120.3M ETH" },
    { rank: 3, name: "Binance Coin", symbol: "BNB", slug: "binance-coin", price: 3200, change1h: -0.8, change24h: -3.87, change7d: -12.1, marketCap: "492B", volume: "8.9B", supply: "153.8M BNB" }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case "trending":
        return trendingCryptos;
      case "meme":
        return memeCryptos;
      case "gainers":
        return topGainers;
      case "losers":
        return topLosers;
      default:
        return allCryptos;
    }
  };

  const filteredData = getCurrentData().filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k SEK`;
    } else if (price < 0.001) {
      return `${price.toFixed(8)} SEK`;
    }
    return `${price.toFixed(2)} SEK`;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center space-x-1 ${
        isPositive ? 'text-success' : 'text-destructive'
      }`}>
        {isPositive ? (
          <TrendingUp size={12} />
        ) : (
          <TrendingDown size={12} />
        )}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-crypto text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MARKNADSÖVERSIKT
            </h1>
            <p className="font-display text-xl text-muted-foreground max-w-4xl mx-auto">
              Komplett översikt av kryptomarknaden med realtidsdata, analyser och detaljerad information om alla digitala tillgångar
            </p>
          </div>

          {/* Market Sentiment Dashboard */}
          <Card className="mb-12 p-8 bg-gradient-secondary border-border shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-crypto text-2xl font-bold text-primary flex items-center">
                <BarChart3 className="mr-3 h-7 w-7" />
                MARKNADS SENTIMENT & STATISTIK
              </h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Uppdaterat för 2 minuter sedan
              </div>
            </div>
            
            {/* Main Sentiment Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-success mr-3" />
                    <span className="font-display font-semibold text-lg">Overall Sentiment</span>
                  </div>
                  <Badge className="bg-success/20 text-success">
                    +{marketSentiment.change24h}%
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-success mb-2">{marketSentiment.overall}%</div>
                <Progress value={marketSentiment.overall} className="mb-2 h-3" />
                <div className="text-base text-muted-foreground">Stark Bullish Trend</div>
              </Card>
              
              <Card className="p-6 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Globe className="h-6 w-6 text-warning mr-3" />
                    <span className="font-display font-semibold text-lg">Fear & Greed Index</span>
                  </div>
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="text-4xl font-bold text-warning mb-2">{marketSentiment.fearGreedIndex}</div>
                <Progress value={marketSentiment.fearGreedIndex} className="mb-2 h-3" />
                <div className="text-base text-muted-foreground">Greed Territory</div>
              </Card>
              
              <Card className="p-6 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <MessageCircle className="h-6 w-6 text-primary mr-3" />
                    <span className="font-display font-semibold text-lg">Social Aktivitet</span>
                  </div>
                  <ChevronUp className="h-5 w-5 text-success" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{marketSentiment.socialVolume}%</div>
                <Progress value={marketSentiment.socialVolume} className="mb-2 h-3" />
                <div className="text-base text-muted-foreground">Extremt Hög Aktivitet</div>
              </Card>
              
              <Card className="p-6 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Zap className="h-6 w-6 text-accent mr-3" />
                    <span className="font-display font-semibold text-lg">Nyhets Volym</span>
                  </div>
                  <ChevronUp className="h-5 w-5 text-success" />
                </div>
                <div className="text-4xl font-bold text-accent mb-2">{marketSentiment.newsVolume}%</div>
                <Progress value={marketSentiment.newsVolume} className="mb-2 h-3" />
                <div className="text-base text-muted-foreground">Rekordhög Volym</div>
              </Card>
            </div>

            {/* Market Data Section */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-success">${marketData.totalMarketCap}</div>
                <div className="text-sm text-muted-foreground">Total Market Cap</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">${marketData.totalVolume}</div>
                <div className="text-sm text-muted-foreground">24h Volym</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-warning">{marketData.btcDominance}%</div>
                <div className="text-sm text-muted-foreground">Bitcoin Dominans</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">{marketData.ethDominance}%</div>
                <div className="text-sm text-muted-foreground">Ethereum Dominans</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{marketData.activeAddresses}</div>
                <div className="text-sm text-muted-foreground">Aktiva Adresser</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-success">${marketData.defiTvl}</div>
                <div className="text-sm text-muted-foreground">DeFi TVL</div>
              </div>
            </div>
          </Card>

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

          {/* Search and Tabs */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Sök kryptovaluta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Favoriter
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="top10" className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">TOP 10</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center space-x-2">
                  <Flame className="h-4 w-4" />
                  <span className="hidden sm:inline">Trending</span>
                </TabsTrigger>
                <TabsTrigger value="meme" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Meme</span>
                </TabsTrigger>
                <TabsTrigger value="gainers" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Gainers</span>
                </TabsTrigger>
                <TabsTrigger value="losers" className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Losers</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Alla</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead className="min-w-[200px]">Namn</TableHead>
                        <TableHead className="text-right">Pris</TableHead>
                        <TableHead className="text-right">1h %</TableHead>
                        <TableHead className="text-right">24h %</TableHead>
                        <TableHead className="text-right">7d %</TableHead>
                        <TableHead className="text-right">Marknadskapital</TableHead>
                        <TableHead className="text-right">Volym (24h)</TableHead>
                        <TableHead className="text-right min-w-[150px]">Cirkulerande Utbud</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((crypto) => (
                        <TableRow 
                          key={crypto.symbol} 
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/crypto/${crypto.slug}`)}
                        >
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-crypto text-xs">
                              {crypto.rank}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="font-crypto text-xs font-bold text-primary">
                                  {crypto.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-display font-semibold">{crypto.name}</div>
                                <div className="text-sm text-muted-foreground font-crypto">
                                  {crypto.symbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-display font-semibold">
                            {formatPrice(crypto.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatChange(crypto.change1h)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatChange(crypto.change24h)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatChange(crypto.change7d)}
                          </TableCell>
                          <TableCell className="text-right font-display">
                            {crypto.marketCap} SEK
                          </TableCell>
                          <TableCell className="text-right font-display">
                            {crypto.volume} SEK
                          </TableCell>
                          <TableCell className="text-right font-crypto text-sm">
                            {crypto.supply}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketOverviewPage;