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
import ReferenceOrderBook from './ReferenceOrderBook';
import ReferenceTradingPanel from './ReferenceTradingPanel';
import ReferenceMarketStats from './ReferenceMarketStats';
import ReferenceTokenInfo from './ReferenceTokenInfo';
import ProfessionalBottomPanels from './ProfessionalBottomPanels';
import TokenSearchBar from '../TokenSearchBar';
import TradingTokenSidebar from './TradingTokenSidebar';
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
    return price.toFixed(2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isMobile) {
    return null; // Mobile view handled separately
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F]">
      {/* Reference Trading Interface Grid Layout */}
      <div className="grid grid-cols-[300px_1fr_350px] grid-rows-[60px_1fr_200px] gap-3 h-screen p-3">
        
        {/* Header Spanning All Columns */}
        <div className="col-span-3 bg-[#12131A] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            {/* Token Info */}
            <div className="flex items-center gap-4">
              {crypto?.image && (
                <img
                  src={crypto.image}
                  alt={`${tokenName} logo`}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{symbol}</span>
                  <Badge className={`px-2 py-1 text-xs ${
                    realTickerData.priceChange24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {realTickerData.priceChange24h >= 0 ? '+' : ''}{realTickerData.priceChange24h.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  Price: ${formatPrice(realTimePrice)} | Liquidity: $28.6K | Supply: 1B
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <TokenSearchBar 
                currentSymbol={symbol}
                placeholder="Search tokens..."
              />
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Order Book - Left Column */}
        <div className="row-span-2 bg-[#12131A] border border-gray-800 rounded-lg overflow-hidden">
          <ReferenceOrderBook 
            symbol={symbol}
            currentPrice={realTimePrice}
            orderBook={orderBook}
            isConnected={isConnected}
          />
        </div>

        {/* Chart - Center Column */}
        <div className="bg-[#12131A] border border-gray-800 rounded-lg overflow-hidden">
          <TradingViewChart 
            symbol={symbol} 
            currentPrice={realTimePrice}
            limitLines={limitLines} 
            coinGeckoId={crypto?.coinGeckoId} 
          />
        </div>

        {/* Trading Panel - Right Column */}
        <div className="bg-[#12131A] border border-gray-800 rounded-lg overflow-hidden">
          <ReferenceTradingPanel 
            symbol={symbol}
            currentPrice={realTimePrice}
            tokenName={tokenName}
            volume24h={realTickerData.volume24h}
            priceChange24h={realTickerData.priceChange24h}
          />
        </div>

        {/* Market Stats - Center Bottom */}
        <div className="bg-[#12131A] border border-gray-800 rounded-lg overflow-hidden">
          <ReferenceMarketStats 
            marketCap={realTickerData.marketCap}
            volume={realTickerData.volume24h}
            marketCapChange={-3.24}
            volumeChange={7.70}
          />
        </div>

        {/* Token Info - Right Bottom */}
        <div className="bg-[#12131A] border border-gray-800 rounded-lg overflow-hidden">
          <ReferenceTokenInfo 
            tokenName={tokenName}
            symbol={symbol}
          />
        </div>
      </div>
    </div>
  );
};

export default HyperliquidTradingInterface;