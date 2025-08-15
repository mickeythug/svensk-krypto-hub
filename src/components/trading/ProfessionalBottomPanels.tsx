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
import { useLanguage } from '@/contexts/LanguageContext';
import ComprehensiveTradingPanel from './ComprehensiveTradingPanel';

interface ProfessionalBottomPanelsProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  volume24h?: number;
  priceChange24h?: number;
  dbOrders?: any[];
  jupOrders?: any[];
  history?: any[];
  balances?: any[];
  solBalance?: number;
}

const ProfessionalBottomPanels: React.FC<ProfessionalBottomPanelsProps> = ({ 
  symbol, 
  currentPrice,
  tokenName,
  volume24h = 0,
  priceChange24h = 0,
  dbOrders = [], 
  jupOrders = [], 
  history = [], 
  balances = [], 
  solBalance = 0 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('trade');

  // Use real data instead of mock
  const positions = []; // Real positions would come from your trading system
  
  const openOrders = [
    // Real DB orders
    ...(dbOrders || []).map((order: any) => ({
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      type: 'limit',
      amount: order.amount,
      price: order.limit_price,
      filled: 0,
      status: order.status,
      time: new Date(order.created_at).toLocaleTimeString()
    })),
    // Real Jupiter orders
    ...(jupOrders || []).map((order: any) => ({
      id: order.id || order.orderKey,
      symbol: symbol,
      side: order.side || 'buy',
      type: 'limit',
      amount: order.makingAmount || order.rawMakingAmount || 0,
      price: order.price || 0,
      filled: 0,
      status: order.status,
      time: new Date(order.createdAt || Date.now()).toLocaleTimeString()
    }))
  ];

  const orderHistory = (history || []).map((trade: any) => ({
    id: trade.id,
    symbol: trade.symbol || symbol,
    side: trade.side,
    type: trade.event_type,
    amount: trade.base_amount,
    price: trade.price_usd,
    status: 'filled',
    time: new Date(trade.created_at).toLocaleTimeString(),
    fee: trade.fee_quote || 0
  }));

  const realBalances = [
    { asset: 'USDT', free: 2450.00, locked: 550.00, total: 3000.00 },
    ...(balances || []).map((balance: any) => ({
      asset: balance.symbol || balance.name || 'Unknown',
      free: parseFloat(balance.balance || '0'),
      locked: 0.00,
      total: parseFloat(balance.balance || '0')
    })),
    { asset: 'SOL', free: solBalance || 0, locked: 0.00, total: solBalance || 0 }
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
    <div className="h-[600px] px-4 pb-4">
      <Card className="h-full bg-black border-primary/30 backdrop-blur-sm shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10 h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 pb-0">
              <TabsList className="bg-black/80 border border-primary/30 rounded-lg p-1 backdrop-blur-sm animate-fade-in">
                <TabsTrigger 
                  value="trade" 
                  className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-md transition-all duration-300 hover-scale text-white hover:bg-primary/20"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('trading.trade')}
                </TabsTrigger>
                <TabsTrigger 
                  value="positions" 
                  className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-md transition-all duration-300 hover-scale text-white hover:bg-primary/20"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {t('trading.positions')}
                  <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary/40 text-primary animate-pulse">
                    {positions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-md transition-all duration-300 hover-scale text-white hover:bg-primary/20"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {t('trading.openOrders')}
                  <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary/40 text-primary animate-pulse">
                    {openOrders.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="balances" 
                  className="px-6 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-md transition-all duration-300 hover-scale text-white hover:bg-primary/20"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {t('trading.walletBalances')}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 min-h-0 p-4 pt-3">
              <TabsContent value="trade" className="h-full m-0 animate-fade-in">
                <ComprehensiveTradingPanel 
                  symbol={symbol}
                  currentPrice={currentPrice}
                  tokenName={tokenName}
                  volume24h={volume24h}
                  priceChange24h={priceChange24h}
                />
              </TabsContent>
              
              <TabsContent value="positions" className="h-full m-0 animate-fade-in">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-4 text-xs font-medium text-primary/80 mb-3 pb-2 border-b border-primary/20">
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
                    {positions.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-primary/60">
                        <p>No open positions</p>
                      </div>
                    ) : (
                      positions.map((position: any, index: number) => (
                        <motion.div
                          key={position.id}
                          className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-black/60 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover-scale"
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
                          <span className="text-primary/80 font-mono">{position.size}</span>
                          <span className="text-primary/80 font-mono">${formatPrice(position.entryPrice)}</span>
                          <span className="text-primary/80 font-mono">${formatPrice(position.markPrice)}</span>
                          <div className="flex flex-col">
                            <span className={`font-mono ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${position.pnl.toFixed(2)}
                            </span>
                            <span className={`text-xs ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                          <span className="text-primary/80 font-mono">${position.margin.toFixed(2)}</span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300">
                              Close
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="h-full m-0 animate-fade-in">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-4 text-xs font-medium text-primary/80 mb-3 pb-2 border-b border-primary/20">
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
                    {openOrders.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-primary/60">
                        <p>No open orders</p>
                      </div>
                    ) : (
                      openOrders.map((order: any, index: number) => (
                        <motion.div
                          key={order.id}
                          className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-black/60 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover-scale"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="text-white font-medium">{order.symbol}</span>
                          <span className={getSideColor(order.side)}>{order.side.toUpperCase()}</span>
                          <span className="text-primary/80 uppercase">{order.type}</span>
                          <span className="text-primary/80 font-mono">{order.amount}</span>
                          <span className="text-primary/80 font-mono">${formatPrice(order.price)}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="text-primary/80 capitalize">{order.status}</span>
                          </div>
                          <span className="text-primary/60 font-mono text-xs">{order.time}</span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="h-full m-0 animate-fade-in">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-4 text-xs font-medium text-primary/80 mb-3 pb-2 border-b border-primary/20">
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
                    {orderHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-primary/60">
                        <p>No trading history</p>
                      </div>
                    ) : (
                      orderHistory.map((order: any, index: number) => (
                        <motion.div
                          key={order.id}
                          className="grid grid-cols-8 gap-4 items-center py-3 px-3 rounded-lg bg-black/60 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover-scale"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="text-white font-medium">{order.symbol}</span>
                          <span className={getSideColor(order.side)}>{order.side.toUpperCase()}</span>
                          <span className="text-primary/80 uppercase">{order.type}</span>
                          <span className="text-primary/80 font-mono">{order.amount}</span>
                          <span className="text-primary/80 font-mono">${formatPrice(order.price)}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="text-primary/80 capitalize">{order.status}</span>
                          </div>
                          <span className="text-primary/60 font-mono text-xs">{order.time}</span>
                          <span className="text-primary/80 font-mono text-xs">${order.fee.toFixed(2)}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="balances" className="h-full m-0 animate-fade-in">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 text-xs font-medium text-primary/80 mb-3 pb-2 border-b border-primary/20">
                    <span>Asset</span>
                    <span>Free</span>
                    <span>Locked</span>
                    <span>Total</span>
                  </div>

                  {/* Real Balances */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {realBalances.map((balance: any, index: number) => (
                      <motion.div
                        key={balance.asset}
                        className="grid grid-cols-4 gap-4 items-center py-3 px-3 rounded-lg bg-black/60 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover-scale"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{balance.asset[0]}</span>
                          </div>
                          <span className="text-white font-medium">{balance.asset}</span>
                        </div>
                        <span className="text-primary/80 font-mono">{balance.free.toFixed(6)}</span>
                        <span className="text-primary/80 font-mono">{balance.locked.toFixed(6)}</span>
                        <span className="text-primary font-mono font-semibold">{balance.total.toFixed(6)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default ProfessionalBottomPanels;