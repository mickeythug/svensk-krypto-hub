import { useState } from "react";
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
    <div className="flex h-full">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col">
        {/* TradingView Chart Container */}
        <div className="flex-1 m-2 relative">
          <TradingViewChart symbol={symbol} currentPrice={currentPrice} />
        </div>

        {/* Bottom Panels */}
        <div className="h-48 m-2">
          <Tabs defaultValue="positions" className="h-full">
            <TabsList className="mb-2">
              <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs">Open Orders</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Order History</TabsTrigger>
              <TabsTrigger value="balances" className="text-xs">Balances</TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="h-full">
              <Card className="h-full p-4 bg-card/40">
                <div className="text-center text-muted-foreground text-sm">
                  No open positions
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="h-full">
              <Card className="h-full p-4 bg-card/40">
                <div className="text-center text-muted-foreground text-sm">
                  No open orders
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="h-full">
              <Card className="h-full p-4 bg-card/40">
                <div className="text-center text-muted-foreground text-sm">
                  No order history
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="balances" className="h-full">
              <Card className="h-full p-4 bg-card/40">
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

      {/* Right Sidebar */}
      <div className="w-80 flex flex-col">
        {/* Orderbook */}
        <div className="flex-1 m-2 mb-1">
          <Card className="h-full bg-card/40">
            <div className="p-3 border-b border-border/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Order Book</h3>
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-success" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Spread: {calculateSpread()}%
                </div>
              </div>
              {error && (
                <div className="text-xs text-destructive mt-1">{error}</div>
              )}
            </div>
            
            <div className="h-full overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 text-xs text-muted-foreground p-2 border-b border-border/10">
                <span>Price (USDC)</span>
                <span className="text-right">Size ({symbol})</span>
                <span className="text-right">Total</span>
              </div>
              
              {/* Asks (Sell orders) */}
              <div className="space-y-0.5 p-2">
                {orderBook?.asks?.map((ask, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs hover:bg-destructive/5 py-0.5 cursor-pointer">
                    <span className="text-destructive font-mono">{formatPrice(ask.price)}</span>
                    <span className="text-right font-mono">{formatSize(ask.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(ask.total)}</span>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground text-xs py-4">
                    Loading orderbook...
                  </div>
                )}
              </div>
              
              {/* Current Price */}
              <div className="border-y border-border/20 p-2 bg-primary/5">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono">{formatPrice(currentPrice)}</div>
                  <div className={`text-xs flex items-center justify-center gap-1 ${
                    priceChange24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              {/* Bids (Buy orders) */}
              <div className="space-y-0.5 p-2">
                {orderBook?.bids?.map((bid, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs hover:bg-success/5 py-0.5 cursor-pointer">
                    <span className="text-success font-mono">{formatPrice(bid.price)}</span>
                    <span className="text-right font-mono">{formatSize(bid.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(bid.total)}</span>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground text-xs py-4">
                    Loading orderbook...
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="h-96 m-2 mt-1">
          <Card className="h-full bg-card/40">
            <div className="p-3 border-b border-border/20">
              <div className="flex gap-1">
                <Button
                  variant={side === "buy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSide("buy")}
                  className={`flex-1 ${side === "buy" ? "bg-success hover:bg-success/90 text-white" : ""}`}
                >
                  Buy
                </Button>
                <Button
                  variant={side === "sell" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSide("sell")}
                  className={`flex-1 ${side === "sell" ? "bg-destructive hover:bg-destructive/90 text-white" : ""}`}
                >
                  Sell
                </Button>
              </div>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Order Type */}
              <div className="flex gap-1 text-xs">
                <Button
                  variant={orderType === "market" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOrderType("market")}
                  className="flex-1 h-7"
                >
                  Market
                </Button>
                <Button
                  variant={orderType === "limit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setOrderType("limit")}
                  className="flex-1 h-7"
                >
                  Limit
                </Button>
              </div>

              {/* Leverage */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Leverage</label>
                <div className="flex gap-1">
                  {["1", "2", "5", "10", "20"].map((lev) => (
                    <Button
                      key={lev}
                      variant={leverage === lev ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLeverage(lev)}
                      className="flex-1 h-7 text-xs"
                    >
                      {lev}x
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Input */}
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Price (USDC)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-8 text-sm font-mono"
                    step="0.001"
                  />
                </div>
              )}

              {/* Size Input */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Size ({symbol})</label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="0.0000"
                  className="h-8 text-sm font-mono"
                  step="0.0001"
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