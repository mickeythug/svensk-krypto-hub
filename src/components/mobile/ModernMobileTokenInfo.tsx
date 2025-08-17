import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUp, ArrowDown, TrendingUp, Volume2, Coins, Calendar } from "lucide-react";

interface ModernMobileTokenInfoProps {
  symbol: string;
  tokenName: string;
  currentPrice: number;
  priceChange24h: number;
  crypto: any;
  ticker: any;
}

const ModernMobileTokenInfo = ({ 
  symbol, 
  tokenName, 
  currentPrice, 
  priceChange24h, 
  crypto, 
  ticker 
}: ModernMobileTokenInfoProps) => {
  const { t } = useLanguage();
  const isPositive = priceChange24h >= 0;

  const formatLargeNumber = (num: number | string | undefined) => {
    if (!num || num === 'N/A') return 'N/A';
    const value = typeof num === 'string' ? parseFloat(num.replace(/[,$]/g, '')) : num;
    if (!Number.isFinite(value)) return 'N/A';
    
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatSupply = (supply: number | string | undefined) => {
    if (!supply) return 'N/A';
    const value = typeof supply === 'string' ? parseFloat(supply.replace(/[,$]/g, '')) : supply;
    if (!Number.isFinite(value)) return 'N/A';
    
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* TOKEN HEADER */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/80">
        <div className="flex items-center gap-4 mb-6">
          {crypto?.image && (
            <div className="relative">
              <img
                src={crypto.image}
                alt={`${tokenName} logo`}
                className="h-16 w-16 rounded-full ring-4 ring-primary/20 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-card"></div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">{tokenName}</h1>
            <p className="text-muted-foreground font-mono">{symbol.toUpperCase()}</p>
          </div>
        </div>

        {/* CURRENT PRICE */}
        <div className="space-y-3">
          <div className="text-4xl font-bold font-mono text-foreground">
            {formatUsd(currentPrice)}
          </div>
          
          <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
            <span className="text-xl font-bold">
              {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">24h förändring</span>
          </div>
        </div>
      </Card>

      {/* PRICE STATISTICS */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Price statistics (24h)
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Högsta</div>
            <div className="font-mono font-bold text-emerald-500">
              {Number.isFinite(ticker?.high24h) ? formatUsd(ticker.high24h) : '—'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Lägsta</div>
            <div className="font-mono font-bold text-red-500">
              {Number.isFinite(ticker?.low24h) ? formatUsd(ticker.low24h) : '—'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Volym</div>
            <div className="font-mono font-bold text-primary">
              {Number.isFinite(ticker?.volumeQuote) 
                ? formatLargeNumber(ticker.volumeQuote)
                : formatLargeNumber(crypto?.volume)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Spread</div>
            <div className="font-mono font-bold text-foreground">
              {ticker?.spread ? `${(ticker.spread * 100).toFixed(3)}%` : '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* MARKET DATA */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          {t('market.data')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">{t('market.cap')}</span>
            <span className="font-mono font-bold">
              {formatLargeNumber(crypto?.marketCap)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">24h Volym</span>
            <span className="font-mono font-bold">
              {formatLargeNumber(crypto?.volume)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Ranking</span>
            <span className="font-mono font-bold">
              {crypto?.rank ? `#${crypto.rank}` : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* SUPPLY INFORMATION */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Supply information
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Circulating supply</span>
            <span className="font-mono font-bold">
              {formatSupply(crypto?.circulatingSupply)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Total supply</span>
            <span className="font-mono font-bold">
              {formatSupply(crypto?.totalSupply) || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Max supply</span>
            <span className="font-mono font-bold">
              {crypto?.maxSupply ? formatSupply(crypto.maxSupply) : 'Obegränsad'}
            </span>
          </div>
        </div>
      </Card>

      {/* TRADING PAIRS */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Available trading pairs
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold">
            {symbol}/USDT
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 border-secondary/30 font-semibold">
            {symbol}/BTC
          </Badge>
          <Badge variant="outline" className="bg-accent/10 border-accent/30 font-semibold">
            {symbol}/ETH
          </Badge>
          <Badge variant="outline" className="bg-muted/20 border-muted-foreground/30 font-semibold">
            {symbol}/BNB
          </Badge>
        </div>
      </Card>

      {/* ADDITIONAL INFO */}
      {(crypto?.description || crypto?.website || crypto?.social) && (
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4">Om {tokenName}</h3>
          
          {crypto?.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {crypto.description}
            </p>
          )}
          
          {(crypto?.website || crypto?.social) && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Länkar</h4>
              <div className="flex flex-wrap gap-2">
                {crypto?.website && (
                  <Badge variant="outline" className="text-xs">
                    Website
                  </Badge>
                )}
                {crypto?.social?.twitter && (
                  <Badge variant="outline" className="text-xs">
                    Twitter
                  </Badge>
                )}
                {crypto?.social?.github && (
                  <Badge variant="outline" className="text-xs">
                    GitHub
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ModernMobileTokenInfo;