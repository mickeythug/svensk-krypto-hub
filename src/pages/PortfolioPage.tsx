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
  StarOff,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealPortfolio } from "@/hooks/useRealPortfolio";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useRealWatchlist } from "@/hooks/useRealWatchlist";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const PortfolioPage = () => {
  const isMobile = useIsMobile();
  const [showValues, setShowValues] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();
  
  // Real portfolio data hooks
  const { connectedWallets, primaryWallet, isLoading: walletsLoading } = useWalletConnection();
  const { 
    portfolioData, 
    transactions, 
    isLoading: portfolioLoading, 
    error: portfolioError,
    isConnected: wsConnected,
    pnl,
    refreshPortfolio 
  } = useRealPortfolio(primaryWallet || undefined);
  
  const { 
    watchlist, 
    isLoading: watchlistLoading, 
    toggleWatchlist, 
    isInWatchlist,
    refreshPrices 
  } = useRealWatchlist();

  const isLoading = walletsLoading || portfolioLoading || watchlistLoading;

  // Handle wallet connection errors
  const handleWalletError = () => {
    if (!primaryWallet) {
      toast.error("Ingen plånbok ansluten", {
        description: "Anslut en Solana-plånbok för att se din portfolio",
      });
    } else if (portfolioError) {
      toast.error("Fel vid hämtning av portfoliodata", {
        description: "Försök igen om en stund",
      });
    }
  };

  // Refresh all data
  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refreshPortfolio(),
        refreshPrices(),
      ]);
      toast.success("Data uppdaterad");
    } catch (error) {
      toast.error("Kunde inte uppdatera data");
    }
  };

  const formatCurrency = (amount: number) => {
    if (!showValues) return "••••••";
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!showValues) return "••••";
    return num.toFixed(2);
  };

  // Get real portfolio values
  const totalValue = portfolioData?.totalValue || 0;
  const totalPnL = pnl.pnl || 0;
  const pnlPercentage = pnl.percentage || 0;
  const holdingsCount = portfolioData ? (portfolioData.tokenBalances.length + (portfolioData.solBalance.balance > 0 ? 1 : 0)) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {/* Removed duplicate ticker - main header already includes CryptoPriceTicker */}
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
      {/* Removed duplicate ticker - keeping only main header ticker */}
      
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
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {!isMobile && "Uppdatera"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2"
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {!isMobile && (showValues ? "Dölj" : "Visa")}
            </Button>
            
            {!primaryWallet && (
              <Button 
                onClick={handleWalletError}
                className={`flex items-center gap-2 bg-gradient-primary ${isMobile ? 'px-3' : ''}`}
              >
                <Plus className="h-4 w-4" />
                {!isMobile && "Anslut plånbok"}
              </Button>
            )}
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
              {holdingsCount}
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
            {!primaryWallet ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Ingen plånbok ansluten</h3>
                <p className="text-muted-foreground mb-6">
                  Anslut din Solana-plånbok för att se din portfolio
                </p>
                <Button onClick={handleWalletError} className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Anslut plånbok
                </Button>
              </Card>
            ) : portfolioError ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Fel vid hämtning av data</h3>
                <p className="text-muted-foreground mb-6">
                  {portfolioError}
                </p>
                <Button onClick={refreshPortfolio} className="bg-gradient-primary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Försök igen
                </Button>
              </Card>
            ) : portfolioData ? (
              <div className="space-y-4">
                {/* SOL Balance */}
                {portfolioData.solBalance.balance > 0 && (
                  <Card className="group relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`relative ${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform shadow-lg`}>
                            SOL
                          </div>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} group-hover:text-primary transition-colors`}>
                            Solana
                          </h3>
                          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                            SOL
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} group-hover:text-primary transition-colors`}>
                          {showValues ? `${portfolioData.solBalance.balance.toFixed(4)} SOL` : "••••••"}
                        </div>
                        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                          {formatCurrency(portfolioData.solBalance.value)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-muted-foreground text-sm">
                          @ {formatCurrency(portfolioData.solBalance.price)}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Token Balances */}
                {portfolioData.tokenBalances.map((token) => (
                  <Card 
                    key={token.mint} 
                    className="group relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`relative ${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {token.image ? (
                            <img 
                              src={token.image} 
                              alt={token.name}
                              className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full group-hover:scale-110 transition-transform shadow-lg`}
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform shadow-lg`}>
                              {token.symbol.slice(0, 3)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} group-hover:text-primary transition-colors`}>
                            {token.name}
                          </h3>
                          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                            {token.symbol}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} group-hover:text-primary transition-colors`}>
                          {showValues ? `${formatNumber(token.uiAmount)} ${token.symbol}` : "••••••"}
                        </div>
                        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                          {formatCurrency(token.value || 0)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {token.price && (
                          <div className="text-muted-foreground text-sm">
                            @ {formatCurrency(token.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {portfolioData.tokenBalances.length === 0 && portfolioData.solBalance.balance === 0 && (
                  <Card className="p-12 text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Portfolio tom</h3>
                    <p className="text-muted-foreground mb-6">
                      Din anslutna plånbok har inga tokens eller SOL
                    </p>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Laddar portfolio data...</p>
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
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="h-10 w-10 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-white font-bold text-xs">
                                  {item.symbol.slice(0, 3)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-base">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.symbol.toUpperCase()}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist({ symbol: item.symbol, name: item.name, chain: item.chain })}
                              className="p-2 text-yellow-500 hover:text-yellow-600"
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Pris</div>
                              <div className="font-semibold">{item.price ? formatCurrency(item.price) : '—'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">24h %</div>
                              <div className={`font-semibold ${(item.change24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {item.change24h ? `${item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(2)}%` : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Market Cap</div>
                              <div className="font-semibold">
                                {item.marketCap ? formatCurrency(item.marketCap) : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Volym 24h</div>
                              <div className="font-semibold">
                                {item.volume ? formatCurrency(item.volume) : '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Desktop Layout
                        <div className="grid grid-cols-7 gap-4 p-4 items-center">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="h-8 w-8 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-white font-bold text-xs">
                                {item.symbol.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.symbol.toUpperCase()}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist({ symbol: item.symbol, name: item.name, chain: item.chain })}
                              className="p-1 text-yellow-500 hover:text-yellow-600 ml-2"
                            >
                              <Star className="h-3 w-3 fill-current" />
                            </Button>
                          </div>
                          
                          <div className="text-right font-semibold">
                            {item.price ? formatCurrency(item.price) : '—'}
                          </div>
                          
                          <div className={`text-right font-semibold ${(item.change1h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {item.change1h ? `${item.change1h >= 0 ? '+' : ''}${item.change1h.toFixed(2)}%` : '—'}
                          </div>
                          
                          <div className={`text-right font-semibold ${(item.change24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {item.change24h ? `${item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(2)}%` : '—'}
                          </div>
                          
                          <div className={`text-right font-semibold ${(item.change7d || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {item.change7d ? `${item.change7d >= 0 ? '+' : ''}${item.change7d.toFixed(2)}%` : '—'}
                          </div>
                          
                          <div className="text-right font-semibold">
                            {item.marketCap ? formatCurrency(item.marketCap) : '—'}
                          </div>
                          
                          <div className="text-right font-semibold">
                            {item.volume ? formatCurrency(item.volume) : '—'}
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