import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart,
  Target,
  Eye,
  EyeOff,
  Settings
} from "lucide-react";
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import { useCryptoData } from "@/hooks/useCryptoData";

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  image: string;
}

const PortfolioPage = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [showValues, setShowValues] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { cryptoPrices, isLoading } = useCryptoData();

  // Demo portfolio data
  useEffect(() => {
    if (cryptoPrices && cryptoPrices.length > 0) {
      const demoHoldings: PortfolioHolding[] = [
        {
          id: "1",
          symbol: "BTC",
          name: "Bitcoin",
          amount: 0.5,
          avgBuyPrice: 100000,
          currentPrice: cryptoPrices.find(c => c.symbol === "BTC")?.price || 115000,
          image: cryptoPrices.find(c => c.symbol === "BTC")?.image || ""
        },
        {
          id: "2", 
          symbol: "ETH",
          name: "Ethereum",
          amount: 2.5,
          avgBuyPrice: 3200,
          currentPrice: cryptoPrices.find(c => c.symbol === "ETH")?.price || 3800,
          image: cryptoPrices.find(c => c.symbol === "ETH")?.image || ""
        },
        {
          id: "3",
          symbol: "SOL",
          name: "Solana", 
          amount: 10,
          avgBuyPrice: 150,
          currentPrice: cryptoPrices.find(c => c.symbol === "SOL")?.price || 169,
          image: cryptoPrices.find(c => c.symbol === "SOL")?.image || ""
        }
      ];
      setHoldings(demoHoldings);
    }
  }, [cryptoPrices]);

  const calculateTotalValue = () => {
    return holdings.reduce((total, holding) => total + (holding.amount * holding.currentPrice), 0);
  };

  const calculateTotalPnL = () => {
    return holdings.reduce((total, holding) => {
      const invested = holding.amount * holding.avgBuyPrice;
      const current = holding.amount * holding.currentPrice;
      return total + (current - invested);
    }, 0);
  };

  const calculatePnLPercentage = () => {
    const totalInvested = holdings.reduce((total, holding) => total + (holding.amount * holding.avgBuyPrice), 0);
    const totalPnL = calculateTotalPnL();
    return totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  };

  const formatCurrency = (amount: number) => {
    if (!showValues) return "••••••";
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount * 11); // Rough USD to SEK conversion
  };

  const totalValue = calculateTotalValue();
  const totalPnL = calculateTotalPnL();
  const pnlPercentage = calculatePnLPercentage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CryptoPriceTicker />
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Laddar portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CryptoPriceTicker />
      
      <main className="container mx-auto px-4 pt-8 pb-20">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-crypto text-4xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              MIN PORTFÖLJ
            </h1>
            <p className="font-display text-lg text-muted-foreground">
              Spåra dina krypto-investeringar
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2"
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showValues ? "Dölj" : "Visa"}
            </Button>
            <Button className="flex items-center gap-2 bg-gradient-primary">
              <Plus className="h-4 w-4" />
              Lägg till
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Totalt värde</h3>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Portfolio balans
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-warning/10 border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Vinst/Förlust</h3>
              {totalPnL >= 0 ? 
                <TrendingUp className="h-5 w-5 text-success" /> : 
                <TrendingDown className="h-5 w-5 text-destructive" />
              }
            </div>
            <div className={`text-3xl font-bold mb-2 ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {showValues ? `${totalPnL >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalPnL))}` : "••••••"}
            </div>
            <div className={`text-sm font-medium ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {showValues ? `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%` : "••••"}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-secondary/10 border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Holdings</h3>
              <PieChart className="h-5 w-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {holdings.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Olika kryptovalutor
            </div>
          </Card>
        </div>

        {/* Portfolio Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 h-12 p-1 bg-secondary/10 rounded-xl border border-border/20 w-full max-w-md">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
            >
              <Wallet className="h-4 w-4" />
              <span>Översikt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
            >
              <Target className="h-4 w-4" />
              <span>Analys</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              {holdings.map((holding) => {
                const pnl = (holding.currentPrice - holding.avgBuyPrice) * holding.amount;
                const pnlPercentage = ((holding.currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
                
                return (
                  <Card key={holding.id} className="p-6 hover:shadow-lg transition-all border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={holding.image} 
                          alt={holding.name}
                          className="h-12 w-12 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{holding.name}</h3>
                          <p className="text-muted-foreground">{holding.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {showValues ? `${holding.amount} ${holding.symbol}` : "••••••"}
                        </div>
                        <div className="text-muted-foreground">
                          {formatCurrency(holding.amount * holding.currentPrice)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {showValues ? `${pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(pnl))}` : "••••••"}
                        </div>
                        <div className={`text-sm ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {showValues ? `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%` : "••••"}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {holdings.length === 0 && (
              <Card className="p-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Ingen portfolio än</h3>
                <p className="text-muted-foreground mb-6">
                  Börja med att lägga till dina första krypto-investeringar
                </p>
                <Button className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till första holding
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Analys kommer snart</h3>
              <p className="text-muted-foreground">
                Vi arbetar på avancerade analysfunktioner för din portfolio
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PortfolioPage;