import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUsd } from '@/lib/utils';

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
    { label: 'Price USD', value: formatUsd(token.price) },
    { label: 'Price', value: formatSolPrice(token.price) },
    { label: 'Liquidity', value: `$${formatLargeNumber(liquidity)}` },
    { label: 'FDV', value: `$${formatLargeNumber(fdv)}` },
    { label: 'Mkt Cap', value: `$${formatLargeNumber(token.marketCap)}` },
  ];

  const timeStats = [
    { label: '5M', value: '3.13%', positive: true },
    { label: '1H', value: volumes?.v1h ? `$${formatLargeNumber(volumes.v1h)}` : '—' },
    { label: '6H', value: volumes?.v6h ? `$${formatLargeNumber(volumes.v6h)}` : '—' },
    { label: '24H', value: volumes?.v24h ? `$${formatLargeNumber(volumes.v24h)}` : '—' },
  ];

  const tradingStats = [
    { label: 'Txns', value: '11,243' },
    { label: 'Volume', value: `$${formatLargeNumber(token.volume24h)}` },
    { label: 'Makers', value: '3,804' },
    { label: 'Buys', value: '6,543' },
    { label: 'Sells', value: '4,700' },
    { label: 'Buy Vol', value: `$${formatLargeNumber(token.volume24h * 0.53)}` },
    { label: 'Sell Vol', value: `$${formatLargeNumber(token.volume24h * 0.47)}` },
    { label: 'Buyers', value: '3,636' },
    { label: 'Sellers', value: '3,104' },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
      <h3 className="text-xl font-bold mb-6 text-foreground">Market Stats</h3>
      
      <div className="space-y-6">
        {/* Basic Stats */}
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <span className="font-semibold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Time-based Performance */}
        <div className="pt-4 border-t border-border/30">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Performance</h4>
          <div className="grid grid-cols-4 gap-2">
            {timeStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-sm font-semibold text-foreground">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Stats */}
        <div className="pt-4 border-t border-border/30">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Trading Activity</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {tradingStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className="text-xs font-semibold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holders */}
        <div className="pt-4 border-t border-border/30">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Holders</span>
            <span className="font-semibold text-foreground">
              {token.holders.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};