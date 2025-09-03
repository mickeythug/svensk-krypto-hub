import { useEffect, useRef, useState, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Maximize2, BarChart3, RefreshCw } from "lucide-react";
import { loadTradingView } from "@/lib/tradingviewLoader";

interface UnifiedTradingChartProps {
  symbol: string;
  currentPrice: number;
  limitLines?: {
    price: number;
    side: 'buy' | 'sell';
  }[];
  coinGeckoId?: string;
  height?: string;
  showControls?: boolean;
  mobile?: boolean;
}

const UnifiedTradingChart = memo(({
  symbol,
  currentPrice,
  limitLines,
  coinGeckoId,
  height = "h-full",
  showControls = true,
  mobile = false
}: UnifiedTradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef<string>(`tv_unified_${Math.random().toString(36).slice(2)}`);
  const widgetRef = useRef<any>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Initialize chart
  const initializeChart = async () => {
    try {
      setIsLoading(true);
      console.log(`🎯 Initializing chart for ${symbol}`);
      
      // Load TradingView script
      await loadTradingView();
      console.log('✅ TradingView loaded');
      
      // Create widget
      createTradingViewWidget();
      setIsLoading(false);
      setIsReady(true);
      console.log('✅ Chart ready');
    } catch (error) {
      console.error('❌ Chart initialization failed:', error);
      setIsLoading(false);
    }
  };

  const createTradingViewWidget = () => {
    if (!containerRef.current || !window.TradingView) {
      return;
    }

    // Cleanup previous widget
    if (widgetRef.current) {
      try {
        if (typeof widgetRef.current.remove === 'function') {
          widgetRef.current.remove();
        }
      } catch (e) {
        console.warn('Widget cleanup:', e);
      }
    }

    // Clear container
    containerRef.current.innerHTML = '';

    const tradingPair = `BINANCE:${symbol.toUpperCase()}USDT`;
    
    widgetRef.current = new window.TradingView.widget({
      autosize: true,
      symbol: tradingPair,
      interval: getInterval(timeframe),
      container_id: containerIdRef.current,
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "rgba(0, 0, 0, 0)",
      enable_publishing: false,
      hide_top_toolbar: mobile,
      hide_legend: mobile,
      save_image: false,
      hide_volume: false,
      width: "100%",
      height: "100%",
      studies: mobile ? [] : ["Volume@tv-basicstudies"],
      overrides: {
        "paneProperties.background": mobile ? "#0f0f23" : "rgba(0, 0, 0, 0)",
        "paneProperties.backgroundType": "solid",
        "mainSeriesProperties.candleStyle.upColor": "#10b981",
        "mainSeriesProperties.candleStyle.downColor": "#ef4444",
        "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
        "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
        "scalesProperties.textColor": "#8a92b2",
        "scalesProperties.backgroundColor": mobile ? "#0f0f23" : "rgba(0, 0, 0, 0.1)"
      },
      disabled_features: mobile ? [
        "use_localstorage_for_settings",
        "header_symbol_search",
        "header_compare",
        "header_undo_redo", 
        "header_screenshot",
        "header_chart_type",
        "header_saveload",
        "header_settings"
      ] : ["use_localstorage_for_settings", "volume_force_overlay"],
      enabled_features: mobile ? [] : ["study_templates"]
    });
  };

  useEffect(() => {
    initializeChart();

    return () => {
      if (widgetRef.current) {
        try {
          if (typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
          }
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
        widgetRef.current = null;
      }
    };
  }, [symbol, mobile]);

  const getInterval = (timeframe: string): "1" | "5" | "15" | "60" | "240" | "D" | "W" => {
    const intervals: Record<string, "1" | "5" | "15" | "60" | "240" | "D" | "W"> = {
      "1m": "1",
      "5m": "5", 
      "15m": "15",
      "1H": "60",
      "4H": "240",
      "1D": "D",
      "1W": "W"
    };
    return intervals[timeframe] || "D";
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    if (widgetRef.current && widgetRef.current.chart) {
      try {
        widgetRef.current.chart().setResolution(getInterval(newTimeframe));
      } catch (e) {
        console.warn('Could not change resolution, reinitializing');
        initializeChart();
      }
    }
  };

  const handleRefresh = () => {
    initializeChart();
  };

  const toggleFullscreen = async () => {
    if (mobile) {
      try {
        if (!document.fullscreenElement) {
          const el = containerRef.current?.closest(".chart-container") || containerRef.current;
          if (el) {
            await (el as any).requestFullscreen();
            setIsFullscreen(true);
          }
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch (e) {
        console.error("Fullscreen error:", e);
      }
    } else {
      const chartContainer = containerRef.current?.closest('.chart-fullscreen-container') as HTMLElement;
      if (!chartContainer) return;

      if (!isFullscreen) {
        setIsFullscreen(true);
        chartContainer.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: rgb(10, 10, 10) !important;
          border-radius: 0 !important;
        `;
      } else {
        setIsFullscreen(false);
        chartContainer.style.cssText = '';
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const timeframes = mobile ? ["5m", "15m", "1H", "4H", "1D", "1W"] : ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

  const ChartContainer = mobile ? "div" : Card;
  const containerProps = mobile ? {
    className: `${height} w-full flex flex-col chart-container bg-[#0f0f23] overflow-hidden`
  } : {
    className: `${height} bg-gradient-to-br from-card/95 to-muted/95 backdrop-blur-xl border-primary/20 relative overflow-hidden flex flex-col chart-fullscreen-container shadow-2xl shadow-primary/5 ${isFullscreen ? 'fullscreen-chart' : ''}`,
    style: {
      ...(isFullscreen && !document.fullscreenElement ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))',
        borderRadius: 0
      } : {})
    }
  };

  return (
    <ChartContainer {...containerProps}>
      {/* Controls Header */}
      {showControls && (
        <div className={`flex items-center justify-between ${mobile ? 'px-3 py-2' : 'px-4 py-3'} ${mobile ? 'bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-xl border-b border-border/20' : 'border-b border-primary/20 bg-gradient-to-r from-card/95 to-muted/95 backdrop-blur-xl'}`}>
          <div className={`flex gap-${mobile ? '1' : '2'} ${mobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
            {timeframes.map(tf => (
              <Badge 
                key={tf} 
                variant={timeframe === tf ? "default" : "outline"} 
                className={`cursor-pointer backdrop-blur-sm transition-all duration-300 hover:scale-105 rounded-lg font-medium ${mobile ? 'px-3 py-1.5 text-xs flex-shrink-0' : ''} ${
                  timeframe === tf 
                    ? mobile 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30 border-primary/50"
                    : mobile
                      ? "text-muted-foreground hover:text-foreground hover:bg-primary/10" 
                      : "bg-muted/30 border-muted-foreground/20 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary"
                }`} 
                onClick={() => handleTimeframeChange(tf)}
              >
                {tf}
              </Badge>
            ))}
          </div>
          <div className={`flex gap-${mobile ? '1 ml-2' : '2'}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-lg hover:bg-primary/20 transition-all duration-200 ${
                !mobile ? 'backdrop-blur-sm' : ''
              } ${
                isFullscreen && !mobile
                  ? 'bg-gradient-to-br from-destructive/20 to-destructive/30 hover:from-destructive/30 hover:to-destructive/40 text-destructive shadow-lg shadow-destructive/20' 
                  : mobile 
                    ? 'hover:bg-primary/20'
                    : 'bg-muted/30 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 text-muted-foreground hover:text-primary'
              }`}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            >
              <Maximize2 className={`h-4 w-4 transition-all duration-300 ${isFullscreen && !mobile ? 'transform rotate-45' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                mobile 
                  ? 'hover:bg-primary/20'
                  : 'bg-muted/30 backdrop-blur-sm hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 text-muted-foreground hover:text-primary'
              }`}
              onClick={handleRefresh}
              title="Refresh Chart"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                mobile 
                  ? 'hover:bg-primary/20'
                  : 'bg-muted/30 backdrop-blur-sm hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 text-muted-foreground hover:text-primary'
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="flex-1 relative min-h-0">
        <div 
          ref={containerRef} 
          id={containerIdRef.current} 
          className="w-full h-full absolute inset-0"
          style={{
            background: mobile ? '#0f0f23' : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
            minHeight: '100%',
            zIndex: 1
          }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 mb-4 animate-spin">
                <BarChart3 className="h-full w-full text-primary" />
              </div>
              <p className="text-foreground font-medium">Laddar TradingView...</p>
            </div>
          </div>
        )}
        
        {/* Fullscreen indicator */}
        {isFullscreen && mobile && (
          <div className="absolute top-4 right-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
            Fullscreen aktivt
          </div>
        )}
      </div>
    </ChartContainer>
  );
});

UnifiedTradingChart.displayName = "UnifiedTradingChart";

export default UnifiedTradingChart;