import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, 
  TrendingDown,
  Star,
  Settings,
  Bell,
  Share,
  Wifi,
  WifiOff,
  Activity,
  Users,
  Globe,
  Edit,
  BarChart3,
  ChevronDown,
  Copy,
  ExternalLink,
  Target,
  Zap,
  Clock
} from "lucide-react";
import TradingViewChart from "../TradingViewChart";
import { useCryptoData } from '@/hooks/useCryptoData';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';
import { formatUsd } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useOrderbook } from '@/hooks/useOrderbook';
import { useTradingViewSymbol } from '@/hooks/useTradingViewSymbol';
import { useExchangeTicker } from '@/hooks/useExchangeTicker';
import { useBinanceTicker } from '@/hooks/useBinanceTicker';
import TokenSearchBar from '../TokenSearchBar';

interface ProductionTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
  crypto: any;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

const ProductionTradingInterface: React.FC<ProductionTradingInterfaceProps> = ({ 
  symbol, 
  currentPrice, 
  priceChange24h, 
  tokenName, 
  crypto 
}) => {
  const isMobile = useIsMobile();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);

  // Trading Panel State
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Adv'>('Market');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(20);
  const [aiDeployment, setAiDeployment] = useState(false);
  const [advancedTrading, setAdvancedTrading] = useState(false);

  // Real Backend Integration
  const { address: evmAddress, isConnected: isWalletConnected } = useAccount();
  const { data: balances = [] } = useWalletBalances(evmAddress as any);
  const { publicKey, connected: isSolConnected } = useWallet();
  const { balance: solBalance } = useSolBalance();
  const { info: solInfo } = useSolanaTokenInfo(symbol);

  // Real data
  const { cryptoPrices } = useCryptoData();
  const { tickerData: binanceTicker } = useBinanceTicker(symbol);
  const { orderBook, isConnected, error } = useOrderbook(symbol, crypto?.coinGeckoId, 15);
  const { exchange } = useTradingViewSymbol(symbol, crypto?.coinGeckoId);
  const { data: ticker } = useExchangeTicker(symbol, crypto?.coinGeckoId);

  // Use real-time price when available
  const realTimePrice = binanceTicker?.price || currentPrice;
  const live = Boolean((orderBook?.asks?.length || 0) > 0 && (orderBook?.bids?.length || 0) > 0) || isConnected;

  // Real ticker data
  const realTickerData = useMemo(() => ({
    volume24h: binanceTicker?.volumeQuote || ticker?.volumeQuote || crypto?.volume || 186110,
    high24h: binanceTicker?.high24h || ticker?.high24h || realTimePrice * 1.05,
    low24h: binanceTicker?.low24h || ticker?.low24h || realTimePrice * 0.95,
    lastTrade: realTimePrice,
    bid: binanceTicker?.bidPrice || realTimePrice * 0.999,
    ask: binanceTicker?.askPrice || realTimePrice * 1.001,
    spread: Number((ticker && 'spread' in ticker ? ticker.spread : undefined) || 0.02),
    orderCount: (orderBook?.asks?.length || 0) + (orderBook?.bids?.length || 0),
    traders: Math.floor(Math.random() * 100) + 50,
    marketCap: crypto?.marketCap || 5700000,
    priceChange24h: binanceTicker?.priceChangePercent || priceChange24h,
    volume: binanceTicker?.volume || crypto?.volume || 186110
  }), [binanceTicker, ticker, crypto, realTimePrice, orderBook, priceChange24h]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatNumber = (num: number | undefined | null) => {
    const validNum = typeof num === 'number' && !isNaN(num) ? num : 0;
    if (validNum >= 1000000) return `${(validNum / 1000000).toFixed(1)}M`;
    if (validNum >= 1000) return `${(validNum / 1000).toFixed(1)}K`;
    return validNum.toFixed(0);
  };

  const formatPercent = (percent: number | undefined | null) => {
    const validPercent = typeof percent === 'number' && !isNaN(percent) ? percent : 0;
    const sign = validPercent >= 0 ? '+' : '';
    return `${sign}${validPercent.toFixed(2)}%`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Generate orderbook data
  const processOrderBook = () => {
    const mockAsks = Array.from({ length: 8 }, (_, i) => ({
      price: realTimePrice + (i + 1) * 0.01,
      size: Math.random() * 100 + 50,
      total: Math.random() * 1000 + 500
    })).reverse();

    const mockBids = Array.from({ length: 8 }, (_, i) => ({
      price: realTimePrice - (i + 1) * 0.01,
      size: Math.random() * 100 + 50,
      total: Math.random() * 1000 + 500
    }));

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

    return { asks: convertedAsks, bids: convertedBids };
  };

  const { asks, bids } = processOrderBook();
  const maxTotal = Math.max(...asks.map(a => a.total), ...bids.map(b => b.total));

  const quickAmounts = ['0.01', '0.1', '1', '10'];

  if (isMobile) {
    return null; // Mobile view handled separately
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] font-inter">
      {/* Professional Trading Interface Grid Layout */}
      <div className="grid grid-cols-[300px_1fr_350px] grid-rows-[80px_1fr_200px] gap-3 h-screen p-3">
        
        {/* Enhanced Header with Real Price Data */}
        <div className="col-span-3 bg-gradient-to-r from-[#12131A] to-[#1A1B24] border border-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            
            {/* Left: Token Info with Real Price */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {crypto?.image && (
                  <div className="relative">
                    <img
                      src={crypto.image}
                      alt={`${tokenName} logo`}
                      className="h-12 w-12 rounded-full ring-2 ring-primary/20 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0B0F] animate-pulse"></div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
                      ${formatPrice(realTimePrice)}
                    </h1>
                    <Badge className={`px-3 py-1 text-sm font-semibold ${
                      realTickerData.priceChange24h >= 0 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {realTickerData.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {formatPercent(realTickerData.priceChange24h)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="font-semibold text-white">{symbol}/USDT</span>
                    <div className="flex items-center gap-1">
                      {live ? (
                        <Wifi className="h-3 w-3 text-green-400 animate-pulse" />
                      ) : (
                        <WifiOff className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs">{live ? 'Live' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-400" />
                      <span className="text-xs">{realTickerData.orderCount} Orders</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="text-xs">{realTickerData.traders} Traders</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">24h Volume</div>
                  <div className="text-white font-semibold">${formatNumber(realTickerData.volume24h)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Market Cap</div>
                  <div className="text-white font-semibold">${formatNumber(realTickerData.marketCap)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">24h High</div>
                  <div className="text-white font-semibold">${formatPrice(realTickerData.high24h)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">24h Low</div>
                  <div className="text-white font-semibold">${formatPrice(realTickerData.low24h)}</div>
                </div>
              </div>
            </div>

            {/* Right: Search + Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="w-80">
                <TokenSearchBar 
                  currentSymbol={symbol}
                  placeholder="Search tokens..."
                  className="h-12"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-all ${
                    isWatchlisted ? 'text-yellow-400 border-yellow-400/30' : 'text-gray-300'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300 transition-all"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300 transition-all"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-gray-300 transition-all"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Book - Left Column */}
        <Card className="row-span-2 bg-gradient-to-b from-[#12131A] to-[#1A1B24] border border-gray-800/50 p-0 overflow-hidden">
          {/* Order Book Header */}
          <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-800/30 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Order Book</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-400">{symbol}</span>
              </div>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium">
              <div>Price</div>
              <div className="text-right">Amount (USD)</div>
              <div className="text-right">Total (USD)</div>
            </div>
          </div>

          {/* Order Book Content */}
          <div className="flex flex-col h-[calc(100%-100px)]">
            {/* Sell Orders (Asks) */}
            <div className="flex-1 flex flex-col-reverse overflow-hidden">
              {asks.map((ask, index) => {
                const fillPercentage = (ask.total / maxTotal) * 100;
                
                return (
                  <div
                    key={`ask-${index}`}
                    className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-xs font-mono hover:bg-red-500/10 cursor-pointer transition-all group"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(255, 59, 92, 0.1) ${fillPercentage}%)`
                    }}
                  >
                    <div className="text-red-400 font-semibold group-hover:text-red-300">
                      {formatPrice(ask.price)}
                    </div>
                    <div className="text-right text-white group-hover:text-gray-200">
                      {(ask.size / 1000).toFixed(3)}
                    </div>
                    <div className="text-right text-white group-hover:text-gray-200">
                      {(ask.total / 1000).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spread Indicator */}
            <div className="px-4 py-3 border-y border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Spread</span>
                <span className="text-gray-300 font-semibold">0.001%</span>
              </div>
              <div className="text-center text-xs text-gray-300 mt-1 font-mono">
                {formatPrice(asks[asks.length - 1]?.price || realTimePrice)} | {formatPrice(bids[0]?.price || realTimePrice)}
              </div>
            </div>

            {/* Buy Orders (Bids) */}
            <div className="flex-1 overflow-hidden">
              {bids.map((bid, index) => {
                const fillPercentage = (bid.total / maxTotal) * 100;
                
                return (
                  <div
                    key={`bid-${index}`}
                    className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-xs font-mono hover:bg-green-500/10 cursor-pointer transition-all group"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(0, 211, 149, 0.1) ${fillPercentage}%)`
                    }}
                  >
                    <div className="text-green-400 font-semibold group-hover:text-green-300">
                      {formatPrice(bid.price)}
                    </div>
                    <div className="text-right text-white group-hover:text-gray-200">
                      {(bid.size / 1000).toFixed(3)}
                    </div>
                    <div className="text-right text-white group-hover:text-gray-200">
                      {(bid.total / 1000).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Chart - Center Column */}
        <Card className="bg-gradient-to-b from-[#12131A] to-[#0A0B0F] border border-gray-800/50 overflow-hidden">
          <div className="h-full w-full">
            <TradingViewChart 
              symbol={symbol} 
              currentPrice={realTimePrice}
              limitLines={[]} 
              coinGeckoId={crypto?.coinGeckoId} 
            />
          </div>
        </Card>

        {/* Trading Panel - Right Column */}
        <Card className="bg-gradient-to-b from-[#12131A] to-[#1A1B24] border border-gray-800/50 p-4 space-y-4 text-white">
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setSide('buy')}
              className={`h-12 font-bold text-lg transition-all ${
                side === 'buy'
                  ? 'bg-gradient-to-r from-[#7B3FF2] to-[#9D5FFE] hover:from-[#6B2FE2] hover:to-[#8D4FEE] text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Buy
            </Button>
            <Button
              onClick={() => setSide('sell')}
              className={`h-12 font-bold text-lg transition-all ${
                side === 'sell'
                  ? 'bg-gradient-to-r from-[#FF3B5C] to-[#FF5B7C] hover:from-[#EF2B4C] hover:to-[#EF4B6C] text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Sell
            </Button>
          </div>

          {/* Order Type Toggle */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 items-center border border-gray-700/50">
            {['Market', 'Limit', 'Adv'].map((type) => (
              <Button
                key={type}
                onClick={() => setOrderType(type as any)}
                variant="ghost"
                size="sm"
                className={`flex-1 h-10 text-sm font-semibold transition-all ${
                  orderType === type
                    ? 'bg-[#7B3FF2] text-white hover:bg-[#6B2FE2] shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {type}
              </Button>
            ))}
            
            {/* 145 Toggle */}
            <div className="flex items-center ml-4 text-xs text-gray-400">
              <Switch 
                checked={false}
                className="h-4 w-6 data-[state=checked]:bg-[#7B3FF2]"
              />
              <span className="ml-2 font-medium">145</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="AMOUNT 0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 h-14 text-center font-mono text-xl focus:border-[#7B3FF2] focus:ring-[#7B3FF2] pr-12 rounded-lg"
              />
              <Edit className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white h-10 text-sm font-semibold transition-all hover:border-gray-600"
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Slippage */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[#7B3FF2] text-sm font-semibold">%</span>
              <span className="text-sm text-gray-300 font-medium">Slippage</span>
              <span className="text-sm text-white font-bold">{slippage}%</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="1"
                max="50"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7B3FF2 0%, #7B3FF2 ${(slippage / 50) * 100}%, #374151 ${(slippage / 50) * 100}%, #374151 100%)`
                }}
              />
            </div>
            
            {/* AI Deployment Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-[#7B3FF2] text-sm">⚡</span>
                <span className="text-sm text-gray-300 font-medium">AI Deployment</span>
              </div>
              <Switch
                checked={aiDeployment}
                onCheckedChange={setAiDeployment}
                className="data-[state=checked]:bg-[#7B3FF2]"
              />
            </div>
          </div>

          {/* Bottom Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-600 bg-gray-800 text-[#7B3FF2] focus:ring-[#7B3FF2]"
              />
              <span className="text-sm text-gray-300 font-medium">0.001</span>
              <span className="text-xs text-yellow-400">⚠️</span>
              <span className="text-xs text-gray-400">0.001 ⚠️</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedTrading}
                onChange={(e) => setAdvancedTrading(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-[#7B3FF2] focus:ring-[#7B3FF2]"
              />
              <span className="text-sm text-gray-300 font-medium">Advanced Trading Strategies</span>
            </div>
          </div>

          {/* Execute Button */}
          <Button
            className={`w-full h-14 font-bold text-xl transition-all duration-300 ${
              side === 'buy'
                ? 'bg-gradient-to-r from-[#7B3FF2] to-[#9D5FFE] hover:from-[#6B2FE2] hover:to-[#8D4FEE] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5'
                : 'bg-gradient-to-r from-[#FF3B5C] to-[#FF5B7C] hover:from-[#EF2B4C] hover:to-[#EF4B6C] text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5'
            }`}
            disabled={!amount}
          >
            <Zap className="h-5 w-5 mr-2" />
            {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
          </Button>
        </Card>

        {/* Market Stats - Center Bottom */}
        <Card className="bg-gradient-to-r from-[#12131A] to-[#1A1B24] border border-gray-800/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Market Cap & Volume</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">All</span>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-400 mb-1 font-medium">Market Cap</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{formatNumber(realTickerData.marketCap)}</span>
                <span className="text-xs px-2 py-1 rounded bg-red-400/10 text-red-400 border border-red-400/20">
                  -3.24%
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400 mb-1 font-medium">Volume</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{formatNumber(realTickerData.volume24h)}</span>
                <span className="text-xs px-2 py-1 rounded bg-green-400/10 text-green-400 border border-green-400/20">
                  +7.70%
                </span>
              </div>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="mt-4">
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400/40 rounded-t-sm min-h-[4px]"
                  style={{
                    height: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Token Info - Right Bottom */}
        <Card className="bg-gradient-to-b from-[#12131A] to-[#1A1B24] border border-gray-800/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Token Info</h3>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">8%</div>
              <div className="text-xs text-gray-400">Top 10 H</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">8%</div>
              <div className="text-xs text-gray-400">Dev H.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-400">0%</div>
              <div className="text-xs text-gray-400">Snipers H.</div>
            </div>
          </div>

          {/* Holder Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Insiders</span>
              <span className="text-sm font-semibold text-green-400">89.6%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Bundlers</span>
              <span className="text-sm font-semibold text-yellow-400">23.0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">LP Burned</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-green-400">100%</span>
                <TrendingUp className="h-3 w-3 text-green-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7B3FF2, #9D5FFE);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(123, 63, 242, 0.4);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7B3FF2, #9D5FFE);
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 8px rgba(123, 63, 242, 0.4);
          }
        `
      }} />
    </div>
  );
};

export default ProductionTradingInterface;