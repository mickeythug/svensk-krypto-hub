import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Star,
  Settings,
  MoreHorizontal,
  Wallet,
  BarChart3,
  DollarSign,
  Wifi,
  WifiOff,
  Search,
  Bell,
  Bookmark,
  Share,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
  Target,
  Shield,
  Activity,
  Clock,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from "lucide-react";
import TradingViewChart from "../TradingViewChart";
import { useCryptoData } from '@/hooks/useCryptoData';
import { formatUsd } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import ProfessionalOrderBook from './ProfessionalOrderBook';
import HyperliquidTradingPanel from './HyperliquidTradingPanel';
import ModernMarketStats from './ModernMarketStats';
import ProfessionalBottomPanels from './ProfessionalBottomPanels';

interface HyperliquidTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const HyperliquidTradingInterface: React.FC<HyperliquidTradingInterfaceProps> = ({ 
  symbol, 
  currentPrice, 
  priceChange24h, 
  tokenName, 
  crypto 
}) => {
  const isMobile = useIsMobile();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);

  // Mock real-time data simulation
  const [realTimePrice, setRealTimePrice] = useState(currentPrice);
  const [tickerData, setTickerData] = useState({
    volume24h: crypto?.volume || 0,
    high24h: currentPrice * 1.05,
    low24h: currentPrice * 0.95,
    lastTrade: currentPrice,
    bid: currentPrice * 0.999,
    ask: currentPrice * 1.001,
    spread: 0.02,
    orderCount: 1247,
    traders: 892,
    marketCap: crypto?.marketCap || 0
  });

  // Simulate live price updates
  useEffect(() => {
    if (!liveDataEnabled) return;
    
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.002;
      setRealTimePrice(prev => prev * (1 + variation));
      setTickerData(prev => ({
        ...prev,
        lastTrade: realTimePrice,
        bid: realTimePrice * 0.999,
        ask: realTimePrice * 1.001,
        orderCount: prev.orderCount + Math.floor(Math.random() * 3),
        traders: prev.traders + Math.floor(Math.random() * 2)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [liveDataEnabled, realTimePrice]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isMobile) {
    return null; // Mobile view handled separately
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Main Trading Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Professional Header */}
        <div className="bg-gray-900/95 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="p-4">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                {/* Token Info */}
                <div className="flex items-center gap-3">
                  {crypto?.image && (
                    <div className="relative">
                      <img
                        src={crypto.image}
                        alt={`${tokenName} logo`}
                        className="h-12 w-12 rounded-full ring-2 ring-primary/20 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-white font-mono">
                        ${formatPrice(realTimePrice)}
                      </h1>
                      <Badge 
                        variant={priceChange24h >= 0 ? "default" : "destructive"}
                        className="px-2 py-1 text-xs font-medium"
                      >
                        {priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="font-medium">{symbol}/USDT</span>
                      <div className="flex items-center gap-1">
                        {liveDataEnabled ? (
                          <Wifi className="h-3 w-3 text-green-400" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-red-400" />
                        )}
                        <span className="text-xs">Live</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span className="text-xs">{tickerData.orderCount} orders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-purple-400" />
                        <span className="text-xs">{tickerData.traders} traders</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tokens..."
                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 h-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 ${
                    isWatchlisted ? 'text-yellow-400 border-yellow-400/30' : 'text-gray-300'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300"
                  onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Market Stats Row */}
            <ModernMarketStats 
              tickerData={tickerData}
              showAdvanced={showAdvancedStats}
            />
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-0">
          <div className="h-full pr-4 pb-4">
            <div className="h-full rounded-r-xl overflow-hidden border-r border-t border-b border-gray-800/50 shadow-2xl bg-[#0a0a0a]">
              <TradingViewChart 
                symbol={symbol} 
                currentPrice={realTimePrice} 
                limitLines={[]} 
                coinGeckoId={crypto?.coinGeckoId} 
              />
            </div>
          </div>
        </div>

        {/* Bottom Panels */}
        <ProfessionalBottomPanels symbol={symbol} />
      </div>

      {/* Right Sidebar */}
      <motion.div 
        className="bg-gray-900/95 border-l border-gray-800/50 backdrop-blur-sm"
        animate={{ width: sidebarCollapsed ? 60 : 400 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h3 className="text-lg font-semibold text-white">Market Depth</h3>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Order Book */}
              <div className="flex-1 p-4 min-h-0">
                <ProfessionalOrderBook 
                  symbol={symbol}
                  currentPrice={realTimePrice}
                  tickerData={tickerData}
                />
              </div>

              {/* Trading Panel */}
              <div className="h-[500px] p-4 pt-2 border-t border-gray-800/50">
                <HyperliquidTradingPanel 
                  symbol={symbol}
                  currentPrice={realTimePrice}
                  tokenName={tokenName}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HyperliquidTradingInterface;