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
    loadTradingView()
      .then(initChart)
      .catch((err) => console.error("Failed to load TradingView script (mobile):", err));

    return () => {
      try { widgetRef.current?.remove?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe, tvSymbol]);

  const initChart = () => {
    if (!containerRef.current || !window.TradingView) return;

    // clear previous
    try { widgetRef.current?.remove?.(); } catch {}
    containerRef.current.innerHTML = "";

    const tradingPair = tvSymbol || `BINANCE:${symbol.toUpperCase()}USDT`;

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
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      width: "100%",
      height: "100%",
      studies: ["Volume@tv-basicstudies"],
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
        "scalesProperties.backgroundColor": "rgba(0, 0, 0, 0.1)",
      },
      disabled_features: [
        "use_localstorage_for_settings",
        "volume_force_overlay",
        "create_volume_indicator_by_default_once",
      ],
      enabled_features: ["study_templates"],
    });
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

  const handleTimeframeChange = (tf: string) => setTimeframe(tf);

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
    <Card className={`h-[60vh] bg-card border-border/20 relative overflow-hidden flex flex-col chart-fullscreen-container`}>
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-1">
          {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
            <Badge
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              className={`cursor-pointer text-xs ${timeframe === tf ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} id={containerIdRef.current} className="w-full h-full absolute inset-0 bg-transparent" />
      </div>
    </Card>
  );
};

export default TradingViewMobileChart;
