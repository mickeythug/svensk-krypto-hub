import { useState, useEffect } from "react";
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
import ModernTradingViewChart from "./ModernTradingViewChart";
import OrderBook from "./OrderBook";
import TokenSearchBar from "./TokenSearchBar";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useTradingViewSymbol } from "@/hooks/useTradingViewSymbol";
import { formatUsd } from "@/lib/utils";

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

  // Exchange-aware orderbook data
  const { orderBook, isConnected, error } = useOrderbook(symbol, crypto?.coinGeckoId, 15);
  const { exchange } = useTradingViewSymbol(symbol, crypto?.coinGeckoId);

  // Debug logging
  useEffect(() => {
    console.log('DesktopTradingInterface loaded for symbol:', symbol);
    console.log('OrderBook state:', { orderBook, isConnected, error });
  }, [symbol, orderBook, isConnected, error]);

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
          <ModernTradingViewChart symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
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
              <Card className="h-full p-4 bg-card/60 backdrop-blur-sm border-border/30">
                <div className="text-center text-muted-foreground text-sm">
                  No open positions
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="h-full">
              <Card className="h-full p-4 bg-card/60 backdrop-blur-sm border-border/30">
                <div className="text-center text-muted-foreground text-sm">
                  No open orders
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="h-full">
              <Card className="h-full p-4 bg-card/60 backdrop-blur-sm border-border/30">
                <div className="text-center text-muted-foreground text-sm">
                  No order history
                </div>
              </Card>
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

        {/* Trading Panel - Bottom section with reduced height */}
        <div className="h-80 m-3 mt-2">
          <Card className="h-full bg-card/60 backdrop-blur-sm border-border/30 shadow-lg">
            <div className="p-3 border-b border-border/30 bg-background/40">
              <div className="flex gap-1">
                <Button
                  variant={side === "buy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSide("buy")}
                  className={`flex-1 transition-all ${side === "buy" ? "bg-success hover:bg-success/90 text-white shadow-md" : "hover:bg-success/20"}`}
                >
                  Buy
                </Button>
                <Button
                  variant={side === "sell" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSide("sell")}
                  className={`flex-1 transition-all ${side === "sell" ? "bg-destructive hover:bg-destructive/90 text-white shadow-md" : "hover:bg-destructive/20"}`}
                >
                  Sell
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4 bg-background/20">
              {/* Order Type */}
              <div className="flex gap-1 text-xs">
                <Button
                  variant={orderType === "market" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOrderType("market")}
                  className="flex-1 h-8"
                >
                  Market
                </Button>
                <Button
                  variant={orderType === "limit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOrderType("limit")}
                  className="flex-1 h-8"
                >
                  Limit
                </Button>
              </div>

              {/* Price Input for Limit Orders */}
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block font-semibold">Price (USDT)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-10 text-sm font-mono"
                    step="0.01"
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-semibold">Amount ({symbol})</label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="0.00000000"
                  className="h-10 text-sm font-mono"
                  step="0.00000001"
                />
              </div>

              {/* Quick Size Buttons */}
              <div className="grid grid-cols-4 gap-1">
                {["25%", "50%", "75%", "100%"].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    {percent}
                  </Button>
                ))}
              </div>

              {/* Order Value */}
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Order Value:</span>
                  <span className="font-mono">
                    {size && price ? `$${(parseFloat(size) * parseFloat(price)).toFixed(2)}` : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-mono">$2,450.00</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className={`w-full ${
                  side === "buy"
                    ? "bg-success hover:bg-success/90 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }`}
                disabled={!size}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {side === "buy" ? "Buy" : "Sell"} {symbol}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesktopTradingInterface;