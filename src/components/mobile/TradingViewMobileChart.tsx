import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Settings, MoreHorizontal } from "lucide-react";
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
  const { tvSymbol } = useTradingViewSymbol(symbol, coinGeckoId);

  useEffect(() => {
    console.log('TradingViewMobileChart mounting for symbol:', symbol);
    loadTradingView()
      .then(() => {
        console.log('TradingView script loaded, initializing mobile chart');
        initChart();
      })
      .catch((err) => console.error("Failed to load TradingView script (mobile):", err));

    return () => {
      if (widgetRef.current) {
        try {
          console.log('Cleaning up mobile TradingView widget');
          widgetRef.current.remove();
        } catch (e) {
          console.log('Error cleaning up mobile widget:', e);
        }
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
        const el = containerRef.current?.closest(".chart-fullscreen-container");
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
    <div className="h-full w-full flex flex-col chart-fullscreen-container bg-[#0f0f23] rounded-2xl overflow-hidden">
      {/* PRODUCTION CONTROLS - SOLID AND NEVER OVERLAPPING */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background/90 backdrop-blur-sm">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
            <Badge
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              className={`cursor-pointer text-xs font-bold px-3 py-1.5 transition-all duration-200 flex-shrink-0 ${
                timeframe === tf ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/20 border-border/50"
              }`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1.5 ml-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-200">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PRODUCTION CHART CONTAINER - PERFECT Z-INDEX AND SPACING */}
      <div className="flex-1 relative min-h-0 bg-[#0f0f23] rounded-b-2xl overflow-hidden">
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
      </div>
    </div>
  );
};

export default TradingViewMobileChart;
