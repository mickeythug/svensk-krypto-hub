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
  Grid3X3,
  List,
  Clock,
  User,
  ExternalLink,
  BookOpen,
  Eye
} from "lucide-react";
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  imageUrl?: string;
  tags: string[];
  trending: boolean;
  impact: 'high' | 'medium' | 'low';
  source: string;
  url?: string;
  readTime: number;
  views: number;
  author: string;
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
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
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
  const [sortBy, setSortBy] = useState<"date" | "impact" | "trending">("date");
  const [isLoading, setIsLoading] = useState(false);

  // SEO Setup
  useEffect(() => {
    document.title = "Krypto Nyheter | Senaste Nyheterna från Kryptovaluta-världen | Crypto Network Sweden";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Läs de senaste krypto-nyheterna från Bitcoin, Ethereum, DeFi och mer. Expertanalys och marknadsinsikter från Sveriges ledande krypto-community.'
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://cryptonetworksweden.se/nyheter');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const projectRef = "jcllcrvomxdrhtkqpcbr";
        const url = `https://${projectRef}.supabase.co/functions/v1/news-aggregator?lang=sv&limit=50`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        const items = (json.articles ?? []) as any[];
        const mapped: NewsArticle[] = items.map((a) => ({
          id: a.id,
          title: a.title,
          summary: a.description || "",
          content: a.description || "",
          publishedAt: a.publishedAt,
          category: /bitcoin/i.test(a.title) ? "Bitcoin" : /ethereum|eth/i.test(a.title) ? "Ethereum" : /meme|doge|shib|pepe/i.test(a.title) ? "Meme Tokens" : "Allmänt",
          sentiment: 'neutral',
          imageUrl: a.imageUrl || undefined,
          tags: Array.isArray(a.tickers) ? a.tickers : [],
          trending: a.source === 'CryptoPanic',
          impact: 'medium',
          source: a.source,
          url: a.url,
          readTime: Math.max(1, Math.round(((a.description || '').split(' ').length) / 200)),
          views: 0,
          author: a.author || a.source || 'Okänd',
        }));
        if (!active) return;
        setNews(mapped);
        setFilteredNews(mapped);
      } catch (e) {
        console.error('Failed to load news', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  // Update filtered news when search, category, or sort changes
  useEffect(() => {
    let filtered = news.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           article.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
        article.category === selectedCategory || 
        (selectedCategory === "trending" && article.trending);
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "impact":
        filtered.sort((a, b) => {
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        });
        break;
      case "trending":
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
    }

    setFilteredNews(filtered);
  }, [news, searchQuery, selectedCategory, sortBy]);

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

  const categories = [
    { id: "all", label: "ALLA" },
    { id: "Bitcoin", label: "BTC" },
    { id: "Ethereum", label: "ETH" },
    { id: "Meme Tokens", label: "Memes" },
    { id: "Politik", label: "Politik" },
    { id: "trending", label: "Trending" }
  ];

  const topMovers = [
    { 
      name: "SHIB", 
      symbol: "SHIB", 
      change: "+23.45%", 
      price: "0.000025 SEK", 
      volume: "2.1B SEK",
      logo: "/src/assets/crypto-logos/shib.png",
      isPositive: true
    },
    { 
      name: "Dogecoin", 
      symbol: "DOGE", 
      change: "+18.92%", 
      price: "0.95 SEK", 
      volume: "1.8B SEK",
      logo: "/src/assets/crypto-logos/doge.png",
      isPositive: true
    },
    { 
      name: "Pepe", 
      symbol: "PEPE", 
      change: "+15.67%", 
      price: "0.000012 SEK", 
      volume: "890M SEK",
      logo: "/src/assets/crypto-logos/eth.png", // Using ETH as placeholder for PEPE
      isPositive: true
    },
    { 
      name: "Chainlink", 
      symbol: "LINK", 
      change: "-8.23%", 
      price: "180.45 SEK", 
      volume: "1.2B SEK",
      logo: "/src/assets/crypto-logos/link.png",
      isPositive: false
    },
    { 
      name: "Cardano", 
      symbol: "ADA", 
      change: "-5.67%", 
      price: "4.23 SEK", 
      volume: "967M SEK",
      logo: "/src/assets/crypto-logos/ada.png",
      isPositive: false
    }
  ];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just nu";
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CryptoPriceTicker />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-8 text-muted-foreground hover:text-primary text-lg group"
            >
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Tillbaka till startsidan
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <h1 className="font-crypto text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                  <span style={{ color: '#12E19F' }}>CRY</span>
                  <span className="text-white">PTO</span>
                  <span className="text-white"> </span>
                  <span className="text-white">NET</span>
                  <span style={{ color: '#12E19F' }}>WORK</span>
                  <span className="text-white"> NYHETER</span>
                </h1>
                <p className="text-muted-foreground font-display text-lg md:text-xl leading-relaxed max-w-3xl animate-fade-in">
                  Sveriges mest omfattande och aktuella källa för krypto-nyheter, marknadsanalys och branschinsikter. 
                  Håll dig uppdaterad med realtidsrapportering från våra experter.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-success animate-pulse" />
                    <span>Live uppdateringar varje minut</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-warning" />
                    <span>Expertanalys från branschledare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Sök nyheter, författare eller taggar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg bg-secondary/50 border-border focus:border-primary transition-all duration-300"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSortBy(sortBy === "date" ? "impact" : "date")}
                  className="h-12 px-6"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {sortBy === "date" ? "Datum" : "Påverkan"}
                </Button>
                <div className="flex border border-border rounded-lg overflow-hidden bg-secondary/50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-12 px-4 rounded-none hover:bg-primary/10"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-12 px-4 rounded-none hover:bg-primary/10"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-10">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full bg-secondary/50 h-12 p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="font-display font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-2 transition-all duration-300"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* News Content */}
            <div className="xl:col-span-3">
              {/* Breaking News - dynamic from latest article */}
              {news[0] && (
                <Card className="p-6 bg-destructive/10 border-destructive/30 shadow-lg mb-8 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive mt-1 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-destructive mb-3">🚨 BREAKING NEWS</h3>
                      <p className="text-base text-foreground leading-relaxed mb-2 font-display font-semibold">
                        {news[0].title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {news[0].summary}
                      </p>
                      {news[0].url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-all duration-300"
                          onClick={() => window.open(news[0].url!, '_blank')}
                        >
                          Läs mer →
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Results Counter */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-crypto text-2xl font-bold text-primary">
                  {searchQuery ? `SÖKRESULTAT (${filteredNews.length})` : 'ALLA NYHETER'}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Visar {filteredNews.length} av {news.length} artiklar
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* News Content - Grid/List Views */}
              {!isLoading && (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      {filteredNews.map((article, index) => (
                         <Card 
                           key={article.id} 
                           className="p-5 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card/90 backdrop-blur-sm group cursor-pointer hover-scale"
                           style={{ animationDelay: `${index * 100}ms` }}
                           onClick={() => article.url ? window.open(article.url, '_blank') : undefined}
                         >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${getSentimentBadge(article.sentiment)} text-xs px-2 py-1`}>
                                {article.sentiment === 'positive' ? '📈 Positiv' : 
                                 article.sentiment === 'negative' ? '📉 Negativ' : '➡️ Neutral'}
                              </Badge>
                              <Badge className={`${getImpactBadge(article.impact)} text-xs px-2 py-1`}>
                                {article.impact === 'high' ? '🔥 Hög' : 
                                 article.impact === 'medium' ? '⚡ Medium' : '💭 Låg'}
                              </Badge>
                              {article.trending && (
                                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs px-2 py-1">
                                  🔥 Trending
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {article.summary}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs hover:bg-primary/20 transition-colors">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{formatTimeAgo(article.publishedAt)}</span>
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  <span>{article.readTime} min</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                <span>{article.author}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="space-y-4 animate-fade-in">
                      {filteredNews.map((article, index) => (
                         <Card 
                           key={article.id} 
                           className="p-4 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card/90 backdrop-blur-sm group cursor-pointer"
                           style={{ animationDelay: `${index * 50}ms` }}
                           onClick={() => article.url ? window.open(article.url, '_blank') : undefined}
                         >
                          <div className="flex gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${getSentimentBadge(article.sentiment)} text-xs px-2 py-1`}>
                                  {article.sentiment === 'positive' ? '📈' : 
                                   article.sentiment === 'negative' ? '📉' : '➡️'}
                                </Badge>
                                <Badge className={`${getImpactBadge(article.impact)} text-xs px-2 py-1`}>
                                  {article.impact === 'high' ? '🔥' : 
                                   article.impact === 'medium' ? '⚡' : '💭'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {article.category}
                                </Badge>
                                {article.trending && (
                                  <Badge className="bg-orange-500/20 text-orange-500 text-xs">
                                    Trending
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-display font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                              
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                {article.summary}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span>{article.author}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatTimeAgo(article.publishedAt)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    <span>{article.readTime} min läsning</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    <span>{article.views.toLocaleString()} visningar</span>
                                  </div>
                                </div>
                                 <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground" onClick={(e) => { e.stopPropagation(); if (article.url) window.open(article.url, '_blank'); }}>
                                   <ExternalLink className="h-3 w-3 mr-1" />
                                   Läs mer
                                 </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {filteredNews.length === 0 && !isLoading && (
                    <Card className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">Inga nyheter hittades</h3>
                        <p className="text-muted-foreground">
                          Prova att ändra sökterm eller välj en annan kategori
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                          }}
                        >
                          Rensa filter
                        </Button>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Market Sentiment */}
              <Card className="p-6">
                <h3 className="font-crypto text-lg font-bold mb-6 text-primary">MARKNADS-<br />SENTIMENT</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                    <span className="font-bold text-success">{marketSentiment.fearGreedIndex}/100</span>
                  </div>
                  <Progress value={marketSentiment.fearGreedIndex} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Social Volym</span>
                    <span className="font-bold">{marketSentiment.socialVolume}%</span>
                  </div>
                  <Progress value={marketSentiment.socialVolume} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nyhetsvolym</span>
                    <span className="font-bold">{marketSentiment.newsVolume}%</span>
                  </div>
                  <Progress value={marketSentiment.newsVolume} className="h-2" />

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">24h Trend</span>
                      <div className={`flex items-center gap-1 ${
                        marketSentiment.change24h >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {marketSentiment.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-bold">{marketSentiment.change24h >= 0 ? '+' : ''}{marketSentiment.change24h}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Top Movers */}
              <Card className="p-6">
                <h3 className="font-crypto text-xl font-bold mb-6 text-primary">TOP MOVERS</h3>
                <div className="space-y-4">
                  {topMovers.map((token, index) => (
                    <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                          <img 
                            src={token.logo} 
                            alt={token.symbol}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#12E19F"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${token.symbol.charAt(0)}</text></svg>`)}`;
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm group-hover:text-primary transition-colors">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm flex items-center gap-1 ${
                          token.isPositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {token.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {token.change}
                        </div>
                        <div className="text-xs text-muted-foreground">{token.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Market Data */}
              <Card className="p-6">
                <h3 className="font-crypto text-xl font-bold mb-6 text-primary">MARKNADSDATA</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Total Market Cap</span>
                    <span className="font-mono font-bold">${marketData.totalMarketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">24h Volym</span>
                    <span className="font-mono font-bold">${marketData.totalVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">BTC Dominans</span>
                    <span className="font-mono font-bold">{marketData.btcDominance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">ETH Dominans</span>
                    <span className="font-mono font-bold">{marketData.ethDominance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Aktiva Adresser</span>
                    <span className="font-mono font-bold">{marketData.activeAddresses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">DeFi TVL</span>
                    <span className="font-mono font-bold">${marketData.defiTvl}</span>
                  </div>
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