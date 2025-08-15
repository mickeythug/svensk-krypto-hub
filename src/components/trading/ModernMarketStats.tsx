import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Clock,
  Users,
  Activity,
  Globe,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernMarketStatsProps {
  tickerData: {
    volume24h: number;
    high24h: number;
    low24h: number;
    lastTrade: number;
    bid: number;
    ask: number;
    spread: number;
    orderCount: number;
    traders: number;
    marketCap: number;
  };
  showAdvanced: boolean;
}

const ModernMarketStats: React.FC<ModernMarketStatsProps> = ({ tickerData, showAdvanced }) => {
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const basicStats = [
    {
      label: '24h High',
      value: `$${formatPrice(tickerData.high24h)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: '24h Low',
      value: `$${formatPrice(tickerData.low24h)}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      label: '24h Volume',
      value: formatVolume(tickerData.volume24h),
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Market Cap',
      value: formatVolume(tickerData.marketCap),
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const advancedStats = [
    {
      label: 'Best Bid',
      value: `$${formatPrice(tickerData.bid)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Best Ask',
      value: `$${formatPrice(tickerData.ask)}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      label: 'Spread',
      value: `${tickerData.spread.toFixed(3)}%`,
      icon: Activity,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Orders',
      value: tickerData.orderCount.toLocaleString(),
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      label: 'Traders',
      value: tickerData.traders.toLocaleString(),
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      label: 'Global Rank',
      value: '#42',
      icon: Globe,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Basic Stats - Always Visible */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {basicStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${stat.bgColor} border border-gray-700/30 min-w-fit`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-2 rounded ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
              <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Stats - Collapsible */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {advancedStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${stat.bgColor} border border-gray-700/30 min-w-fit`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-1.5 rounded ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                    <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Activity Feed */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Last trade: ${formatPrice(tickerData.lastTrade)}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span>{Math.floor(Math.random() * 20) + 10} trades/min</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ModernMarketStats;