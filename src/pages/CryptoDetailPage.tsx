import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  ExternalLink,
  Maximize,
  Minimize,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";

const CryptoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartProvider, setChartProvider] = useState<'tradingview' | 'coingecko' | 'dexscreener'>('tradingview');
  const [chartError, setChartError] = useState(false);

  // Mock data with additional chart info - in real app this would come from API
  const cryptoData = {
    bitcoin: {
      name: "Bitcoin",
      symbol: "BTC",
      coingeckoId: "bitcoin",
      dexscreenerId: "bitcoin",
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
      whitepaper: "https://bitcoin.org/bitcoin.pdf",
      onTradingView: true
    },
    ethereum: {
      name: "Ethereum",
      symbol: "ETH",
      coingeckoId: "ethereum", 
      dexscreenerId: "ethereum",
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
      whitepaper: "https://ethereum.org/en/whitepaper/",
      onTradingView: true
    },
    pepe: {
      name: "Pepe",
      symbol: "PEPE",
      coingeckoId: "pepe",
      dexscreenerId: "ethereum/0x6982508145454ce325ddbe47a25d4ec3d2311933",
      price: 0.000024,
      change1h: 15.2,
      change24h: 45.8,
      change7d: 123.4,
      marketCap: "9.8B",
      volume: "2.1B",
      supply: "420.7T",
      maxSupply: "420.7T",
      rank: 25,
      description: "PEPE är en memecoin baserad på den populära Pepe the Frog memen. Den lanserades på Ethereum-nätverket och har blivit en av de mest populära memecoins.",
      website: "https://www.pepe.vip/",
      whitepaper: "",
      onTradingView: false
    }
  };

  const crypto = cryptoData[slug as keyof typeof cryptoData];

  useEffect(() => {
    if (!crypto) {
      navigate('/marknad');
      return;
    }

    const loadChart = () => {
      const chartContainer = document.getElementById('tradingview_chart');
      if (!chartContainer) return;

      // Clear previous content
      chartContainer.innerHTML = '';

      if (chartProvider === 'tradingview' && crypto.onTradingView) {
        loadTradingViewChart(chartContainer);
      } else if (chartProvider === 'coingecko') {
        loadCoinGeckoChart(chartContainer);
      } else if (chartProvider === 'dexscreener') {
        loadDexScreenerChart(chartContainer);
      } else {
        // Fallback to CoinGecko if TradingView doesn't have the token
        setChartProvider('coingecko');
        loadCoinGeckoChart(chartContainer);
      }
    };

    const loadTradingViewChart = (container: HTMLElement) => {
      try {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          width: "100%",
          height: isFullscreen ? "90vh" : "700",
          symbol: `COINBASE:${crypto.symbol}USD`,
          interval: "1D",
          timezone: "Europe/Stockholm",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: ["RSI@tv-basicstudies"],
          container_id: "tradingview_chart"
        });
        container.appendChild(script);
        setChartError(false);
      } catch (error) {
        console.error('Error loading TradingView chart:', error);
        setChartError(true);
      }
    };

    const loadCoinGeckoChart = (container: HTMLElement) => {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col">
          <div class="flex items-center justify-between mb-4 px-4">
            <span class="text-sm text-muted-foreground">Powered by CoinGecko</span>
            <a href="https://www.coingecko.com/sv/coins/${crypto.coingeckoId}" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
              Visa på CoinGecko
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path>
              </svg>
            </a>
          </div>
          <iframe 
            src="https://www.coingecko.com/sv/coins/${crypto.coingeckoId}/usd/advanced_chart_widget" 
            width="100%" 
            height="${isFullscreen ? 'calc(90vh - 60px)' : '650px'}"
            frameborder="0"
            style="border-radius: 8px; background: #000;"
          ></iframe>
        </div>
      `;
      setChartError(false);
    };

    const loadDexScreenerChart = (container: HTMLElement) => {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col">
          <div class="flex items-center justify-between mb-4 px-4">
            <span class="text-sm text-muted-foreground">Powered by DexScreener</span>
            <a href="https://dexscreener.com/${crypto.dexscreenerId}" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
              Visa på DexScreener
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path>
              </svg>
            </a>
          </div>
          <iframe 
            src="https://dexscreener.com/${crypto.dexscreenerId}?embed=1&theme=dark" 
            width="100%" 
            height="${isFullscreen ? 'calc(90vh - 60px)' : '650px'}"
            frameborder="0"
            style="border-radius: 8px;"
          ></iframe>
        </div>
      `;
      setChartError(false);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadChart, 100);

    return () => {
      clearTimeout(timer);
      const chartContainer = document.getElementById('tradingview_chart');
      if (chartContainer) {
        chartContainer.innerHTML = '';
      }
    };
  }, [crypto, navigate, slug, isFullscreen, chartProvider]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const switchChartProvider = (provider: 'tradingview' | 'coingecko' | 'dexscreener') => {
    setChartProvider(provider);
    setChartError(false);
  };

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
        <div className="container mx-auto px-4 max-w-7xl">
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

          {/* Crypto Header - Fixed responsive layout */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-crypto text-2xl font-bold text-primary">
                  {crypto.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-crypto text-2xl md:text-3xl font-bold">{crypto.name}</h1>
                  <Badge variant="outline" className="font-crypto">
                    #{crypto.rank}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-crypto text-lg">{crypto.symbol}</p>
              </div>
            </div>
            
            <div className="text-left lg:text-right w-full lg:w-auto">
              <div className="font-crypto text-3xl md:text-4xl font-bold mb-3">
                {formatPrice(crypto.price)}
              </div>
              <div className="flex flex-wrap items-center gap-4 justify-start lg:justify-end">
                <div className="text-sm">{formatChange(crypto.change1h)}</div>
                <div className="text-sm">{formatChange(crypto.change24h)}</div>
                <div className="text-sm">{formatChange(crypto.change7d)}</div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Fixed responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Marknadskapital</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">{crypto.marketCap} SEK</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Volym (24h)</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">{crypto.volume} SEK</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Cirkulerande</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">{crypto.supply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Max Utbud</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">{crypto.maxSupply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">1h Förändring</span>
              </div>
              <div className="font-display font-bold text-xs md:text-sm">{formatChange(crypto.change1h)}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">7d Förändring</span>
              </div>
              <div className="font-display font-bold text-xs md:text-sm">{formatChange(crypto.change7d)}</div>
            </Card>
          </div>

          {/* Chart - Fixed layout and responsive */}
          <div className={`transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''
          }`}>
            <Card className={`p-4 md:p-6 mb-8 bg-card/80 backdrop-blur-sm h-full shadow-lg`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <h2 className="font-crypto text-xl md:text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  {crypto.name} Kursutveckling
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  {/* Chart Provider Selector */}
                  <div className="flex bg-muted rounded-lg p-1 w-full sm:w-auto">
                    <Button
                      variant={chartProvider === 'tradingview' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => switchChartProvider('tradingview')}
                      disabled={!crypto.onTradingView}
                      className="text-xs px-2 py-1 flex-1 sm:flex-none"
                    >
                      TradingView
                    </Button>
                    <Button
                      variant={chartProvider === 'coingecko' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => switchChartProvider('coingecko')}
                      className="text-xs px-2 py-1 flex-1 sm:flex-none"
                    >
                      CoinGecko
                    </Button>
                    <Button
                      variant={chartProvider === 'dexscreener' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => switchChartProvider('dexscreener')}
                      className="text-xs px-2 py-1 flex-1 sm:flex-none"
                    >
                      DexScreener
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize size={16} />
                        Minimera
                      </>
                    ) : (
                      <>
                        <Maximize size={16} />
                        Fullskärm
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {chartError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                  <AlertCircle size={16} />
                  <span className="text-sm">Chart kunde inte laddas. Försök med en annan provider.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setChartError(false)}
                    className="ml-auto"
                  >
                    <RefreshCw size={14} />
                  </Button>
                </div>
              )}
              
              <div 
                id="tradingview_chart" 
                className={`w-full bg-background rounded-lg border border-border ${
                  isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px] md:h-[700px]'
                }`}
              ></div>
            </Card>
          </div>

          {/* Description and Links - Hidden in fullscreen */}
          {!isFullscreen && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailPage;