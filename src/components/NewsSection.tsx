import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Clock, ArrowRight, Bookmark, Share2 } from "lucide-react";

const NewsSection = () => {
  const cryptoNews = [
    {
      id: 1,
      title: "Bitcoin ETF får rekordinflöden från institutionella investerare",
      excerpt: "Spot Bitcoin ETF:er har sett över 2 miljarder dollar i inflöden den senaste veckan, vilket signalerar stark institutionell efterfrågan.",
      category: "Institutionellt",
      time: "2 timmar sedan",
      readTime: "3 min",
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
      trending: true
    },
    {
      id: 2,
      title: "Ethereum staking når nya rekordnivåer inför Shanghai upgrade",
      excerpt: "Över 15 miljoner ETH är nu staket på Ethereum 2.0, vilket representerar nästan 13% av det totala utbudet.",
      category: "DeFi",
      time: "4 timmar sedan", 
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400",
      trending: false
    },
    {
      id: 3,
      title: "Ny EU-reglering MiCA träder i kraft - vad det betyder för svenska användare",
      excerpt: "Markets in Crypto-Assets förordningen kommer att påverka hur kryptotjänster erbjuds i Sverige och resten av EU.",
      category: "Reglering",
      time: "6 timmar sedan",
      readTime: "7 min", 
      image: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400",
      trending: false
    },
    {
      id: 4,
      title: "Solana DeFi ekosystem exploderar med ny rekordvolym",
      excerpt: "Solana-baserade DEX:er processade över 1 miljard dollar i volym förra veckan, driven av meme coin-mani.",
      category: "DeFi",
      time: "8 timmar sedan",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400",
      trending: true
    },
    {
      id: 5,
      title: "Svenska banker börjar erbjuda kryptotjänster till privatkunder",
      excerpt: "Flera svenska storbanker meddelar planer på att erbjuda kryptohandel och förvaring till sina privatkunder under 2024.",
      category: "Adoption",
      time: "12 timmar sedan",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
      trending: false
    },
    {
      id: 6,
      title: "NFT-marknaden ser återhämtning med fokus på verklig nytta",
      excerpt: "NFT-försäljningar ökar för första gången på månader, drivet av projekt med verklig användning snarare än spekulation.",
      category: "NFT",
      time: "1 dag sedan",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400",
      trending: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "Institutionellt": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "DeFi": "bg-purple-500/20 text-purple-400 border-purple-500/30", 
      "Reglering": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Adoption": "bg-green-500/20 text-green-400 border-green-500/30",
      "NFT": "bg-pink-500/20 text-pink-400 border-pink-500/30"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-crypto text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            KRYPTO NYHETER
          </h2>
          <p className="font-display text-xl text-muted-foreground max-w-3xl mx-auto">
            Håll dig uppdaterad med de senaste nyheterna från kryptovärlden. 
            Vi kurerar och översätter de viktigaste händelserna för svenska läsare.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {cryptoNews.slice(0, 2).map((article) => (
                <Card key={article.id} className="overflow-hidden border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 group">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div 
                      className="h-48 md:h-auto bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${article.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
                      {article.trending && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="outline" className={getCategoryColor(article.category)}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground space-x-1">
                            <Clock size={12} />
                            <span>{article.time}</span>
                            <span>•</span>
                            <span>{article.readTime} läsning</span>
                          </div>
                        </div>
                        
                        <h3 className="font-display font-bold text-lg mb-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {article.excerpt}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Läs mer <ArrowRight size={14} className="ml-1" />
                        </Button>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Bookmark size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Stories */}
            <Card className="p-6 border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Newspaper className="h-5 w-5 text-primary" />
                <h3 className="font-crypto font-bold text-primary">TRENDING IDAG</h3>
              </div>
              
              <div className="space-y-4">
                {cryptoNews.slice(2).map((article, index) => (
                  <div key={article.id} className="group cursor-pointer">
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="text-primary font-crypto text-xs mt-1">
                        {index + 3}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className={`${getCategoryColor(article.category)} text-xs mb-1`}>
                          {article.category}
                        </Badge>
                        <h4 className="font-display font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground space-x-1">
                          <Clock size={10} />
                          <span>{article.time}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6 border-border bg-gradient-primary text-primary-foreground">
              <h3 className="font-crypto font-bold text-lg mb-3">
                DAGLIG KRYPTO RAPPORT
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Få de viktigaste kryptonotiserna levererade direkt till din inkorg varje morgon.
              </p>
              <Button variant="outline" className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Prenumerera Gratis
              </Button>
            </Card>

            {/* Market Alert */}
            <Card className="p-6 border-border bg-card/80 backdrop-blur-sm">
              <h3 className="font-crypto font-bold text-primary mb-3">
                MARKNADS ALERT
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-success/10">
                  <span className="text-sm">Bitcoin +5.2%</span>
                  <Badge className="bg-success text-success-foreground text-xs">Bullish</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-destructive/10">
                  <span className="text-sm">Altcoin Index -2.1%</span>
                  <Badge variant="destructive" className="text-xs">Bearish</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;