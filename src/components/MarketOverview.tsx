import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import cryptoCharts from "@/assets/crypto-charts.jpg";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useMemo, useState } from "react";
import { useAIMarketIntel } from "@/hooks/useAIMarketIntel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import OptimizedImage from "@/components/OptimizedImage";
import { useLanguage } from "@/contexts/LanguageContext";

// Coin logos
import btcLogo from "@/assets/crypto-logos/svg/btc.svg";
import ethLogo from "@/assets/crypto-logos/svg/eth.svg";
import bnbLogo from "@/assets/crypto-logos/svg/bnb.svg";
import adaLogo from "@/assets/crypto-logos/svg/ada.svg";
import avaxLogo from "@/assets/crypto-logos/svg/avax.svg";
import dogeLogo from "@/assets/crypto-logos/svg/doge.svg";
import dotLogo from "@/assets/crypto-logos/svg/dot.svg";
import linkLogo from "@/assets/crypto-logos/svg/link.svg";
import ltcLogo from "@/assets/crypto-logos/svg/ltc.svg";
import maticLogo from "@/assets/crypto-logos/svg/matic.svg";
import shibLogo from "@/assets/crypto-logos/svg/shib.svg";
import solLogo from "@/assets/crypto-logos/svg/sol.svg";
import uniLogo from "@/assets/crypto-logos/svg/uni.svg";
import xrpLogo from "@/assets/crypto-logos/svg/xrp.svg";
import trxLogo from "@/assets/crypto-logos/svg/trx.svg";
import TransparentLogo from "@/components/TransparentLogo";

const COIN_LOGOS: Record<string, string> = {
  BTC: btcLogo,
  ETH: ethLogo,
  BNB: bnbLogo,
  ADA: adaLogo,
  AVAX: avaxLogo,
  DOGE: dogeLogo,
  DOT: dotLogo,
  LINK: linkLogo,
  LTC: ltcLogo,
  MATIC: maticLogo,
  SHIB: shibLogo,
  SOL: solLogo,
  UNI: uniLogo,
  XRP: xrpLogo,
  TRX: trxLogo,
};

const EXCLUDED_STABLES = new Set(['USDT','USDC','DAI','TUSD','FDUSD','USDE','USDP','GUSD','EURT','PYUSD','BUSD','LUSD','FRAX','USDJ','USDD']);
const EXCLUDED_STAKED = new Set(['STETH','WSTETH','RETH','CBETH','FRXETH','ANKRETH','WBETH','SFRXETH']);

function AIMarkets() {
  const { data, isLoading, error } = useAIMarketIntel();
  const { t } = useLanguage();
  if (error) return null;
  return (
    <Card className="p-4 bg-card/80 border-border mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-crypto text-sm text-muted-foreground">{t('market.aiMarketAnalysis')} (OpenAI)</span>
        <Badge className={`${data?.trend === 'Bearish' ? 'bg-destructive text-destructive-foreground' : data?.trend === 'Bullish' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}`}>
          {data?.trend ?? 'Neutral'}
        </Badge>
      </div>
      <p className="text-sm font-display mb-3">
        {isLoading ? t('market.loadingAI') : (data?.summary || t('market.aiSummaryUnavailable'))}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="font-display text-success mb-1">{t('market.positives')}</div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {(data?.positives ?? []).slice(0,5).map((p, i) => (<li key={`ai-pos-${i}`}>{p}</li>))}
          </ul>
        </div>
        <div>
          <div className="font-display text-warning mb-1">{t('market.toWatch')}</div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {(data?.negatives ?? []).slice(0,5).map((n, i) => (<li key={`ai-neg-${i}`}>{n}</li>))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

const MarketOverview = () => {
  const { data: aiIntel, isLoading: aiLoading } = useAIMarketIntel();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { data: intel } = useMarketIntel(); // Backup for market stats
  const { cryptoPrices } = useCryptoData();
  const [openDetails, setOpenDetails] = useState(false);

  const formatAbbrev = (n?: number | null) => {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(2);
  };

  const extractMarketCap = (summary: string): number | null => {
    const match = summary.match(/(?:Market Cap|Marknadsvärde):\s*([\d.]+)([TBM])/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[2];
    const multiplier = unit === 'T' ? 1e12 : unit === 'B' ? 1e9 : unit === 'M' ? 1e6 : 1;
    return value * multiplier;
  };

  const marketStats = [
    {
      title: t('market.totalMarketCap'),
      value: formatAbbrev(aiIntel?.summary ? extractMarketCap(aiIntel.summary) : intel?.overview.totalMarketCap),
      unit: "USD",
      change: typeof intel?.sentiment.trend24hPct === 'number' ? `${intel!.sentiment.trend24hPct >= 0 ? '+' : ''}${intel!.sentiment.trend24hPct.toFixed(2)}%` : null,
      positive: typeof intel?.sentiment.trend24hPct === 'number' ? intel!.sentiment.trend24hPct >= 0 : null,
      icon: DollarSign
    },
    {
      title: t('market.volume24h'),
      value: formatAbbrev(intel?.overview.totalVolume24h),
      unit: "USD", 
      change: null,
      positive: null,
      icon: BarChart3
    },
    {
      title: t('market.btcDominance'),
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
    const filtered = (cryptoPrices ?? []).filter((c) => {
      const sym = (c.symbol || '').toUpperCase();
      return sym && !EXCLUDED_STABLES.has(sym) && !EXCLUDED_STAKED.has(sym);
    });

    return filtered
      .slice()
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
      .slice(0, 8)
      .map((c, idx) => ({
        rank: c.rank ?? idx + 1,
        symbol: (c.symbol || '').toUpperCase(),
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
    <section className={`${isMobile ? 'py-8' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-16'}`}>
          <h2 className={`font-crypto ${isMobile ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            {t('market.title').toUpperCase()}
          </h2>
          <p className={`font-display ${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            {t('market.description')}
          </p>
        </div>

        {/* Market Stats */}
        <div className={`grid grid-cols-2 ${isMobile ? 'gap-3 mb-6' : 'md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'}`}>
          {marketStats.map((stat) => {
            const IconComponent = stat.icon;
            
            return (
              <Card 
                key={stat.title}
                className={`${isMobile ? 'p-3' : 'p-6'} bg-card/80 backdrop-blur-sm border-border hover:shadow-glow-secondary transition-all duration-300 hover:scale-105`}
              >
                <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
                  <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-primary`} />
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
                
                <div className={`${isMobile ? 'mb-1' : 'mb-2'}`}>
                  <span className={`font-numbers ${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{stat.value}</span>
                  <span className={`text-muted-foreground ${isMobile ? 'text-xs ml-1' : 'ml-1'}`}>{stat.unit}</span>
                </div>
                
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{stat.title}</p>
              </Card>
            );
          })}
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-8'}`}>
          {/* Top Cryptocurrencies */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border`}>
            <h3 className={`font-crypto ${isMobile ? 'text-lg' : 'text-xl'} font-bold ${isMobile ? 'mb-4' : 'mb-6'} text-primary`}>
              {t('market.topCryptocurrencies').toUpperCase()}
            </h3>
            
            <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
              {topCoins.map((coin) => (
                <div 
                  key={`${coin.symbol}-${coin.rank}`}
                  className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} rounded-xl border border-border bg-muted ring-1 ring-border/50 shadow-sm flex items-center justify-center overflow-hidden`}>
                      <OptimizedImage
                        src={COIN_LOGOS[coin.symbol] || '/placeholder.svg'}
                        alt={`${coin.name} logo`}
                        className={`${isMobile ? 'h-6 w-6' : 'h-10 w-10'} object-contain`}
                        fallbackSrc="/placeholder.svg"
                        loading="lazy"
                      />
                    </div>
                    {!isMobile && (
                      <Badge variant="outline" className="font-crypto text-xs">
                        #{coin.rank}
                      </Badge>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-crypto font-bold text-primary ${isMobile ? 'text-sm' : ''}`}>
                          {coin.symbol}
                        </span>
                        {!isMobile && (
                          <span className="text-muted-foreground text-sm">
                            {coin.name}
                          </span>
                        )}
                      </div>
                      {!isMobile && (
                        <span className="text-xs text-muted-foreground">
                          {t('market.cap')}: {coin.cap} USD
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                     <div className={`font-display font-semibold font-numbers ${isMobile ? 'text-sm' : ''}`}>
                       {formatPrice(coin.price)} USD
                     </div>
                    <div className={`flex items-center justify-end space-x-1 ${isMobile ? 'text-xs' : 'text-sm'} ${
                      coin.change >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {coin.change >= 0 ? (
                        <TrendingUp size={isMobile ? 10 : 12} />
                      ) : (
                        <TrendingDown size={isMobile ? 10 : 12} />
                      )}
                      <span className="font-numbers">{coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Analysis */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/80 backdrop-blur-sm border-border`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <h3 className={`font-crypto ${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary`}>{t('market.marketAnalysis').toUpperCase()}</h3>
              {!isMobile && <Button variant="outline" size="sm" onClick={() => setOpenDetails(true)}>{t('market.detailedInfo')}</Button>}
            </div>
            <div 
              className={`rounded-lg overflow-hidden ${isMobile ? 'mb-3 h-32' : 'mb-4 h-48'} bg-cover bg-center`}
              style={{ backgroundImage: `url(${cryptoCharts})` }}
            >
              <div className={`w-full h-full bg-gradient-to-t from-card/90 to-transparent flex items-end ${isMobile ? 'p-2' : 'p-4'}`}>
                <div className="text-foreground w-full">
                  {aiLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <Badge className="bg-primary text-primary-foreground animate-pulse">
                          {t('market.aiResearchInProgress')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-display font-semibold text-primary">
                          {t('market.openAIAnalyzing')}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• {t('market.fetchingRealTimeData')}</p>
                          <p>• {t('market.analyzingTechnicalIndicators')}</p>
                          <p>• {t('market.calculatingSupportResistance')}</p>
                          <p>• {t('market.identifyingBreakouts')}</p>
                          <p>• {t('market.verifyingSentiment')}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Badge className={`${aiIntel?.trend === 'Bearish' ? 'bg-destructive text-destructive-foreground' : aiIntel?.trend === 'Bullish' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'} mb-2`}>
                        {(aiIntel?.trend ?? 'Neutral')} {t('market.trend')}
                      </Badge>
                      <p className="text-sm font-display">
                        {aiIntel?.summary || t('market.aiMarketAnalysisDefault')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {aiLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="animate-spin h-4 w-4 border-2 border-success border-t-transparent rounded-full"></div>
                    <span className="font-display font-semibold text-success">{t('market.analyzingPositiveSignals')}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-success/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-success/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-success/20 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="animate-spin h-4 w-4 border-2 border-warning border-t-transparent rounded-full"></div>
                    <span className="font-display font-semibold text-warning">{t('market.analyzingRiskFactors')}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-warning/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-warning/20 rounded animate-pulse w-4/5"></div>
                    <div className="h-3 bg-warning/20 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <h4 className="font-crypto text-sm text-primary font-semibold">{t('market.calculatingTechnicalLevels')}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['BTC', 'ETH'] as const).map((asset) => (
                      <Card key={asset} className="p-4 bg-card/70 border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-crypto font-semibold text-primary">{asset}</span>
                          <div className="flex items-center space-x-1">
                            <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
                            <Badge variant="outline" className="text-xs">{t('market.calculating')}</Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{t('market.currentPrice')}:</span>
                            <div className="h-4 bg-secondary/50 rounded animate-pulse w-20"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 rounded bg-destructive/10 border border-destructive/20">
                              <span className="text-sm text-destructive">{t('market.nextSupport')}:</span>
                              <div className="h-4 bg-destructive/20 rounded animate-pulse w-16"></div>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded bg-success/10 border border-success/20">
                              <span className="text-sm text-success">{t('market.nextResistance')}:</span>
                              <div className="h-4 bg-success/20 rounded animate-pulse w-16"></div>
                            </div>
                            <div className="p-2 rounded border bg-warning/10 border-warning/20">
                              <div className="h-3 bg-warning/20 rounded animate-pulse w-full"></div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-display font-semibold text-success">{t('market.positiveSignalsAI')}</span>
                  </div>
                  {aiIntel?.positives?.length ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {aiIntel.positives.map((p, i) => (
                        <li key={`ai-pos-${i}`}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('market.noPositiveSignals')}</p>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-warning" />
                    <span className="font-display font-semibold text-warning">{t('market.toWatchAI')}</span>
                  </div>
                  {aiIntel?.negatives?.length ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {aiIntel.negatives.map((n, i) => (
                        <li key={`ai-neg-${i}`}>{n}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('market.noRiskFactors')}</p>
                  )}
                </div>

                {aiIntel?.technicalLevels ? (
                  <div className="md:col-span-2 mt-4">
                    <h4 className="font-crypto text-sm text-muted-foreground mb-3">{t('market.technicalLevelsAI')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['btc', 'eth'] as const).map((asset) => {
                        const levels = aiIntel.technicalLevels?.[asset];
                        const label = asset.toUpperCase();
                        if (!levels) return null;
                        
                        return (
                          <Card key={asset} className="p-4 bg-card/70 border-border">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-crypto font-semibold text-primary">{label}</span>
                              <Badge variant="outline" className="text-xs">{t('market.realtimeAI')}</Badge>
                            </div>
                            <div className="space-y-3">
<div className="flex justify-between items-center text-sm">
  <span className="text-muted-foreground">{t('market.currentPrice')}:</span>
  <span className="font-numbers font-bold">{(typeof levels.currentPrice === 'number' && isFinite(levels.currentPrice) && levels.currentPrice > 0) ? `$${Math.round(levels.currentPrice).toLocaleString()}` : '—'}</span>
</div>
 
<div className="space-y-2">
  <div className="flex justify-between items-center p-2 rounded bg-destructive/10 border border-destructive/20">
    <span className="text-sm text-destructive">{t('market.nextSupport')}:</span>
    <span className="font-numbers text-sm text-destructive font-bold">{(typeof levels.nextSupport?.price === 'number' && isFinite(levels.nextSupport.price) && levels.nextSupport.price > 0) ? `$${Math.round(levels.nextSupport.price).toLocaleString()}` : '—'}</span>
  </div>
  
  <div className="flex justify-between items-center p-2 rounded bg-success/10 border border-success/20">
    <span className="text-sm text-success">{t('market.nextResistance')}:</span>
    <span className="font-numbers text-sm text-success font-bold">{(typeof levels.nextResistance?.price === 'number' && isFinite(levels.nextResistance.price) && levels.nextResistance.price > 0) ? `$${Math.round(levels.nextResistance.price).toLocaleString()}` : '—'}</span>
  </div>
                                
                                {levels.criticalLevel && (
                                  <div className={`p-2 rounded border ${
                                    levels.criticalLevel.type === 'breakout' ? 'bg-success/10 border-success/20' :
                                    levels.criticalLevel.type === 'breakdown' ? 'bg-destructive/10 border-destructive/20' :
                                    'bg-warning/10 border-warning/20'
                                  }`}>
                                    <div className={`text-xs font-medium ${
                                      levels.criticalLevel.type === 'breakout' ? 'text-success' :
                                      levels.criticalLevel.type === 'breakdown' ? 'text-destructive' :
                                      'text-warning'
                                    }`}>
                                      {levels.criticalLevel.text}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {aiIntel?.ta ? (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="font-crypto text-sm text-muted-foreground mb-3">{t('market.technicalAnalysisAI')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['btc','eth'] as const).map((asset) => {
                        const set = aiIntel.ta?.[asset];
                        const label = asset.toUpperCase();
                          const row = (tf: 'd1'|'d7'|'m1', name: string) => {
                            const t = set?.[tf];
                            const color = t?.trend === 'Bullish' ? 'text-success' : t?.trend === 'Bearish' ? 'text-destructive' : 'text-warning';
                            return (
                              <div key={`${asset}-${tf}`} className="flex items-center justify-between rounded-md px-3 py-2 bg-secondary/30">
                                <span className="font-display text-sm">{name}</span>
                                <div className={`font-display text-sm ${color}`}>
                                  <span className="mr-2">{t?.trend ?? '—'}</span>
                                   {typeof t?.rsi14 === 'number' && (<span className="text-muted-foreground font-numbers">RSI {t.rsi14.toFixed(0)}</span>)}
                                </div>
                              </div>
                            );
                          };
                          return (
                            <Card key={asset} className="p-4 bg-card/70 border-border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-crypto font-semibold text-primary">{label}</span>
                                <Badge variant="outline" className="text-xs">{t('market.aiVerified')}</Badge>
                              </div>
                              <div className="space-y-2">
                                {row('d1','1D')}
                                {row('d7','7D')}
                                {row('m1','1M')}
                              </div>
                            </Card>
                          );
                      })}
                    </div>
                    
                    {aiIntel?.sentiment && (
                      <div className="mt-4 p-4 rounded-lg bg-secondary/20 border border-secondary">
                        <h5 className="font-crypto text-sm font-semibold mb-2">{t('market.sentimentAnalysis')}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('market.fearGreed')}:</span>
                            <span className="ml-2 font-semibold">{aiIntel.sentiment.fearGreed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('market.socialMedia')}:</span>
                            <span className="ml-2 font-semibold">{aiIntel.sentiment.socialMediaTrend}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('market.institutionalFlow')}:</span>
                            <span className="ml-2 font-semibold">{aiIntel.sentiment.institutionalFlow}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : intel?.ta ? (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="font-crypto text-sm text-muted-foreground mb-3">{t('market.technicalAnalysis')} (Fallback)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['btc','eth'] as const).map((asset) => {
                        const set = intel.ta?.[asset];
                        const label = asset.toUpperCase();
                        const row = (tf: 'd1'|'d7'|'m1', name: string) => {
                          const t = set?.[tf];
                          const color = t?.trend === 'Bullish' ? 'text-success' : t?.trend === 'Bearish' ? 'text-destructive' : 'text-warning';
                          return (
                            <div key={`${asset}-${tf}`} className="flex items-center justify-between rounded-md px-3 py-2 bg-secondary/30">
                              <span className="font-display text-sm">{name}</span>
                              <div className={`font-display text-sm ${color}`}>
                                <span className="mr-2">{t?.trend ?? '—'}</span>
                                {typeof t?.rsi14 === 'number' && (<span className="text-muted-foreground">RSI <span className="font-numbers">{t.rsi14.toFixed(0)}</span></span>)}
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
                                {row('d7','7D')}
                                {row('m1','1M')}
                              </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          <Dialog open={openDetails} onOpenChange={setOpenDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('market.detailedAIResearch')}</DialogTitle>
                <DialogDescription>
                  {t('market.lastUpdate')}: {aiIntel?.generatedAt ? new Date(aiIntel.generatedAt).toLocaleString() : '—'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm font-display">{aiIntel?.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['btc','eth'] as const).map((asset) => {
                    const t = aiIntel?.ta?.[asset as 'btc'|'eth'] as any;
                    if (!t) return null;
                    const label = (asset as string).toUpperCase();
                    return (
                      <Card key={asset} className="p-3 bg-card/70 border-border">
                        <div className="font-crypto font-semibold text-primary mb-2">{label}</div>
                        {(['d1','d7','m1'] as const).map(tf => (
                          <div key={`${asset}-${tf}`} className="flex items-center justify-between text-sm py-1">
                            <span className="text-muted-foreground">{tf.toUpperCase()}</span>
                            <span className="font-display">{t?.[tf]?.trend ?? '—'}{typeof t?.[tf]?.rsi14 === 'number' ? ` · RSI ` : ''}<span className="font-numbers">{typeof t?.[tf]?.rsi14 === 'number' ? t?.[tf]?.rsi14.toFixed(0) : ''}</span></span>
                          </div>
                        ))}
                      </Card>
                    );
                  })}
                </div>
                {Array.isArray(aiIntel?.sources) && aiIntel?.sources?.length ? (
                  <div className="text-xs text-muted-foreground">
                    {t('market.sources')}: {(aiIntel?.sources as string[]).join(', ')}
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;