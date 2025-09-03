import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Settings, MoreHorizontal, BarChart3 } from "lucide-react";
import { loadTradingView } from "@/lib/tradingviewLoader";
import { useTradingViewSymbol } from "@/hooks/useTradingViewSymbol";

interface TradingViewMobileChartProps {
  symbol: string;
  coinGeckoId?: string;
}

const TradingViewMobileChart = ({ symbol, coinGeckoId }: TradingViewMobileChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef<string>(`tv_mobile_${Math.random().toString(36).slice(2)}`);
  const widgetRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState("1D");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const { tvSymbol } = useTradingViewSymbol(symbol, coinGeckoId);

  useEffect(() => {
    console.log('📱 TradingViewMobileChart initializing for symbol:', symbol);
    setIsLoading(true);
    setUseFallback(false);
    
    const initializeMobileChart = async () => {
      try {
        await loadTradingView();
        console.log('✅ Mobile TradingView script loaded, initializing chart');
        await new Promise(resolve => setTimeout(resolve, 100));
        initChart();
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Mobile TradingView initialization failed:", error);
        setUseFallback(true);
        setIsLoading(false);
      }
    };

    initializeMobileChart();

    return () => {
      if (widgetRef.current) {
        try {
          console.log('🧹 Cleaning up mobile TradingView widget');
          if (typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
          }
        } catch (e) {
          console.warn('Mobile widget cleanup warning:', e);
        }
        widgetRef.current = null;
      }
    };
  }, [symbol, timeframe, tvSymbol]);

  const initChart = () => {
    if (!containerRef.current || !window.TradingView) {
      console.log('Container or TradingView not ready for mobile');
      return;
    }

    // Clear previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing previous mobile widget:', e);
      }
    }

    // Clear container
    containerRef.current.innerHTML = "";

    const tradingPair = tvSymbol || `BINANCE:${symbol.toUpperCase()}USDT`;
    console.log('Creating mobile TradingView widget for:', tradingPair);

    try {
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
        hide_top_toolbar: true,
        hide_legend: true,
        save_image: false,
        hide_volume: false,
        width: "100%",
        height: "100%",
        overrides: {
          "paneProperties.background": "#0f0f23",
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
          "scalesProperties.backgroundColor": "rgba(0, 0, 0, 0.1)"
        },
        disabled_features: [
          "use_localstorage_for_settings",
          "header_symbol_search",
          "header_compare",
          "header_undo_redo", 
          "header_screenshot",
          "header_chart_type",
          "header_saveload",
          "header_settings"
        ]
      });

      console.log('Mobile TradingView widget created successfully');
    } catch (error) {
      console.error('Error creating mobile TradingView widget:', error);
    }
  };

  const getInterval = (
    timeframe: string
  ): "1" | "5" | "15" | "60" | "240" | "D" | "W" => {
    const intervals: Record<string, any> = {
      "1m": "1",
      "5m": "5",
      "15m": "15",
      "1H": "60",
      "4H": "240",
      "1D": "D",
      "1W": "W",
    };
    return intervals[timeframe] || "D";
  };

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    if (widgetRef.current && widgetRef.current.chart) {
      try {
        widgetRef.current.chart().setResolution(getInterval(tf));
      } catch (e) {
        console.log('Could not change mobile resolution, reinitializing');
        initChart();
      }
    } else {
      initChart();
    }
  };

  const toggleFullscreen = async () => {
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
      console.error("Fullscreen error (mobile):", e);
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  return (
    <div className="h-full w-full flex flex-col chart-container bg-[#0f0f23] overflow-hidden">
      {/* MODERN TIMEFRAME & CONTROLS BAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-xl border-b border-border/20">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {["5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex-shrink-0 ${
                timeframe === tf 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/20 transition-all duration-200" 
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/20 transition-all duration-200"
            title="Inställningar"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="flex-1 relative min-h-0 bg-[#0f0f23] overflow-hidden">
        {useFallback ? (
          <div className="w-full h-full absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-background/95 flex items-center justify-center">
              <div className="text-center p-6">
                <BarChart3 className="mx-auto h-16 w-16 text-primary/50 mb-4" />
                <p className="text-foreground font-medium mb-2">Chart Unavailable</p>
                <p className="text-sm text-muted-foreground">Using alternative chart view</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={containerRef} 
              id={containerIdRef.current} 
              className="w-full h-full absolute inset-0"
              style={{
                background: '#0f0f23',
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
                  <p className="text-foreground font-medium">Loading Mobile Chart...</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Initializing TradingView widget
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
            Fullscreen aktivt
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewMobileChart;
