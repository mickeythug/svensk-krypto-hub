import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Trophy,
  Target,
  Clock,
  Globe,
  MessageCircle,
  Zap,
  AlertCircle,
  ChevronUp,
  Bitcoin,
  CircleDollarSign,
  Coins,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from "lucide-react";
import Header from "@/components/Header";
import { useCryptoData } from "@/hooks/useCryptoData";

// Import crypto logos
import btcLogo from "@/assets/crypto-logos/btc.png";
import ethLogo from "@/assets/crypto-logos/eth.png";
import bnbLogo from "@/assets/crypto-logos/bnb.png";
import xrpLogo from "@/assets/crypto-logos/xrp.png";
import adaLogo from "@/assets/crypto-logos/ada.png";
import solLogo from "@/assets/crypto-logos/sol.png";
import dotLogo from "@/assets/crypto-logos/dot.png";
import avaxLogo from "@/assets/crypto-logos/avax.png";
import linkLogo from "@/assets/crypto-logos/link.png";
import maticLogo from "@/assets/crypto-logos/matic.png";
import dogeLogo from "@/assets/crypto-logos/doge.png";
import shibLogo from "@/assets/crypto-logos/shib.png";
import ltcLogo from "@/assets/crypto-logos/ltc.png";

const MarketOverviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("top10");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = 15; // 15 tokens per sida som begärt
  const navigate = useNavigate();
  const { cryptoPrices, isLoading, error } = useCryptoData();

  // TrustWallet GitHub logo mappning för riktiga token loggor
  const getCryptoLogo = (crypto: any) => {
    const baseUrl = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains';
    
    // Mapping för tokens med blockchain och adresser
    const tokenMapping: { [key: string]: string } = {
      // Native blockchain tokens
      'BTC': `${baseUrl}/bitcoin/info/logo.png`,
      'ETH': `${baseUrl}/ethereum/info/logo.png`,
      'BNB': `${baseUrl}/binance/assets/BNB/logo.png`,
      'SOL': `${baseUrl}/solana/info/logo.png`,
      'ADA': `${baseUrl}/cardano/info/logo.png`,
      'DOT': `${baseUrl}/polkadot/info/logo.png`,
      'AVAX': `${baseUrl}/avalanchec/info/logo.png`,
      'MATIC': `${baseUrl}/polygon/info/logo.png`,
      'LTC': `${baseUrl}/litecoin/info/logo.png`,
      'TRX': `${baseUrl}/tron/info/logo.png`,
      
      // Ethereum ERC-20 tokens
      'USDT': `${baseUrl}/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
      'USDC': `${baseUrl}/ethereum/assets/0xA0b86a33E6441986C3b94C2e3e583d6cED813331/logo.png`,
      'UNI': `${baseUrl}/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png`,
      'LINK': `${baseUrl}/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png`,
      'PEPE': `${baseUrl}/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png`,
      'SHIB': `${baseUrl}/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png`,
      'XRP': `${baseUrl}/ethereum/assets/0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE/logo.png`,
      
      // Andra populära tokens
      'AAVE': `${baseUrl}/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png`,
      'MKR': `${baseUrl}/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png`,
      'COMP': `${baseUrl}/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png`,
      'YFI': `${baseUrl}/ethereum/assets/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.png`,
      'SUSHI': `${baseUrl}/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png`,
      'CRV': `${baseUrl}/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png`,
      'SNX': `${baseUrl}/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png`,
      'BAL': `${baseUrl}/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png`,
      'RUNE': `${baseUrl}/ethereum/assets/0x3155BA85D5F96b2d030a4966AF206230e46849cb/logo.png`,
      'THETA': `${baseUrl}/ethereum/assets/0x3883f5e181fccaF8410FA61e12b59BAd963fb645/logo.png`,
      'VET': `${baseUrl}/ethereum/assets/0xD850942eF8811f2A866692A623011bDE52a462C1/logo.png`,
      'FTM': `${baseUrl}/ethereum/assets/0x4E15361FD6b4BB609Fa63C81A2be19d873717870/logo.png`,
      'ALGO': `${baseUrl}/algorand/info/logo.png`,
      'XTZ': `${baseUrl}/tezos/info/logo.png`,
      'ATOM': `${baseUrl}/cosmos/info/logo.png`,
      'NEO': `${baseUrl}/neo/info/logo.png`,
      'IOTA': `${baseUrl}/ethereum/assets/0xcc8a3F9c0fC81F0b85C142c0a2e84aa3C26BC7FC/logo.png`,
      'EOS': `${baseUrl}/ethereum/assets/0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0/logo.png`,
      'XLM': `${baseUrl}/ethereum/assets/0x0F5D2fB29fb7d3CFeE444a200298f468908cC942/logo.png`,
      'XMR': `${baseUrl}/ethereum/assets/0xfa05A73FfE78ef8f1a739473e462c54bae6567D9/logo.png`,
      'ZEC': `${baseUrl}/ethereum/assets/0xEcF0bDa2cABA4A6a102a15DD1c1D8CFFCE8BBAA3/logo.png`,
      'DASH': `${baseUrl}/ethereum/assets/0x7C5A0CE9267ED19B22F8cae653F198e3E8daf098/logo.png`,
      'BCH': `${baseUrl}/bitcoincash/info/logo.png`,
      'BSV': `${baseUrl}/ethereum/assets/0x6a2f4dc63c08c3b7a71B8B4A0e2D78aE3F6A5EDD/logo.png`,
      'ETC': `${baseUrl}/ethereumclassic/info/logo.png`,
      'FIL': `${baseUrl}/ethereum/assets/0x6e1A19F235bE7ED8E3369eF73b196C07257494DE/logo.png`,
      'HBAR': `${baseUrl}/ethereum/assets/0x88ACDd2a6425c3FAAe4bC9650Fd7E27e0Bebb7aB/logo.png`,
      'ICP': `${baseUrl}/ethereum/assets/0xfaAe27E626460EF0B8C3BE9C1c7AD0d0DF5b2B79/logo.png`,
      'NEAR': `${baseUrl}/ethereum/assets/0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4/logo.png`,
      'FLOW': `${baseUrl}/ethereum/assets/0x5f64b5c3eBc7dd64cC1b2E5F9C8c7A46616C5770/logo.png`,
      'MANA': `${baseUrl}/ethereum/assets/0x0F5D2fB29fb7d3CFeE444a200298f468908cC942/logo.png`,
      'SAND': `${baseUrl}/ethereum/assets/0x3845badAde8e6dFF049820680d1F14bD3903a5d0/logo.png`,
      'AXS': `${baseUrl}/ethereum/assets/0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b/logo.png`,
      'CHZ': `${baseUrl}/ethereum/assets/0x3506424F91fD33084466F402d5D97f05F8e3b4AF/logo.png`,
      'ENJ': `${baseUrl}/ethereum/assets/0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c/logo.png`,
      'BAT': `${baseUrl}/ethereum/assets/0x0D8775F648430679A709E98d2b0Cb6250d2887EF/logo.png`,
      'ZRX': `${baseUrl}/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png`,
      'REP': `${baseUrl}/ethereum/assets/0x221657776846890989a759BA2973e427DfF5C9bB/logo.png`,
      'KNC': `${baseUrl}/ethereum/assets/0xdd974D5C2e2928deA5F71b9825b8b646686BD200/logo.png`,
      'LRC': `${baseUrl}/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png`,
      'BNT': `${baseUrl}/ethereum/assets/0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C/logo.png`,
      'GNT': `${baseUrl}/ethereum/assets/0xa74476443119A942dE498590Fe1f2454d7D4aC0d/logo.png`,
      'OMG': `${baseUrl}/ethereum/assets/0xd26114cd6EE289AccF82350c8d8487fedB8A0C07/logo.png`,
      'ZIL': `${baseUrl}/ethereum/assets/0x05f4a42e251f2d52b8ed15E9FEdAacFcEF1FAD27/logo.png`,
      'QTUM': `${baseUrl}/ethereum/assets/0x9a642d6b3368ddc662CA244bAdf32cDA716005BC/logo.png`,
      'ICX': `${baseUrl}/ethereum/assets/0xb5A5F22694352C15B00323844aD545ABb2B11028/logo.png`,
      'ONT': `${baseUrl}/ethereum/assets/0xd26114cd6EE289AccF82350c8d8487fedB8A0C07/logo.png`,
      'DGB': `${baseUrl}/digibyte/info/logo.png`,
      'RVN': `${baseUrl}/ravencoin/info/logo.png`,
      'SC': `${baseUrl}/ethereum/assets/0xd13c7342e1ef687C5ad21b27c2b65D772cAb5C8c/logo.png`,
      'DCR': `${baseUrl}/ethereum/assets/0x42dBBd5AE373FEA2FC320F5d9b9d510a45013f39/logo.png`,
      'NANO': `${baseUrl}/ethereum/assets/0x0Ced95cd3F0E8A6a138c0e25E51F2c1bCcF506Be/logo.png`,
      'BEA': `${baseUrl}/ethereum/assets/0x774BBC5D1D54aF3a1eD4cB0c7c0fA5e0bC3E1c2D/logo.png`,
      'STORJ': `${baseUrl}/ethereum/assets/0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC/logo.png`,
      'GNO': `${baseUrl}/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png`,
      'POWR': `${baseUrl}/ethereum/assets/0x595832F8FC6BF59c85C527fEC3740A1b7a361269/logo.png`,
      'REQ': `${baseUrl}/ethereum/assets/0x8f8221aFbB33998d8584A2B05749bA73c37a938a/logo.png`,
      'ARDR': `${baseUrl}/ethereum/assets/0xcdcFc0f66c522Fd086A1b725ea3c0Eeb9F9e8814/logo.png`,
      'ARK': `${baseUrl}/ethereum/assets/0x6Aeb95F06CDA84cA345c2dE0F3B7f96923a44f4c/logo.png`,
      'KMD': `${baseUrl}/ethereum/assets/0x5DBcF33d8c2E976c6b560249878e6F1491Bca25c/logo.png`,
      'LSK': `${baseUrl}/ethereum/assets/0x6881cb12AeDBfb7Cb4c8C122D270Aa3E35355c8c/logo.png`,
      'STRAT': `${baseUrl}/ethereum/assets/0x5c872500c00565505F3624AB435c222E558E9ff8/logo.png`,
      'WAVES': `${baseUrl}/waves/info/logo.png`,
      'NXT': `${baseUrl}/ethereum/assets/0xA15C7Ebe1f07CaF6bFF097D8a589fb8AC49Ae5B3/logo.png`,
      'BTS': `${baseUrl}/ethereum/assets/0x08389495D7456E1951ddF7c3a8B275A6646d22bE/logo.png`,
      'STEEM': `${baseUrl}/ethereum/assets/0xD7525E80229ac4F0928DaA7B85dBDe1e3f8163b8/logo.png`,
      'XEM': `${baseUrl}/ethereum/assets/0x84a401be2e7d1B1D4EaA2b82F71C20De2C1dA806/logo.png`,
      'DOGE': `${baseUrl}/dogecoin/info/logo.png`,
      'BONK': `${baseUrl}/solana/assets/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png`,
      'FLOKI': `${baseUrl}/ethereum/assets/0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E/logo.png`
    };

    // Kontrollera om vi har en direkt mapping
    if (tokenMapping[crypto.symbol]) {
      return tokenMapping[crypto.symbol];
    }

    // Fallback till lokala bilder om TrustWallet inte har token
    const localFallback: { [key: string]: string } = {
      'BTC': btcLogo,
      'ETH': ethLogo,
      'BNB': bnbLogo,
      'XRP': xrpLogo,
      'ADA': adaLogo,
      'SOL': solLogo,
      'DOT': dotLogo,
      'AVAX': avaxLogo,
      'LINK': linkLogo,
      'MATIC': maticLogo,
      'DOGE': dogeLogo,
      'SHIB': shibLogo,
      'LTC': ltcLogo
    };
    
    return localFallback[crypto.symbol] || btcLogo;
  };

  const marketSentiment = {
    overall: 68,
    fearGreedIndex: 72,
    socialVolume: 85,
    newsVolume: 76,
    trend: 'bullish' as const,
    change24h: 4.2
  };
  
  const marketData = {
    totalMarketCap: "2.1T",
    totalVolume: "89.5B",
    btcDominance: 52.3,
    ethDominance: 17.8,
    activeAddresses: "1.2M",
    defiTvl: "45.2B"
  };

  const marketStats = [
    {
      title: "Total Marknadskapital",
      value: "2.1T",
      unit: "USD",
      change: "+2.34%",
      positive: true,
      icon: DollarSign
    },
    {
      title: "24h Volym",
      value: "95.2B",
      unit: "USD", 
      change: "-5.67%",
      positive: false,
      icon: BarChart3
    },
    {
      title: "Bitcoin Dominans",
      value: "52.8",
      unit: "%",
      change: "+0.12%",
      positive: true,
      icon: PieChart
    },
    {
      title: "DeFi TVL",
      value: "48.9B",
      unit: "USD",
      change: "+8.91%",
      positive: true,
      icon: Activity
    }
  ];

  const getCurrentData = () => {
    // Använd riktig top 100 data från CoinGecko API
    if (!cryptoPrices || cryptoPrices.length === 0) return [];
    
    // Konvertera riktig data till rätt format för tabellen
    const formattedCrypto = cryptoPrices.map(crypto => ({
      rank: crypto.rank || 1,
      name: crypto.name,
      symbol: crypto.symbol,
      slug: crypto.symbol.toLowerCase(),
      price: crypto.price,
      change1h: 0, // CoinGecko markets API ger inte 1h data direkt
      change24h: crypto.change24h,
      change7d: 0, // CoinGecko markets API ger inte 7d data direkt
      marketCap: crypto.marketCap || "0",
      volume: crypto.volume || "0",
      supply: `${crypto.supply || "0"} ${crypto.symbol}`,
      image: crypto.image // Inkludera riktig bild URL
    }));

    switch (activeTab) {
      case "trending":
        // Sortera efter högst positiv 24h förändring (trending up)
        return formattedCrypto
          .filter(crypto => crypto.change24h > 5) // Bara tokens med >5% ökning
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "meme":
        // Visa populära meme tokens
        return formattedCrypto.filter(crypto => 
          ['DOGE', 'SHIB', 'PEPE', 'BONK', 'FLOKI'].includes(crypto.symbol)
        );
      case "gainers":
        // Sortera efter högst positiv förändring
        return formattedCrypto
          .filter(crypto => crypto.change24h > 0)
          .sort((a, b) => b.change24h - a.change24h)
          .slice(0, 50);
      case "losers":
        // Sortera efter lägst negativ förändring
        return formattedCrypto
          .filter(crypto => crypto.change24h < 0)
          .sort((a, b) => a.change24h - b.change24h)
          .slice(0, 50);
      case "all":
        return formattedCrypto; // Visa alla 100
      default:
        // Top 10 sorterat efter market cap rank
        return formattedCrypto
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10);
    }
  };

  const filteredData = getCurrentData().filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when changing tabs or search
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    } else if (price < 0.001) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // Mini sparkline component
  const MiniSparkline = ({ change }: { change: number }) => {
    const isPositive = change >= 0;
    return (
      <div className="w-16 h-8 flex items-center justify-center">
        <svg width="60" height="24" viewBox="0 0 60 24" className="overflow-visible">
          <path
            d={isPositive 
              ? "M2 20 L15 12 L30 8 L45 4 L58 2" 
              : "M2 4 L15 8 L30 12 L45 16 L58 20"
            }
            stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
            strokeWidth="2"
            fill="none"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Version - Modern CoinMarketCap Style */}
      <div className="hidden md:block min-h-screen bg-background">
        <Header />
        
        {/* Main Container */}
        <div className="pt-16 bg-background">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-background via-background to-secondary/5 border-b border-border/30">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h1 className="font-crypto text-4xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                MARKNADSÖVERSIKT
              </h1>
              <p className="font-display text-lg text-muted-foreground">
                Realtidsöversikt av kryptomarknaden
              </p>
            </div>
          </div>

          {/* Modern Sentiment Dashboard */}
          <div className="bg-secondary/5 border-b border-border/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Total Market Cap Card */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Market Cap</h3>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">${marketData.totalMarketCap}</div>
                  <div className="text-sm text-success font-medium">+2.4% (24h)</div>
                </div>

                {/* Fear & Greed Index */}
                <div className="bg-gradient-to-br from-success/10 to-warning/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-success/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Fear & Greed Index</h3>
                    <Activity className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold text-success mb-2">{marketSentiment.fearGreedIndex}</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-success font-medium">Greed</div>
                </div>

                {/* Alt Season Index */}
                <div className="bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-accent/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Alt Season Index</h3>
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-accent mb-2">65</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="text-sm text-accent font-medium">Alt Season</div>
                </div>

                {/* BTC Dominance */}
                <div className="bg-gradient-to-br from-warning/10 to-destructive/10 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-warning/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
                    <Bitcoin className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold text-warning mb-2">{marketData.btcDominance}%</div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-2 rounded-full transition-all duration-500"
                      style={{ width: `${marketData.btcDominance}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-warning font-medium">BTC Season</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-background border-b border-border/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* Title */}
                <div>
                  <h2 className="font-crypto text-2xl font-bold text-primary mb-1">
                    KRYPTOVALUTOR
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Visar {startIndex + 1}-{Math.min(endIndex, filteredData.length)} av {filteredData.length} kryptovalutor
                  </p>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Sök kryptovaluta..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 w-full sm:w-80 bg-background border-border/50 focus:border-primary h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === "table" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-11 px-4"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "grid" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-11 px-4"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="h-11 px-6 border-border/50 hover:border-primary">
                      <Star className="h-4 w-4 mr-2" />
                      Favoriter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tabs - Modern Style */}
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6 h-12 p-1 bg-secondary/10 rounded-xl border border-border/20">
                    <TabsTrigger 
                      value="top10" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>TOP 10</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trending" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Flame className="h-4 w-4" />
                      <span>Trending</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meme" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <Target className="h-4 w-4" />
                      <span>Meme</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gainers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Toppar</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="losers" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <TrendingDown className="h-4 w-4" />
                      <span>Fallande</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Alla</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Data Display - Table or Grid */}
          <div className="bg-background">
            <div className="max-w-7xl mx-auto px-6">
              
              {viewMode === "table" ? (
                // Table View
                <div className="bg-background/50 backdrop-blur-sm rounded-t-xl border border-border/20 border-b-0 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/20 bg-secondary/10">
                        <TableHead className="text-center font-semibold py-4 px-6 text-muted-foreground w-16">#</TableHead>
                        <TableHead className="text-left font-semibold py-4 px-6 text-muted-foreground w-80">Namn</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">Pris</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">1h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">24h %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-24">7d %</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-40">Market Cap</TableHead>
                        <TableHead className="text-right font-semibold py-4 px-6 text-muted-foreground w-32">Volym (24h)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((crypto, index) => (
                        <TableRow 
                          key={crypto.symbol}
                          className="hover:bg-secondary/10 cursor-pointer transition-all duration-200 border-b border-border/10 group h-16"
                          onClick={() => navigate(`/crypto/${crypto.slug}`)}
                        >
                          {/* Rank */}
                          <TableCell className="text-center py-4 px-6">
                            <Badge variant="secondary" className="text-xs px-2 py-1 bg-secondary/30 text-muted-foreground font-medium">
                              #{crypto.rank}
                            </Badge>
                          </TableCell>
                          
                          {/* Name & Logo */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-border/20">
                                <img 
                                  src={getCryptoLogo(crypto)} 
                                  alt={crypto.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                                  {crypto.name}
                                </div>
                                <div className="text-sm text-muted-foreground font-mono font-medium">
                                  {crypto.symbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Price */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono font-semibold text-foreground text-base">
                              {formatPrice(crypto.price)}
                            </div>
                          </TableCell>
                          
                          {/* 1h Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change1h >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change1h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* 24h Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change24h >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* 7d Change */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
                              crypto.change7d >= 0 
                                ? 'text-success bg-success/10' 
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {crypto.change7d >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          
                          {/* Market Cap */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono text-muted-foreground text-sm">
                              ${crypto.marketCap}
                            </div>
                          </TableCell>
                          
                          {/* Volume */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="font-mono text-muted-foreground text-sm">
                              ${crypto.volume}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 py-6">
                  {currentData.map((crypto) => (
                    <Card 
                      key={crypto.symbol}
                      className="p-6 hover:shadow-lg cursor-pointer transition-all duration-200 border border-border/20 hover:border-primary/30 bg-background/50 backdrop-blur-sm"
                      onClick={() => navigate(`/crypto/${crypto.slug}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-border/20">
                            <img 
                              src={getCryptoLogo(crypto)} 
                              alt={crypto.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{crypto.name}</h3>
                            <p className="text-muted-foreground font-mono">{crypto.symbol}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-secondary/30">
                          #{crypto.rank}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pris</span>
                          <span className="font-mono font-semibold text-lg">{formatPrice(crypto.price)}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">1h</p>
                            <div className={`text-sm font-medium ${
                              crypto.change1h >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change1h >= 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">24h</p>
                            <div className={`text-sm font-medium ${
                              crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">7d</p>
                            <div className={`text-sm font-medium ${
                              crypto.change7d >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-border/20">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Market Cap</span>
                            <span className="font-mono">${crypto.marketCap}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Volume</span>
                            <span className="font-mono">${crypto.volume}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination - Modern Style */}
              <div className="bg-background/50 backdrop-blur-sm border border-border/20 border-t-0 rounded-b-xl px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Visar <span className="font-medium text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> av <span className="font-medium text-foreground">{filteredData.length}</span> kryptovalutor
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={`h-10 px-4 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/20'} border border-border/30 rounded-lg`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className={`h-10 w-10 cursor-pointer border border-border/30 rounded-lg ${
                                currentPage === page 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'hover:bg-secondary/20'
                              }`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-10 w-10" />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={`h-10 px-4 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/20'} border border-border/30 rounded-lg`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Exact Reference Match */}
      <div className="block md:hidden min-h-screen bg-background">
        <Header />
        
        <div className="pt-16 bg-background">
          
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border/20">
            <h1 className="font-crypto text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MARKNAD
            </h1>
            <p className="text-muted-foreground">Live crypto data</p>
          </div>

          {/* Mobile Sentiment Dashboard */}
          <div className="p-4 bg-secondary/5 border-b border-border/20">
            <div className="space-y-4">
              
              {/* Market Cap & Volume Row */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Market Cap</span>
                  </div>
                  <div className="text-lg font-bold text-primary mb-1">
                    ${marketData.totalMarketCap}
                  </div>
                  <div className="text-xs text-success font-medium">+2.4%</div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-secondary" />
                    <span className="text-xs text-muted-foreground font-medium">24h Volume</span>
                  </div>
                  <div className="text-lg font-bold text-secondary mb-1">
                    ${marketData.totalVolume}
                  </div>
                  <div className="text-xs text-destructive font-medium">-1.2%</div>
                </Card>
              </div>

              {/* Fear & Greed Index */}
              <Card className="p-4 bg-gradient-to-br from-success/10 to-warning/10 border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground font-medium">Fear & Greed Index</span>
                  </div>
                  <div className="text-lg font-bold text-success">{marketSentiment.fearGreedIndex}</div>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-destructive via-warning to-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                  ></div>
                </div>
                <div className="text-xs text-success font-medium">Greed</div>
              </Card>

              {/* Alt Season & BTC Dominance Row */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-medium">Alt Season</span>
                  </div>
                  <div className="text-lg font-bold text-accent mb-1">65</div>
                  <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-500"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-accent font-medium">Alt Season</div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-warning/10 to-destructive/10 border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bitcoin className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground font-medium">BTC Dom</span>
                  </div>
                  <div className="text-lg font-bold text-warning mb-1">{marketData.btcDominance}%</div>
                  <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-gradient-to-r from-warning to-destructive h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${marketData.btcDominance}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-warning font-medium">BTC Season</div>
                </Card>
              </div>
            </div>
          </div>

          {/* Mobile Search and Tabs */}
          <div className="sticky top-16 z-20 bg-background border-b border-border/30">
            <div className="p-3">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Sök kryptovaluta..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 bg-background/50 border-border/50 h-9 text-sm"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-secondary/20 w-full">
                  <TabsTrigger value="top10" className="text-xs py-2">TOP 10</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs py-2">Trend</TabsTrigger>
                  <TabsTrigger value="meme" className="text-xs py-2">Meme</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-secondary/20 w-full mt-1">
                  <TabsTrigger value="gainers" className="text-xs py-2">Toppar</TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs py-2">Fallande</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs py-2">Alla</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center justify-between p-4 text-muted-foreground text-xs font-medium">
              <div className="flex items-center space-x-1">
                <span>#</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Market Cap</span>
                <ChevronUp className="h-3 w-3" />
              </div>
              <span>Price</span>
              <span>24h %</span>
            </div>
          </div>

          {/* Mobile List */}
          <div className="divide-y divide-border/20">
            {currentData.map((crypto, index) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between p-4 hover:bg-secondary/10 cursor-pointer transition-colors"
                onClick={() => navigate(`/crypto/${crypto.slug}`)}
              >
                {/* Rank */}
                <div className="w-8 text-muted-foreground text-sm font-medium">
                  {crypto.rank}
                </div>

                {/* Coin Info */}
                <div className="flex-1 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white">
                    <img 
                      src={getCryptoLogo(crypto)} 
                      alt={crypto.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">
                      {crypto.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${crypto.marketCap}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right mr-6">
                  <div className="font-mono font-semibold text-foreground text-sm">
                    {crypto.price >= 1000 
                      ? `${(crypto.price / 1000).toFixed(0)} ${crypto.price >= 1000000 ? "M" : "K"} $`
                      : crypto.price < 0.01 
                      ? `${crypto.price.toFixed(4)} $`
                      : `${crypto.price.toFixed(2)} $`
                    }
                  </div>
                </div>

                {/* 24h Change with Mini Chart */}
                <div className="flex items-center space-x-2">
                  <MiniSparkline change={crypto.change24h} />
                  <div className={`flex items-center text-xs font-medium ${
                    crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${crypto.change24h < 0 ? 'rotate-180' : ''}`} />
                    {crypto.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, filteredData.length)} av {filteredData.length}
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketOverviewPage;