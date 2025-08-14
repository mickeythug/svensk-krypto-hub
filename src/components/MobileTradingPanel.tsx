import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Wallet, 
  DollarSign,
  Zap,
  ShieldCheck,
  Plus,
  Minus,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileTradingPanelProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
}

const MobileTradingPanel = ({ symbol, currentPrice, priceChange24h, tokenName }: MobileTradingPanelProps) => {
  const [activeTab, setActiveTab] = useState("buy");
  const [amount, setAmount] = useState("");
  const [usdValue, setUsdValue] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const { toast } = useToast();

  // Quick amount buttons
  const quickAmounts = ["$25", "$50", "$100", "$250"];
  const quickPercentages = ["25%", "50%", "75", "100%"];

  const handleQuickAmount = (value: string) => {
    const numValue = value.replace("$", "");
    setUsdValue(numValue);
    setAmount((parseFloat(numValue) / currentPrice).toFixed(6));
  };

  const handleTrade = () => {
    toast({
      title: `${activeTab === "buy" ? "Köp" : "Sälj"} Order`,
      description: `${activeTab === "buy" ? "Köper" : "Säljer"} ${amount} ${symbol} för $${usdValue}`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{symbol.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">{symbol}</h1>
              <p className="text-xs text-muted-foreground">{tokenName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold font-numbers text-lg">{formatPrice(currentPrice)}</div>
            <div className={`flex items-center gap-1 text-sm ${
              priceChange24h >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="font-numbers">{Math.abs(priceChange24h).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger 
              value="buy" 
              className="text-base font-semibold data-[state=active]:bg-success data-[state=active]:text-white"
            >
              Köp
            </TabsTrigger>
            <TabsTrigger 
              value="sell" 
              className="text-base font-semibold data-[state=active]:bg-destructive data-[state=active]:text-white"
            >
              Sälj
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-6 space-y-6">
            {/* Quick Amount Buttons */}
            <div>
              <label className="text-sm font-medium mb-3 block">Snabbköp</label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(amount)}
                    className="h-12 text-sm font-medium border-primary/20 hover:bg-primary/10"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Belopp (USD)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdValue}
                    onChange={(e) => {
                      setUsdValue(e.target.value);
                      if (e.target.value) {
                        setAmount((parseFloat(e.target.value) / currentPrice).toFixed(6));
                      }
                    }}
                    className="h-14 text-lg pl-8 bg-secondary/20 border-primary/20"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Du får ({symbol})</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (e.target.value) {
                        setUsdValue((parseFloat(e.target.value) * currentPrice).toFixed(2));
                      }
                    }}
                    className="h-14 text-lg pr-16 bg-secondary/20 border-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance and Fees */}
            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tillgängligt</span>
                <span className="font-medium">$2,450.00 USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trading Fee (0.1%)</span>
                <span className="font-medium">${(parseFloat(usdValue || "0") * 0.001).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border/50 pt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold">${(parseFloat(usdValue || "0") * 1.001).toFixed(2)}</span>
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={handleTrade}
              disabled={!amount || !usdValue}
              className="w-full h-14 text-lg font-bold bg-success hover:bg-success/90 text-white"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Köp {symbol}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="mt-6 space-y-6">
            {/* Portfolio Balance */}
            <div className="bg-secondary/20 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Ditt {symbol} innehav</div>
                <div className="text-2xl font-bold">0.000000 {symbol}</div>
                <div className="text-sm text-muted-foreground">≈ $0.00</div>
              </div>
            </div>

            {/* Percentage Buttons */}
            <div>
              <label className="text-sm font-medium mb-3 block">Sälj procentandel</label>
              <div className="grid grid-cols-4 gap-2">
                {quickPercentages.map((percentage) => (
                  <Button
                    key={percentage}
                    variant="outline"
                    size="sm"
                    className="h-12 text-sm font-medium border-primary/20 hover:bg-primary/10"
                  >
                    {percentage}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sell Amount Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sälj ({symbol})</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 text-lg pr-16 bg-secondary/20 border-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Du får (USD)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdValue}
                    readOnly
                    className="h-14 text-lg pl-8 bg-secondary/20 border-primary/20"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Sell Button */}
            <Button
              onClick={handleTrade}
              disabled={!amount}
              className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 text-white"
            >
              <Minus className="mr-2 h-5 w-5" />
              Sälj {symbol}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Advanced Settings */}
      <div className="px-4 py-6">
        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Avancerade inställningar
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Slippage tolerans</label>
              <div className="grid grid-cols-3 gap-2">
                {["0.1%", "0.5%", "1.0%"].map((slip) => (
                  <Button
                    key={slip}
                    variant={slippage === slip.replace('%', '') ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(slip.replace('%', ''))}
                    className="h-10"
                  >
                    {slip}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Säkrad av Li.Fi & CryptoNetwork Sweden</span>
        </div>
      </div>
    </div>
  );
};

export default MobileTradingPanel;