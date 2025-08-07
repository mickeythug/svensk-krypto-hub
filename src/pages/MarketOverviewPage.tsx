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
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";

const MarketOverviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("top10");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Icon mapping for different cryptocurrencies
  const getCryptoIcon = (symbol: string) => {
    const iconMap: { [key: string]: any } = {
      'BTC': Bitcoin,
      'ETH': CircleDollarSign,
      'BNB': Coins,
      'XRP': Zap,
      'ADA': Target,
      'SOL': Flame,
      'DOT': Globe,
      'AVAX': Activity,
      'LINK': MessageCircle,
      'MATIC': BarChart3,
      'PEPE': Target,
      'BONK': Flame,
      'FLOKI': Zap,
      'DOGE': Target,
      'SHIB': Flame
    };
    return iconMap[symbol] || CircleDollarSign;
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
    { rank: 10, name: "Polygon", symbol: "MATIC", slug: "polygon", price: 12, change1h: -0.8, change24h: 2.1, change7d: 6.7, marketCap: "76B", volume: "423M", supply: "6.3B MATIC" },
    { rank: 11, name: "Uniswap", symbol: "UNI", slug: "uniswap", price: 78, change1h: 1.5, change24h: 3.2, change7d: 8.1, marketCap: "47B", volume: "321M", supply: "601M UNI" },
    { rank: 12, name: "Litecoin", symbol: "LTC", slug: "litecoin", price: 890, change1h: -0.3, change24h: 1.8, change7d: 4.5, marketCap: "66B", volume: "567M", supply: "74M LTC" },
    { rank: 13, name: "Internet Computer", symbol: "ICP", slug: "internet-computer", price: 125, change1h: 2.1, change24h: 6.7, change7d: 12.3, marketCap: "58B", volume: "289M", supply: "464M ICP" },
    { rank: 14, name: "Cosmos", symbol: "ATOM", slug: "cosmos", price: 98, change1h: -1.1, change24h: -2.3, change7d: -4.8, marketCap: "38B", volume: "198M", supply: "388M ATOM" },
    { rank: 15, name: "Near Protocol", symbol: "NEAR", slug: "near", price: 67, change1h: 3.2, change24h: 7.8, change7d: 18.9, marketCap: "71B", volume: "445M", supply: "1.06B NEAR" },
    { rank: 16, name: "Algorand", symbol: "ALGO", slug: "algorand", price: 2.1, change1h: 0.8, change24h: 4.2, change7d: 9.6, marketCap: "16B", volume: "89M", supply: "7.6B ALGO" },
    { rank: 17, name: "VeChain", symbol: "VET", slug: "vechain", price: 0.456, change1h: -0.6, change24h: 2.9, change7d: 6.1, marketCap: "33B", volume: "134M", supply: "72.7B VET" },
    { rank: 18, name: "Fantom", symbol: "FTM", slug: "fantom", price: 3.4, change1h: 4.5, change24h: 12.1, change7d: 28.7, marketCap: "9.5B", volume: "167M", supply: "2.8B FTM" },
    { rank: 19, name: "The Graph", symbol: "GRT", slug: "the-graph", price: 1.89, change1h: 1.2, change24h: 5.4, change7d: 14.2, marketCap: "18B", volume: "78M", supply: "9.5B GRT" },
    { rank: 20, name: "Hedera", symbol: "HBAR", slug: "hedera", price: 0.34, change1h: -0.9, change24h: 1.7, change7d: 3.9, marketCap: "17B", volume: "56M", supply: "50B HBAR" }
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
      case "all":
        return allCryptos;
      default:
        return allCryptos.slice(0, 10); // Top 10 by default
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
      {/* Desktop Version */}
      <div className="hidden md:block min-h-screen bg-background">
        <Header />
        
        {/* Main Container - Full Viewport Layout */}
        <div className="fixed top-16 left-0 right-0 bottom-0 flex flex-col bg-background">
          
          {/* Header Section - Fixed Height */}
          <div className="flex-shrink-0 bg-gradient-to-b from-background via-background to-secondary/5 border-b border-border/50">
            <div className="text-center py-4 px-4">
              <h1 className="font-crypto text-xl md:text-3xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                MARKNADSÖVERSIKT
              </h1>
              <p className="font-display text-xs md:text-sm lg:text-base text-muted-foreground">
                Realtidsöversikt av kryptomarknaden
              </p>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Market Stats - Compact */}
            <div className="px-3 py-4 bg-secondary/10 border-b border-border/30">
              <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 max-w-7xl mx-auto">
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20">
                  <div className="text-xs md:text-lg font-bold text-success">${marketData.totalMarketCap}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Market Cap</div>
                </div>
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20">
                  <div className="text-xs md:text-lg font-bold text-primary">${marketData.totalVolume}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">24h Volym</div>
                </div>
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20">
                  <div className="text-xs md:text-lg font-bold text-warning">{marketData.btcDominance}%</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">BTC</div>
                </div>
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20">
                  <div className="text-xs md:text-lg font-bold text-accent">{marketData.ethDominance}%</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">ETH</div>
                </div>
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20 hidden lg:block">
                  <div className="text-xs md:text-lg font-bold text-primary">{marketData.activeAddresses}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Aktiva</div>
                </div>
                <div className="text-center p-2 bg-background/60 rounded-lg border border-border/20 hidden lg:block">
                  <div className="text-xs md:text-lg font-bold text-success">${marketData.defiTvl}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">DeFi TVL</div>
                </div>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50">
              <div className="px-3 py-3">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 max-w-7xl mx-auto">
                  <div className="flex-shrink-0">
                    <h2 className="font-crypto text-base md:text-xl font-bold text-primary">
                      KRYPTOVALUTOR
                    </h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 md:flex-initial">
                    <div className="relative flex-1 md:flex-initial">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 md:h-4 md:w-4" />
                      <Input
                        placeholder="Sök kryptovaluta..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-7 md:pl-9 bg-background/50 border-border/50 w-full md:w-64 h-8 md:h-9 text-xs md:text-sm"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 h-8 md:h-9 text-xs md:text-sm border-border/50">
                      <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden sm:inline">Favoriter</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="px-3 pb-3 overflow-x-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6 h-auto p-1 bg-secondary/20 min-w-[400px] md:min-w-0 max-w-7xl mx-auto">
                    <TabsTrigger 
                      value="top10" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">TOP 10</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trending" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <Flame className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">Trend</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meme" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <Target className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">Meme</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gainers" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">Toppar</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="losers" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">Fallande</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center justify-center space-x-1 py-2 px-2 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] md:text-sm"
                    >
                      <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="font-medium">Alla</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Table Content - Perfect Layout */}
            <div className="flex-1 overflow-hidden bg-background">
              <div className="h-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-b border-border bg-secondary/30 backdrop-blur-sm">
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-center text-[10px] md:text-xs w-12 md:w-16 bg-secondary/30">#</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-left text-[10px] md:text-xs w-32 md:w-40 bg-secondary/30">Namn</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-20 md:w-24 bg-secondary/30">Pris</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-16 md:w-20 bg-secondary/30">1h</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-16 md:w-20 bg-secondary/30">24h</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-16 md:w-20 bg-secondary/30">7d</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-24 md:w-32 bg-secondary/30">Market Cap</TableHead>
                      <TableHead className="text-muted-foreground font-semibold py-3 px-2 md:px-4 text-right text-[10px] md:text-xs w-20 md:w-28 bg-secondary/30">Volym</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((crypto, index) => (
                      <TableRow 
                        key={crypto.symbol}
                        className="hover:bg-secondary/20 cursor-pointer transition-all duration-200 border-b border-border/20 group h-12 md:h-16"
                        onClick={() => navigate(`/crypto/${crypto.slug}`)}
                      >
                        <TableCell className="text-center py-2 px-2 md:px-4">
                          <Badge variant="outline" className="text-[8px] md:text-xs px-1.5 py-0.5 border-border/50">
                            #{crypto.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-2 md:px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 md:w-8 md:h-8 bg-gradient-to-br from-primary/80 via-accent/80 to-secondary/80 rounded-full flex items-center justify-center shadow-sm">
                              {(() => {
                                const IconComponent = getCryptoIcon(crypto.symbol);
                                return <IconComponent className="h-2 w-2 md:h-4 md:w-4 text-primary-foreground" />;
                              })()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-[9px] md:text-sm">
                                {crypto.name}
                              </div>
                              <div className="text-[7px] md:text-xs text-muted-foreground font-mono">
                                {crypto.symbol}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold py-2 px-2 md:px-4 text-right">
                          <div className="text-foreground text-[9px] md:text-sm">
                            {formatPrice(crypto.price)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 md:px-4 text-right">
                          <div className="text-[8px] md:text-xs">
                            {formatChange(crypto.change1h)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 md:px-4 text-right">
                          <div className="text-[8px] md:text-xs">
                            {formatChange(crypto.change24h)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 md:px-4 text-right">
                          <div className="text-[8px] md:text-xs">
                            {formatChange(crypto.change7d)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground py-2 px-2 md:px-4 text-right">
                          <div className="text-[8px] md:text-xs">
                            {crypto.marketCap}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground py-2 px-2 md:px-4 text-right">
                          <div className="text-[8px] md:text-xs">
                            {crypto.volume}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 py-3 px-3">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      Visar {startIndex + 1}-{Math.min(endIndex, filteredData.length)} av {filteredData.length}
                    </span>
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={`h-8 px-3 text-xs ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary'}`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="h-8 w-8 text-xs cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-8 w-8" />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={`h-8 px-3 text-xs ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary'}`}
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
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/80 via-accent/80 to-secondary/80 rounded-full flex items-center justify-center">
                    {(() => {
                      const IconComponent = getCryptoIcon(crypto.symbol);
                      return <IconComponent className="h-4 w-4 text-primary-foreground" />;
                    })()}
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