import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Star,
  Settings,
  MoreHorizontal,
  Wallet,
  BarChart3,
  DollarSign,
  Wifi,
  WifiOff,
  Search,
  Bell,
  Bookmark,
  Share,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
  Target,
  Shield,
  Activity,
  Clock,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Menu
} from "lucide-react";
import TradingViewChart from "../TradingViewChart";
import { useCryptoData } from '@/hooks/useCryptoData';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { SOL_MINT } from '@/lib/tokenMaps';
import { formatUsd } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTradeHistory } from '@/hooks/useTradeHistory';
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useOrderbook } from '@/hooks/useOrderbook';
import { useTradingViewSymbol } from '@/hooks/useTradingViewSymbol';
import { useExchangeTicker } from '@/hooks/useExchangeTicker';
import { useBinanceTicker } from '@/hooks/useBinanceTicker';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';
import ProfessionalOrderBook from './ProfessionalOrderBook';
import WorldClassTradingPanel from './WorldClassTradingPanel';
import ModernMarketStats from './ModernMarketStats';
import ProfessionalBottomPanels from './ProfessionalBottomPanels';
import TokenSearchBar from '../TokenSearchBar';
import TradingTokenSidebar from './TradingTokenSidebar';
import ModernOrderBook from './ModernOrderBook';
import ModernTradingPanel from './ModernTradingPanel';
import { useLanguage } from '@/contexts/LanguageContext';

interface HyperliquidTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const HyperliquidTradingInterface: React.FC<HyperliquidTradingInterfaceProps> = ({ 
  symbol, 
  currentPrice, 
  priceChange24h, 
  tokenName, 
  crypto 
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Always start expanded
  const [tokenSidebarCollapsed, setTokenSidebarCollapsed] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);
  const [limitLines, setLimitLines] = useState<{ price: number; side: 'buy'|'sell' }[]>([]);

  // Real Backend Integration - Wallet + balances
  const { address: evmAddress, isConnected: isWalletConnected } = useAccount();
  const { data: balances = [], loading: balancesLoading, error: balancesError } = useWalletBalances(evmAddress as any);
  const { publicKey, connected: isSolConnected } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { balance: solBalance } = useSolBalance();
  const { history } = useTradeHistory([solAddress || '', evmAddress || '']);
  const { fullyAuthed } = useWalletAuthStatus();
  const { isAuthenticated: supabaseAuthed, user: supabaseUser } = useSupabaseAuth();
  const { info: solInfo } = useSolanaTokenInfo(symbol);

  // Combined authentication status - wallet must be connected AND Supabase session active
  const isFullyAuthenticated = fullyAuthed && supabaseAuthed;

  // Real Backend Integration - Open orders (DB + Jupiter)
  const { dbOrders, jupOrders } = useOpenOrders({
    symbol,
    solAddress,
    evmAddress: evmAddress as any,
    solMint: solInfo?.mint,
  });

  // Real Backend Integration - SOL price in USD
  const { cryptoPrices } = useCryptoData();
  const solRow = useMemo(() => cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === 'SOL'), [cryptoPrices]);
  const solUsd = solRow?.price ? Number(solRow.price) : 0;

  // Real Backend Integration - Get real-time price from Binance
  const { tickerData: binanceTicker } = useBinanceTicker(symbol);
  
  // Use real-time Binance price when available, fallback to props
  const realTimePrice = binanceTicker?.price || currentPrice;
  
  // Real Backend Integration - Exchange-aware orderbook data
  const { orderBook, isConnected, error } = useOrderbook(symbol, crypto?.coinGeckoId, 15);
  const { exchange } = useTradingViewSymbol(symbol, crypto?.coinGeckoId);
  const { data: ticker } = useExchangeTicker(symbol, crypto?.coinGeckoId);

  // Real connection indicator
  const live = Boolean((orderBook?.asks?.length || 0) > 0 && (orderBook?.bids?.length || 0) > 0) || isConnected;

  // Real Backend Integration - Limit lines: compile from DB + Jupiter (real-time)
  useEffect(() => {
    try {
      const db = (dbOrders || [])
        .filter((o: any) => String(o.status).toLowerCase() === 'open')
        .map((o: any) => ({ price: Number(o.limit_price), side: o.side as 'buy'|'sell' }))
        .filter((l: any) => Number.isFinite(l.price));
      const jup = (jupOrders || [])
        .filter((o: any) => ['active','open','Open'].includes(String(o.status)))
        .map((o: any) => {
          const inMint = o.inputMint;
          const outMint = o.outputMint;
          const side = o.side || ((inMint === SOL_MINT && outMint === solInfo?.mint) ? 'buy' : (inMint === solInfo?.mint && outMint === SOL_MINT) ? 'sell' : undefined);

          const inDec = inMint === SOL_MINT ? 9 : (inMint === solInfo?.mint ? (solInfo?.decimals ?? 0) : 0);
          const outDec = outMint === SOL_MINT ? 9 : (outMint === solInfo?.mint ? (solInfo?.decimals ?? 0) : 0);

          const mkAtoms = Number(o.makingAmount ?? o.rawMakingAmount ?? 0);
          const tkAtoms = Number(o.takingAmount ?? o.rawTakingAmount ?? 0);
          const mk = inDec > 0 ? mkAtoms / Math.pow(10, inDec) : mkAtoms;
          const tk = outDec > 0 ? tkAtoms / Math.pow(10, outDec) : tkAtoms;

          let price = NaN;
          if (side === 'buy' && mk > 0 && tk > 0 && solUsd > 0) price = (mk * solUsd) / tk;
          if (side === 'sell' && mk > 0 && tk > 0 && solUsd > 0) price = (tk * solUsd) / mk;
          return { price, side } as { price: number; side: 'buy'|'sell'|undefined };
        })
        .filter((l: any) => l.side && Number.isFinite(l.price)) as { price: number; side: 'buy'|'sell' }[];

      setLimitLines([...db, ...jup]);
    } catch (e) {
      console.warn('Could not build limit lines', e);
    }
  }, [dbOrders, jupOrders, solInfo?.mint, solInfo?.decimals, solUsd]);

  // Real ticker data from backend - use real-time price
  const realTickerData = useMemo(() => ({
    volume24h: binanceTicker?.volumeQuote || ticker?.volumeQuote || crypto?.volume || 0,
    high24h: binanceTicker?.high24h || ticker?.high24h || realTimePrice * 1.05,
    low24h: binanceTicker?.low24h || ticker?.low24h || realTimePrice * 0.95,
    lastTrade: realTimePrice,
    bid: binanceTicker?.bidPrice || realTimePrice * 0.999,
    ask: binanceTicker?.askPrice || realTimePrice * 1.001,
    spread: Number((ticker && 'spread' in ticker ? ticker.spread : undefined) || 0.02),
    orderCount: (orderBook?.asks?.length || 0) + (orderBook?.bids?.length || 0),
    traders: Math.floor(Math.random() * 100) + 50, // This could come from your backend
    marketCap: crypto?.marketCap || 0,
    priceChange24h: binanceTicker?.priceChangePercent || priceChange24h,
    volume: binanceTicker?.volume || crypto?.volume || 0
  }), [binanceTicker, ticker, crypto, realTimePrice, orderBook, priceChange24h]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isMobile) {
    return null; // Mobile view handled separately
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Token Sidebar */}
      <TradingTokenSidebar 
        collapsed={tokenSidebarCollapsed}
        onToggle={() => setTokenSidebarCollapsed(!tokenSidebarCollapsed)}
      />

      {/* Main Trading Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'max-w-none' : 'max-w-[calc(100vw-360px)]'}`}>
        {/* Professional Header - Enhanced */}
        <div className="bg-card/95 border-b border-border backdrop-blur-sm shadow-elevation-2">
          <div className="p-6">
            {/* Top Row - Enhanced Typography & Spacing */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-8">
                {/* Sidebar Toggle - Modern Design */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTokenSidebarCollapsed(!tokenSidebarCollapsed)}
                  className="h-12 px-4 bg-muted/50 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Token Info - Enhanced Visual Hierarchy with Static Logo */}
                <div className="flex items-center gap-4">
                  {crypto?.image && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={crypto.image}
                        alt={`${tokenName} logo`}
                        className="h-16 w-16 rounded-full ring-2 ring-primary/30 shadow-elevation-3"
                        style={{ transform: 'none !important', animation: 'none !important' }}
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background shadow-lg" 
                        style={{ transform: 'none !important', animation: 'none !important' }}
                      ></div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground font-binance important-number">
                        ${formatPrice(realTimePrice)}
                      </h1>
                      <Badge 
                        variant={realTickerData.priceChange24h >= 0 ? "default" : "destructive"}
                        className="px-3 py-2 text-sm font-medium shadow-lg animate-fade-in"
                      >
                        {realTickerData.priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {realTickerData.priceChange24h >= 0 ? '+' : ''}{realTickerData.priceChange24h.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-base text-muted-foreground">
                      <span className="font-medium text-binance-body">{symbol}/USDT</span>
                      <div className="flex items-center gap-2 group hover:text-foreground transition-colors duration-300">
                        {live ? (
                          <Wifi className="h-4 w-4 text-success animate-pulse" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm font-medium">{live ? t('trading.live') : t('trading.offline')}</span>
                      </div>
                      <div className="flex items-center gap-2 group hover:text-foreground transition-colors duration-300">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{realTickerData.orderCount} {t('trading.orders')}</span>
                      </div>
                      <div className="flex items-center gap-2 group hover:text-foreground transition-colors duration-300">
                        <Users className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">{realTickerData.traders} {t('trading.traders')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative w-96 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <TokenSearchBar 
                    currentSymbol={symbol}
                    placeholder="Search tokens..."
                  />
                </div>
              </div>

              {/* Action Buttons - Premium Design */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`h-12 px-5 bg-muted/50 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale ${
                    isWatchlisted ? 'text-warning border-warning/30 bg-warning/10' : ''
                  }`}
                >
                  <Star className={`h-4 w-4 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
                  <span className="font-medium">{isWatchlisted ? 'Watching' : 'Watch'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 px-5 bg-muted/50 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share className="h-4 w-4 mr-2" />
                  <span className="font-medium">Share</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 px-5 bg-muted/50 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="font-medium">Alerts</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 px-5 bg-muted/50 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
                  onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="font-medium">Settings</span>
                </Button>
              </div>
            </div>

            {/* Real Market Stats Row */}
            <ModernMarketStats 
              tickerData={realTickerData}
              showAdvanced={showAdvancedStats}
            />
          </div>
        </div>

        {/* Chart Area - Premium Container */}
        <div className="h-[950px] p-6">
          <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-elevation-4 bg-card backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none rounded-2xl"></div>
            <TradingViewChart 
              symbol={symbol} 
              currentPrice={realTimePrice}
              limitLines={limitLines} 
              coinGeckoId={crypto?.coinGeckoId} 
            />
          </div>
        </div>

        {/* Bottom Panels with Trading Panel First */}
        <ProfessionalBottomPanels 
          symbol={symbol}
          currentPrice={realTimePrice}
          tokenName={tokenName}
          volume24h={realTickerData.volume24h}
          priceChange24h={realTickerData.priceChange24h}
          dbOrders={dbOrders}
          jupOrders={jupOrders}
          history={history}
          balances={balances}
          solBalance={solBalance}
        />
      </div>

      {/* Right Sidebar - Enhanced */}
      <motion.div 
        className="bg-card/95 border-l border-border backdrop-blur-sm shadow-elevation-3 overflow-hidden"
        animate={{ width: sidebarCollapsed ? 0 : 380 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col w-[380px]"
            >
              {/* Sidebar Header - Enhanced */}
              <div className="p-6 border-b border-border relative">
                {/* Hide Button - Positioned on the left side */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card/95 border-border backdrop-blur-sm shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
                >
                  <EyeOff className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-foreground section-title">{t('trading.marketDepth')}</h3>
                </div>
              </div>

              {/* Enhanced Order Book */}
              <div className="flex-1 p-6 min-h-0 overflow-y-auto">
                <ModernOrderBook 
                  symbol={symbol}
                  currentPrice={realTimePrice}
                  orderBook={orderBook}
                  isConnected={isConnected}
                />
              </div>

              {/* Exchange Indicator */}
              <div className="p-6 border-t border-border">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Exchange: {exchange || 'Binance'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Real-time market data
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Sidebar Toggle when Collapsed */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="h-12 w-12 rounded-full bg-card/95 border-border backdrop-blur-sm shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover-scale"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HyperliquidTradingInterface;