import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useOrderbook } from "@/hooks/useOrderbook";

interface MobileOrderBookProps {
  symbol: string;
  currentPrice: number;
  coinGeckoId?: string;
}

const MobileOrderBook = ({ symbol, currentPrice, coinGeckoId }: MobileOrderBookProps) => {
  const [viewMode, setViewMode] = useState<"combined" | "asks" | "bids">("combined");
  const { orderBook, isConnected } = useOrderbook(symbol, coinGeckoId, 15);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatSize = (size: number | string) => {
    const num = parseFloat(size.toString());
    return num < 1 ? num.toFixed(6) : num.toFixed(2);
  };

  const getMaxTotal = () => {
    const askMax = Math.max(...(orderBook?.asks || []).map(a => a.total));
    const bidMax = Math.max(...(orderBook?.bids || []).map(b => b.total));
    return Math.max(askMax, bidMax);
  };

  const maxTotal = getMaxTotal();

  return (
    <Card className="h-full flex flex-col bg-gradient-to-b from-card to-card/80">
      {/* Modern Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Order Book</h3>
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs px-2 py-0.5">
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
        </div>
        
        {/* View Mode Selector */}
        <div className="grid grid-cols-3 gap-1 bg-muted/50 rounded-xl p-1">
          <Button
            variant={viewMode === "combined" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("combined")}
            className="h-8 text-xs rounded-lg"
          >
            Alla
          </Button>
          <Button
            variant={viewMode === "asks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("asks")}
            className="h-8 text-xs text-destructive rounded-lg"
          >
            Sälj
          </Button>
          <Button
            variant={viewMode === "bids" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("bids")}
            className="h-8 text-xs text-success rounded-lg"
          >
            Köp
          </Button>
        </div>
        
        {/* Column Headers */}
        <div className="grid grid-cols-3 text-xs text-muted-foreground mt-3 px-1">
          <span>Price ({symbol})</span>
          <span className="text-right">Storlek</span>
          <span className="text-right">Total</span>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-hidden">
        {/* Asks Section */}
        {(viewMode === "combined" || viewMode === "asks") && (
          <div className="px-3 py-2">
            <div className="space-y-1">
              {orderBook?.asks?.slice(-6).reverse().map((ask, i) => (
                <div 
                  key={`ask-${i}`} 
                  className="relative grid grid-cols-3 text-xs py-2 px-2 rounded-lg hover:bg-destructive/5 transition-colors"
                >
                  {/* Background bar showing volume */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-destructive/10 rounded-lg"
                    style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                  />
                  
                  <span className="relative text-destructive font-mono font-bold">
                    {formatPrice(ask.price)}
                  </span>
                  <span className="relative text-right font-mono text-foreground">
                    {formatSize(ask.size)}
                  </span>
                  <span className="relative text-right font-mono text-muted-foreground">
                    {formatSize(ask.total)}
                  </span>
                </div>
              )) || Array.from({length: 6}).map((_, i) => (
                <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 gap-2 py-2 px-2">
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Price Separator */}
        {viewMode === "combined" && (
          <div className="px-3 py-2 bg-primary/5 border-y border-primary/20">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-base font-bold font-mono text-primary">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-xs text-muted-foreground">USDT</span>
            </div>
          </div>
        )}

        {/* Bids Section */}
        {(viewMode === "combined" || viewMode === "bids") && (
          <div className="px-3 py-2">
            <div className="space-y-1">
              {orderBook?.bids?.slice(0, 6).map((bid, i) => (
                <div 
                  key={`bid-${i}`} 
                  className="relative grid grid-cols-3 text-xs py-2 px-2 rounded-lg hover:bg-success/5 transition-colors"
                >
                  {/* Background bar showing volume */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-success/10 rounded-lg"
                    style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                  />
                  
                  <span className="relative text-success font-mono font-bold">
                    {formatPrice(bid.price)}
                  </span>
                  <span className="relative text-right font-mono text-foreground">
                    {formatSize(bid.size)}
                  </span>
                  <span className="relative text-right font-mono text-muted-foreground">
                    {formatSize(bid.total)}
                  </span>
                </div>
              )) || Array.from({length: 6}).map((_, i) => (
                <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 gap-2 py-2 px-2">
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Volume Distribution */}
      <div className="p-3 border-t border-border/30 bg-background/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-xs text-success font-semibold">Köp 58%</span>
          </div>
          <div className="flex-1 mx-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-success to-destructive" style={{ width: '58%' }}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive font-semibold">42% Sälj</span>
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MobileOrderBook;