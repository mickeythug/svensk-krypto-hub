import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUsd } from '@/lib/utils';
import { ExternalLink, Globe, ChevronDown, ChevronUp, Info, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface MemeTokenSidebarProps {
  token: {
    price: number;
    marketCap: number;
    holders: number;
    volume24h: number;
    symbol: string;
    name: string;
    description?: string;
  };
  volumes?: {
    v1h?: number;
    v6h?: number;
    v24h?: number;
  };
  beMarket?: any;
}

export const MemeTokenSidebar = ({ token, volumes, beMarket }: MemeTokenSidebarProps) => {
  const [showPerformance, setShowPerformance] = useState(true);
  const [showTrading, setShowTrading] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatSolPrice = (usdPrice: number): string => {
    const solPrice = usdPrice / 170;
    return `${solPrice.toFixed(4)} SOL`;
  };

  const liquidity = beMarket?.liquidity || beMarket?.liquidityUsd || 86000;
  const fdv = token.marketCap || 546000;

  // Core metrics - always visible
  const coreMetrics = [
    { label: 'PRICE USD', value: formatUsd(token.price), large: true },
  ];

  const marketData = [
    { label: 'LIQUIDITY', value: `$${formatLargeNumber(liquidity)}` },
    { label: 'FDV', value: `$${formatLargeNumber(fdv)}` },
    { label: 'MKT CAP', value: `$${formatLargeNumber(token.marketCap)}` },
  ];

  const performanceData = [
    { label: '5M', value: '-0.76%', isNegative: true },
    { label: '1H', value: '-3.44%', isNegative: true },
    { label: '6H', value: '555%', isNegative: false },
    { label: '24H', value: '555%', isNegative: false },
  ];

  const tradingData = [
    { label: 'TXNS', value: '13,310' },
    { label: 'BUYS', value: '7,741' },
    { label: 'SELLS', value: '5,569' },
  ];

  const volumeData = [
    { label: 'VOLUME', value: `$${formatLargeNumber(token.volume24h)}` },
    { label: 'BUY VOL', value: '$882K' },
    { label: 'SELL VOL', value: '$854K' },
  ];

  const participantData = [
    { label: 'MAKERS', value: '4,150' },
    { label: 'BUYERS', value: '4,150' },
    { label: 'SELLERS', value: '2,607' },
  ];

  return (
    <Card className="w-full bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl">
      <div className="p-6 space-y-4">
        {/* Social Links - Compact */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg">
            <Globe className="h-4 w-4" />
            Web
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg">
            <ExternalLink className="h-4 w-4" />
            Twitter
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg">
            <ExternalLink className="h-4 w-4" />
            Telegram
          </Button>
        </div>

        {/* Core Price Section - Large and Prominent */}
        {coreMetrics.map((metric, index) => (
          <Card key={index} className="bg-background/70 border-2 border-border/70 mb-4">
            <div className="p-6">
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                {metric.label}
              </div>
              <div className="text-4xl font-black text-foreground">
                {metric.value}
              </div>
            </div>
          </Card>
        ))}

        {/* Market Data - Larger 3 Column Grid */}
        <Card className="bg-background/70 border-2 border-border/70 mb-4">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {marketData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    {item.label}
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Performance Section - Larger and More Visible */}
        <Card className="bg-background/70 border-2 border-border/70 mb-4">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => setShowPerformance(!showPerformance)}
              className="w-full flex items-center justify-between p-0 h-auto mb-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                <span className="text-lg font-bold">PERFORMANCE</span>
              </div>
              {showPerformance ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            
            {showPerformance && (
              <div className="grid grid-cols-4 gap-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold mb-2">
                      {item.label}
                    </div>
                    <div className={`text-xl font-black ${item.isNegative ? 'text-destructive' : 'text-success'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Trading Activity - Much Larger and More Prominent */}
        <Card className="bg-background/70 border-2 border-border/70 mb-4">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => setShowTrading(!showTrading)}
              className="w-full flex items-center justify-between p-0 h-auto mb-4"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                <span className="text-lg font-bold">TRADING ACTIVITY</span>
              </div>
              {showTrading ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            
            {showTrading && (
              <div className="grid grid-cols-3 gap-6">
                {tradingData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                      {item.label}
                    </div>
                    <div className="text-2xl font-black text-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Volume Section - Larger and More Visible */}
        <Card className="bg-background/70 border-2 border-border/70 mb-4">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => setShowVolume(!showVolume)}
              className="w-full flex items-center justify-between p-0 h-auto mb-4"
            >
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5" />
                <span className="text-lg font-bold">VOLUME DETAILS</span>
              </div>
              {showVolume ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            
            {showVolume && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">TOTAL</div>
                  <div className="text-3xl font-black text-foreground">
                    $1.7M
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">BUY VOL</div>
                    <div className="text-xl font-black text-success">$882K</div>
                    <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '51%' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">SELL VOL</div>
                    <div className="text-xl font-black text-destructive">$854K</div>
                    <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: '49%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Participants Section - Larger and More Visible */}
        <Card className="bg-background/70 border-2 border-border/70">
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => setShowParticipants(!showParticipants)}
              className="w-full flex items-center justify-between p-0 h-auto mb-4"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span className="text-lg font-bold">PARTICIPANTS</span>
              </div>
              {showParticipants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            
            {showParticipants && (
              <div className="grid grid-cols-3 gap-6">
                {participantData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                      {item.label}
                    </div>
                    <div className="text-2xl font-black text-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
};