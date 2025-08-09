import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Star,
  Share,
  BarChart3
} from "lucide-react";
import SimpleMobileChart from "./SimpleMobileChart";
import MobileOrderBook from "./MobileOrderBook";
import MobileTradingPanel from "./MobileTradingPanel";
import TokenSearchBar from "../TokenSearchBar";
import { formatUsd } from "@/lib/utils";

interface MobileTradingViewProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const MobileTradingView = ({ 
  symbol, 
  currentPrice, 
  priceChange24h, 
  tokenName, 
  crypto 
}: MobileTradingViewProps) => {
  const [activeTab, setActiveTab] = useState("chart");
  
  const isPositive = priceChange24h >= 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Price Header */}
      <div className="p-4 bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono">{symbol}/USDT</h2>
            <Badge variant="secondary" className="text-xs">
              SPOT
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="mb-3">
          <TokenSearchBar 
            currentSymbol={symbol}
            placeholder="Sök token"
            className="w-full"
          />
        </div>
        
        <div className="flex items-end gap-3">
          {crypto?.image && (
            <img
              src={crypto.image}
              alt={`${tokenName} (${symbol}) logotyp`}
              className="h-6 w-6 rounded-full mb-1 ring-1 ring-border/40"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="text-3xl font-bold font-mono text-foreground">
            {formatUsd(currentPrice)}
          </div>
          <div className={`${isPositive ? 'text-success' : 'text-destructive'} flex items-center gap-1 pb-1`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>
        
          <div className="text-sm text-muted-foreground mt-1">
            ≈ {formatUsd(currentPrice)} USDT
          </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mb-2">
          <TabsTrigger value="chart" className="text-xs">Graf</TabsTrigger>
          <TabsTrigger value="orderbook" className="text-xs">Order Book</TabsTrigger>
          <TabsTrigger value="trades" className="text-xs">Handel</TabsTrigger>
          <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="flex-1 mt-0">
          <SimpleMobileChart symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
        </TabsContent>

        <TabsContent value="orderbook" className="flex-1 mt-0 px-4">
          <MobileOrderBook symbol={symbol} currentPrice={currentPrice} />
        </TabsContent>

        <TabsContent value="trades" className="flex-1 mt-0 px-4">
          <MobileTradingPanel 
            symbol={symbol} 
            currentPrice={currentPrice} 
            tokenName={tokenName}
          />
        </TabsContent>

        <TabsContent value="info" className="flex-1 mt-0 px-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Om {tokenName}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marknadskapital</span>
                <span className="font-mono">${crypto?.marketCap?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24h Volym</span>
                <span className="font-mono">${crypto?.volume24h?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cirkulerande tillgång</span>
                <span className="font-mono">{crypto?.circulatingSupply?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileTradingView;