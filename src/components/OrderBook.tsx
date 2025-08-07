import { useState } from "react";
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
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <h3 className="font-semibold text-sm">Order Book</h3>
        
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

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground px-3 py-3 border-b border-border/20">
        <span>Price(USDT)</span>
        <span className="text-right">Qty({symbol})</span>
        <span className="text-right">Total({symbol})</span>
      </div>

      {/* Asks (Sell Orders) - Red */}
      <div className="flex-1 min-h-0">
        <div className="space-y-1 px-3 py-2">
          {orderBook?.asks?.slice(-10).reverse().map((ask, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 text-sm py-1 hover:bg-destructive/5 cursor-pointer rounded">
              <span className="text-destructive font-mono font-semibold">{formatPrice(ask.price)}</span>
              <span className="text-right font-mono text-foreground">{formatSize(ask.size)}</span>
              <span className="text-right font-mono text-muted-foreground">{formatSize(ask.total)}</span>
            </div>
          )) || Array.from({length: 10}).map((_, i) => (
            <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 text-sm py-1">
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Price */}
      <div className="px-3 py-3 bg-card border-y border-border/30">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          <span className="text-lg font-bold font-mono text-primary">{formatPrice(currentPrice)}</span>
          <span className="text-sm text-primary font-mono">≈ {formatPrice(currentPrice)}</span>
        </div>
      </div>

      {/* Bids (Buy Orders) - Green */}
      <div className="flex-1 min-h-0">
        <div className="space-y-1 px-3 py-2">
          {orderBook?.bids?.slice(0, 10).map((bid, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 text-sm py-1 hover:bg-success/5 cursor-pointer rounded">
              <span className="text-success font-mono font-semibold">{formatPrice(bid.price)}</span>
              <span className="text-right font-mono text-foreground">{formatSize(bid.size)}</span>
              <span className="text-right font-mono text-muted-foreground">{formatSize(bid.total)}</span>
            </div>
          )) || Array.from({length: 10}).map((_, i) => (
            <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 text-sm py-1">
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Volume Percentages */}
      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-success font-semibold font-mono">{bidPercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-destructive font-semibold font-mono">{askPercentage}%</span>
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground font-mono">5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;