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
export const EnhancedMarketStats = ({
  token,
  volumes,
  beMarket
}: EnhancedMarketStatsProps) => {
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

  const stats = [{
    label: 'Price USD',
    value: formatUsd(token.price),
    highlight: true
  }, {
    label: 'Price SOL',
    value: formatSolPrice(token.price)
  }, {
    label: 'Liquidity',
    value: `$${formatLargeNumber(liquidity)}`
  }, {
    label: 'FDV',
    value: `$${formatLargeNumber(fdv)}`
  }, {
    label: 'Market Cap',
    value: `$${formatLargeNumber(token.marketCap)}`,
    highlight: true
  }];
  const timeStats = [{
    label: '5M',
    value: '3.13%',
    positive: true
  }, {
    label: '1H',
    value: volumes?.v1h ? `$${formatLargeNumber(volumes.v1h)}` : '—'
  }, {
    label: '6H',
    value: volumes?.v6h ? `$${formatLargeNumber(volumes.v6h)}` : '—'
  }, {
    label: '24H',
    value: volumes?.v24h ? `$${formatLargeNumber(volumes.v24h)}` : '—'
  }];
  const tradingStats = [{
    label: 'Transactions',
    value: '11,243',
    icon: <DollarSign className="h-4 w-4" />
  }, {
    label: '24h Volume',
    value: `$${formatLargeNumber(token.volume24h)}`,
    icon: <DollarSign className="h-4 w-4" />
  }, {
    label: 'Makers',
    value: '3,804',
    icon: <Users className="h-4 w-4" />
  }, {
    label: 'Buy Orders',
    value: '6,543',
    icon: <TrendingUp className="h-4 w-4" />
  }, {
    label: 'Sell Orders',
    value: '4,700',
    icon: <TrendingDown className="h-4 w-4" />
  }, {
    label: 'Buy Volume',
    value: `$${formatLargeNumber(token.volume24h * 0.53)}`,
    icon: <TrendingUp className="h-4 w-4" />
  }, {
    label: 'Sell Volume',
    value: `$${formatLargeNumber(token.volume24h * 0.47)}`,
    icon: <TrendingDown className="h-4 w-4" />
  }, {
    label: 'Unique Buyers',
    value: '3,636',
    icon: <Users className="h-4 w-4" />
  }, {
    label: 'Unique Sellers',
    value: '3,104',
    icon: <Users className="h-4 w-4" />
  }];
  return;
};