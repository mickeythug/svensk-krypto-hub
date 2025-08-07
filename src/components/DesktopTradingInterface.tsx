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
import { useBinanceOrderbook } from "@/hooks/useBinanceOrderbook";

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

  // Real Binance orderbook data
  const { orderBook, isConnected, error } = useBinanceOrderbook(symbol, 15);

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
    const bestAsk = orderBook.asks[orderBook.asks.length - 1]?.price || 0;
    const bestBid = orderBook.bids[0]?.price || 0;
    return ((bestAsk - bestBid) / bestBid * 100).toFixed(3);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chart Container - Perfect spacing */}
        <div className="flex-1 m-3 rounded-lg overflow-hidden shadow-lg">
          <ModernTradingViewChart symbol={symbol} currentPrice={currentPrice} />
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
        {/* Orderbook - Top section */}
        <div className="flex-1 m-3 mb-2">
          <Card className="h-full bg-card/60 backdrop-blur-sm border-border/30 shadow-lg">
            <div className="p-3 border-b border-border/30 bg-background/40">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Order Book</h3>
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-success" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Spread: {calculateSpread()}%
                </div>
              </div>
              {error && (
                <div className="text-xs text-destructive mt-1">{error}</div>
              )}
            </div>
            
            <div className="h-full overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 text-xs text-muted-foreground p-3 border-b border-border/20 bg-background/20">
                <span className="font-semibold">Price (USDT)</span>
                <span className="text-right font-semibold">Size ({symbol})</span>
                <span className="text-right font-semibold">Total</span>
              </div>
              
              {/* Asks (Sell orders) - Red - No scrollbar */}
              <div className="space-y-0.5 p-2 h-44">
                {orderBook?.asks?.slice(0, 12).map((ask, i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-3 text-xs hover:bg-destructive/10 py-1 px-2 rounded cursor-pointer transition-colors">
                    <span className="text-destructive font-mono font-semibold">{formatPrice(ask.price)}</span>
                    <span className="text-right font-mono">{formatSize(ask.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(ask.total)}</span>
                  </div>
                )) || Array.from({length: 12}).map((_, i) => (
                  <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 text-xs py-1 px-2">
                    <div className="h-3 bg-destructive/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Current Price - Highlighted */}
              <div className="border-y border-border/40 p-3 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="text-center">
                  <div className="text-xl font-bold font-mono tracking-tight">{formatPrice(currentPrice)}</div>
                  <div className={`text-sm flex items-center justify-center gap-2 ${
                    priceChange24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {priceChange24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="font-semibold">{priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Bids (Buy orders) - Green - No scrollbar */}
              <div className="space-y-0.5 p-2 h-44">
                {orderBook?.bids?.slice(0, 12).map((bid, i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-3 text-xs hover:bg-success/10 py-1 px-2 rounded cursor-pointer transition-colors">
                    <span className="text-success font-mono font-semibold">{formatPrice(bid.price)}</span>
                    <span className="text-right font-mono">{formatSize(bid.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(bid.total)}</span>
                  </div>
                )) || Array.from({length: 12}).map((_, i) => (
                  <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 text-xs py-1 px-2">
                    <div className="h-3 bg-success/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Trading Panel - Bottom section with perfect spacing */}
        <div className="h-96 m-3 mt-2">
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