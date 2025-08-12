import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUsd } from '@/lib/utils';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedMarketStatsProps {
  token: {
    price: number;
    marketCap: number;
    holders: number;
    volume24h: number;
  };
  volumes?: {
    v1h?: number;
    v6h?: number;
    v24h?: number;
  };
  beMarket?: any;
}

export const EnhancedMarketStats = ({ token, volumes, beMarket }: EnhancedMarketStatsProps) => {
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

  const liquidity = beMarket?.liquidity || beMarket?.liquidityUsd || 79000;
  const fdv = token.marketCap; // FDV typically same as market cap for meme tokens

  const stats = [
    { label: 'Price USD', value: formatUsd(token.price), highlight: true },
    { label: 'Price SOL', value: formatSolPrice(token.price) },
    { label: 'Liquidity', value: `$${formatLargeNumber(liquidity)}` },
    { label: 'FDV', value: `$${formatLargeNumber(fdv)}` },
    { label: 'Market Cap', value: `$${formatLargeNumber(token.marketCap)}`, highlight: true },
  ];

  const timeStats = [
    { label: '5M', value: '3.13%', positive: true },
    { label: '1H', value: volumes?.v1h ? `$${formatLargeNumber(volumes.v1h)}` : '—' },
    { label: '6H', value: volumes?.v6h ? `$${formatLargeNumber(volumes.v6h)}` : '—' },
    { label: '24H', value: volumes?.v24h ? `$${formatLargeNumber(volumes.v24h)}` : '—' },
  ];

  const tradingStats = [
    { label: 'Transactions', value: '11,243', icon: <DollarSign className="h-4 w-4" /> },
    { label: '24h Volume', value: `$${formatLargeNumber(token.volume24h)}`, icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Makers', value: '3,804', icon: <Users className="h-4 w-4" /> },
    { label: 'Buy Orders', value: '6,543', icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Sell Orders', value: '4,700', icon: <TrendingDown className="h-4 w-4" /> },
    { label: 'Buy Volume', value: `$${formatLargeNumber(token.volume24h * 0.53)}`, icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Sell Volume', value: `$${formatLargeNumber(token.volume24h * 0.47)}`, icon: <TrendingDown className="h-4 w-4" /> },
    { label: 'Unique Buyers', value: '3,636', icon: <Users className="h-4 w-4" /> },
    { label: 'Unique Sellers', value: '3,104', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <Card className="p-8 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Market Statistics
        </h3>
        <div className="h-3 w-3 rounded-full bg-success animate-pulse shadow-lg shadow-success/50"></div>
      </div>
      
      <div className="space-y-8">
        {/* Key Price Metrics - Enhanced */}
        <div className="space-y-5">
          {stats.map((stat, index) => (
            <div key={index} className={`
              flex justify-between items-center p-4 rounded-xl transition-all duration-300 hover:bg-accent/10
              ${stat.highlight ? 'bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20' : ''}
            `}>
              <span className="text-foreground/80 font-medium text-lg">{stat.label}</span>
              <span className={`
                font-bold text-xl tracking-tight
                ${stat.highlight ? 'text-primary text-2xl' : 'text-foreground'}
              `}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Performance Timeline - Enhanced */}
        <div className="pt-6 border-t-2 border-gradient-to-r from-primary/20 to-accent/20">
          <h4 className="text-xl font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Performance Timeline
          </h4>
          <div className="grid grid-cols-4 gap-4">
            {timeStats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 hover:from-primary/10 hover:to-accent/10 transition-all duration-300">
                <div className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</div>
                <div className={`
                  text-lg font-bold
                  ${stat.positive ? 'text-success' : 'text-foreground'}
                `}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Activity - Enhanced */}
        <div className="pt-6 border-t-2 border-gradient-to-r from-primary/20 to-accent/20">
          <h4 className="text-xl font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            Trading Activity
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {tradingStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/10 to-transparent hover:from-primary/5 hover:to-accent/5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className="group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                  <span className="text-foreground/80 font-medium text-base">{stat.label}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holders Section - Enhanced */}
        <div className="pt-6 border-t-2 border-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex justify-between items-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-foreground font-medium text-xl">Token Holders</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {token.holders.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};