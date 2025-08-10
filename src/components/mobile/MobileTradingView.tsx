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
  BarChart3,
  Bell,
  Bookmark,
  Eye,
  Settings
} from "lucide-react";
import SimpleMobileChart from "./SimpleMobileChart";
import MobileOrderBook from "./MobileOrderBook";
import SmartTradePanel from "@/components/trade/SmartTradePanel";
import TokenSearchBar from "../TokenSearchBar";
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { SOL_TOKENS } from '@/lib/tokenMaps';
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
  const [watchlist, setWatchlist] = useState(false);
  
  const isPositive = priceChange24h >= 0;
  const { connected: solConnected } = useWallet();
  const symbolUpper = symbol.toUpperCase();
  const coinGeckoId = (crypto?.coinGeckoId || crypto?.coin_gecko_id || crypto?.data?.id) as string | undefined;
  const { isSolToken } = useSolanaTokenInfo(symbolUpper, coinGeckoId);

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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="p-4">
          {/* Top Row - Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {crypto?.image && (
                <img
                  src={crypto.image}
                  alt={`${tokenName} logo`}
                  className="h-6 w-6 rounded-full ring-1 ring-border"
                />
              )}
              <h1 className="text-lg font-bold font-mono">{symbol}/USDT</h1>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                SPOT
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <TokenSearchBar 
              currentSymbol={symbol}
              placeholder="Sök annat token"
              className="w-full h-10"
            />
          </div>
          
          {/* Price Display */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">
                {formatUsd(currentPrice)}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ {formatUsd(currentPrice)} USDT
              </div>
            </div>
            
            <div className={`${isPositive ? 'text-success' : 'text-destructive'} flex items-center gap-2`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <div className="text-right">
                <div className="text-lg font-bold">
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </div>
                <div className="text-xs">24h</div>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="flex justify-between mt-4 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">24h High</div>
              <div className="font-mono font-semibold text-success">
                {formatUsd(currentPrice * 1.08)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">24h Low</div>
              <div className="font-mono font-semibold text-destructive">
                {formatUsd(currentPrice * 0.92)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Volume</div>
              <div className="font-mono font-semibold">
                {typeof crypto?.volume === 'string' ? `$${crypto.volume}` : (typeof crypto?.volume === 'number' ? `$${(crypto.volume >= 1e12 ? (crypto.volume/1e12).toFixed(1)+'T' : crypto.volume >= 1e9 ? (crypto.volume/1e9).toFixed(1)+'B' : crypto.volume >= 1e6 ? (crypto.volume/1e6).toFixed(1)+'M' : crypto.volume.toLocaleString())}` : 'N/A')}
              </div>
            </div>
          </div>
        </div>

        {solConnected && !isSolToken && (
          <div className="mx-4 mb-4">
            <Card className="border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs">Denna token stöds inte av Solana‑kedjan. Du är ansluten med Solana‑wallet. Växla till EVM för att handla denna token.</p>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 py-2 bg-card border-b border-border">
          <TabsList className="grid w-full grid-cols-4 h-10 bg-muted rounded-lg p-1">
            <TabsTrigger value="chart" className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              Graf
            </TabsTrigger>
            <TabsTrigger value="orderbook" className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Order Book
            </TabsTrigger>
            <TabsTrigger value="trades" className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Handel
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Info
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chart" className="flex-1 mt-0">
          <SimpleMobileChart symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
        </TabsContent>

        <TabsContent value="orderbook" className="flex-1 mt-0 px-4 py-2">
          <MobileOrderBook symbol={symbol} currentPrice={currentPrice} coinGeckoId={crypto?.coinGeckoId} />
        </TabsContent>

        <TabsContent value="trades" className="flex-1 mt-0 px-4 py-2">
          <SmartTradePanel 
            symbol={symbol} 
            currentPrice={currentPrice}
          />
        </TabsContent>

        <TabsContent value="info" className="flex-1 mt-0 px-4 py-2">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Om {tokenName}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Marknadskapital</div>
                  <div className="font-mono font-semibold">
                    {typeof crypto?.marketCap === 'string' ? `$${crypto.marketCap}` : (typeof crypto?.marketCap === 'number' ? `$${crypto.marketCap.toLocaleString()}` : 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">24h Volym</div>
                  <div className="font-mono font-semibold">
                    {typeof crypto?.volume === 'string' ? `$${crypto.volume}` : (typeof crypto?.volume === 'number' ? `$${crypto.volume.toLocaleString()}` : 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Cirkulerande tillgång</div>
                  <div className="font-mono font-semibold">
                    {crypto?.circulatingSupply ? Number(crypto.circulatingSupply).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Max tillgång</div>
                  <div className="font-mono font-semibold">
                    {crypto?.maxSupply ? Number(crypto.maxSupply).toLocaleString() : 'Obegränsad'}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-muted-foreground mb-2">Handelspar</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{symbol}/USDT</Badge>
                  <Badge variant="outline" className="text-xs">{symbol}/BTC</Badge>
                  <Badge variant="outline" className="text-xs">{symbol}/ETH</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileTradingView;