import { useEffect, useState, useRef } from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MoreHorizontal, Maximize2, BarChart3, AlertCircle, RefreshCw } from "lucide-react";

interface ModernTradingViewChartProps {
  symbol: string;
  currentPrice: number;
}

const ModernTradingViewChart = ({ symbol, currentPrice }: ModernTradingViewChartProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartLoadTimeout = useRef<NodeJS.Timeout>();

  // Symbol mapping for TradingView format
  const getTradingViewSymbol = (symbol: string) => {
    const symbolMap: Record<string, string> = {
      'BTC': 'BTCUSDT',
      'ETH': 'ETHUSDT',
      'BNB': 'BNBUSDT',
      'XRP': 'XRPUSDT',
      'ADA': 'ADAUSDT',
      'SOL': 'SOLUSDT',
      'DOT': 'DOTUSDT',
      'AVAX': 'AVAXUSDT',
      'LINK': 'LINKUSDT',
      'MATIC': 'MATICUSDT',
      'UNI': 'UNIUSDT',
      'LTC': 'LTCUSDT',
      'DOGE': 'DOGEUSDT',
      'SHIB': 'SHIBUSDT'
    };
    return `BINANCE:${symbolMap[symbol.toUpperCase()] || symbol.toUpperCase() + 'USDT'}`;
  };

  // Interval mapping for timeframe
  const getInterval = (timeframe: string) => {
    const intervals: Record<string, any> = {
      "1m": "1",
      "5m": "5", 
      "15m": "15",
      "1H": "60",
      "4H": "240",
      "1D": "1D",
      "1W": "1W"
    };
    return intervals[timeframe] || "1D";
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    console.log('Timeframe changed to:', newTimeframe);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

const handleRetry = () => {
  setHasError(false);
  setIsLoaded(false);
  setRefreshKey((k) => k + 1);
};

  useEffect(() => {
    console.log('ModernTradingViewChart mounted for symbol:', symbol);
    
    // Set a timeout to check if chart loads
    chartLoadTimeout.current = setTimeout(() => {
      if (!isLoaded) {
        console.log('Chart loading timeout');
        setIsLoaded(true); // Show chart anyway
      }
    }, 5000);

    // Simulate successful load after short delay
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
      console.log('Chart marked as loaded');
    }, 2000);

    return () => {
      if (chartLoadTimeout.current) {
        clearTimeout(chartLoadTimeout.current);
      }
      clearTimeout(loadTimer);
    };
  }, [symbol]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const tradingViewSymbol = getTradingViewSymbol(symbol);
  console.log('Using TradingView symbol:', tradingViewSymbol);

  return (
    <Card className="h-full bg-background/95 backdrop-blur-sm border-border/20 relative overflow-hidden">
      {/* Top Controls Bar - Fixed above chart */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-md border-b border-border/20 flex items-center justify-between px-4 z-30">
        {/* Left: Timeframe Controls */}
        <div className="flex gap-1">
          {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
            <Badge
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                timeframe === tf ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/20"
              }`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Badge>
          ))}
        </div>
        
        {/* Right: Action Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-primary/20"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-primary/20"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-primary/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-primary/20"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* Chart Container - Properly spaced below controls */}
      <div 
        ref={containerRef} 
        className="w-full h-full pt-14"
        style={{ minHeight: 'calc(100% - 56px)' }}
      >
        {hasError ? (
          <div className="flex items-center justify-center h-full bg-background/90">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kunde inte ladda chart</h3>
              <p className="text-muted-foreground mb-4">Det uppstod ett fel vid laddning av TradingView chart</p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Försök igen
              </Button>
            </div>
          </div>
        ) : !isLoaded ? (
          <div className="flex items-center justify-center h-full bg-background/90">
            <div className="text-center">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Laddar TradingView Chart</h3>
              <p className="text-muted-foreground">Hämtar live data från Binance...</p>
              <div className="mt-2 text-xs text-success">
                Symbol: {tradingViewSymbol}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <AdvancedRealTimeChart
              key={`${tradingViewSymbol}-${timeframe}-${refreshKey}`}
              theme="dark"
              autosize
              symbol={tradingViewSymbol}
              interval={getInterval(timeframe)}
              timezone="Etc/UTC"
              style="1"
              locale="en"
              enable_publishing={false}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ModernTradingViewChart;