import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import cryptoCharts from "@/assets/crypto-charts.jpg";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useMemo } from "react";
import { useAIMarketIntel } from "@/hooks/useAIMarketIntel";

function AIMarkets() {
  const { data, isLoading, error } = useAIMarketIntel();
  if (error) return null;
  return (
    <Card className="p-4 bg-card/80 border-border mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-crypto text-sm text-muted-foreground">AI-MARKNADSANALYS (OpenAI)</span>
        <Badge className={`${data?.trend === 'Bearish' ? 'bg-destructive text-destructive-foreground' : data?.trend === 'Bullish' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}`}>
          {data?.trend ?? 'Neutral'}
        </Badge>
      </div>
      <p className="text-sm font-display mb-3">
        {isLoading ? 'Laddar AI-analys…' : (data?.summary || 'AI sammanfattning otillgänglig just nu.')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="font-display text-success mb-1">Positiva</div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {(data?.positives ?? []).slice(0,5).map((p, i) => (<li key={`ai-pos-${i}`}>{p}</li>))}
          </ul>
        </div>
        <div>
          <div className="font-display text-warning mb-1">Att Bevaka</div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {(data?.negatives ?? []).slice(0,5).map((n, i) => (<li key={`ai-neg-${i}`}>{n}</li>))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

const MarketOverview = () => {
  const isMobile = useIsMobile();
  const { data: intel } = useMarketIntel();
  const { cryptoPrices } = useCryptoData();

  const formatAbbrev = (n?: number | null) => {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(2);
  };

  const marketStats = [
    {
      title: "Total Marknadskapital",
      value: formatAbbrev(intel?.overview.totalMarketCap),
      unit: "USD",
      change: typeof intel?.sentiment.trend24hPct === 'number' ? `${intel!.sentiment.trend24hPct >= 0 ? '+' : ''}${intel!.sentiment.trend24hPct.toFixed(2)}%` : null,
      positive: typeof intel?.sentiment.trend24hPct === 'number' ? intel!.sentiment.trend24hPct >= 0 : null,
      icon: DollarSign
    },
    {
      title: "24h Volym",
      value: formatAbbrev(intel?.overview.totalVolume24h),
      unit: "USD", 
      change: null,
      positive: null,
      icon: BarChart3
    },
    {
      title: "Bitcoin Dominans",
      value: typeof intel?.overview.btcDominance === 'number' ? intel!.overview.btcDominance.toFixed(1) : '—',
      unit: "%",
      change: null,
      positive: null,
      icon: PieChart
    },
    {
      title: "DeFi TVL",
      value: formatAbbrev(intel?.overview.defiTVL),
      unit: "USD",
      change: null,
      positive: null,
      icon: Activity
    }
  ];

  const topCoins = useMemo(() => {
    return (cryptoPrices ?? [])
      .slice()
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
      .slice(0, 8)
      .map((c, idx) => ({
        rank: c.rank ?? idx + 1,
        symbol: c.symbol,
        name: c.name,
        price: c.price,
        change: c.change24h ?? 0,
        cap: c.marketCap ?? '—'
      }));
  }, [cryptoPrices]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toFixed(2);
  };

  return (
    <section className={`${isMobile ? 'py-12' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-6' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-4' : 'mb-6'} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            MARKNADSÖVERSIKT
          </h2>
          <p className={`font-display ${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            Få en komplett bild av kryptomarknaden med realtidsdata, 
            analyser och insikter från de största digitala tillgångarna.
          </p>
        </div>

        {/* Market Stats */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4 mb-8' : 'md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'}`}>
          {marketStats.map((stat) => {
            const IconComponent = stat.icon;
            
            return (
              <Card 
                key={stat.title}
                className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                  {stat.change != null ? (
                    <div className={`flex items-center space-x-1 ${
                      stat.positive ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.positive ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
                
                <div className="mb-2">
                  <span className="font-crypto text-2xl font-bold">{stat.value}</span>
                  <span className="text-muted-foreground ml-1">{stat.unit}</span>
                </div>
                
                <p className="text-muted-foreground text-sm">{stat.title}</p>
              </Card>
            );
          })}
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'lg:grid-cols-2 gap-8'}`}>
          {/* Top Cryptocurrencies */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="font-crypto text-xl font-bold mb-6 text-primary">
              TOP 8 KRYPTOVALUTOR
            </h3>
            
            <div className="space-y-4">
              {topCoins.map((coin) => (
                <div 
                  key={`${coin.symbol}-${coin.rank}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-crypto text-xs">
                      #{coin.rank}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-crypto font-bold text-primary">
                          {coin.symbol}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {coin.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Cap: {coin.cap} USD
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-display font-semibold">
                      {formatPrice(coin.price)} USD
                    </div>
                    <div className={`flex items-center justify-end space-x-1 text-sm ${
                      coin.change >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {coin.change >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      <span>{coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Analysis */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="font-crypto text-xl font-bold mb-6 text-primary">
              MARKNADSANALYS
            </h3>
            
            <div 
              className="rounded-lg overflow-hidden mb-4 h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${cryptoCharts})` }}
            >
              <div className="w-full h-full bg-gradient-to-t from-card/90 to-transparent flex items-end p-4">
                <div className="text-foreground">
                  <Badge className={`${intel?.analysis?.trend === 'Bearish' ? 'bg-destructive text-destructive-foreground' : intel?.analysis?.trend === 'Bullish' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'} mb-2`}>
                    {(intel?.analysis?.trend ?? 'Neutral')} Trend
                  </Badge>
                  <p className="text-sm font-display">
                    {intel?.analysis?.summary || 'Marknadsdata uppdateras i realtid.'}
                  </p>
                </div>
              </div>
            </div>

            {/* AI-Marknadsanalys (OpenAI) */}
            <AIMarkets />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-display font-semibold text-success">Positiva Signaler</span>
                </div>
                {intel?.analysis?.positives?.length ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {intel?.analysis?.positives?.map((p, i) => (
                      <li key={`pos-${i}`}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Inga starka positiva signaler just nu.</p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-warning" />
                  <span className="font-display font-semibold text-warning">Att Bevaka</span>
                </div>
                {intel?.analysis?.negatives?.length ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {intel?.analysis?.negatives?.map((n, i) => (
                      <li key={`neg-${i}`}>{n}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Inga större riskfaktorer identifierade.</p>
                )}
              </div>

              {intel?.ta ? (
                <div className="md:col-span-2 mt-2">
                  <h4 className="font-crypto text-sm text-muted-foreground mb-3">Teknisk Analys (BTC & ETH)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['btc','eth'] as const).map((asset) => {
                      const set = intel.ta?.[asset];
                      const label = asset.toUpperCase();
                      const row = (tf: 'd1'|'h4'|'h1', name: string) => {
                        const t = set?.[tf];
                        const color = t?.trend === 'Bullish' ? 'text-success' : t?.trend === 'Bearish' ? 'text-destructive' : 'text-warning';
                        return (
                          <div key={`${asset}-${tf}`} className="flex items-center justify-between rounded-md px-3 py-2 bg-secondary/30">
                            <span className="font-display text-sm">{name}</span>
                            <div className={`font-display text-sm ${color}`}>
                              <span className="mr-2">{t?.trend ?? '—'}</span>
                              {typeof t?.rsi14 === 'number' && (<span className="text-muted-foreground">RSI {t.rsi14.toFixed(0)}</span>)}
                            </div>
                          </div>
                        );
                      };
                      return (
                        <Card key={asset} className="p-4 bg-card/70 border-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-crypto font-semibold text-primary">{label}</span>
                          </div>
                          <div className="space-y-2">
                            {row('d1','1D')}
                            {row('h4','4H')}
                            {row('h1','1H')}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}

            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;