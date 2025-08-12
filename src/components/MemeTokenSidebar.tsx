import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUsd } from '@/lib/utils';
import { ExternalLink, Globe } from 'lucide-react';

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
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatSolPrice = (usdPrice: number): string => {
    const solPrice = usdPrice / 170; // Approximate SOL price
    return `${solPrice.toFixed(6)} SOL`;
  };

  const liquidity = beMarket?.liquidity || beMarket?.liquidityUsd || 82000;
  const fdv = token.marketCap || 497000; // FDV typically same as market cap for meme tokens

  // Mock data based on reference image
  const performanceData = [
    { label: '5M', value: '-9.77%', isNegative: true },
    { label: '1H', value: '-0.25%', isNegative: true },
    { label: '6H', value: '496%', isNegative: false },
    { label: '24H', value: '496%', isNegative: false },
  ];

  const tradingData = [
    { label: 'TXNS', value: '12,476' },
    { label: 'BUYS', value: '7,230' },
    { label: 'SELLS', value: '5,246' },
  ];

  const volumeData = [
    { label: 'VOLUME', value: `$${formatLargeNumber(token.volume24h)}` },
    { label: 'BUY VOL', value: '$835K', color: 'success' },
    { label: 'SELL VOL', value: '$809K', color: 'destructive' },
  ];

  const participantData = [
    { label: 'MAKERS', value: '4,114' },
    { label: 'BUYERS', value: '3,941' },
    { label: 'SELLERS', value: '2,496' },
  ];

  return (
    <Card className="w-full bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl">
      <div className="p-6 space-y-6">
        {/* Social Links */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
            <Globe className="h-3 w-3" />
            Website
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
            <ExternalLink className="h-3 w-3" />
            Twitter
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
            <ExternalLink className="h-3 w-3" />
            Telegram
          </Button>
        </div>

        {/* Price Section */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">PRICE USD</div>
            <div className="text-xl font-bold">{formatUsd(token.price)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">PRICE</div>
            <div className="text-xl font-bold">{formatSolPrice(token.price)}</div>
          </div>
        </div>

        {/* Market Data Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">LIQUIDITY</div>
            <div className="text-sm font-bold">${formatLargeNumber(liquidity)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">FDV</div>
            <div className="text-sm font-bold">${formatLargeNumber(fdv)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">MKT CAP</div>
            <div className="text-sm font-bold">${formatLargeNumber(token.marketCap)}</div>
          </div>
        </div>

        {/* Ad Section */}
        {token.description && (
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Ad</div>
            <div className="text-sm font-medium">{token.description}</div>
          </div>
        )}

        {/* Performance Grid */}
        <div className="grid grid-cols-4 gap-3">
          {performanceData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.label}</div>
              <div className={`text-sm font-bold ${item.isNegative ? 'text-destructive' : 'text-success'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Trading Stats */}
        <div className="grid grid-cols-3 gap-4">
          {tradingData.map((item, index) => (
            <div key={index}>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
              <div className="text-sm font-bold">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Volume Section */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">VOLUME</div>
            <div className="text-sm font-bold">${formatLargeNumber(token.volume24h)}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">BUY VOL</div>
              <div className="text-sm font-bold text-success">$835K</div>
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div className="bg-success h-1 rounded-full" style={{ width: '51%' }}></div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">SELL VOL</div>
              <div className="text-sm font-bold text-destructive">$809K</div>
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div className="bg-destructive h-1 rounded-full" style={{ width: '49%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-3 gap-4">
          {participantData.map((item, index) => (
            <div key={index}>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
              <div className="text-sm font-bold">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Buy/Sell Ratio Visualization */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">BUYERS</div>
              <div className="text-sm font-bold text-success">3,941</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">SELLERS</div>
              <div className="text-sm font-bold text-destructive">2,496</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-success h-2 rounded-l-full" style={{ width: '61%' }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};