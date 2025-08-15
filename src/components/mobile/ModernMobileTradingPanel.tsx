import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Zap,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle
} from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';

interface ModernMobileTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  crypto: any;
}

const ModernMobileTradingPanel = ({ 
  symbol, 
  currentPrice, 
  tokenName,
  crypto 
}: ModernMobileTradingPanelProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState("");
  const [percentage, setPercentage] = useState("");
  
  const { connected } = useWallet();
  const { fullyAuthed } = useWalletAuthStatus();
  const { isAuthenticated: supabaseAuthed } = useSupabaseAuth();
  const { t } = useLanguage();

  // Combined authentication status
  const isFullyAuthenticated = fullyAuthed && supabaseAuthed;

  const quickPercentages = [25, 50, 75, 100];

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = orderType === "market" ? currentPrice : parseFloat(price) || 0;
    return amountNum * priceNum;
  };

  const setQuickPercentage = (percent: number) => {
    setPercentage(percent.toString());
    // Here you would calculate based on available balance
    // For now, just set a placeholder amount
    const maxAmount = 1000; // This should come from wallet balance
    const calculatedAmount = (maxAmount * percent) / 100;
    setAmount((calculatedAmount / currentPrice).toFixed(6));
  };

  const handleTrade = () => {
    // Trading logic here
    console.log({
      orderType,
      tradeType,
      amount,
      price: orderType === "market" ? currentPrice : price,
      stopPrice,
      total: calculateTotal()
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* TRADING HEADER */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {crypto?.image && (
              <img
                src={crypto.image}
                alt={`${tokenName} logo`}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <h3 className="font-bold text-lg">{symbol.toUpperCase()}/USDT</h3>
              <p className="text-sm text-muted-foreground">{t('trading.currentPrice')}: {formatUsd(currentPrice)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* BUY/SELL TOGGLE */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setTradeType("buy")}
          variant={tradeType === "buy" ? "default" : "outline"}
          className={`h-12 font-bold ${
            tradeType === "buy" 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
              : "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {t('trading.buy').toUpperCase()}
        </Button>
        <Button
          onClick={() => setTradeType("sell")}
          variant={tradeType === "sell" ? "default" : "outline"}
          className={`h-12 font-bold ${
            tradeType === "sell" 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "border-red-500/50 text-red-500 hover:bg-red-500/10"
          }`}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          {t('trading.sell').toUpperCase()}
        </Button>
      </div>

      {/* ORDER TYPE SELECTION */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          {t('trading.orderType')}
        </h4>
        
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {t('trading.market')}
            </TabsTrigger>
            <TabsTrigger value="limit" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {t('trading.limit')}
            </TabsTrigger>
            <TabsTrigger value="stop" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {t('trading.stop')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.amount')} ({symbol.toUpperCase()})</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.total')} (USDT)</label>
              <div className="font-mono text-lg font-bold p-3 bg-muted/50 rounded-lg">
                {formatUsd(calculateTotal())}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.price')} (USDT)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice.toString()}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.amount')} ({symbol.toUpperCase()})</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.total')} (USDT)</label>
              <div className="font-mono text-lg font-bold p-3 bg-muted/50 rounded-lg">
                {formatUsd(calculateTotal())}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stop" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.stopPrice')} (USDT)</label>
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder={currentPrice.toString()}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.limitPrice')} (USDT)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice.toString()}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.amount')} ({symbol.toUpperCase()})</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('trading.total')} (USDT)</label>
              <div className="font-mono text-lg font-bold p-3 bg-muted/50 rounded-lg">
                {formatUsd(calculateTotal())}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* QUICK PERCENTAGE BUTTONS */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Percent className="h-4 w-4" />
          {t('trading.quickSelection')}
        </h4>
        
        <div className="grid grid-cols-4 gap-2">
          {quickPercentages.map((percent) => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              onClick={() => setQuickPercentage(percent)}
              className={`h-10 font-bold ${
                percentage === percent.toString() 
                  ? "bg-primary/20 border-primary text-primary" 
                  : ""
              }`}
            >
              {percent}%
            </Button>
          ))}
        </div>
      </Card>

      {/* TRADING FEES & INFO */}
      <Card className="p-4 bg-muted/30">
        <h4 className="font-semibold mb-3 text-sm">{t('trading.feesInfo')}</h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('trading.tradingFee')}:</span>
            <span className="font-mono">0.1%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('trading.estimatedFees')}:</span>
            <span className="font-mono">{formatUsd(calculateTotal() * 0.001)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('trading.youWillReceive')}:</span>
            <span className="font-mono font-bold">
              {tradeType === "buy" 
                ? `${parseFloat(amount || "0").toFixed(6)} ${symbol.toUpperCase()}`
                : formatUsd(calculateTotal() * 0.999)
              }
            </span>
          </div>
        </div>
      </Card>

      {/* TRADE BUTTON */}
      {!isFullyAuthenticated ? (
        <div className="space-y-3">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('trading.connectWalletMessage')}
            </p>
          </div>
          <ConnectWalletButton />
        </div>
      ) : (
        <Button 
          onClick={handleTrade}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full h-14 text-lg font-bold ${
            tradeType === "buy"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {tradeType === "buy" ? t('trading.buy').toUpperCase() : t('trading.sell').toUpperCase()} {symbol.toUpperCase()}
        </Button>
      )}

      {/* WARNING DISCLAIMER */}
      <Card className="p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-amber-600 dark:text-amber-400">
              {t('trading.tradingWarning')}
            </h4>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
              {t('trading.tradingWarningText')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernMobileTradingPanel;