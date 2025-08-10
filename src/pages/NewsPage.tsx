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
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import { useNavigate } from "react-router-dom";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [newsCount24h, setNewsCount24h] = useState<number>(0);
  const { data: intel } = useMarketIntel(newsCount24h);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "impact" | "trending">("date");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 20;

  // Smart zero-cost categorization helpers
  const normalize = (s: string = "") => s.toLowerCase();
  const hasAny = (s: string, patterns: RegExp[]) => patterns.some((re) => re.test(s));
  const classifyCategory = (title: string, summary: string, tags: string[] = []) => {
    const t = normalize(title);
    const d = normalize(summary);
    const tagStr = normalize(tags.join(" "));
    const text = `${t} ${d} ${tagStr}`;

    const reBTC = [/\bbitcoin\b/i, /\bbtc\b/i, /\bxbt\b/i, /\blightning\b/i, /\bhalving\b/i];
    const reETH = [/\bethereum\b/i, /\beth\b/i, /\beth2\b/i, /\berc-?20\b/i, /\bevm\b/i, /\bvitalik\b/i];

    const reMEME = [/\bmeme\b/i, /\bdoge\b/i, /\bdogecoin\b/i, /\bshib\b/i, /\bshiba\b/i, /\bpepe\b/i, /\bbonk\b/i, /\bwen\b/i, /\bfloki\b/i, /\bcat\b/i, /\bfrog\b/i];

    const rePOL = [/\bsec\b/i, /\bregul\w*/i, /\bpolicy\b/i, /\bladstift\w*/i, /\blag\b/i, /\bmi\s?ca\b/i, /\beu\b/i, /\bsanction\w*/i, /\bskatt\w*/i, /\btax\b/i, /\bparliament\b/i, /\bregering\b/i];

    if (hasAny(text, reBTC)) return "Bitcoin";
    if (hasAny(text, reETH)) return "Ethereum";
    if (hasAny(text, reMEME)) return "Meme Tokens";
    if (hasAny(text, rePOL)) return "Politik";
    return "Allmänt";
  };

  const isTrending = (title: string, summary: string, publishedAt: string, source?: string) => {
    const now = Date.now();
    const ts = new Date(publishedAt).getTime();
    const minutes = Math.max(0, Math.floor((now - ts) / 60000));

    const t = normalize(title);
    const d = normalize(summary);
    const text = `${t} ${d}`;

    const reHot = [/breaking/i, /urgent/i, /just in/i, /flash/i, /rally/i, /plunge/i, /surge/i, /crash/i, /hack/i, /exploit/i, /etf/i, /lawsuit/i, /approved/i, /denied/i, /listing/i, /delist/i, /halving/i];

    const recencyBoost = minutes <= 90; // last 90 minutes
    const hotWords = hasAny(text, reHot);
    const trusted = /cryptopanic|coindesk|cointelegraph|reuters|bloomberg/i.test(source || "");

    return recencyBoost || (hotWords && trusted);
  };

  // Översättningslogik borttagen enligt begäran

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
        const url = `https://${projectRef}.supabase.co/functions/v1/news-aggregator?lang=sv&limit=500`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        const items = (json.articles ?? []) as any[];
        const mapped: NewsArticle[] = items.map((a) => {
          const title = a.title || '';
          const desc = a.description || '';
          const tags = Array.isArray(a.tickers) ? a.tickers : [];
          const category = classifyCategory(title, desc, tags);
          const trending = isTrending(title, desc, a.publishedAt, a.source);
          return {
            id: a.id,
            title: title,
            summary: desc,
            content: desc,
            publishedAt: a.publishedAt,
            category,
            sentiment: 'neutral',
            imageUrl: a.imageUrl || undefined,
            tags,
            trending,
            impact: trending ? 'high' : 'medium',
            source: a.source,
            url: a.url,
            readTime: Math.max(1, Math.round(((desc).split(' ').length) / 200)),
            views: 0,
            author: a.author || a.source || 'Okänd',
          } as NewsArticle;
        });
        if (!active) return;
        setNews(mapped);
        setFilteredNews(mapped);
        const nowMs = Date.now();
        const count24 = mapped.filter(a => (nowMs - new Date(a.publishedAt).getTime()) <= 24 * 60 * 60 * 1000).length;
        setNewsCount24h(count24);
      } catch (e) {
        console.error('Failed to load news', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    
    // Initial load
    load();
    
    // Auto-refresh every 3 minutes
    const interval = setInterval(load, 3 * 60 * 1000);
    
    return () => { 
      active = false; 
      clearInterval(interval);
    };
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
    { id: "Meme Tokens", label: "MEMES" },
    { id: "Politik", label: "POLITIK" },
    { id: "trending", label: "TRENDING" }
  ];

  // Helpers for compact formatting
  const formatNumberCompact = (n?: number | null) => {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 0 }).format(n);
    };
  const formatCurrencyCompact = (n?: number | null) => {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);
  };

  // Derive UI models from centralized intel
  const sentiment = {
    fearGreedIndex: Math.round(intel?.sentiment.fearGreedIndex ?? 0),
    socialVolume: Math.round(intel?.sentiment.socialVolumePct ?? 0),
    newsVolume: Math.round(intel?.sentiment.newsVolumePct ?? 0),
    change24h: Number(((intel?.sentiment.trend24hPct ?? 0)).toFixed(1)),
  };

  const marketDataUI = {
    totalMarketCap: formatCurrencyCompact(intel?.overview.totalMarketCap),
    totalVolume: formatCurrencyCompact(intel?.overview.totalVolume24h),
    btcDominance: Number(((intel?.overview.btcDominance ?? 0)).toFixed(1)),
    ethDominance: Number(((intel?.overview.ethDominance ?? 0)).toFixed(1)),
    activeAddresses: formatNumberCompact(intel?.overview.activeAddresses24h),
    defiTvl: formatCurrencyCompact(intel?.overview.defiTVL),
  };
  const topMoversUI = (intel?.topMovers ?? []).map((m) => ({
    symbol: m.symbol,
    name: m.name,
    logo: m.image || `/src/assets/crypto-logos/${m.symbol.toLowerCase()}.png`,
    change: `${m.change24h >= 0 ? '+' : ''}${(m.change24h ?? 0).toFixed(2)}%`,
    price: m.price !== undefined ? (m.price < 1 ? `$${m.price.toFixed(6)}` : new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(m.price)) : '—',
    isPositive: (m.change24h ?? 0) >= 0,
  }));

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just nu";
    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d sedan`;
    
    return date.toLocaleDateString('sv-SE');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredNews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      
      <main className={`${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-16'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'} max-w-7xl`}>
          {/* Enhanced Mobile-First Header Section */}
          <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
            {!isMobile && (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-8 text-muted-foreground hover:text-primary text-lg group"
              >
                <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Tillbaka till startsidan
              </Button>
            )}
            
            <div className={`${isMobile ? 'text-center' : 'flex flex-col lg:flex-row lg:items-start lg:justify-between'} gap-8`}>
              <div className="flex-1">
                <h1 className={`font-crypto ${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} leading-tight animate-fade-in`}>
                  <span className="text-brand-turquoise">CRY</span>
                  <span className="text-brand-white">PTO</span>
                  <span className="text-brand-white"> NET</span>
                  <span className="text-brand-turquoise">WORK</span>
                  <span className="text-brand-white"> NYHETER</span>
                </h1>
                <p className={`text-muted-foreground font-display ${isMobile ? 'text-sm px-2' : 'text-lg md:text-xl'} leading-relaxed ${isMobile ? 'max-w-sm mx-auto' : 'max-w-3xl'} animate-fade-in`}>
                  Sveriges mest omfattande och aktuella källa för krypto-nyheter, marknadsanalys och branschinsikter. 
                  {!isMobile && "Håll dig uppdaterad med realtidsrapportering från våra experter."}
                </p>
                <div className={`flex ${isMobile ? 'flex-col items-center gap-2 mt-4' : 'flex-col sm:flex-row items-start sm:items-center gap-4 mt-6'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  <div className="flex items-center">
                    <Activity className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2 text-success animate-pulse`} />
                    <span>Live uppdateringar var 3:e minut</span>
                  </div>
                  <div className="flex items-center">
                    <Star className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2 text-warning`} />
                    <span>Expertanalys från branschledare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className={`${isMobile ? 'mb-6 space-y-3' : 'mb-8 space-y-4'}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col lg:flex-row gap-4'}`}>
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <Input
                  placeholder="Sök nyheter, författare eller taggar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isMobile ? 'pl-10 h-10 text-base' : 'pl-12 h-12 text-lg'} bg-secondary/50 border-border focus:border-primary transition-all duration-300 hover:bg-secondary/70 focus:bg-background`}
                />
              </div>
              <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <Button
                  variant="outline"
                  onClick={() => setSortBy(sortBy === "date" ? "impact" : "date")}
                  className={`${isMobile ? 'h-10 px-4 text-sm' : 'h-12 px-6'} hover:bg-primary/10 hover:border-primary/30 transition-all duration-300`}
                >
                  <Clock className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {sortBy === "date" ? "Datum" : "Påverkan"}
                </Button>
                <div className="flex border border-border rounded-lg overflow-hidden bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`${isMobile ? 'h-10 px-3' : 'h-12 px-4'} rounded-none hover:bg-primary/10 transition-all duration-300`}
                  >
                    <Grid3X3 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`${isMobile ? 'h-10 px-3' : 'h-12 px-4'} rounded-none hover:bg-primary/10 transition-all duration-300`}
                  >
                    <List className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className={`${isMobile ? 'mb-6' : 'mb-10'}`}>
            <TabsList className={`${isMobile ? 'grid grid-cols-3 w-full h-10 p-0.5' : 'grid grid-cols-3 lg:grid-cols-6 w-full h-12 p-1'} bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-colors`}>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={`font-orbitron font-black text-foreground ${isMobile ? 'text-xs tracking-wide' : 'text-sm tracking-widest'} data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-3 py-2 transition-all duration-300 hover:text-primary hover:bg-primary/10 rounded-lg`}
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
              {/* Enhanced Breaking News Banner */}
              {news[0] && (
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl shadow-2xl mb-8 animate-fade-in">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                          <Flame className="h-8 w-8 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="flex-1 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-white/30 text-white border-white/50 font-black text-sm px-4 py-1 tracking-wider backdrop-blur-sm">
                            🚨 SENASTE NYTT
                          </Badge>
                          <span className="text-white/80 text-sm font-medium">
                            {formatTimeAgo(news[0].publishedAt)}
                          </span>
                        </div>
                        <h3 className="font-black text-2xl md:text-3xl leading-tight mb-4 text-shadow-lg">
                          {news[0].title}
                        </h3>
                        <p className="text-white/90 text-lg leading-relaxed mb-6 line-clamp-2 font-medium">
                          {news[0].summary}
                        </p>
                        <div className="flex items-center gap-4">
                          {news[0].url && (
                            <Button 
                              className="bg-white text-red-600 hover:bg-white/90 font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                              onClick={() => window.open(news[0].url!, '_blank')}
                            >
                              Läs hela artikeln
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          <div className="text-white/70 text-sm font-medium">
                            Källa: {news[0].source}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Counter & Pagination Info */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-crypto text-2xl font-bold text-primary">
                  {searchQuery ? `SÖKRESULTAT (${filteredNews.length})` : 'ALLA NYHETER'}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Sida {currentPage} av {totalPages} | Visar {currentArticles.length} av {filteredNews.length} artiklar
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
                      {currentArticles.map((article, index) => (
                         <Card 
                           key={article.id} 
                           className="p-5 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card/90 backdrop-blur-sm group cursor-pointer hover-scale"
                           style={{ animationDelay: `${index * 100}ms` }}
                           onClick={() => article.url ? window.open(article.url, '_blank') : undefined}
                         >
                           <div className="space-y-4">
                             {/* Article Image */}
                             <div className="relative overflow-hidden rounded-lg">
                               <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-secondary/20">
                                 {article.imageUrl ? (
                                   <img 
                                     src={article.imageUrl} 
                                     alt={article.title}
                                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                     onError={(e) => {
                                       (e.target as HTMLImageElement).style.display = 'none';
                                       (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                     }}
                                   />
                                 ) : null}
                                 <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm ${article.imageUrl ? 'hidden' : ''}`}>
                                   <div className="text-center">
                                     <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                                       <Bitcoin className="w-8 h-8 text-primary" />
                                     </div>
                                     <p className="text-primary font-crypto font-bold text-sm">CRYPTO NEWS</p>
                                   </div>
                                 </div>
                               </div>
                               
                               {/* Overlay badges */}
                               <div className="absolute top-3 left-3 flex gap-2">
                                 <Badge className={`${getSentimentBadge(article.sentiment)} text-xs px-2 py-1 backdrop-blur-sm`}>
                                   {article.sentiment === 'positive' ? '📈 Positiv' : 
                                    article.sentiment === 'negative' ? '📉 Negativ' : '➡️ Neutral'}
                                 </Badge>
                                 {article.trending && (
                                   <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 animate-pulse backdrop-blur-sm">
                                     🔥 HOT
                                   </Badge>
                                 )}
                               </div>
                               
                               {/* Impact badge */}
                               <div className="absolute top-3 right-3">
                                 <Badge className={`${getImpactBadge(article.impact)} text-xs px-2 py-1 backdrop-blur-sm`}>
                                   {article.impact === 'high' ? '🔥 Hög' : 
                                    article.impact === 'medium' ? '⚡ Medium' : '💭 Låg'}
                                 </Badge>
                               </div>
                             </div>
                             
                             <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                               {article.title}
                             </h3>
                             
                             <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 min-h-[4rem]">
                               {article.summary}
                             </p>

                             <div className="flex flex-wrap gap-1">
                               {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                 <Badge key={tagIndex} variant="secondary" className="text-xs hover:bg-primary/20 transition-colors">
                                   #{tag}
                                 </Badge>
                               ))}
                             </div>
                             
                             <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
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
                                 <span className="truncate max-w-[100px]">{article.author}</span>
                               </div>
                             </div>
                           </div>
                         </Card>
                       ))}
                     </div>
                   )}

                    {/* List View - Mobile Optimized */}
                    {viewMode === "list" && (
                      <div className={`space-y-4 animate-fade-in ${isMobile ? 'px-1' : ''}`}>
                        {currentArticles.map((article, index) => (
                           <Card 
                             key={article.id} 
                             className={`${isMobile ? 'p-3' : 'p-4'} border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card/90 backdrop-blur-sm group cursor-pointer overflow-hidden`}
                             style={{ animationDelay: `${index * 50}ms` }}
                             onClick={() => article.url ? window.open(article.url, '_blank') : undefined}
                           >
                            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4'}`}>
                              {/* Article Image - Mobile Responsive */}
                              {!isMobile && (
                                <div className="flex-shrink-0 w-32 h-24 relative overflow-hidden rounded-lg">
                                  {article.imageUrl ? (
                                    <img 
                                      src={article.imageUrl} 
                                      alt={article.title}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 ${article.imageUrl ? 'hidden' : ''}`}>
                                    <Bitcoin className="w-6 h-6 text-primary" />
                                  </div>
                                </div>
                              )}
                              
                              {/* Mobile Image */}
                              {isMobile && article.imageUrl && (
                                <div className="w-full h-32 relative overflow-hidden rounded-lg">
                                  <img 
                                    src={article.imageUrl} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 space-y-2 min-w-0">
                                {/* Badges - Mobile Optimized */}
                                <div className={`flex items-center gap-1 flex-wrap ${isMobile ? 'justify-start' : ''}`}>
                                  <Badge className={`${getSentimentBadge(article.sentiment)} ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                                    {article.sentiment === 'positive' ? '📈' : 
                                     article.sentiment === 'negative' ? '📉' : '➡️'}
                                  </Badge>
                                  <Badge className={`${getImpactBadge(article.impact)} ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                                    {article.impact === 'high' ? '🔥' : 
                                     article.impact === 'medium' ? '⚡' : '💭'}
                                  </Badge>
                                  <Badge variant="outline" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'} truncate max-w-20`}>
                                    {article.category}
                                  </Badge>
                                  {article.trending && (
                                    <Badge className={`bg-gradient-to-r from-orange-500 to-red-500 text-white ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'} animate-pulse`}>
                                      🔥 HOT
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Title - Mobile Optimized */}
                                <h3 className={`font-display font-bold ${isMobile ? 'text-base leading-tight' : 'text-xl leading-tight'} group-hover:text-primary transition-colors line-clamp-2 break-words`}>
                                  {article.title}
                                </h3>
                                
                                {/* Summary - Mobile Optimized */}
                                <p className={`text-muted-foreground ${isMobile ? 'text-xs leading-normal' : 'text-sm leading-relaxed'} line-clamp-2 break-words`}>
                                  {article.summary}
                                </p>

                                {/* Meta Info - Mobile Layout */}
                                <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}>
                                  <div className={`flex items-center gap-3 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground flex-wrap`}>
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className={`truncate ${isMobile ? 'max-w-[100px]' : 'max-w-[80px]'}`}>{article.author}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="whitespace-nowrap">{formatTimeAgo(article.publishedAt)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="whitespace-nowrap">{article.readTime} min</span>
                                    </div>
                                  </div>
                                  
                                  {/* Read More Button */}
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={`hover:bg-primary hover:text-primary-foreground shrink-0 ${isMobile ? 'w-full mt-2' : ''}`} 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (article.url) window.open(article.url, '_blank'); 
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {isMobile ? 'Läs hela artikeln' : 'Läs mer'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                       ))}
                     </div>
                   )}

                  {/* Pagination Controls */}
                  {filteredNews.length > articlesPerPage && (
                    <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Föregående
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10 h-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-3"
                      >
                        Nästa
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
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

            {/* Sidebar - Hidden on mobile */}
            {!isMobile && (
            <div className="space-y-6">
              {/* Market Sentiment */}
              <Card className="p-6">
                <h3 className="font-crypto text-lg font-bold mb-6 text-primary">MARKNADS-<br />SENTIMENT</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                    <span className="font-bold text-success">{sentiment.fearGreedIndex}/100</span>
                  </div>
                  <Progress value={sentiment.fearGreedIndex} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Social Volym</span>
                    <span className="font-bold">{sentiment.socialVolume}%</span>
                  </div>
                  <Progress value={sentiment.socialVolume} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nyhetsvolym</span>
                    <span className="font-bold">{sentiment.newsVolume}%</span>
                  </div>
                  <Progress value={sentiment.newsVolume} className="h-2" />

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">24h Trend</span>
                      <div className={`flex items-center gap-1 ${
                        sentiment.change24h >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {sentiment.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-bold">{sentiment.change24h >= 0 ? '+' : ''}{sentiment.change24h}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Top Movers */}
              <Card className="p-6">
                <h3 className="font-crypto text-xl font-bold mb-6 text-primary">TOP MOVERS</h3>
                <div className="space-y-4">
                  {topMoversUI.map((token, index) => (
                    <div key={`${token.symbol}-${index}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                          <img 
                            src={token.logo} 
                            alt={token.symbol}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#12E19F\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-weight=\"bold\">${token.symbol.charAt(0)}</text></svg>`)}`;
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
                    <span className="font-mono font-bold">{marketDataUI.totalMarketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">24h Volym</span>
                    <span className="font-mono font-bold">{marketDataUI.totalVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">BTC Dominans</span>
                    <span className="font-mono font-bold">{marketDataUI.btcDominance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">ETH Dominans</span>
                    <span className="font-mono font-bold">{marketDataUI.ethDominance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Aktiva Adresser</span>
                    <span className="font-mono font-bold">{marketDataUI.activeAddresses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">DeFi TVL</span>
                    <span className="font-mono font-bold">{marketDataUI.defiTvl}</span>
                  </div>
                </div>
              </Card>
            </div>
            )}
          </div>
        </div>
      </main>
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default NewsPage;