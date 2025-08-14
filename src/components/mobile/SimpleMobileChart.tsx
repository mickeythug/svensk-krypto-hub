import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw, Maximize2, Settings, MoreHorizontal } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { loadTradingView } from "@/lib/tradingviewLoader";
import { useTradingViewSymbol } from "@/hooks/useTradingViewSymbol";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface SimpleMobileChartProps {
  symbol: string;
  currentPrice: number;
  coinGeckoId?: string;
}

const SimpleMobileChart = ({ symbol, currentPrice, coinGeckoId }: SimpleMobileChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const containerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef<string>(`tv_mobile_${Math.random().toString(36).slice(2)}`);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fallback, setFallback] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const timeframes = [
    { label: "15m", value: "15m" },
    { label: "1H", value: "1H" },
    { label: "4H", value: "4H" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" }
  ];

  const { tvSymbol } = useTradingViewSymbol(symbol, coinGeckoId);

  useEffect(() => {
    console.log('SimpleMobileChart loading for symbol:', symbol);
    loadTradingView().then(() => {
      console.log('TradingView script ready for mobile');
      initChart();
    }).catch(error => {
      console.error('Failed to load TradingView script:', error);
      setFallback(true);
      setIsLoading(false);
    });

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.log('Error removing mobile widget:', e);
        }
      }
    };
  }, [symbol, selectedTimeframe]);

  const initChart = () => {
    if (!containerRef.current) {
      console.log('Mobile container not ready');
      return;
    }

    if (!window.TradingView) {
      console.log('TradingView not loaded yet for mobile');
      return;
    }

    console.log('Initializing mobile TradingView chart...');
    setIsLoading(true);

    // Clear previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing previous mobile widget:', e);
      }
      widgetRef.current = null;
    }

    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const tradingPair = tvSymbol || `BINANCE:${symbol.toUpperCase()}USDT`;
    console.log('Creating mobile TradingView widget for:', tradingPair);

    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: tradingPair,
        interval: getInterval(selectedTimeframe),
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
      setIsLoading(false);

      // Safety fallback check
      setTimeout(() => {
        const hasIframe = !!containerRef.current?.querySelector('iframe');
        if (!hasIframe) {
          console.warn('Mobile TradingView widget did not render, enabling fallback');
          setFallback(true);
        } else {
          setFallback(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Error creating mobile TradingView widget:', error);
      setFallback(true);
      setIsLoading(false);
    }
  };

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
    setSelectedTimeframe(newTimeframe);
    if (widgetRef.current && widgetRef.current.chart) {
      try {
        widgetRef.current.chart().setResolution(getInterval(newTimeframe));
      } catch (e) {
        console.log('Could not change resolution, reinitializing mobile chart');
        initChart();
      }
    } else {
      initChart();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const chartCard = containerRef.current?.closest('.mobile-chart-fullscreen') || containerRef.current?.parentElement?.parentElement;
        if (chartCard) {
          await chartCard.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Mobile fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background mobile-chart-fullscreen">
      {/* Modern Timeframe Selector */}
      <div className="px-3 py-3 bg-card/50 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange(timeframe.value)}
              className="h-8 px-3 text-xs flex-shrink-0 min-w-[3rem] rounded-xl transition-all"
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 px-2 flex-shrink-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={initChart}
            className="h-8 px-2 flex-shrink-0"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 p-3">
        <Card className="h-full bg-[#0f0f23] border-border/30 relative overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f23] z-20 rounded">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Loading TradingView chart...</p>
                <p className="text-muted-foreground text-xs mt-1">{symbol}/USDT</p>
              </div>
            </div>
          )}

          {/* TradingView Container */}
          <div className="w-full h-full min-h-[300px] relative">
            {fallback ? (
              <div className="w-full h-full">
                <AdvancedRealTimeChart 
                  key={`${tvSymbol}-${selectedTimeframe}-mobile`}
                  theme="dark" 
                  autosize 
                  symbol={tvSymbol || `BINANCE:${symbol}USDT`}
                  interval={getInterval(selectedTimeframe)} 
                  timezone="Etc/UTC" 
                  style="1" 
                  locale="en" 
                  enable_publishing={false}
                  hide_top_toolbar={true}
                  hide_legend={true}
                />
              </div>
            ) : (
              <div 
                ref={containerRef} 
                id={containerIdRef.current} 
                className="w-full h-full"
                style={{ 
                  background: '#0f0f23',
                  borderRadius: '8px'
                }}
              >
                {/* Fallback content while chart loads */}
                <div className="fallback-content absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Loading TradingView chart...</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {typeof window !== 'undefined' && (window as any).TradingView ? 'TradingView loaded, initializing...' : 'Loading TradingView script...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chart Info Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-card/30 border-t border-border/20">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-background/50 px-2 py-1">
            {symbol}/USDT
          </Badge>
          <Badge variant="outline" className="text-xs bg-background/50 px-2 py-1">
            {formatUsd(currentPrice)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${!fallback && !isLoading ? 'bg-success' : fallback ? 'bg-warning' : 'bg-destructive'}`}></div>
          <span className="text-xs text-muted-foreground">
            {!fallback && !isLoading ? 'TradingView' : fallback ? 'Fallback' : 'Loading'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleMobileChart;