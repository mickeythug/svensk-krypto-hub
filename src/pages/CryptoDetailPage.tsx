import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  AlertCircle,
  Menu,
  Search,
  Bell,
  Star
} from "lucide-react";
import TradingPanel from "@/components/TradingPanel";
import DesktopTradingInterface from "@/components/DesktopTradingInterface";
import MobileTradingPanel from "@/components/MobileTradingPanel";
import MobileChart from "@/components/MobileChart";
import Header from "@/components/Header";
import { useCryptoData } from "@/hooks/useCryptoData";

const CryptoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [chartError, setChartError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { getCryptoBySymbol } = useCryptoData();
  const chartInitialized = useRef(false);
  
  // Omfattande slug-mappning för alla top 100 tokens 
  const slugToSymbol: Record<string, string> = {
    'bitcoin': 'BTC', 'btc': 'BTC',
    'ethereum': 'ETH', 'eth': 'ETH',
    'tether': 'USDT', 'usdt': 'USDT',
    'binancecoin': 'BNB', 'bnb': 'BNB', 'binance-coin': 'BNB',
    'solana': 'SOL', 'sol': 'SOL',
    'usd-coin': 'USDC', 'usdc': 'USDC',
    'xrp': 'XRP', 'ripple': 'XRP',
    'staked-ether': 'STETH', 'steth': 'STETH',
    'cardano': 'ADA', 'ada': 'ADA',
    'avalanche-2': 'AVAX', 'avax': 'AVAX', 'avalanche': 'AVAX',
    'dogecoin': 'DOGE', 'doge': 'DOGE',
    'chainlink': 'LINK', 'link': 'LINK',
    'tron': 'TRX', 'trx': 'TRX',
    'polygon': 'MATIC', 'matic': 'MATIC',
    'shiba-inu': 'SHIB', 'shib': 'SHIB',
    'polkadot': 'DOT', 'dot': 'DOT',
    'litecoin': 'LTC', 'ltc': 'LTC',
    'bitcoin-cash': 'BCH', 'bch': 'BCH',
    'uniswap': 'UNI', 'uni': 'UNI',
    'pepe': 'PEPE',
    'internet-computer': 'ICP', 'icp': 'ICP',
    'ethereum-classic': 'ETC', 'etc': 'ETC',
    'artificial-superintelligence-alliance': 'FET', 'fet': 'FET',
    'kaspa': 'KAS', 'kas': 'KAS',
    'near': 'NEAR', 'near-protocol': 'NEAR',
    'dai': 'DAI',
    'aptos': 'APT', 'apt': 'APT',
    'stellar': 'XLM', 'xlm': 'XLM',
    'cronos': 'CRO', 'cro': 'CRO',
    'filecoin': 'FIL', 'fil': 'FIL',
    'cosmos': 'ATOM', 'atom': 'ATOM',
    'vechain': 'VET', 'vet': 'VET',
    'monero': 'XMR', 'xmr': 'XMR',
    'hedera': 'HBAR', 'hbar': 'HBAR',
    'ethereum-name-service': 'ENS', 'ens': 'ENS',
    'arbitrum': 'ARB', 'arb': 'ARB',
    'optimism': 'OP', 'op': 'OP',
    'immutable-x': 'IMX', 'imx': 'IMX',
    'maker': 'MKR', 'mkr': 'MKR',
    'fantom': 'FTM', 'ftm': 'FTM',
    'rocket-pool': 'RPL', 'rpl': 'RPL',
    'the-graph': 'GRT', 'grt': 'GRT',
    'bittensor': 'TAO', 'tao': 'TAO',
    'render-token': 'RNDR', 'rndr': 'RNDR',
    'theta-network': 'THETA', 'theta': 'THETA',
    'algorand': 'ALGO', 'algo': 'ALGO',
    'kucoin-shares': 'KCS', 'kcs': 'KCS',
    'lido-dao': 'LDO', 'ldo': 'LDO',
    'flow': 'FLOW',
    'aave': 'AAVE',
    'decentraland': 'MANA', 'mana': 'MANA',
    'injective-protocol': 'INJ', 'inj': 'INJ',
    'sei-network': 'SEI', 'sei': 'SEI',
    'blockstack': 'STX', 'stx': 'STX',
    'elrond-erd-2': 'EGLD', 'egld': 'EGLD',
    'sandbox': 'SAND', 'sand': 'SAND',
    'axie-infinity': 'AXS', 'axs': 'AXS',
    'floki': 'FLOKI',
    'thorchain': 'RUNE', 'rune': 'RUNE',
    'ftx-token': 'FTT', 'ftt': 'FTT',
    'helium': 'HNT', 'hnt': 'HNT',
    'gala': 'GALA',
    'tezos': 'XTZ', 'xtz': 'XTZ',
    'zcash': 'ZEC', 'zec': 'ZEC',
    'chiliz': 'CHZ', 'chz': 'CHZ',
    'mina-protocol': 'MINA', 'mina': 'MINA',
    'dydx': 'DYDX',
    'bonk': 'BONK',
    'neo': 'NEO',
    'iota': 'IOTA',
    'celsius-degree-token': 'CEL', 'cel': 'CEL',
    'eos': 'EOS',
    'the-open-network': 'TON', 'ton': 'TON',
    'quant-network': 'QNT', 'qnt': 'QNT',
    'kava': 'KAVA',
    'conflux-token': 'CFX', 'cfx': 'CFX',
    '1inch': '1INCH',
    'compound': 'COMP', 'comp': 'COMP',
    'arweave': 'AR', 'ar': 'AR',
    'ecash': 'XEC', 'xec': 'XEC',
    'curve-dao-token': 'CRV', 'crv': 'CRV',
    'terra-luna-2': 'LUNA', 'luna': 'LUNA',
    'looksrare': 'LOOKS', 'looks': 'LOOKS',
    'trust-wallet-token': 'TWT', 'twt': 'TWT',
    'wormhole': 'W', 'w': 'W',
    'pancakeswap-token': 'CAKE', 'cake': 'CAKE',
    'convex-finance': 'CVX', 'cvx': 'CVX',
    'havven': 'SNX', 'snx': 'SNX',
    'bitcoin-sv': 'BSV', 'bsv': 'BSV',
    'livepeer': 'LPT', 'lpt': 'LPT',
    'sushiswap': 'SUSHI', 'sushi': 'SUSHI',
    'blur': 'BLUR',
    'mask-network': 'MASK', 'mask': 'MASK',
    'osmosis': 'OSMO', 'osmo': 'OSMO',
    'golem': 'GLM', 'glm': 'GLM'
  };

  const symbol = slugToSymbol[slug?.toLowerCase() || ''];
  const crypto = symbol ? getCryptoBySymbol(symbol) : null;

  // Statisk info för varje crypto (info som inte ändras ofta)
  const cryptoInfo = {
    'BTC': {
      name: "Bitcoin",
      description: "Bitcoin är den första och mest kända kryptovalutan, skapad av den pseudonyma Satoshi Nakamoto 2009. Den fungerar som ett decentraliserat digitalt betalningssystem utan behov av mellanhand som banker.",
      website: "https://bitcoin.org",
      whitepaper: "https://bitcoin.org/bitcoin.pdf",
      supply: "19.8M",
      maxSupply: "21M"
    },
    'ETH': {
      name: "Ethereum",
      description: "Ethereum är en decentraliserad plattform som möjliggör smarta kontrakt och decentraliserade applikationer (DApps). Den introducerade konceptet med programmerbara blockkedjor.",
      website: "https://ethereum.org",
      whitepaper: "https://ethereum.org/en/whitepaper/",
      supply: "120.3M",
      maxSupply: "∞"
    },
    'BNB': {
      name: "Binance Coin",
      description: "Binance Coin (BNB) är den ursprungliga kryptovalutan för Binance Smart Chain och används för att betala avgifter på Binance-börsens plattform.",
      website: "https://www.binance.com",
      whitepaper: "",
      supply: "153M",
      maxSupply: "200M"
    },
    'XRP': {
      name: "XRP",
      description: "XRP är en digital tillgång byggd för betalningar. Det är den ursprungliga digitala tillgången på XRP Ledger—en öppen källkod, tillståndslös och decentraliserad blockchain-teknik.",
      website: "https://xrpl.org",
      whitepaper: "https://xrpl.org/known-amendments.html",
      supply: "57.2B",
      maxSupply: "100B"
    },
    'ADA': {
      name: "Cardano",
      description: "Cardano är en blockchain-plattform för changemakers, innovatörer och visionärer, med verktyg och teknologier som krävs för att skapa möjligheter för många såväl som för några få.",
      website: "https://cardano.org", 
      whitepaper: "https://www.cardano.org/en/academic-papers/",
      supply: "35.1B",
      maxSupply: "45B"
    },
    'SOL': {
      name: "Solana",
      description: "Solana är en högpresterande blockchain som stöder utvecklare över hela världen att skapa krypto-appar som skalas idag.",
      website: "https://solana.com",
      whitepaper: "https://solana.com/solana-whitepaper.pdf",
      supply: "477M",
      maxSupply: "∞"
    },
    'DOT': {
      name: "Polkadot",
      description: "Polkadot är en blockchain-protokoll som möjliggör interoperabilitet mellan olika blockkedjor.",
      website: "https://polkadot.network",
      whitepaper: "https://polkadot.network/PolkaDotPaper.pdf",
      supply: "1.5B",
      maxSupply: "∞"
    },
    'AVAX': {
      name: "Avalanche",
      description: "Avalanche är en snabb, låg kostnad och miljövänlig blockchain-plattform.",
      website: "https://www.avax.network",
      whitepaper: "https://assets.website-files.com/5d80307810123f5ffbb34d6e/6008d7bbf8b10d1eb01e7e16_Avalanche%20Platform%20Whitepaper.pdf",
      supply: "431M",
      maxSupply: "720M"
    },
    'LINK': {
      name: "Chainlink",
      description: "Chainlink är ett decentraliserat oracle-nätverk som möjliggör för smarta kontrakt att säkert komma åt off-chain dataflöden.",
      website: "https://chain.link",
      whitepaper: "https://link.smartcontract.com/whitepaper",
      supply: "626M",
      maxSupply: "1B"
    },
    'MATIC': {
      name: "Polygon",
      description: "Polygon är en decentraliserad Ethereum scaling platform som möjliggör för utvecklare att bygga skalbara användar-vänliga dApps med låga transaktionsavgifter.",
      website: "https://polygon.technology",
      whitepaper: "https://polygon.technology/papers/pol-whitepaper",
      supply: "10B",
      maxSupply: "10B"
    },
    'UNI': {
      name: "Uniswap",
      description: "Uniswap är ett decentraliserat handelsprotokoll som är känt för sin roll i att underlätta automatiserad handel av decentraliserade finanstoken (DeFi).",
      website: "https://uniswap.org",
      whitepaper: "https://uniswap.org/whitepaper.pdf",
      supply: "753M",
      maxSupply: "1B"
    },
    'LTC': {
      name: "Litecoin",
      description: "Litecoin är en peer-to-peer internetvaluta som möjliggör omedelbara betalningar med nära noll kostnader till vem som helst i världen.",
      website: "https://litecoin.org",
      whitepaper: "",
      supply: "75.8M", 
      maxSupply: "84M"
    },
    'DOGE': {
      name: "Dogecoin",
      description: "Dogecoin är en kryptovaluta som skapades som ett skämt baserat på det populära 'Doge' meme som visar en Shiba Inu hund.",
      website: "https://dogecoin.com",
      whitepaper: "",
      supply: "147B",
      maxSupply: "∞"
    },
    'SHIB': {
      name: "Shiba Inu", 
      description: "Shiba Inu är en decentraliserad spontan community building experiment. SHIB-token är vår första token och tillåter användare att hålla miljarder eller till och med biljoner av dem.",
      website: "https://shibatoken.com",
      whitepaper: "",
      supply: "589T",
      maxSupply: "1000T"
    }
  };

  // Fallback info för tokens som inte har detaljerad info än
  const getTokenInfo = (symbol: string) => {
    const staticInfo = cryptoInfo[symbol as keyof typeof cryptoInfo];
    if (staticInfo) return staticInfo;
    
    // Fallback för alla andra tokens
    return {
      name: crypto?.name || symbol,
      description: `${crypto?.name || symbol} är en kryptovaluta som handlas på världens största kryptobörser. Se live prisdata och chart ovan.`,
      website: "#",
      whitepaper: "",
      supply: "N/A",
      maxSupply: "N/A"
    };
  };

  const info = symbol ? getTokenInfo(symbol) : null;

  // Check if mobile
  const isMobile = window.innerWidth < 768;

  // Förenklad chart loading utan DOM-manipulation
  const loadTradingViewChart = useCallback((symbol: string) => {
    if (chartInitialized.current) return;
    
    try {
      setIsLoading(true);
      
      // Simulerar chart loading utan externa scripts
      setTimeout(() => {
        setIsLoading(false);
        setChartError(false);
        chartInitialized.current = true;
      }, 1000);
      
    } catch (error) {
      console.error('Error loading TradingView chart:', error);
      setChartError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!crypto) return;

    chartInitialized.current = false;
    loadTradingViewChart(crypto.symbol);

    return () => {
      chartInitialized.current = false;
    };
  }, [crypto, loadTradingViewChart]);

  const reloadChart = () => {
    chartInitialized.current = false;
    setChartError(false);
    setIsLoading(true);
    
    setTimeout(() => {
      if (crypto) {
        loadTradingViewChart(crypto.symbol);
      }
    }, 100);
  };

  if (!symbol || !info) {
    return (
      <div className="min-h-screen bg-background">
        {!isMobile && <Header />}
        <div className={`${!isMobile ? 'pt-20' : 'pt-4'} pb-12`}>
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center">
              <h1 className="font-crypto text-2xl font-bold mb-4">Token ej hittad</h1>
              <p className="text-muted-foreground mb-4">
                Denna kryptovaluta finns inte tillgänglig eller är inte stödd ännu.
              </p>
              <Button onClick={() => navigate('/marknad')}>
                Tillbaka till Marknadsöversikt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Om data håller på att laddas, visa loading
  if (!crypto) {
    return (
      <div className="min-h-screen bg-background">
        {!isMobile && <Header />}
        <div className={`${!isMobile ? 'pt-20' : 'pt-4'} pb-12`}>
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center">
              <h1 className="font-crypto text-2xl font-bold mb-4">Laddar {info.name}...</h1>
              <div className="animate-pulse">📡 Hämtar live prisdata...</div>
            </div>
          </div>
        </div>
      </div>
    );
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/marknad')}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Search size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
            <TabsList className="w-full h-12 grid grid-cols-3 rounded-none bg-transparent">
              <TabsTrigger value="overview" className="text-sm">Översikt</TabsTrigger>
              <TabsTrigger value="chart" className="text-sm">Chart</TabsTrigger>
              <TabsTrigger value="trade" className="text-sm">Handel</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            {/* Mobile Price Header */}
            <div className="p-4 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{crypto.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{crypto.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{crypto.symbol}</span>
                    <Badge variant="outline" className="text-xs">#{crypto.rank}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">{formatPrice(crypto.price)}</div>
                <div className="flex items-center justify-center gap-2">
                  {formatChange(crypto.change24h)}
                </div>
              </div>
            </div>

            {/* Mobile Stats Grid */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Marknadskapital</div>
                  <div className="font-bold">${crypto.marketCap}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Volym (24h)</div>
                  <div className="font-bold">${crypto.volume}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Cirkulerande</div>
                  <div className="font-bold">{info.supply}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Max Utbud</div>
                  <div className="font-bold">{info.maxSupply}</div>
                </Card>
              </div>

              {/* About Section */}
              <Card className="p-4 mb-4">
                <h3 className="font-bold mb-3">Om {crypto.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {info.description}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={info.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <Globe size={14} />
                      Webbplats
                    </a>
                  </Button>
                  {info.whitepaper && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={info.whitepaper} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <ExternalLink size={14} />
                        Whitepaper
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            <MobileChart
              symbol={crypto.symbol}
              currentPrice={crypto.price}
              priceChange24h={crypto.change24h}
              tokenName={crypto.name}
              crypto={crypto}
            />
          </TabsContent>

          <TabsContent value="trade" className="mt-0">
            <MobileTradingPanel
              symbol={crypto.symbol}
              currentPrice={crypto.price}
              priceChange24h={crypto.change24h}
              tokenName={crypto.name}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout - Fullscreen Trading Interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar - Similar to Hyperliquid */}
      <div className="h-14 bg-card/40 border-b border-border/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Trading Pair */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/marknad')} className="h-8 w-8 p-0">
              <ArrowLeft size={16} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{crypto.name.charAt(0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{symbol}/USDC</span>
                <Badge variant="secondary" className="text-xs">Spot</Badge>
              </div>
            </div>
          </div>

          {/* Price Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Price</div>
              <div className="font-bold">{formatPrice(crypto.price)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24h Change</div>
              <div className={`font-bold ${crypto.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24h Volume</div>
              <div className="font-bold">{crypto.volume} USDC</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="font-bold">{crypto.marketCap}</div>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="flex-1 overflow-hidden">
        <DesktopTradingInterface
          symbol={crypto.symbol}
          currentPrice={crypto.price}
          priceChange24h={crypto.change24h}
          tokenName={crypto.name}
          crypto={crypto}
        />
      </div>
    </div>
  );
};

export default CryptoDetailPage;