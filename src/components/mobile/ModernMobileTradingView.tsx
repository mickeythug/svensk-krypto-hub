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
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { formatUsd } from "@/lib/utils";
import { useExchangeTicker } from '@/hooks/useExchangeTicker';
import ModernMobileTokenInfo from "./ModernMobileTokenInfo";
import ModernMobileTradingPanel from "./ModernMobileTradingPanel";
import ModernMobileOrdersPanel from "./ModernMobileOrdersPanel";
import TokenSearchBar from "@/components/TokenSearchBar";

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
  const { fullyAuthed } = useWalletAuthStatus();
  const { isAuthenticated: supabaseAuthed } = useSupabaseAuth();
  const symbolUpper = symbol.toUpperCase();

  // Combined authentication status
  const isFullyAuthenticated = fullyAuthed && supabaseAuthed;
  const coinGeckoId = (crypto?.coinGeckoId || crypto?.coin_gecko_id || crypto?.data?.id) as string | undefined;
  const { isSolToken } = useSolanaTokenInfo(symbolUpper, coinGeckoId);
  const { data: ticker } = useExchangeTicker(symbol, coinGeckoId);

  const shareToken = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tokenName} (${symbol})`,
        text: `Check out ${tokenName} on Crypto Network Sweden`,
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
    { id: "chart", label: "Chart", icon: BarChart3 },
    { id: "info", label: "Info", icon: Info },
    { id: "trade", label: "Trade", icon: ArrowUpDown },
    { id: "orders", label: "Orders", icon: Receipt }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 ${activeTab !== "chart" ? "pt-16" : "pt-0"}`}>
        {activeTab === "chart" && (
          <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* TOKEN SEARCH BAR - Modern mobile design */}
            <div className="px-4 py-3 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl border-b border-border/30">
              <TokenSearchBar 
                currentSymbol={symbol}
                placeholder={`Search token (current: ${symbol})`}
                className="w-full"
              />
            </div>
            
            {/* PRICE HEADER */}
            <div className="px-4 py-3 bg-gradient-to-b from-background/80 to-transparent border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goBack} 
                    className="p-2 rounded-full hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  {crypto?.image && (
                    <img
                      src={crypto.image}
                      alt={`${tokenName} logo`}
                      className="h-8 w-8 rounded-full border border-border/50"
                    />
                  )}
                  <div>
                    <h2 className="font-bold text-lg">{symbol}/USDT</h2>
                    <p className="text-sm text-muted-foreground">{formatUsd(currentPrice)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                  }`}>
                    {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleWatchlist}
                    className={`p-2 rounded-full ${watchlist ? 'text-yellow-400 bg-yellow-400/10' : 'hover:bg-primary/10'}`}
                  >
                    <Star className={`h-5 w-5 ${watchlist ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* FULLSCREEN CHART */}
            <div className="flex-1 bg-[#0f0f23]">
              <TradingViewMobileChart symbol={symbol} coinGeckoId={coinGeckoId} />
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
                      ? 'text-primary border-2 border-primary/60 bg-transparent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/30 border-2 border-transparent'
                  }`}
                >
                  <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-transparent' : 'bg-transparent'
                  }`}>
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      isActive ? 'text-primary' : ''
                    }`} />
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                    isActive ? 'text-primary' : ''
                  }`}>
                    {tab.label}
                  </span>
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
              ⚠️ This token is not supported by the Solana chain. Switch to EVM for trading.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModernMobileTradingView;