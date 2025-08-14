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
      {/* ======== ULTRA-SOLID HEADER - NEVER MOVES ======== */}
      <div className="fixed top-26 left-0 right-0 z-[70] bg-card/99 backdrop-blur-3xl border-b border-border/50 shadow-2xl">
        <div className="relative bg-gradient-to-b from-card/100 to-card/95">
          {/* Main Header Content */}
          <div className="px-4 py-4 space-y-4">
            {/* Token Info Row - SOLID LAYOUT */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {crypto?.image && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={crypto.image}
                      alt={`${tokenName} logo`}
                      className="h-11 w-11 rounded-full ring-2 ring-primary/30 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card shadow-sm"></div>
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
              
              {/* Action Buttons - SOLID POSITIONING */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleWatchlist}
                  className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${watchlist ? 'text-warning bg-warning/10' : 'hover:bg-muted/50'}`}
                >
                  <Star className={`h-4 w-4 ${watchlist ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareToken} 
                  className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 transition-all duration-200"
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 transition-all duration-200"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar - SOLID CONTAINER */}
            <div className="relative z-[65]">
              <TokenSearchBar 
                currentSymbol={symbol}
                placeholder="Search token..."
                className="w-full h-12 rounded-xl bg-background/80 border-border/50 backdrop-blur-sm"
              />
            </div>
            
            {/* SOLID PRICE DISPLAY - NEVER MOVES */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <div className="text-3xl font-bold font-mono text-foreground mb-1 leading-none">
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

            {/* SOLID MARKET STATS - FIXED GRID, NO OVERLAP */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 bg-success/10 border-success/30 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-1 font-medium">24h High</div>
                <div className="font-mono text-sm font-bold text-success truncate">
                  {Number.isFinite(ticker?.high24h as any) ? formatUsd(ticker!.high24h!) : '—'}
                </div>
              </Card>
              <Card className="p-3 bg-destructive/10 border-destructive/30 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-1 font-medium">24h Low</div>
                <div className="font-mono text-sm font-bold text-destructive truncate">
                  {Number.isFinite(ticker?.low24h as any) ? formatUsd(ticker!.low24h!) : '—'}
                </div>
              </Card>
              <Card className="p-3 bg-primary/10 border-primary/30 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Volume</div>
                <div className="font-mono text-sm font-bold text-primary truncate">
                  {Number.isFinite(ticker?.volumeQuote as any)
                    ? `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ticker!.volumeQuote!)}`
                    : (typeof crypto?.volume === 'string' ? `$${crypto.volume}` : (typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : '—'))}
                </div>
              </Card>
            </div>
          </div>

          {/* Solana Warning - SOLID POSITIONING */}
          {solConnected && !isSolToken && (
            <div className="mx-4 mb-4">
              <Card className="border-amber-500/40 bg-amber-500/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ This token is not supported by the Solana chain. Switch to EVM for trading.
                </p>
              </Card>
            </div>
          )}

          {/* SOLID TAB NAVIGATION - NEVER MOVES, PRODUCTION READY */}
          <div className="px-4 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/60 rounded-2xl p-1.5 backdrop-blur-sm border border-border/30">
                <TabsTrigger 
                  value="chart" 
                  className="text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border/50 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 py-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Graf</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="orderbook" 
                  className="text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border/50 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 py-2"
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
                  className="text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border/50 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 py-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Trade</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border/50 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 py-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Info</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ======== ULTRA-SOLID CONTENT AREA - NEVER OVERLAPS ======== */}
      {/* CRITICAL: pt-[480px] ensures ZERO overlap with header+tabs */}
      <div className="pt-[480px] pb-24 min-h-screen bg-background">
        {/* ABSOLUTE BARRIER - Ensures content never goes under header */}
        <div className="absolute top-[450px] left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-[30] pointer-events-none"></div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* ULTRA-SOLID CHART TAB - NEVER OVERLAPS, PERFECT SPACING */}
          <TabsContent value="chart" className="mt-0 p-4">
            <div className="relative z-[25] bg-background min-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-border/30">
              <TradingViewMobileChart symbol={symbol} coinGeckoId={crypto?.coinGeckoId} />
            </div>
          </TabsContent>

          {/* ULTRA-SOLID ORDERBOOK TAB - PRODUCTION READY */}
          <TabsContent value="orderbook" className="mt-0 p-4">
            <div className="relative z-[25] bg-background min-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-border/30">
              <MobileOrderBook symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
            </div>
          </TabsContent>

          {/* PRODUCTION TRADING TAB - PERFECT CENTERING */}
          <TabsContent value="trades" className="mt-0 p-4">
            <div className="relative z-20 bg-background max-w-md mx-auto rounded-xl overflow-hidden">
              <SmartTradePanel 
                symbol={symbol} 
                currentPrice={currentPrice}
              />
            </div>
          </TabsContent>

          {/* PRODUCTION INFO TAB - OPTIMIZED LAYOUT */}
          <TabsContent value="info" className="mt-0 p-4">
            <div className="relative z-20 bg-background max-w-md mx-auto space-y-4">
              <Card className="p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border-border/60 shadow-xl backdrop-blur-sm rounded-2xl">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-3 text-foreground">
                  <Eye className="h-6 w-6 text-primary" />
                  Om {tokenName}
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4 bg-background/70 backdrop-blur-sm border-border/50 rounded-xl">
                      <div className="text-muted-foreground text-sm mb-2 font-medium">Marknadskapital</div>
                      <div className="font-mono font-bold text-lg text-foreground">
                        {typeof crypto?.marketCap === 'string' ? `$${crypto.marketCap}` : 
                         typeof crypto?.marketCap === 'number' ? `$${crypto.marketCap.toLocaleString()}` : 'N/A'}
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-background/70 backdrop-blur-sm border-border/50 rounded-xl">
                      <div className="text-muted-foreground text-sm mb-2 font-medium">24h Volym</div>
                      <div className="font-mono font-bold text-lg text-foreground">
                        {typeof crypto?.volume === 'string' ? `$${crypto.volume}` : 
                         typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : 'N/A'}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-background/50 backdrop-blur-sm border-border/40 rounded-xl">
                      <div className="text-muted-foreground text-sm mb-2 font-medium">Cirkulerande</div>
                      <div className="font-mono font-semibold text-foreground text-sm">
                        {crypto?.circulatingSupply ? Number(crypto.circulatingSupply).toLocaleString() : 'N/A'}
                      </div>
                    </Card>
                    <Card className="p-4 bg-background/50 backdrop-blur-sm border-border/40 rounded-xl">
                      <div className="text-muted-foreground text-sm mb-2 font-medium">Max supply</div>
                      <div className="font-mono font-semibold text-foreground text-sm">
                        {crypto?.maxSupply ? Number(crypto.maxSupply).toLocaleString() : 'Obegränsad'}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="pt-4 border-t border-border/40">
                    <div className="text-muted-foreground text-sm mb-3 font-medium">Trading pairs</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/15 border-primary/40 text-primary font-semibold px-3 py-1">
                        {symbol}/USDT
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-secondary/15 border-secondary/40 font-semibold px-3 py-1">
                        {symbol}/BTC
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-accent/15 border-accent/40 font-semibold px-3 py-1">
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