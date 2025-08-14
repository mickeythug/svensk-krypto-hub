import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
}

const MobileTradingPanel = ({ symbol, currentPrice, tokenName }: MobileTradingPanelProps) => {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState(currentPrice.toString());
  const [amount, setAmount] = useState("");
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Trading Tabs */}
      <Tabs value={side} onValueChange={setSide}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="buy" 
            className="data-[state=active]:bg-success data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            {t('trading.buy')}
          </TabsTrigger>
          <TabsTrigger 
            value="sell"
            className="data-[state=active]:bg-destructive data-[state=active]:text-white"
          >
            <TrendingDown className="h-4 w-4 mr-1" />
            {t('trading.sell')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-3">
          <TradingForm
            side="buy"
            symbol={symbol}
            currentPrice={currentPrice}
            orderType={orderType}
            setOrderType={setOrderType}
            price={price}
            setPrice={setPrice}
            amount={amount}
            setAmount={setAmount}
          />
        </TabsContent>

        <TabsContent value="sell" className="mt-3">
          <TradingForm
            side="sell"
            symbol={symbol}
            currentPrice={currentPrice}
            orderType={orderType}
            setOrderType={setOrderType}
            price={price}
            setPrice={setPrice}
            amount={amount}
            setAmount={setAmount}
          />
        </TabsContent>
      </Tabs>

      {/* Account Balance */}
      <Card className="p-3">
        <h3 className="font-semibold text-xs mb-2">{t('trading.balance')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">USDT</span>
            <span className="font-mono">2,450.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{symbol}</span>
            <span className="font-mono">0.000000</span>
          </div>
        </div>
      </Card>

      {/* Open Orders */}
      <Card className="p-3">
        <h3 className="font-semibold text-xs mb-2">{t('trading.openOrders')}</h3>
        <div className="text-center text-muted-foreground text-xs py-3">
          {t('trading.noOpenOrders')}
        </div>
      </Card>
    </div>
  );
};

interface TradingFormProps {
  side: "buy" | "sell";
  symbol: string;
  currentPrice: number;
  orderType: string;
  setOrderType: (type: string) => void;
  price: string;
  setPrice: (price: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
}

const TradingForm = ({
  side,
  symbol,
  currentPrice,
  orderType,
  setOrderType,
  price,
  setPrice,
  amount,
  setAmount
}: TradingFormProps) => {
  const isBuy = side === "buy";

  return (
    <Card className="p-3 space-y-3">
      {/* Order Type */}
      <div className="flex gap-2">
        <Button
          variant={orderType === "market" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("market")}
          className="flex-1"
        >
          {t('trading.market')}
        </Button>
        <Button
          variant={orderType === "limit" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("limit")}
          className="flex-1"
        >
          {t('trading.limit')}
        </Button>
      </div>

      {/* Price Input (for limit orders) */}
      {orderType === "limit" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t('trading.price')} (USDT)
          </label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="font-mono"
          />
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t('trading.amount')} ({symbol})
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00000000"
          className="font-mono"
        />
      </div>

      {/* Percentage Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {["25%", "50%", "75%", "100%"].map((percent) => (
          <Button
            key={percent}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {percent}
          </Button>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('trading.orderValue')}:</span>
          <span className="font-mono">
            {amount && price ? `$${(parseFloat(amount) * parseFloat(price)).toFixed(2)}` : '$0.00'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('trading.fee')}:</span>
          <span className="font-mono">~$0.05</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        className={`w-full font-semibold ${
          isBuy
            ? "bg-success hover:bg-success/90 text-white"
            : "bg-destructive hover:bg-destructive/90 text-white"
        }`}
        disabled={!amount}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isBuy ? t('trading.buy') : t('trading.sell')} {symbol}
      </Button>
    </Card>
  );
};

export default MobileTradingPanel;