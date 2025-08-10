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
  WifiOff
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

interface DesktopTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const DesktopTradingInterface = ({ symbol, currentPrice, priceChange24h, tokenName, crypto }: DesktopTradingInterfaceProps) => {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState(currentPrice.toString());
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [limitLines, setLimitLines] = useState<{ price: number; side: 'buy'|'sell' }[]>([]);
  const [openJupOrders, setOpenJupOrders] = useState<any[]>([]);

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
    if (!orderBook?.asks?.length || !orderBook?.bids?.length) return "0.000";
    const bestAsk = Math.min(...orderBook.asks.map(ask => ask.price));
    const bestBid = Math.max(...orderBook.bids.map(bid => bid.price));
    return ((bestAsk - bestBid) / bestBid * 100).toFixed(3);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Price Display - Separate container above chart */}
        <div className="mx-3 mt-3 mb-2">
          <Card className="bg-background/95 backdrop-blur-sm border-border/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {crypto?.image && (
                  <img
                    src={crypto.image}
                    alt={`${tokenName} (${symbol}) logotyp`}
                    className="h-8 w-8 rounded-full ring-1 ring-border/40 shadow-sm"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {formatUsd(currentPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {symbol}/USDT • {exchange}
                  </div>
                </div>
                <div className="w-64">
                  <TokenSearchBar 
                    currentSymbol={symbol}
                    placeholder="Sök token"
                  />
                </div>
              </div>
              <div className={`flex items-center gap-2 ${
                priceChange24h >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {priceChange24h >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="text-xl font-bold">{priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Container - Perfect spacing */}
        <div className="flex-1 mx-3 mb-2 rounded-lg overflow-hidden shadow-lg">
          <TradingViewChart symbol={symbol} currentPrice={currentPrice} limitLines={limitLines} coinGeckoId={crypto?.coinGeckoId} />
        </div>

        {/* Bottom Panels - Clean separation */}
        <div className="h-48 mx-3 mb-3">
          <Tabs defaultValue="positions" className="h-full">
            <TabsList className="mb-2 bg-card/60">
              <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs">Open Orders</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Order History</TabsTrigger>
              <TabsTrigger value="balances" className="text-xs">Balances</TabsTrigger>
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
              <Card className="h-full p-4 bg-card/60 backdrop-blur-sm border-border/30">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>USDC</span>
                    <span className="font-mono">2,450.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{symbol}</span>
                    <span className="font-mono">0.000000</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Perfect spacing and alignment */}
      <div className="w-80 flex flex-col bg-card/20 border-l border-border/30">
        {/* Orderbook - New Bybit-style component */}
        <div className="flex-1 m-3 mb-2">
          <OrderBook 
            orderBook={orderBook}
            currentPrice={currentPrice}
            symbol={symbol}
            isConnected={isConnected}
          />
        </div>

        {/* Trading Panel - Replaced with SmartTradePanel */}
        {fullyAuthed ? (
          <div className="h-80 m-3 mt-2">
            <SmartTradePanel symbol={symbol} currentPrice={currentPrice} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DesktopTradingInterface;