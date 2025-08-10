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
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import TradingViewMobileChart from "./TradingViewMobileChart";
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
    <div className="min-h-screen bg-background">
      {/* SOLID FIXED HEADER - Never moves, always stays put */}
      <div className="fixed top-28 left-0 right-0 z-40 bg-card/98 backdrop-blur-xl border-b border-border/30 shadow-lg">
        <div className="p-4 space-y-4">
          {/* Token Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {crypto?.image && (
                <div className="relative flex-shrink-0">
                  <img
                    src={crypto.image}
                    alt={`${tokenName} logo`}
                    className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold font-mono text-foreground truncate">
                  {symbol}/USDT
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {tokenName}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleWatchlist}
                className={`h-9 w-9 p-0 ${watchlist ? 'text-warning' : ''}`}
              >
                <Star className={`h-4 w-4 ${watchlist ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareToken} className="h-9 w-9 p-0">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
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
          
          {/* SOLID PRICE DISPLAY - Never moves */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold font-mono text-foreground mb-1">
                {formatUsd(currentPrice)}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ {formatUsd(currentPrice)} USDT
              </div>
            </div>
            
            <div className={`${isPositive ? 'text-success' : 'text-destructive'} text-right flex-shrink-0`}>
              <div className="flex items-center gap-2 justify-end mb-1">
                {isPositive ? (
                  <ArrowUp className="h-5 w-5" />
                ) : (
                  <ArrowDown className="h-5 w-5" />
                )}
                <span className="text-xl font-bold">
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm opacity-80">24h förändring</div>
            </div>
          </div>

          {/* SOLID MARKET STATS - Fixed Grid, never overlaps */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-success/10 border-success/20">
              <div className="text-xs text-muted-foreground mb-1">24h High</div>
              <div className="font-mono text-sm font-semibold text-success">
                {Number.isFinite(ticker?.high24h as any) ? formatUsd(ticker!.high24h!) : '—'}
              </div>
            </Card>
            <Card className="p-3 bg-destructive/10 border-destructive/20">
              <div className="text-xs text-muted-foreground mb-1">24h Low</div>
              <div className="font-mono text-sm font-semibold text-destructive">
                {Number.isFinite(ticker?.low24h as any) ? formatUsd(ticker!.low24h!) : '—'}
              </div>
            </Card>
            <Card className="p-3 bg-primary/10 border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">Volume</div>
              <div className="font-mono text-sm font-semibold text-primary">
                {Number.isFinite(ticker?.volumeQuote as any)
                  ? `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ticker!.volumeQuote!)}`
                  : (typeof crypto?.volume === 'string' ? `$${crypto.volume}` : (typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : '—'))}
              </div>
            </Card>
          </div>
        </div>

        {/* Solana Warning - Fixed position */}
        {solConnected && !isSolToken && (
          <div className="mx-4 mb-4">
            <Card className="border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Denna token stöds inte av Solana‑kedjan. Växla till EVM för handel.
              </p>
            </Card>
          </div>
        )}

        {/* SOLID TAB NAVIGATION - Never moves */}
        <div className="px-4 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 rounded-2xl p-1">
              <TabsTrigger 
                value="chart" 
                className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all flex flex-col items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Graf</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orderbook" 
                className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all flex flex-col items-center gap-1"
              >
                <div className="h-4 w-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm opacity-60"></div>
                  <div className="bg-current rounded-sm opacity-80"></div>
                  <div className="bg-current rounded-sm opacity-80"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span>Order</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trades" 
                className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all flex flex-col items-center gap-1"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Handel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md rounded-xl transition-all flex flex-col items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                <span>Info</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA - Fixed spacing, smooth scroll */}
      <div className="pt-[450px] pb-safe">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* SOLID CHART TAB - Fixed container, no overlap */}
          <TabsContent value="chart" className="mt-0 p-4">
            <div className="relative z-10 bg-background">
              <TradingViewMobileChart symbol={symbol} coinGeckoId={crypto?.coinGeckoId} />
            </div>
          </TabsContent>

          {/* SOLID ORDERBOOK TAB - Fixed container */}
          <TabsContent value="orderbook" className="mt-0 p-4">
            <div className="relative z-10 bg-background">
              <MobileOrderBook symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
            </div>
          </TabsContent>

          {/* SOLID TRADING TAB - Fixed container */}
          <TabsContent value="trades" className="mt-0 p-4">
            <div className="relative z-10 bg-background max-w-md mx-auto">
              <SmartTradePanel 
                symbol={symbol} 
                currentPrice={currentPrice}
              />
            </div>
          </TabsContent>

          {/* SOLID INFO TAB - Fixed container */}
          <TabsContent value="info" className="mt-0 p-4">
            <div className="relative z-10 bg-background max-w-md mx-auto space-y-4">
              <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-foreground">
                  <Eye className="h-5 w-5 text-primary" />
                  Om {tokenName}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4 bg-background/50">
                      <div className="text-muted-foreground text-sm mb-2">Marknadskapital</div>
                      <div className="font-mono font-bold text-lg text-foreground">
                        {typeof crypto?.marketCap === 'string' ? `$${crypto.marketCap}` : 
                         typeof crypto?.marketCap === 'number' ? `$${crypto.marketCap.toLocaleString()}` : 'N/A'}
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-background/50">
                      <div className="text-muted-foreground text-sm mb-2">24h Volym</div>
                      <div className="font-mono font-bold text-lg text-foreground">
                        {typeof crypto?.volume === 'string' ? `$${crypto.volume}` : 
                         typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : 'N/A'}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-background/30">
                      <div className="text-muted-foreground text-sm mb-2">Cirkulerande tillgång</div>
                      <div className="font-mono font-semibold text-foreground">
                        {crypto?.circulatingSupply ? Number(crypto.circulatingSupply).toLocaleString() : 'N/A'}
                      </div>
                    </Card>
                    <Card className="p-4 bg-background/30">
                      <div className="text-muted-foreground text-sm mb-2">Max tillgång</div>
                      <div className="font-mono font-semibold text-foreground">
                        {crypto?.maxSupply ? Number(crypto.maxSupply).toLocaleString() : 'Obegränsad'}
                      </div>
                    </Card>
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
    </div>
  );
};

export default MobileTradingView;