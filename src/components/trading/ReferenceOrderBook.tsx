import React from 'react';
import { Card } from "@/components/ui/card";

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface ReferenceOrderBookProps {
  symbol: string;
  currentPrice: number;
  orderBook?: {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  } | null;
  isConnected: boolean;
}

const ReferenceOrderBook: React.FC<ReferenceOrderBookProps> = ({
  symbol,
  currentPrice,
  orderBook,
  isConnected
}) => {
  // Generate mock data that matches the reference
  const mockAsks = Array.from({ length: 8 }, (_, i) => ({
    price: currentPrice + (i + 1) * 0.01,
    size: Math.random() * 100 + 50,
    total: Math.random() * 1000 + 500
  })).reverse();

  const mockBids = Array.from({ length: 8 }, (_, i) => ({
    price: currentPrice - (i + 1) * 0.01,
    size: Math.random() * 100 + 50,
    total: Math.random() * 1000 + 500
  }));

  // Convert orderbook data to match our interface
  const convertedAsks = orderBook?.asks?.slice(0, 8).map(ask => ({
    price: ask.price,
    size: ask.size || 0,
    total: ask.total || ask.price * (ask.size || 0)
  })) || mockAsks;

  const convertedBids = orderBook?.bids?.slice(0, 8).map(bid => ({
    price: bid.price,
    size: bid.size || 0,
    total: bid.total || bid.price * (bid.size || 0)
  })) || mockBids;

  const asks = convertedAsks;
  const bids = convertedBids;

  const formatPrice = (price: number) => price.toFixed(3);
  const formatAmount = (size: number) => (size / 1000).toFixed(3);
  const formatTotal = (total: number) => (total / 1000).toFixed(0);

  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total)
  );

  return (
    <Card className="bg-[#0A0B0F] border-gray-800 p-0 h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Order book</h3>
          <span className="text-xs text-gray-400">{symbol}</span>
        </div>
        
        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium">
          <div>Price</div>
          <div className="text-right">Amount (USD)</div>
          <div className="text-right">Total (USD)</div>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex flex-col h-[calc(100%-80px)]">
        {/* Sell Orders (Asks) */}
        <div className="flex-1 flex flex-col-reverse overflow-hidden">
          {asks.map((ask, index) => {
            const fillPercentage = (ask.total / maxTotal) * 100;
            
            return (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs font-mono hover:bg-red-500/5 cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(255, 59, 92, 0.1) ${fillPercentage}%)`
                }}
              >
                <div className="text-red-400">{formatPrice(ask.price)}</div>
                <div className="text-right text-white">{formatAmount(ask.size)}</div>
                <div className="text-right text-white">{formatTotal(ask.total)}</div>
              </div>
            );
          })}
        </div>

        {/* Spread Indicator */}
        <div className="px-3 py-2 border-y border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Spread</span>
            <span className="text-gray-300">0.001%</span>
          </div>
          <div className="text-center text-xs text-gray-300 mt-1">
            {formatPrice(asks[asks.length - 1]?.price || currentPrice)} | {formatPrice(bids[0]?.price || currentPrice)}
          </div>
        </div>

        {/* Buy Orders (Bids) */}
        <div className="flex-1 overflow-hidden">
          {bids.map((bid, index) => {
            const fillPercentage = (bid.total / maxTotal) * 100;
            
            return (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs font-mono hover:bg-green-500/5 cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(0, 211, 149, 0.1) ${fillPercentage}%)`
                }}
              >
                <div className="text-green-400">{formatPrice(bid.price)}</div>
                <div className="text-right text-white">{formatAmount(bid.size)}</div>
                <div className="text-right text-white">{formatTotal(bid.total)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ReferenceOrderBook;