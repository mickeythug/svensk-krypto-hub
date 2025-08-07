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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
  ChevronUp,
  Bitcoin,
  CircleDollarSign,
  Coins,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from "lucide-react";
import Header from "@/components/Header";
import { useCryptoData } from "@/hooks/useCryptoData";

// Import crypto logos
import btcLogo from "@/assets/crypto-logos/btc.png";
import ethLogo from "@/assets/crypto-logos/eth.png";
import bnbLogo from "@/assets/crypto-logos/bnb.png";
import xrpLogo from "@/assets/crypto-logos/xrp.png";
import adaLogo from "@/assets/crypto-logos/ada.png";
import solLogo from "@/assets/crypto-logos/sol.png";
import dotLogo from "@/assets/crypto-logos/dot.png";
import avaxLogo from "@/assets/crypto-logos/avax.png";
import linkLogo from "@/assets/crypto-logos/link.png";
import maticLogo from "@/assets/crypto-logos/matic.png";
import dogeLogo from "@/assets/crypto-logos/doge.png";
import shibLogo from "@/assets/crypto-logos/shib.png";
import ltcLogo from "@/assets/crypto-logos/ltc.png";

const MarketOverviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("top10");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = 15; // 15 tokens per sida som begärt
  const navigate = useNavigate();
  const { cryptoPrices, isLoading, error } = useCryptoData();

  // Använd riktiga logo bilder från CoinGecko API
  const getCryptoLogo = (crypto: any) => {
    // Använd riktig bild från API om tillgänglig, annars fallback till lokal bild
    if (crypto.image) {
      return crypto.image;
    }
    
    // Fallback till lokala bilder för vanliga tokens
    const logoMap: { [key: string]: string } = {
      'BTC': btcLogo,
      'ETH': ethLogo,
      'BNB': bnbLogo,
      'XRP': xrpLogo,
      'ADA': adaLogo,
      'SOL': solLogo,
      'DOT': dotLogo,
      'AVAX': avaxLogo,
      'LINK': linkLogo,
      'MATIC': maticLogo,
      'DOGE': dogeLogo,
      'SHIB': shibLogo,
      'LTC': ltcLogo
    };
    return logoMap[crypto.symbol] || btcLogo;
  };

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

  const getCurrentData = () => {
    // Använd riktig top 100 data från CoinGecko API
    if (!cryptoPrices || cryptoPrices.length === 0) return [];
    
    // Konvertera riktig data till rätt format för tabellen
    const formattedCrypto = cryptoPrices.map(crypto => ({
      rank: crypto.rank || 1,
      name: crypto.name,
      symbol: crypto.symbol,
      slug: crypto.symbol.toLowerCase(),
      price: crypto.price,
      change1h: 0, // CoinGecko markets API ger inte 1h data direkt
      change24h: crypto.change24h,
      change7d: 0, // CoinGecko markets API ger inte 7d data direkt
      marketCap: crypto.marketCap || "0",
      volume: crypto.volume || "0",
      supply: `${crypto.supply || "0"} ${crypto.symbol}`,
      image: crypto.image // Inkludera riktig bild URL
    }));

    switch (activeTab) {
      case "trending":
        // Sortera efter högst positiv 24h förändring (trending up)
        return formattedCrypto
          .filter(crypto => crypto.change24h > 5) // Bara tokens med >5% ökning
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "meme":
        // Visa populära meme tokens
        return formattedCrypto.filter(crypto => 
          ['DOGE', 'SHIB', 'PEPE', 'BONK', 'FLOKI'].includes(crypto.symbol)
        );
      case "gainers":
        // Sortera efter högst positiv förändring
        return formattedCrypto
          .filter(crypto => crypto.change24h > 0)
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "losers":
        // Sortera efter lägst negativ förändring
        return formattedCrypto
          .filter(crypto => crypto.change24h < 0)
          .sort((a, b) => a.change24h - b.change24h)
          .slice(0, 50);
      case "all":
        return formattedCrypto; // Visa alla 100
      default:
        // Top 10 sorterat efter market cap rank
        return formattedCrypto
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10);
    }
  };

  const filteredData = getCurrentData().filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when changing tabs or search
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    } else if (price < 0.001) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // Mini sparkline component
  const MiniSparkline = ({ change }: { change: number }) => {
    const isPositive = change >= 0;
    return (
      <div className="w-16 h-8 flex items-center justify-center">
        <svg width="60" height="24" viewBox="0 0 60 24" className="overflow-visible">
          <path
            d={isPositive 
              ? "M2 20 L15 12 L30 8 L45 4 L58 2" 
              : "M2 4 L15 8 L30 12 L45 16 L58 20"
            }
            stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
            strokeWidth="2"
            fill="none"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Version - Modern CoinMarketCap Style */}
      <div className="hidden md:block min-h-screen bg-background">
        <Header />
        
        {/* Main Container */}
        <div className="pt-16 bg-background">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-background via-background to-secondary/5 border-b border-border/30">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h1 className="font-crypto text-4xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                MARKNADSÖVERSIKT
              </h1>
              <p className="font-display text-lg text-muted-foreground">
                Realtidsöversikt av kryptomarknaden
              </p>
            </div>
          </div>

          {/* Modern Sentiment Dashboard */}
          <div className="bg-secondary/5 border-b border-border/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Total Market Cap Card */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Market Cap</h3>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">${marketData.totalMarketCap}</div>
                  <div className="text-sm text-success font-medium">+2.4% (24h)</div>
                </div>

                {/* Fear & Greed Index */}
                <div className="bg-gradient-to-br from-success/10 to-warning/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-success/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Fear & Greed Index</h3>
                    <Activity className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold text-success mb-2">{marketSentiment.fearGreedIndex}</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-success font-medium">Greed</div>
                </div>

                {/* Alt Season Index */}
                <div className="bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-accent/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Alt Season Index</h3>
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-accent mb-2">65</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="text-sm text-accent font-medium">Alt Season</div>
                </div>

                {/* BTC Dominance */}
                <div className="bg-gradient-to-br from-warning/10 to-destructive/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-warning/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
                    <Bitcoin className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold text-warning mb-2">{marketData.btcDominance}%</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-2 rounded-full transition-all duration-500"
                      style={{ width: `${marketData.btcDominance}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-warning font-medium">BTC Season</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-background border-b border-border/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* Title */}
                <div>
                  <h2 className="font-crypto text-2xl font-bold text-primary mb-1">
                    KRYPTOVALUTOR
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Visar {startIndex + 1}-{Math.min(endIndex, filteredData.length)} av {filteredData.length} kryptovalutor
                  </p>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Sök kryptovaluta..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 w-full sm:w-80 bg-background border-border/50 focus:border-primary h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === "table" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-11 px-4"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "grid" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-11 px-4"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="h-11 px-6 border-border/50 hover:border-primary">
                      <Star className="h-4 w-4 mr-2" />
                      Favoriter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tabs - Modern Style */}
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6 h-12 p-1 bg-secondary/10 rounded-xl border border-border/20">
                    <TabsTrigger 
                      value="top10" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>TOP 10</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trending" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Flame className="h-4 w-4" />
                      <span>Trending</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meme" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Target className="h-4 w-4" />
                      <span>Meme</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gainers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Toppar</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="losers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingDown className="h-4 w-4" />
                      <span>Fallande</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Alla</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Data Display - Table or Grid */}
          <div className="bg-background">
            <div className="max-w-7xl mx-auto px-6">
              
              {viewMode === "table" ? (
                // Table View
                <div className="bg-background/50 backdrop-blur-sm rounded-t-xl border border-border/20 border-b-0 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/20 bg-secondary/10">
                        <TableHead className="text-center font-semibold py-4 px-6 text-muted-foreground w-16">#</TableHead>
                        <TableHead className="text-left font-semibold py-4 px-6 text-muted-foreground w-80">Namn</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">Pris</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">1h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">24h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">7d %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-40">Market Cap</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">Volym (24h)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((crypto, index) => (
                        <TableRow 
                          key={crypto.symbol}
                          className="hover:bg-secondary/10 cursor-pointer transition-all duration-200 border-b border-border/10 group h-16"
                          onClick={() => navigate(`/crypto/${crypto.slug}`)}
                        >
                          {/* Rank */}
                          <TableCell className="text-center py-4 px-6">
                            <Badge variant="secondary" className="text-xs px-2 py-1 bg-secondary/30 text-muted-foreground font-medium">
                              #{crypto.rank}
                            </Badge>
                          </TableCell>
                          
                          {/* Name & Logo */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-border/20">
                                <img 
                                  src={getCryptoLogo(crypto)} 
                                  alt={crypto.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                                  {crypto.name}
                                </div>
                                <div className="text-sm text-muted-foreground font-mono font-medium">
                                  {crypto.symbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Price */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono font-semibold text-foreground text-base">
                              {formatPrice(crypto.price)}
                            </div>
                          </TableCell>
                          
                          {/* 1h Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change1h >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change1h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* 24h Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change24h >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* 7d Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change7d >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change7d >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* Market Cap */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono text-muted-foreground text-sm">
                              ${crypto.marketCap}
                            </div>
                          </TableCell>
                          
                          {/* Volume */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono text-muted-foreground text-sm">
                              ${crypto.volume}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 py-6">
                  {currentData.map((crypto) => (
                    <Card 
                      key={crypto.symbol}
                      className="p-6 hover:shadow-lg cursor-pointer transition-all duration-200 border border-border/20 hover:border-primary/30 bg-background/50 backdrop-blur-sm"
                      onClick={() => navigate(`/crypto/${crypto.slug}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-border/20">
                            <img 
                              src={getCryptoLogo(crypto)} 
                              alt={crypto.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{crypto.name}</h3>
                            <p className="text-muted-foreground font-mono">{crypto.symbol}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-secondary/30">
                          #{crypto.rank}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pris</span>
                          <span className="font-mono font-semibold text-lg">{formatPrice(crypto.price)}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">1h</p>
                            <div className={`text-sm font-medium ${
                              crypto.change1h >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">24h</p>
                            <div className={`text-sm font-medium ${
                              crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">7d</p>
                            <div className={`text-sm font-medium ${
                              crypto.change7d >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-border/20">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Market Cap</span>
                            <span className="font-mono">${crypto.marketCap}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Volume</span>
                            <span className="font-mono">${crypto.volume}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination - Modern Style */}
              <div className="bg-background/50 backdrop-blur-sm border border-border/20 border-t-0 rounded-b-xl px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Visar <span className="font-medium text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> av <span className="font-medium text-foreground">{filteredData.length}</span> kryptovalutor
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={`h-10 px-4 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/20'} border border-border/30 rounded-lg`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className={`h-10 w-10 cursor-pointer border border-border/30 rounded-lg ${
                                currentPage === page 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'hover:bg-secondary/20'
                              }`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-10 w-10" />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={`h-10 px-4 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/20'} border border-border/30 rounded-lg`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Exact Reference Match */}
      <div className="block md:hidden min-h-screen bg-background">
        <Header />
        
        <div className="pt-16 bg-background">
          
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border/20">
            <h1 className="font-crypto text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MARKNAD
            </h1>
            <p className="text-muted-foreground">Live crypto data</p>
          </div>

          {/* Mobile Sentiment Dashboard */}
          <div className="p-4 bg-secondary/5 border-b border-border/20">
            <div className="space-y-4">
              
              {/* Market Cap & Volume Row */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Market Cap</span>
                  </div>
                  <div className="text-lg font-bold text-primary mb-1">
                    ${marketData.totalMarketCap}
                  </div>
                  <div className="text-xs text-success font-medium">+2.4%</div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-secondary" />
                    <span className="text-xs text-muted-foreground font-medium">24h Volume</span>
                  </div>
                  <div className="text-lg font-bold text-secondary mb-1">
                    ${marketData.totalVolume}
                  </div>
                  <div className="text-xs text-destructive font-medium">-1.2%</div>
                </Card>
              </div>

              {/* Fear & Greed Index */}
              <Card className="p-4 bg-gradient-to-br from-success/10 to-warning/10 border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground font-medium">Fear & Greed Index</span>
                  </div>
                  <div className="text-lg font-bold text-success">{marketSentiment.fearGreedIndex}</div>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                  ></div>
                </div>
                <div className="text-xs text-success font-medium">Greed</div>
              </Card>

              {/* Alt Season & BTC Dominance Row */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-medium">Alt Season</span>
                  </div>
                  <div className="text-lg font-bold text-accent mb-1">65</div>
                  <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-500"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-accent font-medium">Alt Season</div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-warning/10 to-destructive/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bitcoin className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground font-medium">BTC Dom</span>
                  </div>
                  <div className="text-lg font-bold text-warning mb-1">{marketData.btcDominance}%</div>
                  <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${marketData.btcDominance}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-warning font-medium">BTC Season</div>
                </Card>
              </div>
            </div>
          </div>

          {/* Mobile Search and Tabs */}
          <div className="sticky top-16 z-20 bg-background border-b border-border/30">
            <div className="p-3">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Sök kryptovaluta..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 bg-background/50 border-border/50 h-9 text-sm"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-secondary/20 w-full">
                  <TabsTrigger value="top10" className="text-xs py-2">TOP 10</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs py-2">Trend</TabsTrigger>
                  <TabsTrigger value="meme" className="text-xs py-2">Meme</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-secondary/20 w-full mt-1">
                  <TabsTrigger value="gainers" className="text-xs py-2">Toppar</TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs py-2">Fallande</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs py-2">Alla</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center justify-between p-4 text-muted-foreground text-xs font-medium">
              <div className="flex items-center space-x-1">
                <span>#</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Market Cap</span>
                <ChevronUp className="h-3 w-3" />
              </div>
              <span>Price</span>
              <span>24h %</span>
            </div>
          </div>

          {/* Mobile List */}
          <div className="divide-y divide-border/20">
            {currentData.map((crypto, index) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between p-4 hover:bg-secondary/10 cursor-pointer transition-colors"
                onClick={() => navigate(`/crypto/${crypto.slug}`)}
              >
                {/* Rank */}
                <div className="w-8 text-muted-foreground text-sm font-medium">
                  {crypto.rank}
                </div>

                {/* Coin Info */}
                <div className="flex-1 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white">
                    <img 
                      src={getCryptoLogo(crypto)} 
                      alt={crypto.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">
                      {crypto.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${crypto.marketCap}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right mr-6">
                  <div className="font-mono font-semibold text-foreground text-sm">
                    {crypto.price >= 1000 
                      ? `${(crypto.price / 1000).toFixed(0)} ${crypto.price >= 1000000 ? "M" : "K"} $`
                      : crypto.price < 0.01 
                      ? `${crypto.price.toFixed(4)} $`
                      : `${crypto.price.toFixed(2)} $`
                    }
                  </div>
                </div>

                {/* 24h Change with Mini Chart */}
                <div className="flex items-center space-x-2">
                  <MiniSparkline change={crypto.change24h} />
                  <div className={`flex items-center text-xs font-medium ${
                    crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${crypto.change24h < 0 ? 'rotate-180' : ''}`} />
                    {crypto.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, filteredData.length)} av {filteredData.length}
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketOverviewPage;