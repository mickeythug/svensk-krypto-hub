import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TradingViewChart from "@/components/TradingViewChart";

interface MobileChartProps {
  symbol: string;
  currentPrice: number;
}

const MobileChart = ({ symbol, currentPrice }: MobileChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  
  const timeframes = [
    { label: "15m", value: "15" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 px-4 mb-3 overflow-x-auto">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe.value}
            variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe.value)}
            className="h-8 px-3 text-xs flex-shrink-0"
          >
            {timeframe.label}
          </Button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 px-4">
        <Card className="h-full p-2">
          <div className="h-full min-h-[300px] relative">
            <TradingViewChart 
              symbol={`${symbol}USDT`}
              currentPrice={currentPrice}
            />
          </div>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Volym: ON
          </Badge>
          <Badge variant="outline" className="text-xs">
            MA: 20
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Indikatorer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileChart;