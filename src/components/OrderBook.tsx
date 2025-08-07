import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp } from "lucide-react";

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  orderBook: {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  } | null;
  currentPrice: number;
  symbol: string;
  isConnected: boolean;
}

const OrderBook = ({ orderBook, currentPrice, symbol, isConnected }: OrderBookProps) => {
  const [precision, setPrecision] = useState("0.1");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatSize = (size: number | string) => {
    return parseFloat(size.toString()).toFixed(3);
  };

  // Calculate total volume for percentage calculation
  const totalAskVolume = orderBook?.asks?.slice(0, 10).reduce((sum, ask) => sum + ask.size, 0) || 0;
  const totalBidVolume = orderBook?.bids?.slice(0, 10).reduce((sum, bid) => sum + bid.size, 0) || 0;
  const totalVolume = totalAskVolume + totalBidVolume;
  
  const askPercentage = totalVolume > 0 ? Math.round((totalAskVolume / totalVolume) * 100) : 0;
  const bidPercentage = totalVolume > 0 ? Math.round((totalBidVolume / totalVolume) * 100) : 0;

  return (
    <div className="h-full bg-card/80 border border-border/30 rounded-lg">
      {/* Header with Tabs */}
      <Tabs defaultValue="orderbook" className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <TabsList className="h-8 bg-transparent p-0">
            <TabsTrigger 
              value="orderbook" 
              className="text-xs px-3 py-1 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Order Book
            </TabsTrigger>
            <TabsTrigger 
              value="trades" 
              className="text-xs px-3 py-1 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Recent Trades
            </TabsTrigger>
          </TabsList>
          
          <Select value={precision} onValueChange={setPrecision}>
            <SelectTrigger className="w-16 h-6 text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.1">0.1</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="orderbook" className="flex-1 flex flex-col mt-0">
          {/* Column Headers */}
          <div className="grid grid-cols-3 text-xs text-muted-foreground px-3 py-2 border-b border-border/20">
            <span>Price(USDT)</span>
            <span className="text-right">Qty({symbol})</span>
            <span className="text-right">Total({symbol})</span>
          </div>

          {/* Asks (Sell Orders) - Red */}
          <div className="flex-1 min-h-0">
            <div className="space-y-0 px-3 py-1">
              {orderBook?.asks?.slice(-10).reverse().map((ask, i) => (
                <div key={`ask-${i}`} className="grid grid-cols-3 text-xs py-0.5 hover:bg-destructive/5 cursor-pointer">
                  <span className="text-destructive font-mono">{formatPrice(ask.price)}</span>
                  <span className="text-right font-mono text-muted-foreground">{formatSize(ask.size)}</span>
                  <span className="text-right font-mono text-muted-foreground">{formatSize(ask.total)}</span>
                </div>
              )) || Array.from({length: 10}).map((_, i) => (
                <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 text-xs py-0.5">
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Price */}
          <div className="px-3 py-2 bg-card border-y border-border/30">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <span className="text-base font-bold font-mono text-primary">{formatPrice(currentPrice)}</span>
              <span className="text-xs text-primary font-mono">≈ {formatPrice(currentPrice)}</span>
            </div>
          </div>

          {/* Bids (Buy Orders) - Green */}
          <div className="flex-1 min-h-0">
            <div className="space-y-0 px-3 py-1">
              {orderBook?.bids?.slice(0, 10).map((bid, i) => (
                <div key={`bid-${i}`} className="grid grid-cols-3 text-xs py-0.5 hover:bg-success/5 cursor-pointer">
                  <span className="text-success font-mono">{formatPrice(bid.price)}</span>
                  <span className="text-right font-mono text-muted-foreground">{formatSize(bid.size)}</span>
                  <span className="text-right font-mono text-muted-foreground">{formatSize(bid.total)}</span>
                </div>
              )) || Array.from({length: 10}).map((_, i) => (
                <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 text-xs py-0.5">
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Percentages */}
          <div className="px-3 py-2 border-t border-border/30">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success font-semibold">{bidPercentage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-destructive font-semibold">{askPercentage}%</span>
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-xs text-muted-foreground">5</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="flex-1 mt-0">
          <div className="p-3 text-center text-muted-foreground text-sm">
            Recent Trades - Coming Soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderBook;