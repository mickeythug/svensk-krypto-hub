import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, MoreHorizontal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface ProfessionalOrderBookProps {
  symbol: string;
  currentPrice: number;
  tickerData: any;
}

const ProfessionalOrderBook: React.FC<ProfessionalOrderBookProps> = ({
  symbol,
  currentPrice,
  tickerData
}) => {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>({ bids: [], asks: [] });

  // Generate realistic order book data
  useEffect(() => {
    const generateOrders = () => {
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];
      
      let bidPrice = currentPrice * 0.999;
      let askPrice = currentPrice * 1.001;
      let bidTotal = 0;
      let askTotal = 0;

      // Generate bid orders (buyers)
      for (let i = 0; i < 15; i++) {
        const size = Math.random() * 50 + 5;
        bidTotal += size;
        bids.push({
          price: bidPrice,
          size,
          total: bidTotal
        });
        bidPrice *= 0.9995;
      }

      // Generate ask orders (sellers)
      for (let i = 0; i < 15; i++) {
        const size = Math.random() * 50 + 5;
        askTotal += size;
        asks.push({
          price: askPrice,
          size,
          total: askTotal
        });
        askPrice *= 1.0005;
      }

      setOrderBook({ bids, asks });
    };

    generateOrders();
    const interval = setInterval(generateOrders, 3000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatSize = (size: number) => {
    return size.toFixed(2);
  };

  const maxTotal = Math.max(
    ...orderBook.bids.map(b => b.total),
    ...orderBook.asks.map(a => a.total)
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Order Book Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">Order Book</h4>
          <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300">
            {orderBook.bids.length + orderBook.asks.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium pb-2 border-b border-gray-800/50">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 min-h-0 space-y-1">
        {/* Asks (Sellers) - Red */}
        <div className="space-y-0.5">
          {orderBook.asks.slice().reverse().map((ask, index) => {
            const fillPercent = (ask.total / maxTotal) * 100;
            return (
              <motion.div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded hover:bg-red-500/10 cursor-pointer group"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                {/* Background fill */}
                <div 
                  className="absolute inset-0 bg-red-500/5 rounded"
                  style={{ width: `${fillPercent}%` }}
                />
                <span className="text-red-400 font-mono relative z-10">
                  {formatPrice(ask.price)}
                </span>
                <span className="text-right text-gray-300 font-mono relative z-10">
                  {formatSize(ask.size)}
                </span>
                <span className="text-right text-gray-400 font-mono relative z-10">
                  {formatSize(ask.total)}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Spread Indicator */}
        <div className="py-3 border-y border-gray-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Spread</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-mono">
                {formatPrice(tickerData.ask - tickerData.bid)}
              </span>
              <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300">
                {(((tickerData.ask - tickerData.bid) / currentPrice) * 100).toFixed(3)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Bids (Buyers) - Green */}
        <div className="space-y-0.5">
          {orderBook.bids.map((bid, index) => {
            const fillPercent = (bid.total / maxTotal) * 100;
            return (
              <motion.div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded hover:bg-green-500/10 cursor-pointer group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                {/* Background fill */}
                <div 
                  className="absolute inset-0 bg-green-500/5 rounded"
                  style={{ width: `${fillPercent}%` }}
                />
                <span className="text-green-400 font-mono relative z-10">
                  {formatPrice(bid.price)}
                </span>
                <span className="text-right text-gray-300 font-mono relative z-10">
                  {formatSize(bid.size)}
                </span>
                <span className="text-right text-gray-400 font-mono relative z-10">
                  {formatSize(bid.total)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Book Footer */}
      <div className="pt-3 border-t border-gray-800/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-500/10 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-green-400 font-medium">Buy Pressure</span>
            </div>
            <span className="text-gray-300 font-mono">
              {orderBook.bids.reduce((sum, b) => sum + b.size, 0).toFixed(1)}
            </span>
          </div>
          <div className="bg-red-500/10 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="h-3 w-3 text-red-400" />
              <span className="text-red-400 font-medium">Sell Pressure</span>
            </div>
            <span className="text-gray-300 font-mono">
              {orderBook.asks.reduce((sum, a) => sum + a.size, 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalOrderBook;