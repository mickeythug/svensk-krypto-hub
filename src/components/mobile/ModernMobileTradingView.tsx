import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Info, 
  ArrowUpDown, 
  Receipt,
  ArrowLeft,
  Star,
  Share,
  Bell,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import TradingViewMobileChart from "./TradingViewMobileChart";
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { formatUsd } from "@/lib/utils";
import { useExchangeTicker } from '@/hooks/useExchangeTicker';
import ModernMobileTokenInfo from "./ModernMobileTokenInfo";
import ModernMobileTradingPanel from "./ModernMobileTradingPanel";
import ModernMobileOrdersPanel from "./ModernMobileOrdersPanel";

interface ModernMobileTradingViewProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const ModernMobileTradingView = ({ 
  symbol, 
  currentPrice, 
  priceChange24h, 
  tokenName, 
  crypto 
}: ModernMobileTradingViewProps) => {
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

  const goBack = () => {
    window.history.back();
  };

  const navigationTabs = [
    { id: "chart", label: "Graf", icon: BarChart3 },
    { id: "info", label: "Info", icon: Info },
    { id: "trade", label: "Handel", icon: ArrowUpDown },
    { id: "orders", label: "Orders", icon: Receipt }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* MINIMAL HEADER - Only when not in chart mode */}
      {activeTab !== "chart" && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {crypto?.image && (
                <img
                  src={crypto.image}
                  alt={`${tokenName} logo`}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div>
                <h1 className="font-bold text-lg">{symbol}/USDT</h1>
                <p className="text-sm text-muted-foreground">{formatUsd(currentPrice)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleWatchlist}
                className={`p-2 ${watchlist ? 'text-warning' : ''}`}
              >
                <Star className={`h-4 w-4 ${watchlist ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareToken} className="p-2">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Price Change Indicator */}
          <div className="px-4 pb-3">
            <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 ${activeTab !== "chart" ? "pt-32" : "pt-0"}`}>
        {activeTab === "chart" && (
          <div className="h-[calc(100vh-80px)]">
            {/* FULLSCREEN CHART WITHOUT ANY OVERLAYS */}
            <div className="relative h-full">
              {/* Minimal overlay header - only back button */}
              <div className="absolute top-4 left-4 z-20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goBack} 
                  className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white border border-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Star button top right */}
              <div className="absolute top-4 right-4 z-20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleWatchlist}
                  className={`p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full border border-white/20 ${watchlist ? 'text-yellow-400' : 'text-white'}`}
                >
                  <Star className={`h-5 w-5 ${watchlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* PURE FULLSCREEN CHART */}
              <div className="h-full w-full bg-[#0f0f23]">
                <TradingViewMobileChart symbol={symbol} coinGeckoId={coinGeckoId} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="p-4">
            <ModernMobileTokenInfo
              symbol={symbol}
              tokenName={tokenName}
              currentPrice={currentPrice}
              priceChange24h={priceChange24h}
              crypto={crypto}
              ticker={ticker}
            />
          </div>
        )}

        {activeTab === "trade" && (
          <div className="p-4">
            <ModernMobileTradingPanel
              symbol={symbol}
              currentPrice={currentPrice}
              tokenName={tokenName}
              crypto={crypto}
            />
          </div>
        )}

        {activeTab === "orders" && (
          <div className="p-4">
            <ModernMobileOrdersPanel
              symbol={symbol}
              currentPrice={currentPrice}
            />
          </div>
        )}
      </div>

      {/* MODERN BOTTOM NAVIGATION - Production Ready */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t border-border/30 shadow-2xl">
        <div className="px-2 py-3">
          <div className="grid grid-cols-4 gap-1">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center gap-1.5 py-3 px-2 h-auto rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'text-primary bg-primary/15 shadow-lg shadow-primary/20 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-primary/20 shadow-md' : 'bg-transparent'
                  }`}>
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      isActive ? 'text-primary scale-110' : ''
                    }`} />
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                    isActive ? 'text-primary' : ''
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-lg shadow-primary/40" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Solana Warning */}
      {solConnected && !isSolToken && activeTab === "trade" && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <Card className="border-amber-500/40 bg-amber-500/10 p-3 backdrop-blur-sm">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center">
              ⚠️ Denna token stöds inte av Solana‑kedjan. Växla till EVM för handel.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModernMobileTradingView;