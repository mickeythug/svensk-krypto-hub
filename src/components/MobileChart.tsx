import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  BarChart3,
  DollarSign,
  Volume2,
  Share,
  Star,
  Bell,
  MoreHorizontal,
  Maximize2,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MobileChartProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

const MobileChart = ({ symbol, currentPrice, priceChange24h, tokenName, crypto }: MobileChartProps) => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(false);
  const [chartError, setChartError] = useState(false);

  const timeframes = ["1H", "1D", "1W", "1M", "3M", "1Y"];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const reloadChart = () => {
    setIsLoading(true);
    setChartError(false);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{symbol.charAt(0)}</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">{symbol}/USD</h2>
            <p className="text-xs text-muted-foreground">{tokenName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-4 bg-card/30">
        <div className="flex items-end gap-4 mb-2">
          <div className="text-3xl font-bold font-numbers">{formatPrice(currentPrice)}</div>
          <div className={`flex items-center gap-1 text-lg font-semibold ${
            priceChange24h >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {priceChange24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-numbers">{priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%</span>
          </div>
        </div>
        
        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">24h High</div>
            <div className="font-semibold font-numbers">{formatPrice(currentPrice * 1.05)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Low</div>
            <div className="font-semibold font-numbers">{formatPrice(currentPrice * 0.95)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Volume</div>
            <div className="font-semibold">${crypto?.volume || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 py-2 border-b border-border/20">
        <div className="flex gap-1 overflow-x-auto">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className="flex-shrink-0 h-8 px-4 text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div className="h-[400px] bg-card/20 flex items-center justify-center">
          {chartError ? (
            <div className="text-center p-6">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">{t('common.chartLoadError')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('common.chartLoadErrorDescription')}
              </p>
              <Button onClick={reloadChart} variant="outline" size="sm">
                <RefreshCw size={14} className="mr-2" />
                {t('common.retry')}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center">
              <RefreshCw className="animate-spin h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('common.loadingChart')}</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <BarChart3 className="mx-auto h-16 w-16 text-primary/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">TradingView Chart</h3>
              <p className="text-muted-foreground mb-4">
                {t('common.chartDescription')} {symbol}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/20 rounded-lg p-3">
                  <div className="text-muted-foreground">RSI</div>
                  <div className="font-bold text-primary">42.5</div>
                </div>
                <div className="bg-secondary/20 rounded-lg p-3">
                  <div className="text-muted-foreground">MACD</div>
                  <div className="font-bold text-success">+0.15</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Controls Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm" onClick={reloadChart}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart Indicators */}
      <div className="p-4 border-t border-border/20">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">{t('common.technicalIndicators')}</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Moving Average</span>
              <Badge variant="outline" className="text-xs">MA20</Badge>
            </div>
            <div className="text-sm font-semibold font-numbers">{formatPrice(currentPrice * 0.98)}</div>
            <div className="text-xs text-success font-numbers">+2.1%</div>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Support/Resistance</span>
              <Badge variant="outline" className="text-xs">S/R</Badge>
            </div>
            <div className="text-sm font-semibold font-numbers">{formatPrice(currentPrice * 1.02)}</div>
            <div className="text-xs text-muted-foreground">Resistance</div>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Bollinger Bands</span>
              <Badge variant="outline" className="text-xs">BB</Badge>
            </div>
            <div className="text-sm font-semibold">Neutral</div>
            <div className="text-xs text-muted-foreground">Middle band</div>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Volume Profile</span>
              <Badge variant="outline" className="text-xs">VP</Badge>
            </div>
            <div className="text-sm font-semibold">High</div>
            <div className="text-xs text-success">Above avg</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileChart;