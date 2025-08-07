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
  const [chartError, setChartError] = useState(false);

  // Mock data with additional chart info - in real app this would come from API
  const cryptoData = {
    bitcoin: {
      name: "Bitcoin",
      symbol: "BTC",
      coingeckoId: "bitcoin",
      dexscreenerId: "bitcoin",
      price: 116414,
      change1h: 0.5,
      change24h: 2.19,
      change7d: 5.12,
      marketCap: "2.3T",
      volume: "28.5B",
      supply: "19.8M",
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
      price: 3834.48,
      change1h: -0.2,
      change24h: 6.76,
      change7d: 3.21,
      marketCap: "460B",
      volume: "15.2B", 
      supply: "120.3M",
      maxSupply: "∞",
      rank: 2,
      description: "Ethereum är en decentraliserad plattform som möjliggör smarta kontrakt och decentraliserade applikationer (DApps). Den introducerade konceptet med programmerbara blockkedjor.",
      website: "https://ethereum.org",
      whitepaper: "https://ethereum.org/en/whitepaper/",
      onTradingView: true
    },
    bnb: {
      name: "Binance Coin",
      symbol: "BNB",
      coingeckoId: "binancecoin",
      dexscreenerId: "bsc/bnb",
      price: 775.94,
      change1h: 0.8,
      change24h: 2.07,
      change7d: 4.2,
      marketCap: "110B",
      volume: "1.8B",
      supply: "153M",
      maxSupply: "200M",
      rank: 3,
      description: "Binance Coin (BNB) är den ursprungliga kryptovalutan för Binance Smart Chain och används för att betala avgifter på Binance-börsens plattform.",
      website: "https://www.binance.com",
      whitepaper: "",
      onTradingView: true
    },
    ada: {
      name: "Cardano",
      symbol: "ADA",
      coingeckoId: "cardano",
      dexscreenerId: "cardano/ada",
      price: 0.767208,
      change1h: 1.2,
      change24h: 5.59,
      change7d: 8.4,
      marketCap: "27B",
      volume: "1.1B",
      supply: "35.1B",
      maxSupply: "45B",
      rank: 4,
      description: "Cardano är en blockchain-plattform för changemakers, innovatörer och visionärer, med verktyg och teknologier som krävs för att skapa möjligheter för många såväl som för några få.",
      website: "https://cardano.org",
      whitepaper: "https://www.cardano.org/en/academic-papers/",
      onTradingView: true
    },
    sol: {
      name: "Solana",
      symbol: "SOL",
      coingeckoId: "solana",
      dexscreenerId: "solana/sol",
      price: 172.05,
      change1h: 0.6,
      change24h: 4.78,
      change7d: 12.3,
      marketCap: "82B",
      volume: "3.2B",
      supply: "477M",
      maxSupply: "∞",
      rank: 5,
      description: "Solana är en högpresterande blockchain som stöder utvecklare över hela världen att skapa krypto-appar som skalas idag.",
      website: "https://solana.com",
      whitepaper: "https://solana.com/solana-whitepaper.pdf",
      onTradingView: true
    },
    dot: {
      name: "Polkadot",
      symbol: "DOT",
      coingeckoId: "polkadot",
      dexscreenerId: "polkadot/dot",
      price: 3.79,
      change1h: -0.3,
      change24h: 5.52,
      change7d: 2.1,
      marketCap: "6.2B",
      volume: "180M",
      supply: "1.5B",
      maxSupply: "∞",
      rank: 15,
      description: "Polkadot är en blockchain-protokoll som möjliggör interoperabilitet mellan olika blockkedjor.",
      website: "https://polkadot.network",
      whitepaper: "https://polkadot.network/PolkaDotPaper.pdf",
      onTradingView: true
    },
    avax: {
      name: "Avalanche", 
      symbol: "AVAX",
      coingeckoId: "avalanche-2",
      dexscreenerId: "avalanche/avax",
      price: 22.73,
      change1h: 0.4,
      change24h: 3.88,
      change7d: 6.7,
      marketCap: "9.8B",
      volume: "420M",
      supply: "431M",
      maxSupply: "720M",
      rank: 12,
      description: "Avalanche är en snabb, låg kostnad och miljövänlig blockchain-plattform.",
      website: "https://www.avax.network",
      whitepaper: "https://assets.website-files.com/5d80307810123f5ffbb34d6e/6008d7bbf8b10d1eb01e7e16_Avalanche%20Platform%20Whitepaper.pdf",
      onTradingView: true
    },
    link: {
      name: "Chainlink",
      symbol: "LINK", 
      coingeckoId: "chainlink",
      dexscreenerId: "ethereum/0x514910771af9ca656af840dff83e8264ecf986ca",
      price: 17.86,
      change1h: 0.7,
      change24h: 9.20,
      change7d: 15.4,
      marketCap: "11.2B",
      volume: "680M",
      supply: "626M",
      maxSupply: "1B",
      rank: 13,
      description: "Chainlink är ett decentraliserat oracle-nätverk som möjliggör för smarta kontrakt att säkert komma åt off-chain dataflöden.",
      website: "https://chain.link",
      whitepaper: "https://link.smartcontract.com/whitepaper",
      onTradingView: true
    },
    uni: {
      name: "Uniswap",
      symbol: "UNI",
      coingeckoId: "uniswap",
      dexscreenerId: "ethereum/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      price: 10.11,
      change1h: 0.2,
      change24h: 6.87,
      change7d: 8.9,
      marketCap: "7.6B",
      volume: "420M",
      supply: "753M",
      maxSupply: "1B",
      rank: 16,
      description: "Uniswap är ett decentraliserat handelsprotokoll som är känt för sin roll i att underlätta automatiserad handel av decentraliserade finanstoken (DeFi).",
      website: "https://uniswap.org",
      whitepaper: "https://uniswap.org/whitepaper.pdf",
      onTradingView: true
    },
    doge: {
      name: "Dogecoin",
      symbol: "DOGE",
      coingeckoId: "dogecoin",
      dexscreenerId: "dogecoin/doge",
      price: 0.214554,
      change1h: 1.1,
      change24h: 7.07,
      change7d: 12.5,
      marketCap: "31B",
      volume: "1.8B",
      supply: "147B",
      maxSupply: "∞",
      rank: 8,
      description: "Dogecoin är en kryptovaluta som skapades som ett skämt baserat på det populära 'Doge' meme som visar en Shiba Inu hund.",
      website: "https://dogecoin.com",
      whitepaper: "",
      onTradingView: true
    },
    shib: {
      name: "Shiba Inu",
      symbol: "SHIB",
      coingeckoId: "shiba-inu",
      dexscreenerId: "ethereum/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
      price: 0.00001268,
      change1h: 0.8,
      change24h: 4.49,
      change7d: 9.2,
      marketCap: "7.5B",
      volume: "420M",
      supply: "589T",
      maxSupply: "1000T",
      rank: 17,
      description: "Shiba Inu är en decentraliserad spontan community building experiment. SHIB-token är vår första token och tillåter användare att hålla miljarder eller till och med biljoner av dem.",
      website: "https://shibatoken.com",
      whitepaper: "",
      onTradingView: true
    },
    matic: {
      name: "Polygon",
      symbol: "MATIC",
      coingeckoId: "matic-network",
      dexscreenerId: "ethereum/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      price: 0.237972,
      change1h: 0.4,
      change24h: 7.80,
      change7d: 11.2,
      marketCap: "2.4B",
      volume: "190M",
      supply: "10B",
      maxSupply: "10B",
      rank: 18,
      description: "Polygon är en decentraliserad Ethereum scaling platform som möjliggör för utvecklare att bygga skalbara användar-vänliga dApps med låga transaktionsavgifter.",
      website: "https://polygon.technology",
      whitepaper: "https://polygon.technology/papers/pol-whitepaper",
      onTradingView: true
    },
    ltc: {
      name: "Litecoin",
      symbol: "LTC",
      coingeckoId: "litecoin",
      dexscreenerId: "litecoin/ltc",
      price: 120.06,
      change1h: 0.3,
      change24h: 3.86,
      change7d: 5.4,
      marketCap: "9.1B",
      volume: "580M",
      supply: "75.8M",
      maxSupply: "84M",
      rank: 14,
      description: "Litecoin är en peer-to-peer internetvaluta som möjliggör omedelbara betalningar med nära noll kostnader till vem som helst i världen.",
      website: "https://litecoin.org",
      whitepaper: "",
      onTradingView: true
    },
    xrp: {
      name: "XRP",
      symbol: "XRP",
      coingeckoId: "ripple",
      dexscreenerId: "xrp/xrp",
      price: 3.07,
      change1h: 0.6,
      change24h: 4.19,
      change7d: 7.8,
      marketCap: "176B",
      volume: "2.1B",
      supply: "57.2B",
      maxSupply: "100B",
      rank: 3,
      description: "XRP är en digital tillgång byggd för betalningar. Det är den ursprungliga digitala tillgången på XRP Ledger—en öppen källkod, tillståndslös och decentraliserad blockchain-teknik.",
      website: "https://xrpl.org",
      whitepaper: "https://xrpl.org/known-amendments.html",
      onTradingView: true
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
      loadTradingViewChart(chartContainer);
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
          studies: [],
          container_id: "tradingview_chart"
        });
        container.appendChild(script);
        setChartError(false);
      } catch (error) {
        console.error('Error loading TradingView chart:', error);
        setChartError(true);
      }
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
  }, [crypto, navigate, slug, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  if (!crypto) {
    return null;
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    } else if (price < 0.001) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toFixed(2)}`;
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
              <div className="font-display font-bold text-sm md:text-base">${crypto.marketCap}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Volym (24h)</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">${crypto.volume}</div>
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