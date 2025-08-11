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
  Settings,
  Star,
  StarOff
} from "lucide-react";
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatchlist } from "@/hooks/useWatchlist";

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
  const isMobile = useIsMobile();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [showValues, setShowValues] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { cryptoPrices, isLoading } = useCryptoData();
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();

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
      {isMobile ? <MobileHeader title="PORTFÖLJ" /> : <Header />}
      {!isMobile && <CryptoPriceTicker />}
      
      <main className={`container mx-auto px-4 ${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-20'}`}>
        {/* Header Section */}
        <div className={`${isMobile ? 'flex flex-col space-y-4 mb-6' : 'flex items-center justify-between mb-8'}`}>
          <div>
            <h1 className={`font-crypto ${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl lg:text-6xl'} font-bold mb-3`}>
              <span className="text-brand-turquoise">MIN</span>
              <span className="text-brand-white"> PORT</span>
              <span className="text-brand-turquoise">FÖLJ</span>
            </h1>
            <p className={`font-display ${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground`}>
              Spåra dina krypto-investeringar
            </p>
          </div>
          
          <div className={`flex items-center gap-3 ${isMobile ? 'self-end' : ''}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2"
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {!isMobile && (showValues ? "Dölj" : "Visa")}
            </Button>
            <Button className={`flex items-center gap-2 bg-gradient-primary ${isMobile ? 'px-3' : ''}`}>
              <Plus className="h-4 w-4" />
              {!isMobile && "Lägg till"}
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className={`${isMobile ? 'grid grid-cols-1 gap-4 mb-6' : 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'}`}>
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-primary/10 to-accent/10 border-border/30`}>
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

          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-success/10 to-warning/10 border-border/30`}>
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

          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-accent/10 to-secondary/10 border-border/30`}>
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
          <TabsList className="grid grid-cols-3 h-12 p-1 bg-secondary/10 rounded-xl border border-border/20 w-full max-w-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
            >
              <Wallet className="h-4 w-4" />
              <span>Översikt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="watchlist" 
              className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
            >
              <Star className="h-4 w-4" />
              <span>Watchlist</span>
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
                  <Card 
                    key={holding.id} 
                    className="group relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`relative ${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={holding.image} 
                            alt={holding.name}
                            className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full group-hover:scale-110 transition-transform shadow-lg`}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} group-hover:text-primary transition-colors`}>
                            {holding.name}
                          </h3>
                          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                            {holding.symbol}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} group-hover:text-primary transition-colors`}>
                          {showValues ? `${holding.amount} ${holding.symbol}` : "••••••"}
                        </div>
                        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                          {formatCurrency(holding.amount * holding.currentPrice)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${isMobile ? 'text-sm' : ''} ${pnl >= 0 ? 'text-success' : 'text-destructive'} group-hover:scale-105 transition-transform`}>
                          {showValues ? `${pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(pnl))}` : "••••••"}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
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

          <TabsContent value="watchlist" className="mt-6">
            {watchlist.length > 0 ? (
              <div className="space-y-4">
                {/* Watchlist Table Header */}
                <div className={`${isMobile ? 'hidden' : 'grid grid-cols-7 gap-4 p-4 bg-muted/30 rounded-lg border'}`}>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider">Namn</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">Pris</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">1h %</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">24h %</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">7d %</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">Market Cap</div>
                  <div className="font-crypto text-xs text-muted-foreground uppercase tracking-wider text-right">Volym(24h)</div>
                </div>

                {/* Watchlist Items */}
                {watchlist.map((item) => {
                  const cryptoData = cryptoPrices?.find(c => c.symbol === item.symbol);
                  
                  if (!cryptoData) return null;

                  return (
                    <Card 
                      key={item.id} 
                      className="group relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                    >
                      {isMobile ? (
                        // Mobile Layout
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={cryptoData.image} 
                                alt={cryptoData.name}
                                className="h-10 w-10 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div>
                                <h3 className="font-semibold text-base">{cryptoData.name}</h3>
                                <p className="text-sm text-muted-foreground">{cryptoData.symbol.toUpperCase()}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist({ id: item.id, symbol: item.symbol, name: item.name })}
                              className="p-2 text-yellow-500 hover:text-yellow-600"
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Pris</div>
                              <div className="font-semibold">{formatCurrency(cryptoData.price)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">24h %</div>
                              <div className={`font-semibold ${cryptoData.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.change24h.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Market Cap</div>
                              <div className="font-semibold">
                                {cryptoData.marketCap || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Volym 24h</div>
                              <div className="font-semibold">
                                {cryptoData.volume || '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Desktop Layout
                        <div className="grid grid-cols-7 gap-4 p-4 items-center">
                          <div className="flex items-center gap-3">
                            <img 
                              src={cryptoData.image} 
                              alt={cryptoData.name}
                              className="h-8 w-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div>
                              <div className="font-semibold">{cryptoData.name}</div>
                              <div className="text-sm text-muted-foreground">{cryptoData.symbol.toUpperCase()}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist({ id: item.id, symbol: item.symbol, name: item.name })}
                              className="p-1 text-yellow-500 hover:text-yellow-600 ml-2"
                            >
                              <Star className="h-3 w-3 fill-current" />
                            </Button>
                          </div>
                          
                          <div className="text-right font-semibold">
                            {formatCurrency(cryptoData.price)}
                          </div>
                          
                          <div className={`text-right font-semibold ${(cryptoData.change1h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {(cryptoData.change1h || 0) >= 0 ? '+' : ''}{(cryptoData.change1h || 0).toFixed(2)}%
                          </div>
                          
                          <div className={`text-right font-semibold ${cryptoData.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.change24h.toFixed(2)}%
                          </div>
                          
                          <div className={`text-right font-semibold ${(cryptoData.change7d || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {(cryptoData.change7d || 0) >= 0 ? '+' : ''}{(cryptoData.change7d || 0).toFixed(2)}%
                          </div>
                          
                          <div className="text-right font-semibold">
                            {cryptoData.marketCap || '—'}
                          </div>
                          
                          <div className="text-right font-semibold">
                            {cryptoData.volume || '—'}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Din watchlist är tom</h3>
                <p className="text-muted-foreground mb-6">
                  Börja med att lägga till kryptovalutor genom att klicka på stjärnan
                </p>
                <Button 
                  onClick={() => window.location.href = '/marknad'}
                  className="bg-gradient-primary"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Utforska marknaden
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
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default PortfolioPage;