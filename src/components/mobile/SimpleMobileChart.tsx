import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { useTradingViewSymbol } from "@/hooks/useTradingViewSymbol";

interface SimpleMobileChartProps {
  symbol: string;
  currentPrice: number;
  coinGeckoId?: string;
}

const SimpleMobileChart = ({ symbol, currentPrice, coinGeckoId }: SimpleMobileChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoaded, setChartLoaded] = useState(false);
  const widgetRef = useRef<any>(null);
  
  const timeframes = [
    { label: "15m", value: "15" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" }
  ];

  const { tvSymbol } = useTradingViewSymbol(symbol, coinGeckoId);

  useEffect(() => {
    console.log('SimpleMobileChart: Component mounted for symbol:', symbol, 'tvSymbol:', tvSymbol);
    initTradingViewChart();
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.log('Error removing widget:', e);
        }
      }
    };
  }, [symbol, tvSymbol, selectedTimeframe]);

  const initTradingViewChart = async () => {
    console.log('SimpleMobileChart: Starting TradingView chart initialization');
    setIsLoading(true);
    setChartLoaded(false);

    if (!containerRef.current) {
      console.error('SimpleMobileChart: Container ref not available');
      return;
    }

    // Clear any existing content
    containerRef.current.innerHTML = '';
    
    // Remove previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing previous widget:', e);
      }
    }

    try {
      // Load TradingView script if not already loaded
      if (!(window as any).TradingView) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          createTradingViewWidget();
        };
        script.onerror = () => {
          console.error('Failed to load TradingView script');
          createFallbackChart();
        };
        document.head.appendChild(script);
      } else {
        createTradingViewWidget();
      }
    } catch (error) {
      console.error('Error initializing TradingView chart:', error);
      createFallbackChart();
    }
  };

  const createTradingViewWidget = () => {
    if (!containerRef.current) return;

    try {
      widgetRef.current = new (window as any).TradingView.widget({
        autosize: true,
        symbol: tvSymbol || `BINANCE:${symbol}USDT`,
        interval: getInterval(selectedTimeframe),
        container: containerRef.current,
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "rgba(0, 0, 0, 0)",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        hide_volume: false,
        allow_symbol_change: true,
        studies: [],
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
          "header_chart_type"
        ],
        enabled_features: [
          "header_widget"
        ]
      });
      
      setIsLoading(false);
      setChartLoaded(true);
      
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
      createFallbackChart();
    }
  };

  const createFallbackChart = () => {
    console.log('SimpleMobileChart: Creating fallback chart');
    
    if (!containerRef.current) return;

    // Create a fallback chart
    const fallbackHTML = `
      <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0f0f23 0%, #1a1b2e 100%); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; min-height: 300px;">
        <div style="text-align: center; padding: 20px;">
          <svg width="60" height="40" viewBox="0 0 60 40" style="margin-bottom: 16px;">
            <path d="M5 30 L15 25 L25 20 L35 15 L45 10 L55 5" stroke="#10b981" stroke-width="2" fill="none"/>
            <path d="M5 35 L15 30 L25 25 L35 20 L45 15 L55 10" stroke="#10b981" stroke-width="1" fill="none" opacity="0.5"/>
          </svg>
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${symbol}/USDT</div>
          <div style="font-size: 24px; font-weight: bold; color: #10b981;">${formatUsd(currentPrice)}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">Chart unavailable - ${selectedTimeframe}</div>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Refresh
          </button>
        </div>
      </div>
    `;

    containerRef.current.innerHTML = fallbackHTML;
    setIsLoading(false);
    setChartLoaded(true);
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
    console.log('SimpleMobileChart: Changing timeframe to:', timeframe);
    setSelectedTimeframe(timeframe);
    
    // Try to change resolution on existing widget first
    if (widgetRef.current && widgetRef.current.chart) {
      try {
        widgetRef.current.chart().setResolution(getInterval(timeframe));
        return;
      } catch (e) {
        console.log('Could not change resolution, reinitializing chart');
      }
    }
    
    // Fallback: reinitialize chart
    initTradingViewChart();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Modern Timeframe Selector */}
      <div className="px-3 py-3 bg-card/50 border-b border-border/20">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={initTradingViewChart}
            className="h-8 px-2 flex-shrink-0 ml-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div className="flex-1 p-3">
        <Card className="h-full bg-[#0f0f23] border-border/30 relative overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f23] z-20 rounded">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Laddar TradingView chart...</p>
                <p className="text-muted-foreground text-xs mt-1">{symbol}/USDT</p>
              </div>
            </div>
          )}

          {/* TradingView Chart Container */}
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[320px]"
            style={{ 
              background: '#0f0f23',
              borderRadius: '8px'
            }}
          >
            {/* Initial placeholder */}
            {!chartLoaded && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                  <p className="text-muted-foreground mb-3">TradingView chart kunde inte laddas</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={initTradingViewChart}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Försök igen
                  </Button>
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
          <div className={`w-2 h-2 rounded-full ${chartLoaded ? 'bg-success' : 'bg-destructive'}`}></div>
          <span className="text-xs text-muted-foreground">
            {chartLoaded ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleMobileChart;