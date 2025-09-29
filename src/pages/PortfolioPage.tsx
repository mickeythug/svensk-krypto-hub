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
import MyWalletsSection from "@/components/portfolio/MyWalletsSection";
import WalletSettingsPanel from "@/components/portfolio/WalletSettingsPanel";

const PortfolioPage = () => {
  const isMobile = useIsMobile();
  const [showValues, setShowValues] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
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
      toast.error('No wallet connected', {
        description: 'Please connect your wallet first',
      });
    } else if (portfolioError) {
      toast.error('Portfolio error', {
        description: 'Please try again later',
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
      toast.success('Portfolio updated');
    } catch (error) {
      toast.error('Update failed');
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
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader title="PORTFOLIO" /> : <Header />}
      
      <main className={`container mx-auto px-4 ${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-20'}`}>
        {/* Header Section */}
        <div className={`${isMobile ? 'flex flex-col space-y-4 mb-6' : 'flex items-center justify-between mb-8'}`}>
          <div>
            <h1 className={`font-orbitron ${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl lg:text-6xl'} font-bold mb-3 tracking-wider`}>
              <span className="text-white">CRY</span><span className="text-[#12E19F]">PTO</span><span className="text-white"> NE</span><span className="text-[#12E19F]">TWO</span><span className="text-white">RK </span><span className="text-[#12E19F]">POR</span><span className="text-white">TFO</span><span className="text-[#12E19F]">LIO</span>
            </h1>
            <p className={`font-display ${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground`}>
              Portfolio Overview
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
              {!isMobile && 'Refresh'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2"
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {!isMobile && (showValues ? 'Hide Values' : 'Show Values')}
            </Button>
            
            {!primaryWallet && (
              <Button 
                onClick={handleWalletError}
                className={`flex items-center gap-2 bg-gradient-primary ${isMobile ? 'px-3' : ''}`}
              >
                <Plus className="h-4 w-4" />
                {!isMobile && 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className={`${isMobile ? 'grid grid-cols-1 gap-4 mb-6' : 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'}`}>
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-primary/10 to-accent/10 border-border/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Portfolio Overview
            </div>
          </Card>

          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-success/10 to-warning/10 border-border/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Total PnL</h3>
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
              Cryptocurrencies
            </div>
          </Card>
        </div>

        {/* Portfolio Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-12 p-1 bg-secondary/10 rounded-xl border border-border/20 w-full max-w-3xl">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">
              <Wallet className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="wallets" className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">
              <Wallet className="h-4 w-4" />
              <span>Wallets</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">
              <Star className="h-4 w-4" />
              <span>Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center space-x-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">
              <Target className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {!primaryWallet ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No wallet connected</h3>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet first
                </p>
                <Button onClick={handleWalletError} className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </Card>
            ) : portfolioError ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Portfolio Error</h3>
                <p className="text-muted-foreground mb-6">
                  {portfolioError}
                </p>
                <Button onClick={refreshPortfolio} className="bg-gradient-primary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </Card>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Portfolio overview will be shown here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wallets" className="mt-6">
            <MyWalletsSection />
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <div className="text-center p-8">
              <p className="text-muted-foreground">Watchlist will be shown here</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <WalletSettingsPanel />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center p-8">
              <p className="text-muted-foreground">Analytics will be shown here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default PortfolioPage;