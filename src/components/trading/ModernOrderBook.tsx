import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface ProcessedOrder {
  price: number;
  amount: number;
  total: number;
  side: 'buy' | 'sell';
}

interface OrderBookEntry {
  price: string;
  amount: string;
  side?: string;
  size?: string;
}

interface ModernOrderBookProps {
  symbol: string;
  currentPrice?: number;
  orderBook?: any; // Flexible to accept existing OrderBook types
  isConnected?: boolean;
}

const ModernOrderBook: React.FC<ModernOrderBookProps> = ({
  symbol,
  currentPrice = 0,
  orderBook,
  isConnected = false
}) => {
  // Process order book data
  const processOrders = (orders: any[], side: 'buy' | 'sell'): ProcessedOrder[] => {
    if (!orders) return [];
    
    let runningTotal = 0;
    const processedOrders = orders.slice(0, 15).map((order) => {
      let price: string;
      let amount: string;
      
      if (Array.isArray(order)) {
        [price, amount] = order;
      } else {
        price = order.price;
        amount = order.amount || order.size || '0';
      }
      
      const priceNum = parseFloat(price);
      const amountNum = parseFloat(amount);
      runningTotal += amountNum;
      
      return {
        price: priceNum,
        amount: amountNum,
        total: runningTotal,
        side
      };
    });
    
    return processedOrders;
  };

  const asks = processOrders(orderBook?.asks || [], 'sell');
  const bids = processOrders(orderBook?.bids || [], 'buy');
  
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatAmount = (amount: number) => {
    if (amount > 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount > 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toFixed(3);
  };

  const OrderRow: React.FC<{ order: ProcessedOrder; maxTotal: number }> = ({ order, maxTotal }) => {
    const fillPercentage = (order.total / maxTotal) * 100;
    
    return (
      <div className="relative group h-5 flex items-center text-xs font-mono cursor-pointer hover:bg-white/[0.02] transition-colors duration-200">
        {/* Background fill indicator */}
        <div 
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-300 rounded-sm",
            order.side === 'buy' 
              ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5" 
              : "bg-gradient-to-r from-red-500/10 to-red-500/5"
          )}
          style={{ width: `${fillPercentage}%` }}
        />
        
        {/* Order data */}
        <div className="relative z-10 w-full flex justify-between px-2">
          <span className={cn(
            "font-semibold",
            order.side === 'buy' ? "text-emerald-400" : "text-red-400"
          )}>
            ${formatPrice(order.price)}
          </span>
          <span className="text-white/60">
            {formatAmount(order.amount)}
          </span>
          <span className="text-white/40">
            {formatAmount(order.total)}
          </span>
        </div>
      </div>
    );
  };

  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total)
  );

  return (
    <GlassCard className="h-full flex flex-col" glow>
      {/* Header */}
      <div className="p-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Order Book</h3>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            )} />
            <span className="text-xs text-white/60">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Column headers */}
        <div className="flex justify-between text-xs text-white/40 font-medium px-2">
          <span>Price (USD)</span>
          <span>Amount</span>
          <span>Total</span>
        </div>
      </div>

      {/* Order book content */}
      <div className="flex-1 min-h-0">
        {/* Sell orders (asks) - top */}
        <div className="space-y-0.5 p-2">
          {asks.reverse().map((ask, index) => (
            <OrderRow key={`ask-${index}`} order={ask} maxTotal={maxTotal} />
          ))}
        </div>

        {/* Current price separator */}
        <div className="px-4 py-2 border-y border-white/[0.05] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="text-center">
            <div className="text-lg font-bold text-white font-mono">
              ${formatPrice(currentPrice)}
            </div>
            <div className="text-xs text-purple-400 font-medium">
              Current Price
            </div>
          </div>
        </div>

        {/* Buy orders (bids) - bottom */}
        <div className="space-y-0.5 p-2">
          {bids.map((bid, index) => (
            <OrderRow key={`bid-${index}`} order={bid} maxTotal={maxTotal} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default ModernOrderBook;