import { useState, useEffect, useMemo } from "react";
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
  EyeOff
} from "lucide-react";
import TradingViewChart from "./TradingViewChart";
import { useCryptoData } from '@/hooks/useCryptoData';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { SOL_MINT } from '@/lib/tokenMaps';
import OrderBook from "./OrderBook";
import TokenSearchBar from "./TokenSearchBar";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useTradingViewSymbol } from "@/hooks/useTradingViewSymbol";
import { formatUsd } from "@/lib/utils";
import { useAccount } from 'wagmi';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTradeHistory } from '@/hooks/useTradeHistory';
import SmartTradePanel from '@/components/trade/SmartTradePanel';
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { supabase } from '@/integrations/supabase/client';
import OpenOrders from '@/components/trade/OpenOrdersPanel';
import { useOpenOrders } from '@/hooks/useOpenOrders';
import PositionsPanel from '@/components/trade/PositionsPanel';
import OrderHistoryPanel from '@/components/trade/OrderHistoryPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';
import { useExchangeTicker } from '@/hooks/useExchangeTicker';

interface DesktopTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const DesktopTradingInterface = ({ symbol, currentPrice, priceChange24h, tokenName, crypto }: DesktopTradingInterfaceProps) => {
  const isMobile = useIsMobile();
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState(currentPrice.toString());
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [limitLines, setLimitLines] = useState<{ price: number; side: 'buy'|'sell' }[]>([]);
  const [openJupOrders, setOpenJupOrders] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [watchlist, setWatchlist] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");

  // Wallet + balances
  const { address: evmAddress, isConnected: isWalletConnected } = useAccount();
  const { data: balances = [], loading: balancesLoading, error: balancesError } = useWalletBalances(evmAddress as any);
  const { publicKey, connected: isSolConnected } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { balance: solBalance } = useSolBalance();
  const { history } = useTradeHistory([solAddress || '', evmAddress || '']);
  const { fullyAuthed } = useWalletAuthStatus();
  const { info: solInfo } = useSolanaTokenInfo(symbol);

  // Öppna orders (DB + Jupiter)
  const { dbOrders, jupOrders } = useOpenOrders({
    symbol,
    solAddress,
    evmAddress: evmAddress as any,
    solMint: solInfo?.mint,
  });

  // SOL‑pris i USD
  const { cryptoPrices } = useCryptoData();
  const solRow = useMemo(() => cryptoPrices?.find?.((c: any) => (c.symbol || '').toUpperCase() === 'SOL'), [cryptoPrices]);
  const solUsd = solRow?.price ? Number(solRow.price) : 0;

  // Exchange-aware orderbook data
  const { orderBook, isConnected, error } = useOrderbook(symbol, crypto?.coinGeckoId, 15);
  const { exchange } = useTradingViewSymbol(symbol, crypto?.coinGeckoId);
  const { data: ticker } = useExchangeTicker(symbol, crypto?.coinGeckoId);

  // Connection indicator prefers real book presence
  const live = Boolean((orderBook?.asks?.length || 0) > 0 && (orderBook?.bids?.length || 0) > 0) || isConnected;

  // Debug logging
  useEffect(() => {
    console.log('DesktopTradingInterface loaded for symbol:', symbol);
    console.log('OrderBook state:', { orderBook, isConnected, error });
  }, [symbol, orderBook, isConnected, error]);

  // Limit‑linjer: sammanställ från DB + Jupiter (realtid)
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
      console.warn('Kunde inte bygga limit‑linjer', e);
    }
  }, [dbOrders, jupOrders, solInfo?.mint, solInfo?.decimals, solUsd]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(price);
  };

  const formatSize = (size: number | string) => {
    return parseFloat(size.toString()).toFixed(4);
  };

  const calculateSpread = () => {
    const hasAsks = Array.isArray(orderBook?.asks) && orderBook!.asks.length > 0;
    const hasBids = Array.isArray(orderBook?.bids) && orderBook!.bids.length > 0;
    if (!hasAsks || !hasBids) return '—';
    const bestAsk = Math.min(...orderBook!.asks.map((a) => a.price));
    const bestBid = Math.max(...orderBook!.bids.map((b) => b.price));
    if (!Number.isFinite(bestAsk) || !Number.isFinite(bestBid) || bestBid <= 0) return '—';
    return (Math.abs((bestAsk - bestBid) / bestBid) * 100).toFixed(3);
  };

  const toggleWatchlist = () => {
    setWatchlist(!watchlist);
    // toast would go here in real implementation
  };

  const shareToken = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tokenName} (${symbol})`,
        text: `Kolla in ${tokenName} på Crypto Network Sweden`,
        url: window.location.href
      });
    }
  };

  if (isMobile) {
    return null; // Use mobile-specific component
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Enhanced Price Header */}
        <div className="p-4 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {crypto?.image && (
                  <img
                    src={crypto.image}
                    alt={`${tokenName} (${symbol}) logotyp`}
                    className="h-10 w-10 rounded-full ring-2 ring-primary/20 shadow-sm"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold font-mono text-foreground">
                      {formatUsd(currentPrice)}
                    </h1>
                    <Badge 
                      variant={priceChange24h >= 0 ? "default" : "destructive"}
                      className="px-2 py-1"
                    >
                      {priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{symbol}/USDT</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {live ? (
                        <Wifi className="h-3 w-3 text-success" />
                      ) : (
                        <WifiOff className="h-3 w-3 text-destructive" />
                      )}
                      <span>{live ? 'Live' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-80">
                <TokenSearchBar 
                  currentSymbol={symbol}
                  placeholder="Sök annat token"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWatchlist}
                className={`h-9 px-3 ${watchlist ? 'bg-warning/10 border-warning/30 text-warning' : ''}`}
              >
                <Star className={`h-4 w-4 ${watchlist ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={shareToken} className="h-9 px-3">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Market Stats */}
          <div className="flex items-center gap-8 mt-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">24h High</span>
              <span className="font-mono font-semibold text-success">
                {Number.isFinite(ticker?.high24h as any) ? formatUsd(ticker!.high24h!) : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">24h Low</span>
              <span className="font-mono font-semibold text-destructive">
                {Number.isFinite(ticker?.low24h as any) ? formatUsd(ticker!.low24h!) : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-mono font-semibold">
                {Number.isFinite(ticker?.volumeQuote as any)
                  ? `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ticker!.volumeQuote!)}`
                  : (crypto?.volume ? `$${crypto.volume}` : '—')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-mono font-semibold">
                {crypto?.marketCap ? `$${crypto.marketCap}` : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Spread</span>
              <span className="font-mono font-semibold">
                {calculateSpread()}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="flex-1 p-4 min-h-0">
          <div className="h-full rounded-lg overflow-hidden border border-border shadow-sm">
            <TradingViewChart 
              symbol={symbol} 
              currentPrice={currentPrice} 
              limitLines={limitLines} 
              coinGeckoId={crypto?.coinGeckoId} 
            />
          </div>
        </div>

        {/* Bottom Panels */}
        <div className="h-80 p-4 pt-0">
          <Tabs defaultValue="positions" className="h-full">
            <TabsList className="mb-3 bg-card border border-border rounded-lg p-1 shadow-sm">
              <TabsTrigger value="positions" className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Positions
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Open Orders
              </TabsTrigger>
              <TabsTrigger value="history" className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Order History
              </TabsTrigger>
              <TabsTrigger value="balances" className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Balances
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="h-full">
              <PositionsPanel />
            </TabsContent>
            
            <TabsContent value="orders" className="h-full">
              <OpenOrders symbol={symbol} />
            </TabsContent>
            
            <TabsContent value="history" className="h-full">
              <OrderHistoryPanel symbol={symbol} />
            </TabsContent>
            
            <TabsContent value="balances" className="h-full">
              <Card className="h-full p-6 bg-card border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet Balances
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium">USDC</span>
                    <span className="font-mono text-success">2,450.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium">{symbol}</span>
                    <span className="font-mono">0.000000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium">SOL</span>
                    <span className="font-mono">{(solBalance || 0).toFixed(4)}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Right Sidebar */}
      <div className="w-96 flex flex-col bg-card border-l border-border">
        {/* Orderbook */}
        <div className="flex-1 p-4 min-h-0 max-h-[calc(100vh-520px)]">
          <OrderBook 
            orderBook={orderBook}
            currentPrice={currentPrice}
            symbol={symbol}
            isConnected={isConnected}
          />
        </div>

        {/* Trading Panel */}
        {fullyAuthed ? (
          <div className="h-[480px] p-4 pt-2 mt-2">
            <SmartTradePanel symbol={symbol} currentPrice={currentPrice} />
          </div>
        ) : (
          <div className="p-4 pt-2 mt-2">
            <Card className="p-6 text-center bg-card border">
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Connect Wallet to Trade</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to start trading {symbol}
              </p>
              <ConnectWalletButton />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopTradingInterface;