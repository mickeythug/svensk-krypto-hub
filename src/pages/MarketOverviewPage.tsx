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
import { useCryptoData } from "@/hooks/useCryptoData";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { prefetchTradingViewSymbols } from "@/hooks/useTradingViewSymbol";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = 15; // 15 tokens per page as requested
  const navigate = useNavigate();
  const { cryptoPrices, isLoading, error } = useCryptoData();
  const queryClient = useQueryClient();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { t } = useLanguage();

  // Use real logo images from CoinGecko API
  const getCryptoLogo = (crypto: any) => {
    // Use real image from API if available, otherwise fallback to local image
    if (crypto.image) {
      return crypto.image;
    }
    
    // Fallback to local images for common tokens
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

  const { data: intel } = useMarketIntel();

  // Helpers
  const formatCurrencyCompact = (n?: number | null) => {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);
  };

  // Derived market overview + sentiment
  const totalMarketCap = formatCurrencyCompact(intel?.overview.totalMarketCap);
  const totalVolume = formatCurrencyCompact(intel?.overview.totalVolume24h);
  const trend24 = Number(((intel?.sentiment.trend24hPct ?? 0)).toFixed(1));
  const fearGreed = Math.round(intel?.sentiment.fearGreedIndex ?? 0);
  const greedLabel = fearGreed >= 60 ? t('market.greed') : fearGreed <= 40 ? t('market.fear') : t('market.neutral');
  const btcDom = Number(((intel?.overview.btcDominance ?? 0)).toFixed(1));
  // Simple proxy for Alt Season (no free official API): inverse of BTC dominance
  const altSeason = Math.max(0, Math.min(100, Math.round(100 - (intel?.overview.btcDominance ?? 50))));
  const altSeasonLabel = altSeason >= 60 ? t('market.altSeason') : altSeason <= 40 ? t('market.btcSeason') : t('market.neutral');

  const getCurrentData = () => {
    // Use real top 100 data from CoinGecko API
    if (!cryptoPrices || cryptoPrices.length === 0) return [];
    
    // Filter out wrapped tokens and staked tokens
    const filteredCryptoPrices = cryptoPrices.filter(crypto => {
      const nameToCheck = crypto.name.toLowerCase();
      const symbolToCheck = crypto.symbol.toLowerCase();
      
      // List of tokens to filter out
      const excludedKeywords = [
        'wrapped',
        'staked',
        'lido',
        'wsteth',
        'steth',
        'weth',
        'wbtc',
        'wbnb',
        'wmatic',
        'wsol',
        'wdoge',
        'wada',
        'wavax',
        'wdot',
        'wlink',
        'wuni',
        'wltc',
        'wxrp'
      ];
      
      return !excludedKeywords.some(keyword => 
        nameToCheck.includes(keyword) || symbolToCheck.includes(keyword)
      );
    });
    
    // Convert real data to the right format for the table
    const formattedCrypto = filteredCryptoPrices.map(crypto => ({
      rank: crypto.rank || 1,
      name: crypto.name,
      symbol: crypto.symbol,
      slug: crypto.symbol.toLowerCase(),
      price: crypto.price,
      change1h: crypto.change1h ?? 0,
      change24h: crypto.change24h,
      change7d: crypto.change7d ?? 0,
      marketCap: crypto.marketCap || "0",
      volume: crypto.volume || "0",
      supply: `${crypto.supply || "0"} ${crypto.symbol}`,
      image: crypto.image // Include real image URL
    }));

    switch (activeTab) {
      case "trending":
        // Sort by highest positive 24h change (trending up)
        return formattedCrypto
          .filter(crypto => crypto.change24h > 5) // Only tokens with >5% increase
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "meme":
        // Show popular meme tokens
        return formattedCrypto.filter(crypto => 
          ['DOGE', 'SHIB', 'PEPE', 'BONK', 'FLOKI'].includes(crypto.symbol)
        );
      case "gainers":
        // Sort by highest positive change
        return formattedCrypto
          .filter(crypto => crypto.change24h > 0)
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "losers":
        // Sort by lowest negative change
        return formattedCrypto
          .filter(crypto => crypto.change24h < 0)
          .sort((a, b) => a.change24h - b.change24h)
          .slice(0, 50);
      case "all":
        return formattedCrypto.sort((a, b) => a.rank - b.rank); // Sort by market cap rank
      default:
        // Top 10 sorted by market cap rank
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

  // Prefetch TV symbols for visible page (improves chart load)
  useEffect(() => {
    const toPrefetch = filteredData
      .slice(startIndex, endIndex)
      .map(c => ({ symbol: c.symbol, coinGeckoId: (cryptoPrices.find(p => p.symbol === c.symbol)?.coinGeckoId) }));
    prefetchTradingViewSymbols(queryClient, toPrefetch);
  }, [filteredData, startIndex, endIndex, queryClient, cryptoPrices]);

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
        
        {/* Main Container */}
        <div className="pt-4 bg-background">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-background via-background to-secondary/5 border-b border-border/30">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h1 className="font-crypto text-4xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t('market.title').toUpperCase()}
              </h1>
              <p className="font-display text-lg text-muted-foreground">
                {t('market.description')}
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
                    <h3 className="text-sm font-medium text-muted-foreground">{t('market.totalMarketCap')}</h3>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold font-numbers text-primary mb-2">{totalMarketCap}</div>
                  <div className={`text-sm font-medium font-numbers ${trend24 >= 0 ? 'text-success' : 'text-destructive'}`}>{trend24 >= 0 ? `+${trend24}% (24h)` : `${trend24}% (24h)`}</div>
                </div>

                {/* Fear & Greed Index */}
                <div className="bg-gradient-to-br from-success/10 to-warning/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-success/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('market.fearGreed')}</h3>
                    <Activity className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold font-numbers text-success mb-2">{fearGreed}</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${fearGreed}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-success font-medium">{greedLabel}</div>
                </div>

                {/* Alt Season Index */}
                <div className="bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-accent/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('market.altSeasonIndex')}</h3>
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold font-numbers text-accent mb-2">{altSeason}</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${altSeason}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-accent font-medium">{altSeasonLabel}</div>
                </div>

                {/* BTC Dominance */}
                <div className="bg-gradient-to-br from-warning/10 to-destructive/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-warning/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('market.btcDominance')}</h3>
                    <Bitcoin className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold font-numbers text-warning mb-2">{btcDom}%</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-2 rounded-full transition-all duration-500"
                      style={{ width: `${btcDom}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-warning font-medium">{t('market.btcSeason')}</div>
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
                    {t('market.cryptocurrencies').toUpperCase()}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('market.showing')} {startIndex + 1}-{Math.min(endIndex, filteredData.length)} {t('market.of')} {filteredData.length} {t('market.cryptocurrencies').toLowerCase()}
                  </p>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t('market.search')}
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
                      {t('market.favorites')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tabs - Modern Style */}
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6 h-12 p-1 bg-card border border-border rounded-xl shadow-sm">
                    <TabsTrigger 
                      value="top10" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>{t('market.top10')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trending" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Flame className="h-4 w-4" />
                      <span>{t('market.trending')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meme" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Target className="h-4 w-4" />
                      <span>{t('market.meme')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gainers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>{t('market.gainersShort')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="losers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingDown className="h-4 w-4" />
                      <span>{t('market.losersShort')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>{t('market.allShort')}</span>
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
                <div className="bg-card rounded-t-xl border border-border border-b-0 overflow-hidden shadow-sm">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                        <TableHead className="text-center font-semibold py-4 px-6 text-muted-foreground w-16">#</TableHead>
                        <TableHead className="text-left font-semibold py-4 px-6 text-muted-foreground w-80">{t('market.name')}</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">{t('market.price')}</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">1h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">24h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">7d %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-40">Market Cap</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">{t('market.volume')} (24h)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((crypto, index) => (
                        <TableRow 
                          key={`${crypto.symbol}-${crypto.rank}`}
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
                                <div className="w-10 h-10 rounded-xl bg-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden border border-border/10 shadow-sm">
                                  <img 
                                    src={getCryptoLogo(crypto)} 
                                    alt={crypto.name}
                                    className="w-8 h-8 object-contain drop-shadow-sm"
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
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toggleWatchlist({ 
                                     id: crypto.symbol.toLowerCase(), 
                                     symbol: crypto.symbol, 
                                     name: crypto.name 
                                   });
                                 }}
                                 className={`p-2 hover:scale-110 transition-all ${
                                   isInWatchlist(crypto.symbol.toLowerCase()) 
                                     ? 'text-yellow-500 hover:text-yellow-600' 
                                     : 'text-muted-foreground hover:text-yellow-500'
                                 }`}
                               >
                                 <Star className={`h-4 w-4 ${isInWatchlist(crypto.symbol.toLowerCase()) ? 'fill-current' : ''}`} />
                               </Button>
                             </div>
                           </TableCell>
                          
                          {/* Price */}
                          <TableCell className="py-4 px-6 text-right">
                             <div className="font-numbers font-semibold text-foreground text-base">
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
                              <span className="font-numbers">{crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%</span>
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
                              <span className="font-numbers">{crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
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
                              <span className="font-numbers">{crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* Market Cap */}
                          <TableCell className="py-4 px-6 text-right">
                             <div className="font-numbers text-muted-foreground text-sm">
                               ${crypto.marketCap}
                             </div>
                          </TableCell>
                          
                          {/* Volume */}
                          <TableCell className="py-4 px-6 text-right">
                             <div className="font-numbers text-muted-foreground text-sm">
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
                      key={`${crypto.symbol}-${crypto.rank}`}
                      className="p-6 bg-card hover:shadow-lg cursor-pointer transition-all duration-200 border border-border hover:border-primary/30"
                      onClick={() => navigate(`/crypto/${crypto.slug}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 rounded-xl bg-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden border border-border/10 shadow-sm">
                             <img 
                               src={getCryptoLogo(crypto)} 
                               alt={crypto.name}
                               className="w-10 h-10 object-contain drop-shadow-sm"
                             />
                           </div>
                           <div>
                             <h3 className="font-semibold text-white text-lg">{crypto.name}</h3>
                             <p className="text-white/80 font-mono">{crypto.symbol}</p>
                           </div>
                         </div>
                         <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/20 text-white border-white/30">
                           #{crypto.rank}
                         </Badge>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <span className="text-white/80">{t('market.price')}</span>
                           <span className="font-numbers font-semibold text-lg text-white">{formatPrice(crypto.price)}</span>
                         </div>
                         
                         <div className="grid grid-cols-3 gap-2">
                           <div className="text-center">
                             <p className="text-xs text-white/70 mb-1">1h</p>
                              <div className={`text-sm font-medium font-numbers ${
                                crypto.change1h >= 0 ? 'text-white' : 'text-red-300'
                              }`}>
                               {crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%
                             </div>
                           </div>
                           <div className="text-center">
                             <p className="text-xs text-white/70 mb-1">24h</p>
                              <div className={`text-sm font-medium font-numbers ${
                                crypto.change24h >= 0 ? 'text-white' : 'text-red-300'
                              }`}>
                               {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                             </div>
                           </div>
                           <div className="text-center">
                             <p className="text-xs text-white/70 mb-1">7d</p>
                              <div className={`text-sm font-medium font-numbers ${
                                crypto.change7d >= 0 ? 'text-white' : 'text-red-300'
                              }`}>
                               {crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                             </div>
                           </div>
                         </div>
                         
                         <div className="pt-2 border-t border-white/20">
                           <div className="flex justify-between text-sm">
                             <span className="text-white/70">Market Cap</span>
                             <span className="font-numbers text-white">${crypto.marketCap}</span>
                           </div>
                           <div className="flex justify-between text-sm mt-1">
                             <span className="text-white/70">Volume</span>
                             <span className="font-numbers text-white">${crypto.volume}</span>
                           </div>
                         </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination - Modern Style */}
              <div className="bg-card border border-border border-t-0 rounded-b-xl px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t('market.showing')} <span className="font-medium text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> {t('market.of')} <span className="font-medium text-foreground">{filteredData.length}</span> {t('market.cryptocurrencies')}
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

      {/* Mobile Version - Premium App Store Quality */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-4 border-b border-border/20">
            <div className="text-center mb-4">
              <h1 className="font-crypto text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t('market.title').toUpperCase()}
              </h1>
              <p className="text-muted-foreground font-medium">{t('market.liveCryptoData')}</p>
            </div>
          </div>

          {/* Premium Sentiment Dashboard */}
          <div className="p-4 bg-gradient-to-b from-secondary/5 to-transparent">
            <div className="space-y-4">
              
              {/* Market Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/15 to-accent/10 border-primary/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">Market Cap</span>
                  </div>
                   <div className="text-xl font-bold font-numbers text-primary mb-1">
                     {totalMarketCap}
                   </div>
                   <div className={`text-xs font-semibold font-numbers flex items-center ${trend24 >= 0 ? 'text-success' : 'text-destructive'}`}>
                     <TrendingUp className={`h-3 w-3 mr-1 ${trend24 < 0 ? 'rotate-180' : ''}`} />
                     {trend24 >= 0 ? `+${trend24}%` : `${trend24}%`}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-secondary/15 to-accent/10 border-secondary/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-secondary/20 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">Volume 24h</span>
                  </div>
                  <div className="text-xl font-bold text-secondary mb-1">
                    {totalVolume}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold">Trading</div>
                </Card>
              </div>

              {/* Fear & Greed Index */}
              <Card className="p-5 bg-gradient-to-br from-success/15 to-warning/10 border-success/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-success/20 rounded-lg">
                      <Activity className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">Fear & Greed Index</span>
                  </div>
                  <div className="text-2xl font-bold font-numbers text-success">{fearGreed}</div>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-3 mb-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-destructive via-warning to-success h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${fearGreed}%` }}
                  ></div>
                </div>
                <div className="text-sm text-success font-bold text-center">{greedLabel}</div>
              </Card>

              {/* Market Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-accent/15 to-secondary/10 border-accent/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-accent/20 rounded-lg">
                      <Coins className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">Alt Season</span>
                  </div>
                  <div className="text-xl font-bold font-numbers text-accent mb-2">{altSeason}</div>
                  <div className="w-full bg-secondary/20 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${altSeason}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-accent font-bold">{altSeasonLabel}</div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-warning/15 to-destructive/10 border-warning/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-warning/20 rounded-lg">
                      <Bitcoin className="h-4 w-4 text-warning" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">BTC Dom</span>
                  </div>
                  <div className="text-xl font-bold font-numbers text-warning mb-2">{btcDom}%</div>
                  <div className="w-full bg-secondary/20 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-2 rounded-full transition-all duration-500"
                      style={{ width: `${btcDom}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-warning font-bold">BTC Season</div>
                </Card>
              </div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="sticky top-[120px] z-40 bg-background/98 backdrop-blur-xl border-b border-border/30">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('market.search')}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-background/80 border-border/50 h-11 text-sm font-medium rounded-xl focus:border-primary/50 transition-colors"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 h-11 p-1 bg-card/80 border border-border/30 rounded-xl w-full backdrop-blur-sm">
                  <TabsTrigger value="top10" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">TOP 10</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Trending</TabsTrigger>
                  <TabsTrigger value="meme" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Meme</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3 h-11 p-1 bg-card/80 border border-border/30 rounded-xl w-full mt-2 backdrop-blur-sm">
                  <TabsTrigger value="gainers" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('market.gainersShort')}</TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('market.losersShort')}</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs py-2 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('market.allShort')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Table Headers */}
            <div className="flex items-center justify-between px-5 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wide bg-secondary/5 border-t border-border/20">
              <span className="w-8">#</span>
              <div className="flex-1 flex items-center gap-1">
                <span>Market Cap</span>
                <ChevronUp className="h-3 w-3" />
              </div>
              <span className="w-20 text-center">Price</span>
              <span className="w-16 text-center">24h %</span>
            </div>
          </div>

          {/* Crypto List */}
          <div className="divide-y divide-border/10 pb-6">
            {currentData.map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${crypto.rank}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-secondary/10 active:bg-secondary/20 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-primary/20"
                onClick={() => navigate(`/crypto/${crypto.slug}`)}
              >
                {/* Rank */}
                <div className="w-8 text-muted-foreground text-sm font-bold">
                  {crypto.rank}
                </div>

                {/* Coin Info */}
                <div className="flex-1 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden border border-border/10 shadow-sm">
                    <img 
                      src={getCryptoLogo(crypto)} 
                      alt={crypto.name}
                      className="w-8 h-8 object-contain drop-shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm tracking-wide">
                      {crypto.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {formatCurrencyCompact(parseFloat(crypto.marketCap))}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="w-20 text-right">
                  <div className="font-mono font-bold text-foreground text-sm">
                    {crypto.price >= 1000 
                      ? `$${(crypto.price / 1000).toFixed(1)}K`
                      : crypto.price < 0.01 
                      ? `$${crypto.price.toFixed(4)}`
                      : `$${crypto.price.toFixed(2)}`
                    }
                  </div>
                </div>

                {/* 24h Change with Enhanced Sparkline */}
                <div className="w-16 flex flex-col items-center space-y-1">
                  <MiniSparkline change={crypto.change24h} />
                  <div className={`flex items-center justify-center text-xs font-bold px-2 py-1 rounded-lg ${
                    crypto.change24h >= 0 
                      ? 'text-success bg-success/10' 
                      : 'text-destructive bg-destructive/10'
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${crypto.change24h < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(crypto.change24h).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination at bottom of list */}
            <div className="pt-8 pb-20">
              <div className="flex items-center justify-between max-w-sm mx-auto px-4 py-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
                <span className="text-xs text-muted-foreground font-medium">
                  {t('market.showing')} {startIndex + 1}-{Math.min(endIndex, filteredData.length)} {t('market.of')} {filteredData.length}
                </span>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0 rounded-xl border-border/50 hover:border-primary/50 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="px-3 py-1 bg-primary/10 rounded-lg">
                    <span className="text-sm font-bold text-primary">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 p-0 rounded-xl border-border/50 hover:border-primary/50 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketOverviewPage;