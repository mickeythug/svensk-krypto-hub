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
    { label: 'PRICE', value: formatSolPrice(token.price), large: true },
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
      <div className="p-4 space-y-1">
        {/* Social Links - Compact */}
        <div className="flex gap-1 mb-4">
          <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 h-7 rounded-md">
            <Globe className="h-3 w-3" />
            Web
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 h-7 rounded-md">
            <ExternalLink className="h-3 w-3" />
            Twitter
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 h-7 rounded-md">
            <ExternalLink className="h-3 w-3" />
            Telegram
          </Button>
        </div>

        {/* Core Price Section - Separate Cards */}
        {coreMetrics.map((metric, index) => (
          <Card key={index} className="bg-background/50 border border-border/50 mb-2">
            <div className="p-3">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                {metric.label}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
            </div>
          </Card>
        ))}

        {/* Market Data - 3 Column Grid in Single Card */}
        <Card className="bg-background/50 border border-border/50 mb-2">
          <div className="p-3">
            <div className="grid grid-cols-3 gap-3">
              {marketData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {item.label}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Performance Section - Toggleable */}
        <Card className="bg-background/50 border border-border/50 mb-2">
          <div className="p-3">
            <Button
              variant="ghost"
              onClick={() => setShowPerformance(!showPerformance)}
              className="w-full flex items-center justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">PERFORMANCE</span>
              </div>
              {showPerformance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showPerformance && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {performanceData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-1">
                      {item.label}
                    </div>
                    <div className={`text-sm font-bold ${item.isNegative ? 'text-destructive' : 'text-success'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Trading Activity - Toggleable */}
        <Card className="bg-background/50 border border-border/50 mb-2">
          <div className="p-3">
            <Button
              variant="ghost"
              onClick={() => setShowTrading(!showTrading)}
              className="w-full flex items-center justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">TRADING</span>
              </div>
              {showTrading ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showTrading && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {tradingData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Volume Section - Toggleable */}
        <Card className="bg-background/50 border border-border/50 mb-2">
          <div className="p-3">
            <Button
              variant="ghost"
              onClick={() => setShowVolume(!showVolume)}
              className="w-full flex items-center justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">VOLUME</span>
              </div>
              {showVolume ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showVolume && (
              <div className="space-y-3 mt-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-medium mb-1">TOTAL</div>
                  <div className="text-lg font-bold text-foreground">
                    $1.7M
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-1">BUY VOL</div>
                    <div className="text-sm font-bold text-success">$882K</div>
                    <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
                      <div className="bg-success h-1 rounded-full" style={{ width: '51%' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-1">SELL VOL</div>
                    <div className="text-sm font-bold text-destructive">$854K</div>
                    <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
                      <div className="bg-destructive h-1 rounded-full" style={{ width: '49%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Participants Section - Toggleable */}
        <Card className="bg-background/50 border border-border/50">
          <div className="p-3">
            <Button
              variant="ghost"
              onClick={() => setShowParticipants(!showParticipants)}
              className="w-full flex items-center justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">PARTICIPANTS</span>
              </div>
              {showParticipants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showParticipants && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {participantData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground font-medium mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-bold text-foreground">
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