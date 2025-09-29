import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Search, Filter, Calendar, Zap, BarChart3, Globe, Flame, Bitcoin, DollarSign, ArrowLeft, ArrowRight, Star, Bookmark, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Activity, Grid3X3, List, Clock, User, ExternalLink, BookOpen, Eye } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import { useNavigate } from "react-router-dom";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import { useIsMobile } from "@/hooks/use-mobile";
import LiveNewsMonitor from "@/components/LiveNewsMonitor";
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
  const {
    data: intel
  } = useMarketIntel(newsCount24h);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "impact" | "trending">("date");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 20;

  // Smart zero-cost categorization helpers
  const normalize = (s: string = "") => s.toLowerCase();
  const hasAny = (s: string, patterns: RegExp[]) => patterns.some(re => re.test(s));
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
    return recencyBoost || hotWords && trusted;
  };

  // SEO Setup
  useEffect(() => {
    document.title = 'Crypto News - Latest News';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Stay updated with the latest news from the crypto world');
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://velo.se/news');
    }
  }, []);
  useEffect(() => {
    let active = true;

    // 1) Seed immediately from cache to avoid any loading flashes
    try {
      const raw = localStorage.getItem('news-cache-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Accept cache up to 5 minutes old
        if (Date.now() - (parsed.ts || 0) <= 5 * 60 * 1000) {
          const cachedNews: NewsArticle[] = parsed.data ?? [];
          if (cachedNews.length) {
            setNews(cachedNews);
            setFilteredNews(cachedNews);
            const nowMs = Date.now();
            const count24 = cachedNews.filter(a => nowMs - new Date(a.publishedAt).getTime() <= 24 * 60 * 60 * 1000).length;
            setNewsCount24h(count24);
            setIsLoading(false);
          }
        }
      }
    } catch {}
    const load = async () => {
      try {
        setIsLoading(prev => prev && news.length === 0); // only show loading if nothing to show yet
        const projectRef = "jcllcrvomxdrhtkqpcbr";
        const url = `https://${projectRef}.supabase.co/functions/v1/news-aggregator?lang=sv&limit=500`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        const json = await res.json();
        const items = (json.articles ?? []) as any[];
        const mapped: NewsArticle[] = items.map(a => {
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
            readTime: Math.max(1, Math.round(desc.split(' ').length / 200)),
            views: 0,
            author: a.author || a.source || 'Unknown'
          } as NewsArticle;
        });
        if (!active) return;
        setNews(mapped);
        setFilteredNews(mapped);
        const nowMs = Date.now();
        const count24 = mapped.filter(a => nowMs - new Date(a.publishedAt).getTime() <= 24 * 60 * 60 * 1000).length;
        setNewsCount24h(count24);
        try {
          localStorage.setItem('news-cache-v1', JSON.stringify({
            ts: Date.now(),
            data: mapped
          }));
        } catch {}
      } catch (e) {
        console.error('Failed to load news', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    // Initial load from network (will update cache and UI)
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
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.summary.toLowerCase().includes(searchQuery.toLowerCase()) || article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || article.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory || selectedCategory === "trending" && article.trending;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "impact":
        filtered.sort((a, b) => {
          const impactOrder = {
            high: 3,
            medium: 2,
            low: 1
          };
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
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-warning';
    }
  };
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success/20 text-success border-success/30';
      case 'negative':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-warning/20 text-warning border-warning/30';
    }
  };
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };
  const categories = [{
    id: "all",
    label: 'All'
  }, {
    id: "Bitcoin",
    label: 'Bitcoin'
  }, {
    id: "Ethereum",
    label: 'Ethereum'
  }, {
    id: "Meme Tokens",
    label: 'Meme Tokens'
  }, {
    id: "Politik",
    label: 'Politics'
  }, {
    id: "trending",
    label: 'Trending'
  }];

  // Helpers for compact formatting
  const formatNumberCompact = (n?: number | null) => {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(n);
  };
  const formatCurrencyCompact = (n?: number | null) => {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(n);
  };

  // Derive UI models from centralized intel
  const sentiment = {
    fearGreedIndex: Math.round(intel?.sentiment.fearGreedIndex ?? 0),
    socialVolume: Math.round(intel?.sentiment.socialVolumePct ?? 0),
    newsVolume: Math.round(intel?.sentiment.newsVolumePct ?? 0),
    change24h: Number((intel?.sentiment.trend24hPct ?? 0).toFixed(1))
  };
  const marketDataUI = {
    totalMarketCap: formatCurrencyCompact(intel?.overview.totalMarketCap),
    totalVolume: formatCurrencyCompact(intel?.overview.totalVolume24h),
    btcDominance: Number((intel?.overview.btcDominance ?? 0).toFixed(1)),
    ethDominance: Number((intel?.overview.ethDominance ?? 0).toFixed(1)),
    activeAddresses: formatNumberCompact(intel?.overview.activeAddresses24h),
    defiTvl: formatCurrencyCompact(intel?.overview.defiTVL)
  };
  const topMoversUI = (intel?.topMovers ?? []).map(m => ({
    symbol: m.symbol,
    name: m.name,
    logo: m.image || `/src/assets/crypto-logos/${m.symbol.toLowerCase()}.png`,
    change: `${m.change24h >= 0 ? '+' : ''}${(m.change24h ?? 0).toFixed(2)}%`,
    price: m.price !== undefined ? m.price < 1 ? `$${m.price.toFixed(6)}` : new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(m.price) : '—',
    isPositive: (m.change24h ?? 0) >= 0
  }));
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
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
  return <div className="min-h-screen bg-background">
      {/* Live News Monitor - Desktop Only */}
      {!isMobile && <LiveNewsMonitor />}
      
      <main className={`${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-16 pl-96'}`}>
        <div className={`${isMobile ? 'px-3' : 'w-full pr-4 pl-8'}`}>
          {/* Enhanced Mobile-First Header Section */}
          <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
            {!isMobile && <Button variant="ghost" onClick={() => navigate('/')} className="mb-8 text-muted-foreground hover:text-primary text-lg group">
                 <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Homepage
              </Button>}
            
            <div className={`${isMobile ? 'text-center' : 'flex flex-col lg:flex-row lg:items-start lg:justify-between'} gap-8`}>
              <div className="flex-1">
                <h1 className={`${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} leading-tight animate-fade-in font-orbitron tracking-wider`}>
                  <span className="text-white">CRY</span><span className="text-[#12E19F]">PTO</span><span className="text-white"> NE</span><span className="text-[#12E19F]">TWO</span><span className="text-white">RK </span><span className="text-[#12E19F]">NYH</span><span className="text-white">ETE</span><span className="text-[#12E19F]">R</span>
                </h1>
                <p className={`text-muted-foreground font-display ${isMobile ? 'text-sm px-2' : 'text-lg md:text-xl'} leading-relaxed ${isMobile ? 'max-w-sm mx-auto' : 'max-w-3xl'} animate-fade-in`}>
                  Stay updated with the latest news from the crypto world
                  {!isMobile && ` and market insights`}
                </p>
                <div className={`flex ${isMobile ? 'flex-col items-center gap-2 mt-4' : 'flex-col sm:flex-row items-start sm:items-center gap-4 mt-6'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  <div className="flex items-center">
                    
                    
                  </div>
                  <div className="flex items-center">
                    
                    
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
                <Input placeholder={isMobile ? 'Search news...' : 'Search news, topics, or cryptocurrencies...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${isMobile ? 'pl-10 h-10 text-base' : 'pl-12 h-12 text-lg'} bg-secondary/50 border-border focus:border-primary transition-all duration-300 hover:bg-secondary/70 focus:bg-background`} />
              </div>
              {!isMobile && <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSortBy(sortBy === "date" ? "impact" : "date")} className="h-12 px-6 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
                    <Clock className="mr-2 h-4 w-4" />
                    {sortBy === "date" ? 'Sort by Date' : 'Sort by Impact'}
                  </Button>
                  <div className="flex border border-border rounded-lg overflow-hidden bg-secondary/50 hover:bg-secondary/70 transition-colors">
                    <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-12 px-4 rounded-none hover:bg-primary/10 transition-all duration-300">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-12 px-4 rounded-none hover:bg-primary/10 transition-all duration-300">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>}
            </div>

            {/* Enhanced Mobile Categories */}
            <div className={`${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
              <div className={`flex ${isMobile ? 'gap-2 pb-1' : 'gap-3 flex-wrap'} ${isMobile ? 'min-w-max' : ''}`}>
                {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size={isMobile ? "sm" : "default"} onClick={() => setSelectedCategory(category.id)} className={`${isMobile ? 'text-xs px-3 py-2' : 'px-4 py-2'} transition-all duration-300 hover:scale-105 ${selectedCategory === category.id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/10 hover:border-primary/30'}`}>
                    {category.label}
                  </Button>)}
                {isMobile && <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "date" ? "impact" : "date")} className="text-xs px-3 py-2 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
                    <Clock className="mr-1 h-3 w-3" />
                    Sort
                  </Button>}
              </div>
            </div>
          </div>

          {/* News Content */}
          {isLoading && news.length === 0 ? <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading latest news...</p>
              </div>
            </div> : filteredNews.length === 0 ? <Card className={`${isMobile ? 'p-8' : 'p-16'} text-center border-border/50`}>
              <BookOpen className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-muted-foreground mx-auto mb-4`} />
              <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>No news found</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''} max-w-md mx-auto`}>
                No news articles match your current filters. Try adjusting your search or category selection.
              </p>
            </Card> : <>
                {/* Enhanced News Grid/List */}
                <div className={viewMode === "grid" ? isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {currentArticles.map(article => {
                    const isGridView = viewMode === "grid";
                    return <Card key={article.id} className={`group relative overflow-hidden transition-all duration-300 hover:shadow-glow-secondary hover:scale-[1.02] cursor-pointer bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 ${isGridView && !isMobile ? 'h-full' : ''}`} onClick={() => article.url && window.open(article.url, '_blank')}>
                        {/* Trending Badge */}
                        {article.trending && <Badge className="absolute top-3 right-3 z-10 bg-destructive/20 text-destructive border-destructive/30 text-xs px-2 py-1">
                            <Flame className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>}

                        <div className={`${isGridView && !isMobile ? 'p-4' : isMobile ? 'p-4' : 'p-6'} ${isGridView ? 'flex flex-col h-full' : 'flex gap-4'}`}>
                          {/* Article Image */}
                          {article.imageUrl && <div className={`${isGridView ? 'w-full h-48 mb-4' : isMobile ? 'w-20 h-16' : 'w-32 h-24'} rounded-lg overflow-hidden bg-muted flex-shrink-0`}>
                              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => {
                              e.currentTarget.style.display = 'none';
                            }} />
                            </div>}

                          {/* Article Content */}
                          <div className={`flex-1 ${isGridView ? '' : 'min-w-0'}`}>
                            {/* Article Meta */}
                            <div className={`flex items-center ${isGridView ? 'justify-between' : 'gap-3'} mb-2 text-xs text-muted-foreground`}>
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span className="truncate">{article.source}</span>
                              </div>
                              {!isGridView && <Badge variant="outline" className={getImpactBadge(article.impact)}>
                                  {article.impact}
                                </Badge>}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(article.publishedAt)}</span>
                              </div>
                            </div>

                            {/* Article Title */}
                            <h3 className={`font-semibold ${isMobile ? 'text-sm' : isGridView ? 'text-base' : 'text-lg'} leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-3`}>
                              {article.title}
                            </h3>

                            {/* Article Summary */}
                            {(!isMobile || isGridView) && <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed ${isGridView ? 'line-clamp-3 flex-1' : 'line-clamp-2'} mb-3`}>
                                {article.summary}
                              </p>}

                            {/* Article Tags and Actions */}
                            <div className={`flex items-center ${isGridView ? 'justify-between mt-auto' : 'gap-4'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {article.category && <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-xs'} bg-primary/10 text-primary border-primary/30`}>
                                    {article.category}
                                  </Badge>}
                                <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                  {article.readTime} min read
                                </span>
                              </div>
                              
                              {!isMobile && <div className="flex items-center gap-3 text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-xs">{formatNumberCompact(article.views)}</span>
                                  </div>
                                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>}
                            </div>
                          </div>
                        </div>
                      </Card>;
                  })}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && <div className={`${isMobile ? 'mt-8' : 'mt-12'} flex justify-center`}>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`${isMobile ? 'h-8 w-8 p-0' : 'h-10 px-3'} transition-all duration-300 hover:bg-primary/10 hover:border-primary/30`}>
                        <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                        {!isMobile && <span className="ml-1">Previous</span>}
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({
                        length: Math.min(5, totalPages)
                      }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        return <Button key={page} variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className={`${isMobile ? 'h-8 w-8 p-0 text-xs' : 'h-10 px-3'} transition-all duration-300 ${currentPage === page ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/10 hover:border-primary/30'}`}>
                            {page}
                          </Button>;
                      })}
                      </div>
                      
                      <Button variant="outline" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`${isMobile ? 'h-8 w-8 p-0' : 'h-10 px-3'} transition-all duration-300 hover:bg-primary/10 hover:border-primary/30`}>
                        {!isMobile && <span className="mr-1">Next</span>}
                        <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                      </Button>
                    </div>
                  </div>}
              </>}
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && <MobileBottomNavigation />}
    </div>;
};

export default NewsPage;