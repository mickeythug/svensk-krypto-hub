import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Maximize2, RefreshCw, Settings, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TradingViewChart from '@/components/TradingViewChart';

interface ProfessionalTradingChartProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
}

export const ProfessionalTradingChart: React.FC<ProfessionalTradingChartProps> = ({
  symbol,
  currentPrice,
  tokenName
}) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timeframes = ['5M', '15M', '1H', '4H', '1D', '1W', '1M'];

  return (
    <Card className="border border-gray-800 bg-gradient-surface backdrop-blur-sm shadow-xl">
      <div className="p-6">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Live Chart</h2>
            </div>
            <Badge className="bg-success/20 text-success border-success/30 animate-pulse">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-3">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeframe === tf
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price Info Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                ${currentPrice.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Change</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-lg font-bold text-success font-mono">+5.24%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h High</p>
              <p className="text-lg font-bold text-foreground font-mono">
                ${(currentPrice * 1.12).toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Low</p>
              <p className="text-lg font-bold text-foreground font-mono">
                ${(currentPrice * 0.88).toFixed(6)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
            {tokenName}
          </Badge>
        </div>

        {/* Chart Container */}
        <motion.div
          className="relative bg-black rounded-xl border border-gray-800 overflow-hidden"
          style={{ height: isFullscreen ? '800px' : '600px' }}
          animate={{ height: isFullscreen ? '800px' : '600px' }}
          transition={{ duration: 0.3 }}
        >
          <TradingViewChart
            symbol={symbol}
            currentPrice={currentPrice}
            coinGeckoId={symbol.toLowerCase()}
          />
        </motion.div>

        {/* Chart Footer */}
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Powered by TradingView</span>
            <span>•</span>
            <span>Real-time data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Market Open</span>
          </div>
        </div>
      </div>
    </Card>
  );
};