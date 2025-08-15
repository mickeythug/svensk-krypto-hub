import React from 'react';
import { Card } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

interface ReferenceMarketStatsProps {
  marketCap?: number | null;
  volume?: number | null;
  marketCapChange?: number | null;
  volumeChange?: number | null;
}

const ReferenceMarketStats: React.FC<ReferenceMarketStatsProps> = ({
  marketCap = 5700,
  volume = 186110,
  marketCapChange = -3.24,
  volumeChange = 7.70
}) => {
  const formatNumber = (num: number | undefined | null) => {
    // Ensure we have a valid number
    const validNum = typeof num === 'number' && !isNaN(num) ? num : 0;
    
    if (validNum >= 1000000) return `${(validNum / 1000000).toFixed(1)}M`;
    if (validNum >= 1000) return `${(validNum / 1000).toFixed(1)}K`;
    return validNum.toFixed(0);
  };

  const formatPercent = (percent: number | undefined | null) => {
    // Ensure we have a valid number
    const validPercent = typeof percent === 'number' && !isNaN(percent) ? percent : 0;
    const sign = validPercent >= 0 ? '+' : '';
    return `${sign}${validPercent.toFixed(2)}%`;
  };

  // Mock volume chart data
  const volumeData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    volume: Math.random() * 100 + 20
  }));

  const maxVolume = Math.max(...volumeData.map(d => d.volume));

  return (
    <Card className="bg-[#0A0B0F] border-gray-800 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Market Cap & Volume</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">All</span>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Market Cap</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{formatNumber(marketCap)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              marketCapChange >= 0 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-red-400 bg-red-400/10'
            }`}>
              {formatPercent(marketCapChange)}
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-1">Volume</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{formatNumber(volume)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              volumeChange >= 0 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-red-400 bg-red-400/10'
            }`}>
              {formatPercent(volumeChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400">Volume Distribution</div>
        <div className="flex items-end gap-1 h-20">
          {volumeData.map((data, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400/40 rounded-t-sm min-h-[4px]"
              style={{
                height: `${(data.volume / maxVolume) * 100}%`
              }}
            />
          ))}
        </div>
        
        {/* Chart Labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>MAY 5</span>
          <span>MAY 6</span>
          <span>MAY 7</span>
          <span>MAY 8</span>
          <span>MAY 9</span>
          <span>MAY 10</span>
          <span>MAY 11</span>
          <span>MAY 12</span>
        </div>
      </div>
    </Card>
  );
};

export default ReferenceMarketStats;