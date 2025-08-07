import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import { useCryptoData } from "@/hooks/useCryptoData";

const CryptoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [chartError, setChartError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getCryptoBySymbol } = useCryptoData();
  const chartRef = useRef<HTMLDivElement>(null);
  const tradingViewScriptRef = useRef<HTMLScriptElement | null>(null);
  const chartInitialized = useRef(false);
  
  // Cache för TradingView script
  const scriptCache = useMemo(() => new Map(), []);
  
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

  // Komplett TradingView symbol mappning för alla 100 tokens
  const getTradingViewSymbol = (symbol: string): string => {
    const tradingPairs: Record<string, string> = {
      // Top 10
      'BTC': 'BINANCE:BTCUSDT',
      'ETH': 'BINANCE:ETHUSDT', 
      'USDT': 'BINANCE:USDCUSDT',
      'BNB': 'BINANCE:BNBUSDT',
      'SOL': 'BINANCE:SOLUSDT',
      'USDC': 'BINANCE:USDCUSDT',
      'XRP': 'BINANCE:XRPUSDT',
      'STETH': 'BINANCE:ETHUSDT', // Fallback till ETH
      'ADA': 'BINANCE:ADAUSDT',
      'AVAX': 'BINANCE:AVAXUSDT',
      
      // Top 11-30
      'DOGE': 'BINANCE:DOGEUSDT',
      'LINK': 'BINANCE:LINKUSDT',
      'TRX': 'BINANCE:TRXUSDT',
      'MATIC': 'BINANCE:MATICUSDT',
      'SHIB': 'BINANCE:SHIBUSDT',
      'DOT': 'BINANCE:DOTUSDT',
      'LTC': 'BINANCE:LTCUSDT',
      'BCH': 'BINANCE:BCHUSDT',
      'UNI': 'BINANCE:UNIUSDT',
      'PEPE': 'BINANCE:PEPEUSDT',
      'ICP': 'BINANCE:ICPUSDT',
      'ETC': 'BINANCE:ETCUSDT',
      'FET': 'BINANCE:FETUSDT',
      'KAS': 'MEXC:KASUSDT',
      'NEAR': 'BINANCE:NEARUSDT',
      'DAI': 'BINANCE:DAIUSDT',
      'APT': 'BINANCE:APTUSDT',
      'XLM': 'BINANCE:XLMUSDT',
      'CRO': 'BINANCE:CROUSDT',
      'FIL': 'BINANCE:FILUSDT',
      
      // Top 31-60
      'ATOM': 'BINANCE:ATOMUSDT',
      'VET': 'BINANCE:VETUSDT',
      'XMR': 'BINANCE:XMRUSDT',
      'HBAR': 'BINANCE:HBARUSDT',
      'ENS': 'BINANCE:ENSUSDT',
      'ARB': 'BINANCE:ARBUSDT',
      'OP': 'BINANCE:OPUSDT',
      'IMX': 'BINANCE:IMXUSDT',
      'MKR': 'BINANCE:MKRUSDT',
      'FTM': 'BINANCE:FTMUSDT',
      'RPL': 'BINANCE:RPLUSDT',
      'GRT': 'BINANCE:GRTUSDT',
      'TAO': 'MEXC:TAOUSDT',
      'RNDR': 'BINANCE:RNDRUSDT',
      'THETA': 'BINANCE:THETAUSDT',
      'ALGO': 'BINANCE:ALGOUSDT',
      'KCS': 'KUCOIN:KCSUSDT',
      'LDO': 'BINANCE:LDOUSDT',
      'FLOW': 'BINANCE:FLOWUSDT',
      'AAVE': 'BINANCE:AAVEUSDT',
      'MANA': 'BINANCE:MANAUSDT',
      'INJ': 'BINANCE:INJUSDT',
      'SEI': 'BINANCE:SEIUSDT',
      'STX': 'BINANCE:STXUSDT',
      'EGLD': 'BINANCE:EGLDUSDT',
      'SAND': 'BINANCE:SANDUSDT',
      'AXS': 'BINANCE:AXSUSDT',
      'FLOKI': 'BINANCE:FLOKIUSDT',
      'RUNE': 'BINANCE:RUNEUSDT',
      'FTT': 'BINANCE:FTTUSDT',
      
      // Top 61-100
      'HNT': 'BINANCE:HNTUSDT',
      'GALA': 'BINANCE:GALAUSDT',
      'XTZ': 'BINANCE:XTZUSDT',
      'ZEC': 'BINANCE:ZECUSDT',
      'CHZ': 'BINANCE:CHZUSDT',
      'MINA': 'BINANCE:MINAUSDT',
      'DYDX': 'BINANCE:DYDXUSDT',
      'BONK': 'BINANCE:BONKUSDT',
      'NEO': 'BINANCE:NEOUSDT',
      'IOTA': 'BINANCE:IOTAUSDT',
      'CEL': 'BINANCE:CELUSDT',
      'EOS': 'BINANCE:EOSUSDT',
      'TON': 'BYBIT:TONUSDT',
      'QNT': 'BINANCE:QNTUSDT',
      'KAVA': 'BINANCE:KAVAUSDT',
      'CFX': 'BINANCE:CFXUSDT',
      '1INCH': 'BINANCE:1INCHUSDT',
      'COMP': 'BINANCE:COMPUSDT',
      'AR': 'BINANCE:ARUSDT',
      'XEC': 'BINANCE:XECUSDT',
      'CRV': 'BINANCE:CRVUSDT',
      'LUNA': 'BINANCE:LUNAUSDT',
      'LOOKS': 'BINANCE:LOOKSUSDT',
      'TWT': 'BINANCE:TWTUSDT',
      'W': 'BINANCE:WUSDT',
      'CAKE': 'BINANCE:CAKEUSDT',
      'CVX': 'BINANCE:CVXUSDT',
      'SNX': 'BINANCE:SNXUSDT',
      'BSV': 'BINANCE:BSVUSDT',
      'LPT': 'BINANCE:LPTUSDT',
      'SUSHI': 'BINANCE:SUSHIUSDT',
      'BLUR': 'BINANCE:BLURUSDT',
      'MASK': 'BINANCE:MASKUSDT',
      'OSMO': 'OSMOSIS:OSMOUSDT',
      'GLM': 'BINANCE:GLMUSDT'
    };

    return tradingPairs[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}USDT`;
  };

  // Optimerad chart loading med aggressiv cachning
  const loadTradingViewChart = useCallback((container: HTMLElement, symbol: string) => {
    if (chartInitialized.current) return;
    
    try {
      setIsLoading(true);
      
      // Preload TradingView script i cache
      const scriptSrc = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      
      const loadScript = () => {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.defer = true;
        
        const tradingSymbol = getTradingViewSymbol(symbol);
        
        // Optimerad konfiguration för snabbast möjliga laddning
        const config = {
          width: "100%",
          height: "700",
          symbol: tradingSymbol,
          interval: "1D",
          timezone: "Europe/Stockholm",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false, // Disabled för prestanda
          hide_side_toolbar: false,
          allow_symbol_change: false, // Disabled för prestanda
          studies: [],
          container_id: "tradingview_chart",
          autosize: true,
          hide_volume: false,
          calendar: false, // Disabled för prestanda
          news: [], // Disabled för prestanda
          hotlist: false // Disabled för prestanda
        };
        
        script.innerHTML = JSON.stringify(config);
        
        // Onload event för snabb feedback
        script.onload = () => {
          setIsLoading(false);
          setChartError(false);
          chartInitialized.current = true;
        };
        
        script.onerror = () => {
          setChartError(true);
          setIsLoading(false);
        };
        
        container.appendChild(script);
        tradingViewScriptRef.current = script;
      };

      // Instant loading utan delay
      loadScript();
      
    } catch (error) {
      console.error('Error loading TradingView chart:', error);
      setChartError(true);
      setIsLoading(false);
    }
  }, []);

  // Preload nästa chart för ännu snabbare navigering
  const preloadChart = useCallback((symbol: string) => {
    const tradingSymbol = getTradingViewSymbol(symbol);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js`;
    link.as = 'script';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!crypto) return;

    chartInitialized.current = false;
    
    const loadChart = () => {
      const chartContainer = chartRef.current;
      if (!chartContainer) return;

      // Instant clear och reload
      chartContainer.innerHTML = '';
      loadTradingViewChart(chartContainer, crypto.symbol);
    };

    // Instant loading - ingen delay
    loadChart();

    // Preload nästa populära charts
    const popularSymbols = ['BTC', 'ETH', 'SOL', 'BNB'];
    popularSymbols.forEach(symbol => {
      if (symbol !== crypto.symbol) {
        preloadChart(symbol);
      }
    });

    return () => {
      chartInitialized.current = false;
      if (tradingViewScriptRef.current) {
        tradingViewScriptRef.current.remove();
        tradingViewScriptRef.current = null;
      }
    };
  }, [crypto, loadTradingViewChart, preloadChart]);

  // Instant chart reload för prestanda
  const reloadChart = useCallback(() => {
    if (!crypto || !chartRef.current) return;
    
    chartInitialized.current = false;
    chartRef.current.innerHTML = '';
    loadTradingViewChart(chartRef.current, crypto.symbol);
  }, [crypto, loadTradingViewChart]);


  if (!symbol || !info) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-12">
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
        <Header />
        <div className="pt-20 pb-12">
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
                <div className="text-sm">{formatChange(crypto.change24h)}</div>
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
              <div className="font-display font-bold text-sm md:text-base">{info.supply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Max Utbud</span>
              </div>
              <div className="font-display font-bold text-sm md:text-base">{info.maxSupply}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">24h Förändring</span>
              </div>
              <div className="font-display font-bold text-xs md:text-sm">{formatChange(crypto.change24h)}</div>
            </Card>
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">Rank</span>
              </div>
              <div className="font-display font-bold text-xs md:text-sm">#{crypto.rank}</div>
            </Card>
          </div>

          {/* TradingView Chart - Optimerad för prestanda */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-crypto text-xl font-bold">Live Chart</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reloadChart}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Laddar..." : "Uppdatera"}
                </Button>
              </div>
            </div>
            
            {chartError ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chart kunde inte laddas</h3>
                <p className="text-muted-foreground mb-4">
                  Det gick inte att ladda chart för {crypto.symbol}. Prova att uppdatera.
                </p>
                <Button onClick={reloadChart} variant="outline">
                  <RefreshCw size={16} className="mr-2" />
                  Försök igen
                </Button>
              </div>
            ) : (
              <div 
                ref={chartRef}
                id="tradingview_chart" 
                className="w-full rounded-lg overflow-hidden relative"
                style={{ 
                  height: '700px',
                  minHeight: '700px'
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                      <span className="font-crypto">Laddar chart...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Description and Links */}
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/80 backdrop-blur-sm">
                <h3 className="font-crypto text-xl font-bold mb-4">Om {crypto.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {info.description}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={info.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Globe size={16} />
                      Officiell Webbplats
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                  
                  {info.whitepaper && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={info.whitepaper} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Whitepaper
                        <ExternalLink size={14} />
                      </a>
                    </Button>
                  )}
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
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Marknadskapital</span>
                    <span className="font-display font-semibold">${crypto.marketCap}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailPage;