import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
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
  
  const timeframes = [
    { label: "15m", value: "15" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" }
  ];

  const { tvSymbol, exchange } = useTradingViewSymbol(symbol, coinGeckoId);

  useEffect(() => {
    console.log('SimpleMobileChart: Component mounted for symbol:', symbol, 'tvSymbol:', tvSymbol);
    initSimpleChart();
    return () => {
      console.log('SimpleMobileChart: Component unmounting');
    };
  }, [symbol, tvSymbol, selectedTimeframe]);

  const initSimpleChart = async () => {
    console.log('SimpleMobileChart: Starting chart initialization');
    setIsLoading(true);
    setChartLoaded(false);

    if (!containerRef.current) {
      console.error('SimpleMobileChart: Container ref not available');
      return;
    }

    // Clear any existing content
    containerRef.current.innerHTML = '';
    
    try {
      // Method 1: Try TradingView iframe embed (most reliable for mobile)
      const iframeHtml = `
        <iframe 
          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=${selectedTimeframe}&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
          style="width: 100%; height: 300px; margin: 0 !important; padding: 0 !important; border: none;"
          frameborder="0"
          allowtransparency="true"
          scrolling="no">
        </iframe>
      `;

      containerRef.current.innerHTML = iframeHtml;
      console.log('SimpleMobileChart: TradingView iframe created');
      
      // Set loading to false after a delay
      setTimeout(() => {
        console.log('SimpleMobileChart: Chart should be loaded');
        setIsLoading(false);
        setChartLoaded(true);
      }, 2000);

    } catch (error) {
      console.error('SimpleMobileChart: Error creating iframe chart:', error);
      
      // Fallback: Create a simple placeholder chart
      createFallbackChart();
    }
  };

  const createFallbackChart = () => {
    console.log('SimpleMobileChart: Creating fallback chart');
    
    if (!containerRef.current) return;

    // Create a simple SVG chart as fallback
    const fallbackHTML = `
      <div style="width: 100%; height: 300px; background: linear-gradient(135deg, #1a1b23 0%, #2a2d3a 100%); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
        <div style="text-align: center; padding: 20px;">
          <svg width="60" height="40" viewBox="0 0 60 40" style="margin-bottom: 16px;">
            <path d="M5 30 L15 25 L25 20 L35 15 L45 10 L55 5" stroke="#00ff88" stroke-width="2" fill="none"/>
            <path d="M5 35 L15 30 L25 25 L35 20 L45 15 L55 10" stroke="#00ff88" stroke-width="1" fill="none" opacity="0.5"/>
          </svg>
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${symbol}/USDT</div>
          <div style="font-size: 24px; font-weight: bold; color: #00ff88;">${formatUsd(currentPrice)}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">Live Chart - ${selectedTimeframe}</div>
        </div>
      </div>
    `;

    containerRef.current.innerHTML = fallbackHTML;
    setChartLoaded(true);
  };

  const handleTimeframeChange = (timeframe: string) => {
    console.log('SimpleMobileChart: Changing timeframe to:', timeframe);
    setSelectedTimeframe(timeframe);
    // Reinitialize chart with new timeframe
    initSimpleChart();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Debug info */}
      <div className="px-4 py-2 text-xs text-muted-foreground">
        Debug: Loading=${isLoading.toString()}, Loaded=${chartLoaded.toString()}, Symbol=${symbol}, tv=${tvSymbol}
      </div>

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
        <Card className="h-full p-4 bg-[#1a1b23] border-border/30 relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-4 flex items-center justify-center bg-[#1a1b23] z-20 rounded">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Laddar {symbol} chart...</p>
                <p className="text-muted-foreground text-xs mt-1">Timeframe: {selectedTimeframe}</p>
              </div>
            </div>
          )}

          {/* Chart Container */}
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[300px]"
            style={{ 
              background: 'transparent',
              borderRadius: '8px'
            }}
          >
            {/* Initial placeholder */}
            {!chartLoaded && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                  <p className="text-muted-foreground">Ingen chart data tillgänglig</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={initSimpleChart}
                  >
                    Försök igen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-background/50">
            {symbol}/USDT
          </Badge>
          <Badge variant="outline" className="text-xs bg-background/50">
            {formatUsd(currentPrice)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={createFallbackChart}
          >
            Fallback Chart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleMobileChart;