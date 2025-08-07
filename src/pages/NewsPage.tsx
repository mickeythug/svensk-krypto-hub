import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

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
}

interface MarketSentiment {
  overall: number;
  fearGreedIndex: number;
  socialVolume: number;
  newsVolume: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: 68,
    fearGreedIndex: 72,
    socialVolume: 85,
    newsVolume: 76,
    trend: 'bullish'
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Mock news data
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin når nya rekordhöjder efter ETF-godkännande",
        summary: "Bitcoin stiger över $70,000 efter att fler institutionella investerare visar intresse för kryptovalutor.",
        content: "Detaljerad artikel om Bitcoin's prisökning...",
        author: "Erik Andersson",
        publishedAt: "2024-01-07T10:30:00Z",
        category: "Bitcoin",
        sentiment: "positive",
        views: 12500,
        likes: 450,
        comments: 89,
        imageUrl: "/crypto-charts.jpg",
        tags: ["Bitcoin", "ETF", "Institutionella", "Rekord"],
        trending: true,
        impact: "high"
      },
      {
        id: "2",
        title: "Ethereum 2.0 staking når 32 miljoner ETH",
        summary: "Milestone för Ethereum-nätverket när fler användare väljer att stake sina tokens.",
        content: "Fullständig analys av Ethereum staking...",
        author: "Anna Björk",
        publishedAt: "2024-01-07T08:15:00Z",
        category: "Ethereum",
        sentiment: "positive",
        views: 8900,
        likes: 320,
        comments: 67,
        tags: ["Ethereum", "Staking", "ETH2.0", "Milestone"],
        trending: true,
        impact: "medium"
      },
      {
        id: "3",
        title: "DOGE och SHIB rasar efter Elon Musks tweet",
        summary: "Meme-tokens påverkas kraftigt av sociala medier sentiment.",
        content: "Analys av meme token volatilitet...",
        author: "Marcus Lind",
        publishedAt: "2024-01-07T07:45:00Z",
        category: "Meme Tokens",
        sentiment: "negative",
        views: 15600,
        likes: 234,
        comments: 156,
        tags: ["DOGE", "SHIB", "Meme", "Volatilitet"],
        trending: true,
        impact: "medium"
      },
      {
        id: "4",
        title: "Sveriges CBDC-pilot visar lovande resultat",
        summary: "Riksbanken rapporterar positiva tester av digital krona.",
        content: "Detaljerad rapport om CBDC utveckling...",
        author: "Sophia Chen",
        publishedAt: "2024-01-07T06:20:00Z",
        category: "CBDC",
        sentiment: "positive",
        views: 5400,
        likes: 178,
        comments: 34,
        tags: ["Sverige", "CBDC", "Riksbank", "Digital"],
        trending: false,
        impact: "high"
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
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Bitcoin", "Ethereum", "Meme Tokens", "CBDC", "DeFi", "NFT"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till startsidan
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="font-crypto text-4xl md:text-5xl font-bold mb-2">
                  <span style={{ color: '#12E19F' }}>CRY</span>
                  <span className="text-white">PTO</span>
                  <span className="text-white"> </span>
                  <span className="text-white">NET</span>
                  <span style={{ color: '#12E19F' }}>WORK</span>
                  <span className="text-white"> NYHETER</span>
                </h1>
                <p className="text-muted-foreground font-display text-lg">
                  Sveriges mest omfattande källa för krypto-nyheter och marknadsanalys
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Sök nyheter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Market Sentiment Dashboard */}
          <Card className="mb-8 p-6 bg-gradient-secondary border-border">
            <h2 className="font-crypto text-xl font-bold mb-4 text-primary">
              MARKNADS SENTIMENT
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5 text-success mr-2" />
                  <span className="font-display font-semibold">Overall</span>
                </div>
                <div className="text-2xl font-bold text-success">{marketSentiment.overall}%</div>
                <div className="text-sm text-muted-foreground">Bullish</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="h-5 w-5 text-warning mr-2" />
                  <span className="font-display font-semibold">Fear & Greed</span>
                </div>
                <div className="text-2xl font-bold text-warning">{marketSentiment.fearGreedIndex}</div>
                <div className="text-sm text-muted-foreground">Greed</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="h-5 w-5 text-primary mr-2" />
                  <span className="font-display font-semibold">Social Volym</span>
                </div>
                <div className="text-2xl font-bold text-primary">{marketSentiment.socialVolume}%</div>
                <div className="text-sm text-muted-foreground">Hög aktivitet</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-accent mr-2" />
                  <span className="font-display font-semibold">Nyhets Volym</span>
                </div>
                <div className="text-2xl font-bold text-accent">{marketSentiment.newsVolume}%</div>
                <div className="text-sm text-muted-foreground">Mycket hög</div>
              </div>
            </div>
          </Card>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full bg-secondary/50">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="font-display font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category === "all" ? "Alla" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* News Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trending News */}
              <div>
                <div className="flex items-center mb-4">
                  <Flame className="h-6 w-6 text-destructive mr-2" />
                  <h2 className="font-crypto text-xl font-bold text-primary">TRENDING NYHETER</h2>
                </div>
                
                <div className="space-y-4">
                  {filteredNews
                    .filter(article => article.trending)
                    .slice(0, 3)
                    .map((article) => (
                    <Card key={article.id} className="p-6 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-secondary">
                      <div className="flex flex-col md:flex-row gap-4">
                        {article.imageUrl && (
                          <div className="md:w-48 h-32 bg-secondary/50 rounded-lg flex-shrink-0"></div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSentimentBadge(article.sentiment)}>
                                {article.sentiment === 'positive' ? 'Positiv' : 
                                 article.sentiment === 'negative' ? 'Negativ' : 'Neutral'}
                              </Badge>
                              <Badge className={getImpactBadge(article.impact)}>
                                {article.impact === 'high' ? 'Hög påverkan' : 
                                 article.impact === 'medium' ? 'Medium påverkan' : 'Låg påverkan'}
                              </Badge>
                              <Badge variant="outline" className="border-primary text-primary">
                                {article.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <h3 className="font-display font-bold text-lg mb-2 hover:text-primary cursor-pointer transition-colors">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span>{article.author}</span>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(article.publishedAt).toLocaleDateString('sv-SE')}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {article.views.toLocaleString()}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {article.likes}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {article.comments}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All News */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-crypto text-xl font-bold text-primary">SENASTE NYHETER</h2>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Sortera efter datum
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {filteredNews.map((article) => (
                    <Card key={article.id} className="p-4 border-border hover:border-primary/50 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-primary text-primary text-xs">
                              {article.category}
                            </Badge>
                            <span className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                              {article.sentiment === 'positive' ? '↗' : 
                               article.sentiment === 'negative' ? '↘' : '→'}
                            </span>
                          </div>
                          
                          <h3 className="font-display font-semibold mb-1 hover:text-primary cursor-pointer transition-colors">
                            {article.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{article.author}</span>
                            <div className="flex items-center gap-3">
                              <span>{new Date(article.publishedAt).toLocaleDateString('sv-SE')}</span>
                              <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                <span>{article.views.toLocaleString()}</span>
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

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-4 bg-gradient-secondary border-border">
                <h3 className="font-crypto font-bold mb-4 text-primary">MARKNADS STATISTIK</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bitcoin Dominance</span>
                    <span className="font-semibold text-primary">52.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Market Cap</span>
                    <span className="font-semibold text-success">$2.1T</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">24h Volume</span>
                    <span className="font-semibold text-warning">$89.5B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Addresses</span>
                    <span className="font-semibold text-accent">1.2M</span>
                  </div>
                </div>
              </Card>

              {/* Top Movers */}
              <Card className="p-4 border-border">
                <h3 className="font-crypto font-bold mb-4 text-primary">DAGENS VINNARE</h3>
                <div className="space-y-3">
                  {[
                    { name: "SHIB", change: "+23.45%", price: "0.000025 SEK" },
                    { name: "DOGE", change: "+18.92%", price: "0.95 SEK" },
                    { name: "PEPE", change: "+15.67%", price: "0.000012 SEK" }
                  ].map((token, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm">{token.name}</div>
                        <div className="text-xs text-muted-foreground">{token.price}</div>
                      </div>
                      <div className="text-success font-semibold">
                        {token.change}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Newsletter Signup */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-crypto font-bold mb-2 text-primary">PRENUMERERA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Få dagliga nyhetsuppdateringar direkt i din inkorg
                </p>
                <div className="space-y-2">
                  <Input placeholder="Din e-postadress" className="bg-background" />
                  <Button className="w-full bg-gradient-primary">
                    Prenumerera
                  </Button>
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