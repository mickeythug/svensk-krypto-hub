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
  DollarSign
} from "lucide-react";

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

  // Mock orderbook data
  const orderbook = {
    asks: [
      { price: currentPrice * 1.001, size: "12.45", total: "12.45" },
      { price: currentPrice * 1.002, size: "8.92", total: "21.37" },
      { price: currentPrice * 1.003, size: "15.67", total: "37.04" },
      { price: currentPrice * 1.004, size: "22.11", total: "59.15" },
      { price: currentPrice * 1.005, size: "18.88", total: "78.03" },
      { price: currentPrice * 1.006, size: "31.22", total: "109.25" },
      { price: currentPrice * 1.007, size: "9.45", total: "118.70" },
      { price: currentPrice * 1.008, size: "27.89", total: "146.59" },
    ],
    bids: [
      { price: currentPrice * 0.999, size: "15.23", total: "15.23" },
      { price: currentPrice * 0.998, size: "11.87", total: "27.10" },
      { price: currentPrice * 0.997, size: "23.45", total: "50.55" },
      { price: currentPrice * 0.996, size: "19.67", total: "70.22" },
      { price: currentPrice * 0.995, size: "8.91", total: "79.13" },
      { price: currentPrice * 0.994, size: "34.56", total: "113.69" },
      { price: currentPrice * 0.993, size: "12.34", total: "126.03" },
      { price: currentPrice * 0.992, size: "16.78", total: "142.81" },
    ]
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(price);
  };

  const formatSize = (size: string) => {
    return parseFloat(size).toFixed(2);
  };

  return (
    <div className="flex h-full">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col">
        {/* Chart Container */}
        <div className="flex-1 bg-card/20 border border-border/20 rounded-lg m-2 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <BarChart3 className="mx-auto h-20 w-20 text-primary/30" />
              <div>
                <h3 className="text-xl font-semibold text-muted-foreground">Advanced Trading Chart</h3>
                <p className="text-muted-foreground">Professional {symbol}/USD chart kommer här</p>
              </div>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">1D</Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">4H</Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">1H</Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">15m</Badge>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
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
                <h3 className="font-semibold text-sm">Order Book</h3>
                <div className="text-xs text-muted-foreground">
                  Spread: {((currentPrice * 0.001 - currentPrice * 0.999) / currentPrice * 100).toFixed(3)}%
                </div>
              </div>
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
                {orderbook.asks.reverse().map((ask, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs hover:bg-destructive/5 py-0.5 cursor-pointer">
                    <span className="text-destructive font-mono">{formatPrice(ask.price)}</span>
                    <span className="text-right font-mono">{formatSize(ask.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(ask.total)}</span>
                  </div>
                ))}
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
                {orderbook.bids.map((bid, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs hover:bg-success/5 py-0.5 cursor-pointer">
                    <span className="text-success font-mono">{formatPrice(bid.price)}</span>
                    <span className="text-right font-mono">{formatSize(bid.size)}</span>
                    <span className="text-right font-mono text-muted-foreground">{formatSize(bid.total)}</span>
                  </div>
                ))}
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