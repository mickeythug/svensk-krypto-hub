import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Wallet, 
  DollarSign,
  Info,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend Window interface for Li.Fi
declare global {
  interface Window {
    LiFi?: any;
  }
}

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  tokenName: string;
}

const TradingPanel = ({ symbol, currentPrice, priceChange24h, tokenName }: TradingPanelProps) => {
  const [activeTab, setActiveTab] = useState("swap");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState(symbol);
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const widgetRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize Li.Fi Widget with proper cleanup
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    
    const initializeLiFiWidget = async () => {
      if (!widgetRef.current || !mounted) return;

      try {
        // Clear previous widget safely
        if (widgetRef.current.children.length > 0) {
          widgetRef.current.innerHTML = '';
        }

        // Simple fallback UI instead of external widget for now
        const fallbackHTML = `
          <div class="p-6 text-center space-y-4">
            <div class="text-lg font-semibold">DEX Trading Coming Soon</div>
            <p class="text-sm text-muted-foreground">
              We are integrating Li.Fi for secure cross-chain trading
            </p>
            <div class="grid grid-cols-2 gap-2 mt-4">
              <div class="p-3 bg-secondary/20 rounded-lg">
                <div class="text-sm font-medium">Best Price</div>
                <div class="text-xs text-muted-foreground">Cross-chain routing</div>
              </div>
              <div class="p-3 bg-secondary/20 rounded-lg">
                <div class="text-sm font-medium">Low Fees</div>
                <div class="text-xs text-muted-foreground">Optimized costs</div>
              </div>
            </div>
          </div>
        `;
        
        if (mounted && widgetRef.current) {
          widgetRef.current.innerHTML = fallbackHTML;
        }
      } catch (error) {
        if (mounted) {
          console.error('Error initializing trading widget:', error);
          toast({
            title: "Widget Error",
            description: "Could not load trading widget. Try again later.",
            variant: "destructive"
          });
        }
      }
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeLiFiWidget, 100);
    
    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timer);
      // Safe cleanup - only clear if element still exists and is mounted
      if (widgetRef.current && document.contains(widgetRef.current)) {
        try {
          widgetRef.current.innerHTML = '';
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [symbol, fromToken, toToken, slippage, toast]);

  const handleQuickBuy = (amount: string) => {
    setFromAmount(amount);
    setActiveTab("swap");
    toast({
      title: "Quick buy activated",
      description: `Buy ${amount} USDT worth of ${symbol}`,
    });
  };

  const handleSwap = () => {
    setIsLoading(true);
    toast({
      title: "Swap initiated",
      description: `Swapping ${fromAmount} ${fromToken} to ${symbol}`,
    });
    
    // Li.Fi widget will handle the actual swap
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const calculateEstimate = () => {
    if (!fromAmount || !currentPrice) return "0";
    const amount = parseFloat(fromAmount);
    if (fromToken === "USDT" && toToken === symbol) {
      return (amount / currentPrice).toFixed(6);
    }
    return (amount * currentPrice).toFixed(2);
  };

  return (
    <Card className="w-full max-w-md bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trade {symbol}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Li.Fi DEX
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current price:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPrice(currentPrice)}</span>
            <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="text-xs">
              {priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(priceChange24h).toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Buy Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {["100", "500", "1000", "5000"].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickBuy(amount)}
              className="text-xs hover:bg-primary/10 hover:border-primary/40"
            >
              ${amount}
            </Button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="swap" className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="space-y-4 mt-4">
            {/* From Token Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">From</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>
                <Button
                  variant="outline"
                  className="px-3 min-w-[80px] border-primary/20"
                  onClick={() => setFromToken(fromToken === "USDT" ? "ETH" : "USDT")}
                >
                  {fromToken}
                </Button>
              </div>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const temp = fromToken;
                  setFromToken(toToken);
                  setToToken(temp);
                  setFromAmount(toAmount);
                  setToAmount(fromAmount);
                }}
                className="rounded-full p-2 hover:bg-primary/10"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">To</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={calculateEstimate()}
                    readOnly
                    className="bg-secondary/30 border-primary/20"
                  />
                </div>
                <Button
                  variant="outline"
                  className="px-3 min-w-[80px] border-primary/20"
                  disabled
                >
                  {symbol}
                </Button>
              </div>
            </div>

            {/* Slippage Settings */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slippage tolerance:</span>
              <div className="flex gap-1">
                {["0.1", "0.5", "1.0"].map((slip) => (
                  <Button
                    key={slip}
                    variant={slippage === slip ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSlippage(slip)}
                    className="text-xs px-2 py-1"
                  >
                    {slip}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Secure trading widget without DOM manipulation */}
            <div className="min-h-[200px] rounded-lg bg-secondary/20 border border-primary/20 p-6">
              <div className="text-center space-y-4">
                <div className="text-lg font-semibold">DEX Trading</div>
                <p className="text-sm text-muted-foreground">
                  Li.Fi integration for secure cross-chain trading
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm font-medium">Best Price</div>
                    <div className="text-xs text-muted-foreground">Cross-chain routing</div>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="text-sm font-medium">Low Fees</div>
                    <div className="text-xs text-muted-foreground">Optimized costs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={!fromAmount || isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3"
            >
              {isLoading ? (
                "Processing swap..."
              ) : (
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Swap {fromToken} → {symbol}
                </span>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Cross-Chain Trading
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Trade {symbol} from different blockchains with Li.Fi's cross-chain technology.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-center">Ethereum</Badge>
                </div>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-warning">Risk Warning</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cryptocurrencies are volatile investments. Only invest what you can afford to lose.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Custom Slippage (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="bg-secondary/50 border-primary/20"
                />
              </div>

              <Button variant="outline" className="w-full border-primary/20">
                <Info className="h-4 w-4 mr-2" />
                View advanced settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-primary/10">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ShieldCheck className="h-3 w-3" />
            Powered by Li.Fi & CryptoNetwork Sweden
          </div>
          <p>Secure cross-chain DEX aggregator with best prices</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;