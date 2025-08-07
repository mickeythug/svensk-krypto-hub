import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  DollarSign,
  BarChart3,
  Volume2,
  Coins,
  Calendar,
  Globe,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";

const CryptoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API
  const cryptoData = {
    bitcoin: {
      name: "Bitcoin",
      symbol: "BTC",
      price: 645000,
      change1h: 0.5,
      change24h: 2.34,
      change7d: 5.12,
      marketCap: "12.5T",
      volume: "28.5B",
      supply: "19.5M",
      maxSupply: "21M",
      rank: 1,
      description: "Bitcoin är den första och mest kända kryptovalutan, skapad av den pseudonyma Satoshi Nakamoto 2009. Den fungerar som ett decentraliserat digitalt betalningssystem utan behov av mellanhand som banker.",
      website: "https://bitcoin.org",
      whitepaper: "https://bitcoin.org/bitcoin.pdf"
    },
    ethereum: {
      name: "Ethereum",
      symbol: "ETH", 
      price: 35000,
      change1h: -0.2,
      change24h: -1.45,
      change7d: 3.21,
      marketCap: "4.2T",
      volume: "15.2B", 
      supply: "120.3M",
      maxSupply: "∞",
      rank: 2,
      description: "Ethereum är en decentraliserad plattform som möjliggör smarta kontrakt och decentraliserade applikationer (DApps). Den introducerade konceptet med programmerbara blockkedjor.",
      website: "https://ethereum.org",
      whitepaper: "https://ethereum.org/en/whitepaper/"
    }
  };

  const crypto = cryptoData[slug as keyof typeof cryptoData];

  useEffect(() => {
    if (!crypto) {
      navigate('/marknad');
      return;
    }

    // Load TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "500",
      symbol: `COINBASE:${crypto.symbol}USD`,
      interval: "D",
      timezone: "Europe/Stockholm",
      theme: "dark",
      style: "1",
      locale: "sv",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_chart"
    });

    const chartContainer = document.getElementById('tradingview_chart');
    if (chartContainer) {
      chartContainer.innerHTML = '';
      chartContainer.appendChild(script);
    }

    return () => {
      if (chartContainer) {
        chartContainer.innerHTML = '';
      }
    };
  }, [crypto, navigate, slug]);

  if (!crypto) {
    return null;
  }

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
          <TrendingUp size={16} />
        ) : (
          <TrendingDown size={16} />
        )}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/marknad')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Tillbaka till Marknadsöversikt
            </Button>
          </div>

          {/* Crypto Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-crypto text-2xl font-bold text-primary">
                  {crypto.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-crypto text-3xl font-bold">{crypto.name}</h1>
                  <Badge variant="outline" className="font-crypto">
                    #{crypto.rank}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-crypto text-lg">{crypto.symbol}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-crypto text-4xl font-bold mb-2">
                {formatPrice(crypto.price)}
              </div>
              <div className="flex items-center gap-4">
                {formatChange(crypto.change1h)}
                {formatChange(crypto.change24h)}
                {formatChange(crypto.change7d)}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Marknadskapital</span>
              </div>
              <div className="font-display font-bold">{crypto.marketCap} SEK</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Volym (24h)</span>
              </div>
              <div className="font-display font-bold">{crypto.volume} SEK</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Cirkulerande</span>
              </div>
              <div className="font-display font-bold">{crypto.supply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Max Utbud</span>
              </div>
              <div className="font-display font-bold">{crypto.maxSupply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">1h Förändring</span>
              </div>
              <div className="font-display font-bold">{formatChange(crypto.change1h)}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">7d Förändring</span>
              </div>
              <div className="font-display font-bold">{formatChange(crypto.change7d)}</div>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6 mb-8 bg-card/80 backdrop-blur-sm">
            <h2 className="font-crypto text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {crypto.name} Kursutveckling
            </h2>
            <div id="tradingview_chart" className="w-full h-[500px] bg-background rounded-lg"></div>
          </Card>

          {/* Description and Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-card/80 backdrop-blur-sm">
              <h3 className="font-crypto text-xl font-bold mb-4">Om {crypto.name}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {crypto.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={crypto.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe size={16} />
                    Officiell Webbplats
                    <ExternalLink size={14} />
                  </a>
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={crypto.whitepaper} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Whitepaper
                    <ExternalLink size={14} />
                  </a>
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm">
              <h3 className="font-crypto text-xl font-bold mb-4">Marknadsstatistik</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Ranking</span>
                  <span className="font-display font-semibold">#{crypto.rank}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Aktuellt Pris</span>
                  <span className="font-display font-semibold">{formatPrice(crypto.price)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">24h Förändring</span>
                  {formatChange(crypto.change24h)}
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">7d Förändring</span>
                  {formatChange(crypto.change7d)}
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Marknadskapital</span>
                  <span className="font-display font-semibold">{crypto.marketCap} SEK</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailPage;