import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MoreHorizontal, Maximize2, BarChart3 } from "lucide-react";

interface TradingViewChartProps {
  symbol: string;
  currentPrice: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart = ({ symbol, currentPrice }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");

  useEffect(() => {
    console.log('TradingViewChart loading for symbol:', symbol);
    
    // Load TradingView script
    if (!window.TradingView) {
      console.log('Loading TradingView script...');
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        console.log('TradingView script loaded successfully');
        initChart();
      };
      script.onerror = (error) => {
        console.error('Failed to load TradingView script:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('TradingView already loaded, initializing chart...');
      initChart();
    }

    return () => {
      if (widgetRef.current) {
        console.log('Cleaning up TradingView widget');
        widgetRef.current.remove();
      }
    };
  }, [symbol]);

  const initChart = () => {
    if (!containerRef.current) {
      console.log('Container not ready');
      return;
    }

    if (!window.TradingView) {
      console.log('TradingView not loaded yet');
      return;
    }

    console.log('Initializing TradingView chart...');

    // Clear previous widget
    if (widgetRef.current) {
      console.log('Removing previous widget');
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing widget:', e);
      }
      widgetRef.current = null;
    }

    const tradingPair = `BINANCE:${symbol}USDT`;
    console.log('Creating TradingView widget for:', tradingPair);

    // Clear the container first
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {

      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: tradingPair,
        interval: getInterval(timeframe),
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
        studies: [
          "Volume@tv-basicstudies"
        ],
        overrides: {
          "paneProperties.background": "rgba(0, 0, 0, 0)",
          "paneProperties.backgroundType": "solid",
          "paneProperties.backgroundGradientStartColor": "rgba(0, 0, 0, 0.1)",
          "paneProperties.backgroundGradientEndColor": "rgba(0, 0, 0, 0.1)",
          "mainSeriesProperties.candleStyle.upColor": "hsl(var(--success))",
          "mainSeriesProperties.candleStyle.downColor": "hsl(var(--destructive))",
          "mainSeriesProperties.candleStyle.borderUpColor": "hsl(var(--success))",
          "mainSeriesProperties.candleStyle.borderDownColor": "hsl(var(--destructive))",
          "mainSeriesProperties.candleStyle.wickUpColor": "hsl(var(--success))",
          "mainSeriesProperties.candleStyle.wickDownColor": "hsl(var(--destructive))",
          "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
          "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
          "scalesProperties.textColor": "hsl(var(--muted-foreground))",
          "scalesProperties.backgroundColor": "rgba(0, 0, 0, 0.1)"
        },
        disabled_features: [
          "use_localstorage_for_settings",
          "volume_force_overlay",
          "create_volume_indicator_by_default_once"
        ],
        enabled_features: [
          "study_templates"
        ]
      });
      
      console.log('TradingView widget created successfully');
      
      // Remove fallback content after widget creation
      const fallbackElements = containerRef.current?.querySelectorAll('.fallback-content');
      fallbackElements?.forEach(el => el.remove());
      
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }
  };

  const getInterval = (timeframe: string) => {
    const intervals: Record<string, string> = {
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
      widgetRef.current.chart().setResolution(getInterval(newTimeframe));
    }
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card className="h-full bg-background/80 backdrop-blur-sm border-border/20 relative overflow-hidden">
      {/* Chart Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
          <Badge
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            className={`cursor-pointer bg-background/80 backdrop-blur-sm transition-all hover:scale-105 ${
              timeframe === tf ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
            }`}
            onClick={() => handleTimeframeChange(tf)}
          >
            {tf}
          </Badge>
        ))}
      </div>
      
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary/20"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Price Display */}
      <div className="absolute top-16 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg p-2">
        <div className="text-lg font-bold font-mono text-foreground">
          ${currentPrice.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          {symbol}/USDT
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[500px] bg-transparent"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
          position: 'relative'
        }}
      >
        {/* Fallback content while chart loads */}
        <div className="fallback-content absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-primary/30 mb-4" />
            <p className="text-muted-foreground">Laddar TradingView chart...</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {window.TradingView ? 'TradingView laddat, initialiserar...' : 'Laddar TradingView script...'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TradingViewChart;