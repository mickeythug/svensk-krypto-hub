import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Wallet,
  Target,
  BarChart3,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfessionalBottomPanelsProps {
  symbol: string;
}

const ProfessionalBottomPanels: React.FC<ProfessionalBottomPanelsProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState('positions');

  // Mock data
  const positions = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'long',
      size: 0.25,
      entryPrice: 43250.00,
      markPrice: 43820.00,
      pnl: 142.50,
      pnlPercent: 1.32,
      margin: 1000.00,
      leverage: '10x'
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'short',
      size: 2.5,
      entryPrice: 2650.00,
      markPrice: 2620.00,
      pnl: 75.00,
      pnlPercent: 2.84,
      margin: 500.00,
      leverage: '5x'
    }
  ];

  const openOrders = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      amount: 0.1,
      price: 42500.00,
      filled: 0,
      status: 'open',
      time: '14:32:15'
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'sell',
      type: 'stop',
      amount: 1.0,
      price: 2700.00,
      filled: 0,
      status: 'pending',
      time: '14:28:42'
    }
  ];

  const orderHistory = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'market',
      amount: 0.05,
      price: 43150.00,
      status: 'filled',
      time: '13:45:23',
      fee: 2.16
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'sell',
      type: 'limit',
      amount: 0.5,
      price: 2680.00,
      status: 'filled',
      time: '13:22:18',
      fee: 1.34
    },
    {
      id: 3,
      symbol: 'SOL/USDT',
      side: 'buy',
      type: 'market',
      amount: 10.0,
      price: 98.50,
      status: 'cancelled',
      time: '12:58:07',
      fee: 0
    }
  ];

  const balances = [
    { asset: 'USDT', free: 2450.00, locked: 550.00, total: 3000.00 },
    { asset: 'BTC', free: 0.15432, locked: 0.25000, total: 0.40432 },
    { asset: 'ETH', free: 1.2345, locked: 2.5000, total: 3.7345 },
    { asset: 'SOL', free: 45.67, locked: 0.00, total: 45.67 }
  ];

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'open':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' || side === 'long' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="h-80 pr-4 pb-4">
      <Card className="h-full bg-gray-900/95 border-gray-800/50 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="p-4 pb-0">
            <TabsList className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-1">
              <TabsTrigger 
                value="positions" 
                className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                <Target className="h-4 w-4 mr-2" />
                Positions
                <Badge variant="outline" className="ml-2 text-xs bg-gray-700/50 border-gray-600/50 text-gray-300">
                  {positions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                <Clock className="h-4 w-4 mr-2" />
                Open Orders
                <Badge variant="outline" className="ml-2 text-xs bg-gray-700/50 border-gray-600/50 text-gray-300">
                  {openOrders.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                <Activity className="h-4 w-4 mr-2" />
                Order History
              </TabsTrigger>
              <TabsTrigger 
                value="balances" 
                className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Balances
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 min-h-0 p-4 pt-3">
            <TabsContent value="positions" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-400 mb-3 pb-2 border-b border-gray-800/50">
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Size</span>
                  <span>Entry Price</span>
                  <span>Mark Price</span>
                  <span>PnL</span>
                  <span>Margin</span>
                  <span>Actions</span>
                </div>

                {/* Positions */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {positions.map((position, index) => (
                    <motion.div
                      key={position.id}
                      className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-white font-medium">{position.symbol}</span>
                      <Badge
                        variant="outline"
                        className={`w-fit ${
                          position.side === 'long' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {position.side.toUpperCase()}
                      </Badge>
                      <span className="text-gray-300 font-mono">{position.size}</span>
                      <span className="text-gray-300 font-mono">${formatPrice(position.entryPrice)}</span>
                      <span className="text-gray-300 font-mono">${formatPrice(position.markPrice)}</span>
                      <div className="flex flex-col">
                        <span className={`font-mono ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${position.pnl.toFixed(2)}
                        </span>
                        <span className={`text-xs ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-gray-300 font-mono">${position.margin.toFixed(2)}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-gray-800/50 border-gray-700/50 text-gray-300">
                          Close
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-400 mb-3 pb-2 border-b border-gray-800/50">
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span>Time</span>
                  <span>Actions</span>
                </div>

                {/* Open Orders */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {openOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-white font-medium">{order.symbol}</span>
                      <span className={getSideColor(order.side)}>{order.side.toUpperCase()}</span>
                      <span className="text-gray-300 uppercase">{order.type}</span>
                      <span className="text-gray-300 font-mono">{order.amount}</span>
                      <span className="text-gray-300 font-mono">${formatPrice(order.price)}</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className="text-gray-300 capitalize">{order.status}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-xs">{order.time}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-gray-800/50 border-gray-700/50 text-gray-300">
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-400 mb-3 pb-2 border-b border-gray-800/50">
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span>Time</span>
                  <span>Fee</span>
                </div>

                {/* Order History */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {orderHistory.map((order, index) => (
                    <motion.div
                      key={order.id}
                      className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-white font-medium">{order.symbol}</span>
                      <span className={getSideColor(order.side)}>{order.side.toUpperCase()}</span>
                      <span className="text-gray-300 uppercase">{order.type}</span>
                      <span className="text-gray-300 font-mono">{order.amount}</span>
                      <span className="text-gray-300 font-mono">${formatPrice(order.price)}</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className="text-gray-300 capitalize">{order.status}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-xs">{order.time}</span>
                      <span className="text-gray-300 font-mono text-xs">${order.fee.toFixed(2)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="balances" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-400 mb-3 pb-2 border-b border-gray-800/50">
                  <span>Asset</span>
                  <span>Free</span>
                  <span>Locked</span>
                  <span>Total</span>
                </div>

                {/* Balances */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {balances.map((balance, index) => (
                    <motion.div
                      key={balance.asset}
                      className="grid grid-cols-4 gap-4 items-center py-3 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-300">{balance.asset[0]}</span>
                        </div>
                        <span className="text-white font-medium">{balance.asset}</span>
                      </div>
                      <span className="text-gray-300 font-mono">{balance.free.toFixed(6)}</span>
                      <span className="text-gray-300 font-mono">{balance.locked.toFixed(6)}</span>
                      <span className="text-white font-mono font-semibold">{balance.total.toFixed(6)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfessionalBottomPanels;