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
  Search,
  ArrowLeft,
  Star,
  BarChart3,
  Globe,
  Flame,
  Calendar
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
  author: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  views: number;
  likes: number;
  comments: number;
  imageUrl?: string;
  readTime: number;
  trending: boolean;
}

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin når nya rekordhöjder över 75,000 dollar",
        summary: "Bitcoin fortsätter sin uppgång efter starkt institutionellt intresse och ETF-inflöden. Experter förutspår fortsatt tillväxt under 2024.",
        author: "Erik Andersson",
        publishedAt: "2024-01-07T10:30:00Z",
        category: "Bitcoin",
        sentiment: "positive",
        views: 45500,
        likes: 1250,
        comments: 189,
        imageUrl: cryptoCharts,
        readTime: 5,
        trending: true
      },
      {
        id: "2",
        title: "Ethereum staking når nya milstolpar",
        summary: "Över 32 miljoner ETH är nu stakade vilket stärker nätverkets säkerhet betydligt. Utvecklingen visar på stark tilltro till plattformen.",
        author: "Anna Björk",
        publishedAt: "2024-01-07T08:15:00Z",
        category: "Ethereum",
        sentiment: "positive",
        views: 28900,
        likes: 820,
        comments: 167,
        imageUrl: hexPattern,
        readTime: 4,
        trending: true
      },
      {
        id: "3",
        title: "Meme-tokens faller efter Musks uttalanden",
        summary: "DOGE och SHIB tappar över 20% efter kritiska kommentarer om spekulation. Marknaden reagerar starkt på social media påverkan.",
        author: "Marcus Lind",
        publishedAt: "2024-01-07T07:45:00Z",
        category: "Meme Tokens",
        sentiment: "negative",
        views: 67800,
        likes: 534,
        comments: 298,
        imageUrl: memeTokens,
        readTime: 3,
        trending: true
      },
      {
        id: "4",
        title: "Sveriges digitala krona närmar sig lansering",
        summary: "Riksbanken rapporterar framsteg i CBDC-utvecklingen med över 100,000 testanvändare. Nationell utrullning planeras för 2025.",
        author: "Sophia Chen",
        publishedAt: "2024-01-07T06:20:00Z",
        category: "CBDC",
        sentiment: "positive",
        views: 19400,
        likes: 678,
        comments: 89,
        imageUrl: cryptoCharts,
        readTime: 6,
        trending: false
      },
      {
        id: "5",
        title: "DeFi-marknaden växer med 40% under månaden",
        summary: "Total Value Locked överstiger 100 miljarder dollar för första gången sedan 2022. Institutionella investerare visar ökande intresse.",
        author: "David Kim",
        publishedAt: "2024-01-07T05:30:00Z",
        category: "DeFi",
        sentiment: "positive",
        views: 15600,
        likes: 445,
        comments: 67,
        imageUrl: hexPattern,
        readTime: 4,
        trending: false
      }
    ];
    setNews(mockNews);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Bitcoin", "Ethereum", "Meme Tokens", "CBDC", "DeFi"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Simple Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till startsidan
            </Button>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span style={{ color: '#12E19F' }}>CRY</span>
                <span className="text-white">PTO</span>
                <span className="text-white"> </span>
                <span className="text-white">NET</span>
                <span style={{ color: '#12E19F' }}>WORK</span>
                <span className="text-white"> NYHETER</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Håll dig uppdaterad med de senaste nyheterna från krypto-världen
              </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Sök nyheter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          {/* Market Stats - Simple */}
          <Card className="mb-8 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Marknadsöversikt
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">68%</div>
                <div className="text-sm text-muted-foreground">Marknadssentiment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.1T</div>
                <div className="text-sm text-muted-foreground">Total Market Cap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">72</div>
                <div className="text-sm text-muted-foreground">Fear & Greed Index</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">52%</div>
                <div className="text-sm text-muted-foreground">BTC Dominans</div>
              </div>
            </div>
          </Card>

          {/* Category Tabs - Clean */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm"
                >
                  {category === "all" ? "Alla" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* News Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main News */}
            <div className="lg:col-span-2">
              
              {/* Trending Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-orange-500" />
                  Trending Nyheter
                </h2>
                
                {/* Featured Article */}
                {filteredNews.filter(article => article.trending)[0] && (
                  <Card className="mb-6 overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img 
                          src={filteredNews.filter(article => article.trending)[0].imageUrl} 
                          alt={filteredNews.filter(article => article.trending)[0].title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Trending
                          </Badge>
                          <Badge className={getSentimentBadge(filteredNews.filter(article => article.trending)[0].sentiment)}>
                            {filteredNews.filter(article => article.trending)[0].sentiment === 'positive' ? 'Positiv' : 
                             filteredNews.filter(article => article.trending)[0].sentiment === 'negative' ? 'Negativ' : 'Neutral'}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-3">
                          {filteredNews.filter(article => article.trending)[0].title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {filteredNews.filter(article => article.trending)[0].summary}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>{filteredNews.filter(article => article.trending)[0].author}</span>
                            <span>•</span>
                            <span>{filteredNews.filter(article => article.trending)[0].readTime} min</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {(filteredNews.filter(article => article.trending)[0].views / 1000).toFixed(0)}k
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {filteredNews.filter(article => article.trending)[0].likes}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* All News List */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Senaste Nyheter</h2>
                <div className="space-y-4">
                  {filteredNews.map((article) => (
                    <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                              {article.sentiment === 'positive' ? '↗' : 
                               article.sentiment === 'negative' ? '↘' : '→'}
                            </span>
                            {article.trending && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-base mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>{article.author}</span>
                              <span>•</span>
                              <span>{article.readTime} min</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {(article.views / 1000).toFixed(0)}k
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
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
            </div>

            {/* Sidebar */}
            <div>
              
              {/* Market Movers */}
              <Card className="p-4 mb-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  Dagens Vinnare
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "BTC", change: "+5.2%", price: "645,000 SEK" },
                    { name: "ETH", change: "+3.8%", price: "35,000 SEK" },
                    { name: "BNB", change: "+2.1%", price: "3,200 SEK" }
                  ].map((token, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">{token.price}</div>
                      </div>
                      <div className="text-green-500 font-semibold">
                        {token.change}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Newsletter */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Få Dagliga Nyheter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prenumerera på vårt nyhetsbrev för de viktigaste krypto-nyheterna.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Din e-postadress" />
                  <Button className="w-full">
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