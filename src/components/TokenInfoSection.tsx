import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUsd } from '@/lib/utils';
import { ExternalLink, Globe, Info, TrendingUp, Users, BarChart3, Twitter, MessageCircle } from 'lucide-react';
import { useEnhancedTokenData } from '@/hooks/useEnhancedTokenData';

interface TokenInfoSectionProps {
  tokenAddress: string;
  fallbackData?: {
    price: number;
    marketCap: number;
    holders: number;
    volume24h: number;
    symbol: string;
    name: string;
    description?: string;
  };
}

export const TokenInfoSection = ({ tokenAddress, fallbackData }: TokenInfoSectionProps) => {
  const { data: enhancedData, loading } = useEnhancedTokenData(tokenAddress);
  
  // Use enhanced data or fallback
  const tokenData = enhancedData || fallbackData;
  
  if (!tokenData) {
    return <div className="text-center text-muted-foreground">Loading token information...</div>;
  }

  const formatLargeNumber = (num?: number): string => {
    if (!num) return '—';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (num?: number): string => {
    if (typeof num !== 'number') return '—';
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  // Real data from DEXTools
  const price = enhancedData?.price || fallbackData?.price || 0;
  const liquidity = enhancedData?.liquidity || 0;
  const fdv = enhancedData?.fdv || enhancedData?.marketCap || fallbackData?.marketCap || 0;
  const marketCap = enhancedData?.marketCap || fallbackData?.marketCap || 0;
  const holders = enhancedData?.holders || fallbackData?.holders || 0;

  const marketData = [
    { label: 'LIQUIDITY', value: `$${formatLargeNumber(liquidity)}` },
    { label: 'FDV', value: `$${formatLargeNumber(fdv)}` },
    { label: 'MKT CAP', value: `$${formatLargeNumber(marketCap)}` },
  ];

  // Real performance data from DEXTools price variations
  const performanceData = [
    { 
      label: '5M', 
      value: formatPercentage(enhancedData?.variation5m), 
      isNegative: (enhancedData?.variation5m || 0) < 0 
    },
    { 
      label: '1H', 
      value: formatPercentage(enhancedData?.variation1h), 
      isNegative: (enhancedData?.variation1h || 0) < 0 
    },
    { 
      label: '6H', 
      value: formatPercentage(enhancedData?.variation6h), 
      isNegative: (enhancedData?.variation6h || 0) < 0 
    },
    { 
      label: '24H', 
      value: formatPercentage(enhancedData?.variation24h), 
      isNegative: (enhancedData?.variation24h || 0) < 0 
    },
  ];

  // Real trading data from pool information
  const poolData = enhancedData?.poolData;
  const totalTxns24h = (poolData?.buys24h || 0) + (poolData?.sells24h || 0);
  
  const tradingData = [
    { label: 'TXNS', value: formatLargeNumber(totalTxns24h) },
    { label: 'BUYS', value: formatLargeNumber(poolData?.buys24h) },
    { label: 'SELLS', value: formatLargeNumber(poolData?.sells24h) },
  ];

  // Calculate unique participants (estimated from trading data)
  const estimatedMakers = Math.floor((poolData?.buys24h || 0) * 0.3); // Rough estimate
  const estimatedBuyers = Math.floor((poolData?.buys24h || 0) * 0.6);
  const estimatedSellers = Math.floor((poolData?.sells24h || 0) * 0.55);

  const participantData = [
    { label: 'HOLDERS', value: formatLargeNumber(holders) },
    { label: 'BUYERS', value: formatLargeNumber(estimatedBuyers) },
    { label: 'SELLERS', value: formatLargeNumber(estimatedSellers) },
  ];

  // Real social links from DEXTools
  const socials = enhancedData?.socials || {};
  const hasWebsite = socials?.website;
  const hasTwitter = socials?.twitter;
  const hasTelegram = socials?.telegram;

  return (
    <div className="space-y-6">
      {/* Social Links - Only show if they exist */}
      {(hasWebsite || hasTwitter || hasTelegram) && (
        <Card className="bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl">
          <div className="p-6">
            <div className="flex gap-3 justify-center flex-wrap">
              {hasWebsite && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg"
                  onClick={() => window.open(hasWebsite, '_blank')}
                >
                  <Globe className="h-4 w-4" />
                  Website
                </Button>
              )}
              {hasTwitter && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg"
                  onClick={() => window.open(hasTwitter, '_blank')}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
              )}
              {hasTelegram && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2 text-sm px-4 py-2 h-9 rounded-lg"
                  onClick={() => window.open(hasTelegram, '_blank')}
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Price and Market Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Core Price Section */}
        <Card className="bg-background/70 border-2 border-border/70 lg:col-span-1">
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-3">
              PRICE USD
            </div>
            <div className="text-3xl font-black text-foreground">
              {formatUsd(price)}
            </div>
          </div>
        </Card>

        {/* Market Data */}
        <Card className="bg-background/70 border-2 border-border/70 lg:col-span-3">
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
      </div>

      {/* Performance and Trading Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Section */}
        <Card className="bg-background/70 border-2 border-border/70">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5" />
              <span className="text-lg font-bold">PERFORMANCE</span>
            </div>
            
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
          </div>
        </Card>

        {/* Trading Activity */}
        <Card className="bg-background/70 border-2 border-border/70">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5" />
              <span className="text-lg font-bold">TRADING ACTIVITY</span>
            </div>
            
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
          </div>
        </Card>
      </div>

      {/* Volume and Participants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Section */}
        <Card className="bg-background/70 border-2 border-border/70">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5" />
              <span className="text-lg font-bold">VOLUME DETAILS</span>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">VOLUME 24H</div>
                <div className="text-3xl font-black text-foreground">
                  ${formatLargeNumber(poolData?.volume24h || fallbackData?.volume24h)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">BUY VOL</div>
                  <div className="text-xl font-black text-success">
                    ${formatLargeNumber(poolData?.buyVolume5m ? poolData.buyVolume5m * 288 : (poolData?.volume24h || 0) * 0.53)} 
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '53%' }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">SELL VOL</div>
                  <div className="text-xl font-black text-destructive">
                    ${formatLargeNumber(poolData?.sellVolume5m ? poolData.sellVolume5m * 288 : (poolData?.volume24h || 0) * 0.47)}
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Participants Section */}
        <Card className="bg-background/70 border-2 border-border/70">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5" />
              <span className="text-lg font-bold">PARTICIPANTS</span>
            </div>
            
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
          </div>
        </Card>
      </div>
    </div>
  );
};