import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  Share,
  BarChart3,
  Bell,
  Settings,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import SimpleMobileChart from "./SimpleMobileChart";
import MobileOrderBook from "./MobileOrderBook";
import SmartTradePanel from "@/components/trade/SmartTradePanel";
import TokenSearchBar from "../TokenSearchBar";
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { formatUsd } from "@/lib/utils";
import { useExchangeTicker } from '@/hooks/useExchangeTicker';

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
  const [watchlist, setWatchlist] = useState(false);
  
  const isPositive = priceChange24h >= 0;
  const { connected: solConnected } = useWallet();
  const symbolUpper = symbol.toUpperCase();
  const coinGeckoId = (crypto?.coinGeckoId || crypto?.coin_gecko_id || crypto?.data?.id) as string | undefined;
  const { isSolToken } = useSolanaTokenInfo(symbolUpper, coinGeckoId);
  const { data: ticker } = useExchangeTicker(symbol, coinGeckoId);

  const shareToken = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tokenName} (${symbol})`,
        text: `Kolla in ${tokenName} på Crypto Network Sweden`,
        url: window.location.href
      });
    }
  };

  const toggleWatchlist = () => {
    setWatchlist(!watchlist);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-safe">
      {/* Modern Compact Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-card to-card/95 backdrop-blur-xl border-b border-border/30 shadow-lg">
        <div className="px-3 py-4 space-y-4">
          {/* Token Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {crypto?.image && (
                <div className="relative flex-shrink-0">
                  <img
                    src={crypto.image}
                    alt={`${tokenName} logo`}
                    className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold font-display text-foreground truncate">
                  {symbol}/USDT
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {tokenName}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleWatchlist}
                className={`h-8 w-8 p-0 ${watchlist ? 'text-warning' : ''}`}
              >
                <Star className={`h-4 w-4 ${watchlist ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareToken} className="h-8 w-8 p-0">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <TokenSearchBar 
            currentSymbol={symbol}
            placeholder="Sök token..."
            className="w-full"
          />
          
          {/* Price Display */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold font-mono text-foreground mb-1">
                {formatUsd(currentPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                ≈ {formatUsd(currentPrice)} USDT
              </div>
            </div>
            
            <div className={`${isPositive ? 'text-success' : 'text-destructive'} text-right flex-shrink-0`}>
              <div className="flex items-center gap-1 justify-end mb-1">
                {isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span className="text-lg font-bold">
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs opacity-80">24h</div>
            </div>
          </div>

          {/* Compact Market Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-success/10 rounded-xl p-2">
              <div className="text-xs text-muted-foreground mb-1">24h High</div>
              <div className="font-mono text-sm font-semibold text-success">
                {Number.isFinite(ticker?.high24h as any) ? formatUsd(ticker!.high24h!) : '—'}
              </div>
            </div>
            <div className="text-center bg-destructive/10 rounded-xl p-2">
              <div className="text-xs text-muted-foreground mb-1">24h Low</div>
              <div className="font-mono text-sm font-semibold text-destructive">
                {Number.isFinite(ticker?.low24h as any) ? formatUsd(ticker!.low24h!) : '—'}
              </div>
            </div>
            <div className="text-center bg-primary/10 rounded-xl p-2">
              <div className="text-xs text-muted-foreground mb-1">Volume</div>
              <div className="font-mono text-sm font-semibold text-primary">
                {Number.isFinite(ticker?.volumeQuote as any)
                  ? `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ticker!.volumeQuote!)}`
                  : (typeof crypto?.volume === 'string' ? `$${crypto.volume}` : (typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : '—'))}
              </div>
            </div>
          </div>
        </div>

        {/* Solana Warning */}
        {solConnected && !isSolToken && (
          <div className="mx-3 mb-3">
            <Card className="border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Denna token stöds inte av Solana‑kedjan. Växla till EVM för handel.
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Modern Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-3 py-3 bg-card/50 border-b border-border/20">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 rounded-2xl p-1">
            <TabsTrigger 
              value="chart" 
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all"
            >
              <BarChart3 className="h-4 w-4 mb-1" />
              <span>Graf</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orderbook" 
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 mb-1 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm opacity-60"></div>
                  <div className="bg-current rounded-sm opacity-80"></div>
                  <div className="bg-current rounded-sm opacity-80"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span>Order</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="trades" 
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all"
            >
              <TrendingUp className="h-4 w-4 mb-1" />
              <span>Handel</span>
            </TabsTrigger>
            <TabsTrigger 
              value="info" 
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all"
            >
              <Eye className="h-4 w-4 mb-1" />
              <span>Info</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="chart" className="flex-1 mt-0">
          <SimpleMobileChart symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
        </TabsContent>

        <TabsContent value="orderbook" className="flex-1 mt-0 p-3">
          <MobileOrderBook symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
        </TabsContent>

        <TabsContent value="trades" className="flex-1 mt-0 p-3">
          <div className="max-w-md mx-auto">
            <SmartTradePanel 
              symbol={symbol} 
              currentPrice={currentPrice}
            />
          </div>
        </TabsContent>

        <TabsContent value="info" className="flex-1 mt-0 p-3">
          <div className="max-w-md mx-auto">
            <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-primary" />
                Om {tokenName}
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-background/50 rounded-xl p-4">
                    <div className="text-muted-foreground text-sm mb-2">Marknadskapital</div>
                    <div className="font-mono font-bold text-lg text-foreground">
                      {typeof crypto?.marketCap === 'string' ? `$${crypto.marketCap}` : 
                       typeof crypto?.marketCap === 'number' ? `$${crypto.marketCap.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-background/50 rounded-xl p-4">
                    <div className="text-muted-foreground text-sm mb-2">24h Volym</div>
                    <div className="font-mono font-bold text-lg text-foreground">
                      {typeof crypto?.volume === 'string' ? `$${crypto.volume}` : 
                       typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/30 rounded-xl p-4">
                    <div className="text-muted-foreground text-sm mb-2">Cirkulerande tillgång</div>
                    <div className="font-mono font-semibold text-foreground">
                      {crypto?.circulatingSupply ? Number(crypto.circulatingSupply).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-background/30 rounded-xl p-4">
                    <div className="text-muted-foreground text-sm mb-2">Max tillgång</div>
                    <div className="font-mono font-semibold text-foreground">
                      {crypto?.maxSupply ? Number(crypto.maxSupply).toLocaleString() : 'Obegränsad'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/30">
                  <div className="text-muted-foreground text-sm mb-3">Handelspar</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                      {symbol}/USDT
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-secondary/10 border-secondary/30">
                      {symbol}/BTC
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                      {symbol}/ETH
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileTradingView;