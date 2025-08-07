
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
  Calendar,
  Activity,
  AlertCircle,
  Zap
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
  readTime: number;
  trending: boolean;
  minutesAgo: number;
}

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin når nya rekordhöjder över 75,000 dollar",
        summary: "Bitcoin fortsätter sin uppgång efter starkt institutionellt intresse och ETF-inflöden. Experter förutspår fortsatt tillväxt under 2024.",
        content: "Bitcoin har brutit nya rekord och handlas nu över 75,000 dollar för första gången i sin historia. Detta kommer efter flera veckor av intensiva inflöden till Bitcoin ETF:er från institutionella investerare. Analyser visar att över 2.3 miljarder dollar har flödat in i Bitcoin ETF:er bara den senaste veckan. Experter menar att detta är början på en ny bull run som kan ta Bitcoin till över 100,000 dollar innan årsskiftet. Institutionella investerare som tidigare var skeptiska till krypto visar nu stort intresse, vilket skapar en stark grund för fortsatt tillväxt.",
        author: "Erik Andersson",
        publishedAt: "2024-01-07T10:30:00Z",
        category: "Bitcoin",
        sentiment: "positive",
        views: 45500,
        likes: 1250,
        comments: 189,
        imageUrl: cryptoCharts,
        readTime: 5,
        trending: true,
        minutesAgo: 2
      },
      {
        id: "2",
        title: "Ethereum staking når nya milstolpar",
        summary: "Över 32 miljoner ETH är nu stakade vilket stärker nätverkets säkerhet betydligt.",
        content: "Ethereum-nätverket har nått en historisk milstolpe med över 32 miljoner ETH nu stakade på Ethereum 2.0. Detta representerar nästan 27% av det totala ETH-utbudet och visar på stark tilltro till plattformen. Staking-belöningarna har lockat både institutionella och privata investerare. Utvecklingen stärker nätverkets säkerhet och minskar samtidigt det cirkulerande utbudet, vilket kan ha positiva effekter på priset.",
        author: "Anna Björk",
        publishedAt: "2024-01-07T08:15:00Z",
        category: "Ethereum",
        sentiment: "positive",
        views: 28900,
        likes: 820,
        comments: 167,
        imageUrl: hexPattern,
        readTime: 4,
        trending: true,
        minutesAgo: 15
      },
      {
        id: "3",
        title: "Meme-tokens faller efter Musks uttalanden",
        summary: "DOGE och SHIB tappar över 20% efter kritiska kommentarer om spekulation.",
        content: "Meme-tokens som DOGE och SHIB har fallit kraftigt efter att Elon Musk kritiserat den spekulativa naturen hos dessa tokens. I ett tweet varnade han för riskerna med att investera baserat på sociala medier-hype. DOGE föll 23% och SHIB tappade 21% inom några timmar efter uttalandet. Detta visar hur känslig meme-token marknaden är för uttalanden från inflytelserika personer.",
        author: "Marcus Lind",
        publishedAt: "2024-01-07T07:45:00Z",
        category: "Meme Tokens",
        sentiment: "negative",
        views: 67800,
        likes: 534,
        comments: 298,
        imageUrl: memeTokens,
        readTime: 3,
        trending: true,
        minutesAgo: 30
      },
      {
        id: "4",
        title: "DeFi-marknaden växer med 40% under månaden",
        summary: "Total Value Locked överstiger 100 miljarder dollar för första gången sedan 2022.",
        content: "DeFi-marknaden har sett explosiv tillväxt med Total Value Locked (TVL) som nu överstiger 100 miljarder dollar. Detta är den högsta nivån sedan slutet av 2022. Tillväxten drivs av nya innovativa protokoll och ökad institutionell adoption. Uniswap, Aave och Compound leder utvecklingen med betydande volymökningar. Experter ser detta som tecken på att DeFi är på väg att bli mainstream.",
        author: "David Kim",
        publishedAt: "2024-01-07T05:30:00Z",
        category: "DeFi",
        sentiment: "positive",
        views: 15600,
        likes: 445,
        comments: 67,
        imageUrl: hexPattern,
        readTime: 4,
        trending: false,
        minutesAgo: 45
      },
      {
        id: "5",
        title: "Nya AI-tokens lanseras på Ethereum",
        summary: "Artificiell intelligens möter blockchain i nya innovativa projekt som får stor uppmärksamhet.",
        content: "En ny våg av AI-relaterade tokens har lanserats på Ethereum, vilket kombinerar artificiell intelligens med blockchain-teknologi. Dessa projekt fokuserar på att skapa decentraliserade AI-nätverk där användare kan bidra med beräkningskraft och bli belönade med tokens. Investerare visar stort intresse för denna sektor som kan revolutionera både AI och krypto-industrin.",
        author: "Sofia Chen",
        publishedAt: "2024-01-07T04:15:00Z",
        category: "AI & Tech",
        sentiment: "positive",
        views: 12300,
        likes: 324,
        comments: 89,
        imageUrl: cryptoCharts,
        readTime: 6,
        trending: false,
        minutesAgo: 60
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

  const getTimeAgo = (minutesAgo: number) => {
    if (minutesAgo < 60) {
      return `${minutesAgo} min sedan`;
    } else {
      const hours = Math.floor(minutesAgo / 60);
      return `${hours} timmar sedan`;
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Bitcoin", "Ethereum", "Meme Tokens", "DeFi", "AI & Tech"];

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={handleBackToList}
              className="mb-6 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till nyheter
            </Button>
            
            <article className="prose prose-lg max-w-none">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
              />
              
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getSentimentBadge(selectedArticle.sentiment)}>
                  {selectedArticle.sentiment === 'positive' ? 'Positiv' : 
                   selectedArticle.sentiment === 'negative' ? 'Negativ' : 'Neutral'}
                </Badge>
                <Badge variant="outline">{selectedArticle.category}</Badge>
                {selectedArticle.trending && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    Trending
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {selectedArticle.title}
              </h1>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-4">
                  <span>{selectedArticle.author}</span>
                  <span>•</span>
                  <span>{getTimeAgo(selectedArticle.minutesAgo)}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime} min läsning</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {(selectedArticle.views / 1000).toFixed(0)}k
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {selectedArticle.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {selectedArticle.comments}
                  </div>
                </div>
              </div>
              
              <div className="text-xl text-muted-foreground mb-6 font-medium">
                {selectedArticle.summary}
              </div>
              
              <div className="text-foreground leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>
            </article>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header */}
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
                <span style={{ color: '#12E19F' }}>CRYPTO</span>
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

          {/* Market Sentiment Dashboard */}
          <Card className="mb-8 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Detaljerad Marknadssentiment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">68</div>
                <div className="text-sm text-muted-foreground mb-1">Fear & Greed Index</div>
                <Badge className="bg-green-100 text-green-800">Gierighet</Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">78%</div>
                <div className="text-sm text-muted-foreground mb-1">Alt Season Index</div>
                <Badge className="bg-orange-100 text-orange-800">Alt Season</Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">$2.1T</div>
                <div className="text-sm text-muted-foreground mb-1">Total Market Cap</div>
                <Badge variant="outline">+5.2% 24h</Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">52%</div>
                <div className="text-sm text-muted-foreground mb-1">BTC Dominans</div>
                <Badge variant="outline">-0.8% 24h</Badge>
              </div>
            </div>
          </Card>

          {/* Real-time News Alert */}
          <Card className="mb-8 p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-orange-500 mr-2" />
              <span className="font-semibold text-orange-800">LIVE: </span>
              <span className="text-orange-700">Bitcoin stiger 3.2% på 15 minuter efter ETF-nyheter</span>
              <Badge className="ml-2 bg-red-100 text-red-800">🔴 LIVE</Badge>
            </div>
          </Card>

          {/* Category Tabs */}
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
                  <Card 
                    className="mb-6 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleArticleClick(filteredNews.filter(article => article.trending)[0])}
                  >
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
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            🔴 LIVE - {getTimeAgo(filteredNews.filter(article => article.trending)[0].minutesAgo)}
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

              {/* Live News Feed */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-red-500" />
                  Live Nyhetsflöde
                </h2>
                <div className="space-y-4">
                  {filteredNews
                    .sort((a, b) => a.minutesAgo - b.minutesAgo)
                    .map((article) => (
                    <Card 
                      key={article.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="flex gap-4">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className={`text-xs ${article.minutesAgo <= 5 ? 'bg-red-100 text-red-800' : 
                                         article.minutesAgo <= 30 ? 'bg-orange-100 text-orange-800' : 
                                         'bg-gray-100 text-gray-800'}`}
                            >
                              {article.minutesAgo <= 5 ? '🔴 LIVE' : ''} {getTimeAgo(article.minutesAgo)}
                            </Badge>
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
              
              {/* Market Analysis */}
              <Card className="p-4 mb-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                  Marknadsanalys
                </h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-700">Bullish Signal</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Institutionella inflöden driver marknaden uppåt
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold text-orange-700">Bevaka</span>
                    </div>
                    <p className="text-sm text-orange-600">
                      Regulatoriska beslut kan påverka volatiliteten
                    </p>
                  </div>
                </div>
              </Card>

              {/* Top Gainers */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  Största Vinnare 24h
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "BTC", change: "+5.2%", price: "645,000 SEK" },
                    { name: "ETH", change: "+3.8%", price: "35,000 SEK" },
                    { name: "SOL", change: "+7.1%", price: "1,100 SEK" },
                    { name: "ADA", change: "+4.5%", price: "4.2 SEK" }
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsPage;
