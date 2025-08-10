import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useOrderbook } from "@/hooks/useOrderbook";

interface MobileOrderBookProps {
  symbol: string;
  currentPrice: number;
  coinGeckoId?: string;
}

const MobileOrderBook = ({ symbol, currentPrice, coinGeckoId }: MobileOrderBookProps) => {
  const [viewMode, setViewMode] = useState<"combined" | "asks" | "bids">("combined");
  const { orderBook, isConnected } = useOrderbook(symbol, coinGeckoId, 20);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatSize = (size: number | string) => {
    return parseFloat(size.toString()).toFixed(4);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xs">Order Book</h3>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "combined" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("combined")}
              className="h-7 px-2 text-xs"
            >
              Alla
            </Button>
            <Button
              variant={viewMode === "asks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("asks")}
              className="h-7 px-2 text-xs text-destructive"
            >
              Sälj
            </Button>
            <Button
              variant={viewMode === "bids" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("bids")}
              className="h-7 px-2 text-xs text-success"
            >
              Köp
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 text-xs text-muted-foreground">
          <span>Pris</span>
          <span className="text-right">Storlek</span>
          <span className="text-right">Total</span>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-hidden">
        {(viewMode === "combined" || viewMode === "asks") && (
          <div className="space-y-0.5 p-2">
            {orderBook?.asks?.slice(-8).reverse().map((ask, i) => (
              <div key={`ask-${i}`} className="grid grid-cols-3 text-xs py-1 hover:bg-destructive/5 rounded">
                <span className="text-destructive font-mono font-semibold">
                  {formatPrice(ask.price)}
                </span>
                <span className="text-right font-mono text-muted-foreground">
                  {formatSize(ask.size)}
                </span>
                <span className="text-right font-mono text-muted-foreground">
                  {formatSize(ask.total)}
                </span>
              </div>
            )) || Array.from({length: 8}).map((_, i) => (
              <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 text-xs py-1">
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "combined" && (
          <div className="px-2 py-1 bg-card border-y border-border/30">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold font-mono text-primary">
                {formatPrice(currentPrice)}
              </span>
            </div>
          </div>
        )}

        {(viewMode === "combined" || viewMode === "bids") && (
          <div className="space-y-0.5 p-2">
            {orderBook?.bids?.slice(0, 8).map((bid, i) => (
              <div key={`bid-${i}`} className="grid grid-cols-3 text-xs py-1 hover:bg-success/5 rounded">
                <span className="text-success font-mono font-semibold">
                  {formatPrice(bid.price)}
                </span>
                <span className="text-right font-mono text-muted-foreground">
                  {formatSize(bid.size)}
                </span>
                <span className="text-right font-mono text-muted-foreground">
                  {formatSize(bid.total)}
                </span>
              </div>
            )) || Array.from({length: 8}).map((_, i) => (
              <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 text-xs py-1">
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volume Stats */}
      <div className="p-2 border-t border-border/30">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-success font-semibold">58%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-destructive font-semibold">42%</span>
            <TrendingDown className="h-3 w-3 text-destructive" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MobileOrderBook;