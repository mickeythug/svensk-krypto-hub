import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

interface ReferenceTokenInfoProps {
  tokenName?: string;
  symbol?: string;
}

const ReferenceTokenInfo: React.FC<ReferenceTokenInfoProps> = ({
  tokenName = "Token",
  symbol = "TOKEN"
}) => {
  const stats = [
    { label: 'Top 10 H', value: '8%', positive: true },
    { label: 'Dev H.', value: '8%', positive: true },
    { label: 'Snipers H.', value: '0%', positive: false }
  ];

  const holderStats = [
    { label: 'Insiders', value: '89.6%', color: 'text-green-400' },
    { label: 'Bundlers', value: '23.0%', color: 'text-yellow-400' },
    { label: 'LP Burned', value: '100%', color: 'text-green-400', icon: TrendingUp }
  ];

  const additionalStats = [
    { label: 'Holders', value: '9', color: 'text-gray-300' },
    { label: 'Pro Traders', value: '7', color: 'text-gray-300' },
    { label: 'Dev Status', value: 'Unrugged', color: 'text-red-400', icon: TrendingDown }
  ];

  return (
    <Card className="bg-[#0A0B0F] border-gray-800 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Token Info</h3>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-lg font-bold ${
              stat.positive ? 'text-green-400' : 'text-gray-400'
            }`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Holder Stats */}
      <div className="space-y-3 mb-4">
        {holderStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{stat.label}</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${stat.color}`}>
                {stat.value}
              </span>
              {stat.icon && <stat.icon className={`h-3 w-3 ${stat.color}`} />}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="space-y-3 border-t border-gray-800 pt-3">
        {additionalStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{stat.label}</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${stat.color}`}>
                {stat.value}
              </span>
              {stat.icon && <stat.icon className={`h-3 w-3 ${stat.color}`} />}
            </div>
          </div>
        ))}
      </div>

      {/* Token Address */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-1">Contract Address</div>
        <div className="text-xs font-mono text-gray-300 break-all">
          MqYToT5xnF4DHBHqRjDBkZaFLUt5x9BHqRJoP4dGwmQs
        </div>
      </div>
    </Card>
  );
};

export default ReferenceTokenInfo;