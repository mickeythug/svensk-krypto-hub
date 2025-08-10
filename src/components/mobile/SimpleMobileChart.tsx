import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { formatUsd } from "@/lib/utils";

interface SimpleMobileChartProps {
  symbol: string;
  currentPrice: number;
  coinGeckoId?: string;
}

const SimpleMobileChart = ({ symbol, currentPrice, coinGeckoId }: SimpleMobileChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(false);
  const [mockData, setMockData] = useState<Array<{price: number, time: string}>>([]);
  
  const timeframes = [
    { label: "15m", value: "15" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" }
  ];

  // Generate mock chart data for better mobile experience
  useEffect(() => {
    generateMockData();
  }, [selectedTimeframe, currentPrice]);

  const generateMockData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const dataPoints = 50;
      const data = [];
      let price = currentPrice;
      
      for (let i = 0; i < dataPoints; i++) {
        const change = (Math.random() - 0.5) * (currentPrice * 0.02); // 2% max change
        price = Math.max(price + change, currentPrice * 0.5); // Don't go below 50% of current
        data.push({
          price,
          time: new Date(Date.now() - (dataPoints - i) * 3600000).toISOString()
        });
      }
      
      setMockData(data);
      setIsLoading(false);
    }, 800);
  };

  const generateSVGPath = () => {
    if (mockData.length === 0) return {
      path: "",
      color: "#10b981",
      isPositive: true
    };
    
    const width = 300;
    const height = 150;
    const padding = 20;
    
    const minPrice = Math.min(...mockData.map(d => d.price));
    const maxPrice = Math.max(...mockData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1;
    
    const points = mockData.map((d, i) => {
      const x = padding + (i / (mockData.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxPrice - d.price) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    const lastPrice = mockData[mockData.length - 1]?.price || currentPrice;
    const firstPrice = mockData[0]?.price || currentPrice;
    const isPositive = lastPrice >= firstPrice;
    
    return {
      path: `M ${points}`,
      color: isPositive ? '#10b981' : '#ef4444',
      isPositive
    };
  };

  const chartInfo = generateSVGPath();
  const priceChange = mockData.length > 1 ? 
    ((mockData[mockData.length - 1].price - mockData[0].price) / mockData[0].price * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Compact Timeframe Selector */}
      <div className="px-3 py-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedTimeframe(timeframe.value);
                generateMockData();
              }}
              className="h-8 px-3 text-xs flex-shrink-0 min-w-[3rem] rounded-xl"
            >
              {timeframe.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={generateMockData}
            className="h-8 px-2 flex-shrink-0 ml-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Modern Chart Container */}
      <div className="flex-1 px-3 pb-3">
        <Card className="h-full bg-gradient-to-br from-card to-card/80 border-border/50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Laddar chart...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{symbol}/USDT</h3>
                  <p className="text-xs text-muted-foreground">{selectedTimeframe} Timeframe</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-foreground">
                    {formatUsd(currentPrice)}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${chartInfo.isPositive ? 'text-success' : 'text-destructive'}`}>
                    {chartInfo.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {chartInfo.isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* SVG Chart */}
              <div className="flex-1 relative bg-background/30 rounded-xl p-4">
                <svg 
                  viewBox="0 0 300 150" 
                  className="w-full h-full"
                  style={{ minHeight: '120px' }}
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Price line */}
                  {mockData.length > 1 && (
                    <>
                      <path
                        d={chartInfo.path}
                        stroke={chartInfo.color}
                        strokeWidth="2"
                        fill="none"
                        className="drop-shadow-sm"
                      />
                      {/* Gradient fill under line */}
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={chartInfo.color} stopOpacity="0.3"/>
                          <stop offset="100%" stopColor={chartInfo.color} stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d={`${chartInfo.path} L 280,130 L 20,130 Z`}
                        fill="url(#chartGradient)"
                      />
                    </>
                  )}
                </svg>

                {/* Current price indicator */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${chartInfo.isPositive ? 'border-success/50 bg-success/10' : 'border-destructive/50 bg-destructive/10'}`}
                  >
                    Live
                  </Badge>
                </div>
              </div>

              {/* Chart Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">High</div>
                  <div className="text-sm font-mono font-semibold text-success">
                    {formatUsd(Math.max(...mockData.map(d => d.price)))}
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Low</div>
                  <div className="text-sm font-mono font-semibold text-destructive">
                    {formatUsd(Math.min(...mockData.map(d => d.price)))}
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Change</div>
                  <div className={`text-sm font-mono font-semibold ${chartInfo.isPositive ? 'text-success' : 'text-destructive'}`}>
                    {chartInfo.isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SimpleMobileChart;