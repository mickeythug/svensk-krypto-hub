import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share, 
  Search,
  Filter,
  Calendar,
  Zap,
  BarChart3,
  Globe,
  Flame,
  Bitcoin,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Star,
  Bookmark,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Activity,
  TrendingDownIcon,
  Play,
  Volume2
} from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import cryptoCharts from "@/assets/crypto-charts.jpg";
import hexPattern from "@/assets/hex-pattern.jpg";
import memeTokens from "@/assets/meme-tokens.jpg";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  views: number;
  likes: number;
  comments: number;
  imageUrl?: string;
  tags: string[];
  trending: boolean;
  impact: 'high' | 'medium' | 'low';
  readTime: number;
  source: string;
}

interface MarketSentiment {
  overall: number;
  fearGreedIndex: number;
  socialVolume: number;
  newsVolume: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  change24h: number;
}

interface MarketData {
  totalMarketCap: string;
  totalVolume: string;
  btcDominance: number;
  ethDominance: number;
  activeAddresses: string;
  defiTvl: string;
}

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: 68,
    fearGreedIndex: 72,
    socialVolume: 85,
    newsVolume: 76,
    trend: 'bullish',
    change24h: 4.2
  });
  
  const [marketData, setMarketData] = useState<MarketData>({
    totalMarketCap: "2.1T",
    totalVolume: "89.5B",
    btcDominance: 52.3,
    ethDominance: 17.8,
    activeAddresses: "1.2M",
    defiTvl: "45.2B"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Mock expanded news data with real images
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin når historiska höjder efter institutionella ETF-investeringar överstiger 50 miljarder dollar",
        summary: "Bitcoin har nått nya rekordhöjder över $70,000 efter att institutionella investerare pumpat in över 50 miljarder dollar i Bitcoin ETF:er under den senaste månaden. Analster förutspår ytterligare tillväxt med möjlighet att nå $100,000 inom året.",
        content: "Detaljerad artikel om Bitcoin's exceptionella prisökning och institutionella adoption...",
        author: "Erik Andersson, Senior Kryptoanalytiker",
        publishedAt: "2024-01-07T10:30:00Z",
        category: "Bitcoin",
        sentiment: "positive",
        views: 45500,
        likes: 1250,
        comments: 189,
        imageUrl: cryptoCharts,
        tags: ["Bitcoin", "ETF", "Institutionella", "Rekord", "Adoption"],
        trending: true,
        impact: "high",
        readTime: 8,
        source: "CryptoNetwork Sverige"
      },
      {
        id: "2",
        title: "Ethereum 2.0 staking överstiger 32 miljoner ETH - Nätverkets säkerhet når nya nivåer",
        summary: "Ethereum-nätverket har nått en betydande milstolpe när över 32 miljoner ETH nu är stakade, vilket representerar mer än 25% av den totala ETH-tillgången. Detta stärker nätverkets säkerhet avsevärt och visar på stark tilltro till plattformen.",
        content: "Fullständig analys av Ethereum stakingtrend och dess påverkan på nätverkssäkerhet...",
        author: "Anna Björk, Blockchain-specialist",
        publishedAt: "2024-01-07T08:15:00Z",
        category: "Ethereum",
        sentiment: "positive",
        views: 28900,
        likes: 820,
        comments: 167,
        imageUrl: hexPattern,
        tags: ["Ethereum", "Staking", "ETH2.0", "Säkerhet", "Milestone"],
        trending: true,
        impact: "high",
        readTime: 6,
        source: "CryptoNetwork Sverige"
      },
      {
        id: "3",
        title: "Meme Token-marknaden rasar 25% efter Elon Musks kritiska uttalanden om spekulation",
        summary: "DOGE, SHIB och andra meme-tokens har tappat över 25% av sitt värde efter Elon Musks senaste tweets där han varnar för överdriven spekulation i meme-baserade kryptovalutor. Experter uppmanar till försiktighet men ser potentiell återhämtning.",
        content: "Djupgående analys av meme token volatilitet och social media påverkan...",
        author: "Marcus Lind, Marknadsanalytiker",
        publishedAt: "2024-01-07T07:45:00Z",
        category: "Meme Tokens",
        sentiment: "negative",
        views: 67800,
        likes: 534,
        comments: 298,
        imageUrl: memeTokens,
        tags: ["DOGE", "SHIB", "Meme", "Volatilitet", "Social Media"],
        trending: true,
        impact: "medium",
        readTime: 5,
        source: "CryptoNetwork Sverige"
      },
      {
        id: "4",
        title: "Sveriges CBDC-pilot med digital krona visar exceptionella resultat - Riksbanken planerar nationell utrullning",
        summary: "Riksbankens pilotprogram för digital krona har överträffat alla förväntningar med över 100,000 testanvändare och 99.9% systemtillgänglighet. Planer för nationell utrullning diskuteras aktivt för 2025 med potential att revolutionera svenskt betalningssystem.",
        content: "Detaljerad rapport om Sveriges CBDC-utveckling och framtidsplaner...",
        author: "Sophia Chen, FinTech-expert",
        publishedAt: "2024-01-07T06:20:00Z",
        category: "CBDC",
        sentiment: "positive",
        views: 19400,
        likes: 678,
        comments: 89,
        imageUrl: cryptoCharts,
        tags: ["Sverige", "CBDC", "Riksbank", "Digital Krona", "Innovation"],
        trending: false,
        impact: "high",
        readTime: 10,
        source: "CryptoNetwork Sverige"
      },
      {
        id: "5",
        title: "DeFi Total Value Locked (TVL) överstiger 100 miljarder dollar för första gången sedan 2022",
        summary: "Decentraliserad finans (DeFi) har nått en ny milstolpe med över 100 miljarder dollar i Total Value Locked, drivet av innovativa protokoll, förbättrad säkerhet och ökad institutionell adoption. Uniswap och Aave leder utvecklingen.",
        content: "Omfattande analys av DeFi-marknadens återhämtning och framtidsutsikter...",
        author: "David Kim, DeFi-specialist",
        publishedAt: "2024-01-07T05:30:00Z",
        category: "DeFi",
        sentiment: "positive",
        views: 15600,
        likes: 445,
        comments: 67,
        imageUrl: hexPattern,
        tags: ["DeFi", "TVL", "Protokoll", "Innovation", "Growth"],
        trending: false,
        impact: "high",
        readTime: 7,
        source: "CryptoNetwork Sverige"
      }
    ];
    setNews(mockNews);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/20 text-success border-success/30';
      case 'negative': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Bitcoin", "Ethereum", "Meme Tokens", "CBDC", "DeFi", "NFT"];

  const topMovers = [
    { name: "SHIB", symbol: "SHIB", change: "+23.45%", price: "0.000025 SEK", volume: "2.1B SEK" },
    { name: "Dogecoin", symbol: "DOGE", change: "+18.92%", price: "0.95 SEK", volume: "1.8B SEK" },
    { name: "Pepe", symbol: "PEPE", change: "+15.67%", price: "0.000012 SEK", volume: "890M SEK" },
    { name: "Chainlink", symbol: "LINK", change: "-8.23%", price: "180.45 SEK", volume: "1.2B SEK" },
    { name: "Cardano", symbol: "ADA", change: "-5.67%", price: "4.23 SEK", volume: "967M SEK" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Enhanced Header Section */}
          <div className="mb-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-8 text-muted-foreground hover:text-primary text-xl p-4 h-auto"
            >
              <ArrowLeft className="mr-4 h-6 w-6" />
              <span className="text-lg">Tillbaka till startsidan</span>
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-4xl">
                <h1 className="font-crypto text-6xl md:text-8xl font-bold mb-6 leading-tight">
                  <span style={{ color: '#12E19F' }}>CRY</span>
                  <span className="text-white">PTO</span>
                  <span className="text-white"> </span>
                  <span className="text-white">NET</span>
                  <span style={{ color: '#12E19F' }}>WORK</span>
                  <span className="text-white"> NYHETER</span>
                </h1>
                <p className="text-muted-foreground font-display text-2xl md:text-3xl leading-relaxed mb-6">
                  Sveriges mest omfattande och aktuella källa för krypto-nyheter, marknadsanalys och branschinsikter. 
                  <br className="hidden md:block" />
                  <span className="text-primary font-semibold">Håll dig uppdaterad med realtidsrapportering från våra experter.</span>
                </p>
                <div className="flex flex-wrap items-center gap-6 text-lg text-muted-foreground">
                  <div className="flex items-center bg-success/10 px-4 py-2 rounded-full">
                    <Activity className="h-5 w-5 mr-3 text-success" />
                    <span className="font-medium">Live uppdateringar varje minut</span>
                  </div>
                  <div className="flex items-center bg-warning/10 px-4 py-2 rounded-full">
                    <Star className="h-5 w-5 mr-3 text-warning" />
                    <span className="font-medium">Expertanalys från branschledare</span>
                  </div>
                  <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                    <Eye className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium">Lätt att läsa för alla åldrar</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                  <Input
                    placeholder="🔍 Sök nyheter, taggar eller författare..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 w-full sm:w-[500px] h-16 text-xl bg-secondary/50 border-2 border-border focus:border-primary rounded-2xl"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" size="lg" className="text-lg px-6 py-3 h-auto rounded-xl border-2">
                    <Filter className="mr-3 h-6 w-6" />
                    Avancerat Filter
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-6 py-3 h-auto rounded-xl border-2">
                    <Bookmark className="mr-3 h-6 w-6" />
                    Sparade Artiklar
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-6 py-3 h-auto rounded-xl border-2">
                    <Volume2 className="mr-3 h-6 w-6" />
                    Lyssna på nyheter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Market Sentiment Dashboard */}
          <Card className="mb-10 p-8 bg-gradient-secondary border-border shadow-lg">
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
                <div className="text-sm text-muted-foreground">BTC Dominans</div>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">{marketData.ethDominance}%</div>
                <div className="text-sm text-muted-foreground">ETH Dominans</div>
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

          {/* Enhanced Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full lg:w-auto bg-secondary/50 h-12">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="font-display font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                  >
                    {category === "all" ? "Alla Kategorier" : category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Visning:</span>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="text-sm"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="text-sm"
                >
                  Lista
                </Button>
              </div>
            </div>
          </Tabs>

          {/* Enhanced News Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Enhanced */}
            <div className="lg:col-span-2 space-y-8">
              {/* Breaking News Alert */}
              <Card className="p-6 bg-destructive/10 border-destructive/30">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-destructive mb-2">🚨 BREAKING NEWS</h3>
                    <p className="text-base text-foreground">
                      Bitcoin når nya all-time highs över $75,000 efter ETF-inflöden på rekordnivå. 
                      Institutionella investerare fortsätter att pumpa in kapital i krypto-marknaden.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 border-destructive text-destructive hover:bg-destructive hover:text-white">
                      Läs mer →
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Trending News - Enhanced */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Flame className="h-7 w-7 text-destructive mr-3" />
                    <h2 className="font-crypto text-2xl font-bold text-primary">TRENDING NYHETER</h2>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {filteredNews.filter(article => article.trending).length} artiklar
                  </Badge>
                </div>
                
                <div className="space-y-8">
                  {filteredNews
                    .filter(article => article.trending)
                    .slice(0, 3)
                    .map((article) => (
                    <Card key={article.id} className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 rounded-3xl">
                      <div className="flex flex-col lg:flex-row">
                        {article.imageUrl && (
                          <div className="lg:w-80 h-64 lg:h-80 relative overflow-hidden">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-destructive/90 text-white text-lg px-4 py-2 font-bold">
                                🔥 TRENDING
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 right-4">
                              <Button size="sm" variant="secondary" className="bg-black/70 text-white hover:bg-black/90">
                                <Play className="h-4 w-4 mr-2" />
                                Spela upp
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex-1 p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4 flex-wrap">
                              <Badge className={`${getSentimentBadge(article.sentiment)} text-lg px-4 py-2 font-semibold`}>
                                {article.sentiment === 'positive' ? '📈 POSITIV NYHET' : 
                                 article.sentiment === 'negative' ? '📉 VIKTIG VARNING' : '➡️ NEUTRAL INFO'}
                              </Badge>
                              <Badge className={`${getImpactBadge(article.impact)} text-lg px-4 py-2 font-semibold`}>
                                {article.impact === 'high' ? '🔥 HÖG PÅVERKAN' : 
                                 article.impact === 'medium' ? '⚡ MEDIUM PÅVERKAN' : '💭 LÅG PÅVERKAN'}
                              </Badge>
                              <Badge variant="outline" className="border-2 border-primary text-primary text-lg px-4 py-2 font-bold">
                                📂 {article.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <h3 className="font-display font-bold text-3xl mb-6 hover:text-primary cursor-pointer transition-colors leading-tight">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-6 text-xl leading-relaxed font-medium">
                            {article.summary}
                          </p>

                          <div className="flex flex-wrap gap-3 mb-6">
                            {article.tags.slice(0, 5).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-base px-3 py-1 bg-secondary/70">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-lg">
                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                              <div className="flex items-center font-medium">
                                👤 <span className="ml-2 font-bold text-primary">{article.author}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString('sv-SE')}</span>
                              </div>
                              <div className="flex items-center text-primary font-bold">
                                ⏱️ <span className="ml-2">{article.readTime} min läsning</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-muted-foreground">
                              <div className="flex items-center font-bold">
                                <Eye className="h-6 w-6 mr-2 text-primary" />
                                <span className="text-xl">{article.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center font-bold">
                                <Heart className="h-6 w-6 mr-2 text-destructive" />
                                <span className="text-xl">{article.likes}</span>
                              </div>
                              <div className="flex items-center font-bold">
                                <MessageCircle className="h-6 w-6 mr-2 text-primary" />
                                <span className="text-xl">{article.comments}</span>
                              </div>
                              <Button variant="ghost" size="lg" className="h-auto">
                                <Share className="h-6 w-6" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-crypto text-3xl font-bold text-primary">📰 ALLA NYHETER</h2>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="lg" className="text-lg px-6 py-3 h-auto rounded-xl border-2">
                      <Calendar className="mr-3 h-6 w-6" />
                      Sortera efter datum
                    </Button>
                    <span className="text-muted-foreground text-xl font-medium bg-secondary/50 px-4 py-2 rounded-full">
                      📊 {filteredNews.length} artiklar
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {filteredNews.map((article) => (
                    <Card key={article.id} className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg rounded-2xl">
                      <div className="flex flex-col lg:flex-row">
                        {article.imageUrl && (
                          <div className="lg:w-72 h-48 lg:h-64 relative overflow-hidden">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Badge variant="outline" className="border-2 border-primary text-primary text-base px-3 py-2 font-bold">
                              📂 {article.category}
                            </Badge>
                            <span className={`text-2xl ${getSentimentColor(article.sentiment)}`}>
                              {article.sentiment === 'positive' ? '📈' : 
                               article.sentiment === 'negative' ? '📉' : '➡️'}
                            </span>
                            <span className="text-base text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                              ⏱️ {article.readTime} min
                            </span>
                            <span className="text-base text-muted-foreground">•</span>
                            <span className="text-base text-muted-foreground font-medium">{article.source}</span>
                          </div>
                          
                          <h3 className="font-display font-bold text-2xl mb-4 hover:text-primary cursor-pointer transition-colors leading-tight">
                            {article.title}
                          </h3>
                          
                          <p className="text-xl text-muted-foreground mb-6 leading-relaxed font-medium">
                            {article.summary}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-sm bg-secondary/70">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-lg text-muted-foreground">
                            <div className="flex items-center gap-6">
                              <span className="font-bold text-primary">👤 {article.author}</span>
                              <span>•</span>
                              <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString('sv-SE')}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center font-bold">
                                <Eye className="h-5 w-5 mr-2 text-primary" />
                                <span>{(article.views / 1000).toFixed(1)}k</span>
                              </div>
                              <div className="flex items-center font-bold">
                                <Heart className="h-5 w-5 mr-2 text-destructive" />
                                <span>{article.likes}</span>
                              </div>
                              <div className="flex items-center font-bold">
                                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                                <span>{article.comments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-8">
              {/* Enhanced Market Movers */}
              <Card className="p-6 bg-gradient-secondary border-border">
                <h3 className="font-crypto font-bold text-xl mb-6 text-primary flex items-center">
                  <TrendingUp className="mr-3 h-6 w-6" />
                  STÖRSTA RÖRELSERNA
                </h3>
                <div className="space-y-4">
                  {topMovers.map((token, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-lg">{token.symbol}</div>
                          <div className={`font-bold text-lg ${
                            token.change.startsWith('+') ? 'text-success' : 'text-destructive'
                          }`}>
                            {token.change}
                          </div>
                        </div>
                        <div className="text-base text-muted-foreground">{token.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {token.price} • Vol: {token.volume}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Enhanced Quick Analysis */}
              <Card className="p-6 border-border">
                <h3 className="font-crypto font-bold text-xl mb-6 text-primary flex items-center">
                  <BarChart3 className="mr-3 h-6 w-6" />
                  SNABBANALYS
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-lg border border-success/30">
                    <h4 className="font-semibold text-success mb-2">🚀 Bullish Signal</h4>
                    <p className="text-sm text-muted-foreground">
                      Institutionella ETF-inflöden fortsätter att driva Bitcoin uppåt. 
                      Teknisk analys visar stark support vid $65,000.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
                    <h4 className="font-semibold text-warning mb-2">⚠️ Varning</h4>
                    <p className="text-sm text-muted-foreground">
                      Meme token-sektorn visar tecken på överköpthet. 
                      Rekommenderar försiktighet för kortsiktiga positioner.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <h4 className="font-semibold text-primary mb-2">💡 Möjlighet</h4>
                    <p className="text-sm text-muted-foreground">
                      DeFi-sektorn visar tecken på återhämtning med TVL som överstiger $100B. 
                      Håll ögonen på innovativa protokoll.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Enhanced Newsletter */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-crypto font-bold text-xl mb-4 text-primary flex items-center">
                  <Zap className="mr-3 h-6 w-6" />
                  EXPERTNYHETSBREV
                </h3>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  Få de viktigaste krypto-nyheterna, expertanalys och marknadsinsikter 
                  direkt i din inkorg varje dag. Över 50,000 prenumeranter litar på oss.
                </p>
                <div className="space-y-4">
                  <Input 
                    placeholder="Din e-postadress" 
                    className="bg-background h-12 text-base" 
                  />
                  <Button className="w-full bg-gradient-primary h-12 text-base font-semibold">
                    📧 Prenumerera Gratis
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Ingen spam. Avsluta prenumeration när som helst. 
                    Vi respekterar din integritet.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsPage;