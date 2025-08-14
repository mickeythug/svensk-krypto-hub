import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { formatUsd } from "@/lib/utils";

interface MobileChartProps {
  symbol: string;
  currentPrice: number;
}


const MobileChart = ({ symbol, currentPrice }: MobileChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const timeframes = [
    { label: "15m", value: "15" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" }
  ];

  useEffect(() => {
    initMobileChart();
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.log('Error removing widget:', e);
        }
      }
    };
  }, [symbol]);

  const initMobileChart = () => {
    setIsLoading(true);
    
    if (!(window as any).TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        createMobileWidget();
      };
      script.onerror = () => {
        console.error('Failed to load TradingView script');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      createMobileWidget();
    }
  };

  const createMobileWidget = () => {
    if (!containerRef.current) return;

    // Clear previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing previous widget:', e);
      }
    }

    // Clear container
    containerRef.current.innerHTML = '';

    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}USDT`,
        interval: getInterval(selectedTimeframe),
        container: containerRef.current,
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "rgba(0, 0, 0, 0)",
        enable_publishing: false,
        hide_top_toolbar: true,
        hide_legend: true,
        save_image: false,
        hide_volume: true,
        allow_symbol_change: false,
        studies: [],
        overrides: {
          "paneProperties.background": "#1a1b23",
          "paneProperties.backgroundType": "solid",
          "mainSeriesProperties.candleStyle.upColor": "#00ff88",
          "mainSeriesProperties.candleStyle.downColor": "#ff4444",
          "mainSeriesProperties.candleStyle.borderUpColor": "#00ff88",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ff4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#00ff88",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff4444",
          "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
          "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
          "scalesProperties.textColor": "#8a92b2",
          "scalesProperties.backgroundColor": "rgba(0, 0, 0, 0.1)"
        },
        disabled_features: [
          "use_localstorage_for_settings",
          "volume_force_overlay",
          "create_volume_indicator_by_default_once",
          "header_widget",
          "header_symbol_search",
          "header_compare",
          "header_undo_redo",
          "header_screenshot",
          "header_chart_type",
          "header_settings",
          "header_indicators",
          "header_fullscreen_button",
          "left_toolbar",
          "control_bar",
          "timeframes_toolbar"
        ],
        enabled_features: []
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error creating mobile TradingView widget:', error);
      setIsLoading(false);
    }
  };

  const getInterval = (timeframe: string) => {
    const intervals: Record<string, string> = {
      "15": "15",
      "60": "60",
      "240": "240",
      "1D": "D",
      "1W": "W",
      "1M": "M"
    };
    return intervals[timeframe] || "D";
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    if (widgetRef.current && widgetRef.current.chart) {
      widgetRef.current.chart().setResolution(getInterval(timeframe));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 px-4 mb-3 overflow-x-auto">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe.value}
            variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTimeframeChange(timeframe.value)}
            className="h-8 px-3 text-xs flex-shrink-0"
          >
            {timeframe.label}
          </Button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 px-4">
        <Card className="h-full p-0 bg-[#1a1b23] border-border/30">
          <div className="h-full min-h-[300px] relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1b23] z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground text-sm">Loading chart...</p>
                </div>
              </div>
            )}
            <div 
              ref={containerRef} 
              className="w-full h-full"
              style={{ minHeight: '300px' }}
            />
          </div>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-background/50">
            {symbol}/USDT
          </Badge>
          <Badge variant="outline" className="text-xs bg-background/50">
            ${currentPrice.toLocaleString()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Fullskärm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileChart;