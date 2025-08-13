import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Zap,
  Link,
  User
} from "lucide-react";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import ConnectWalletButton from "@/components/web3/ConnectWalletButton";
import { WalletManagementModal } from "@/components/WalletManagementModal";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWalletAuthStatus } from "@/hooks/useWalletAuthStatus";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useSolBalance } from "@/hooks/useSolBalance";
import { useTradingWallet } from "@/hooks/useTradingWallet";
import { useNavigate } from "react-router-dom";
import { formatUsd } from "@/lib/utils";

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  image: string;
  chain: 'SOL' | 'ETH';
}

const PortfolioPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [showValues, setShowValues] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Auth and wallet hooks
  const { fullyAuthed, authedSol, authedEvm, solAddress, evmAddress } = useWalletAuthStatus();
  const { data: evmBalances, loading: evmLoading } = useWalletBalances(evmAddress);
  const { balance: solBalance, loading: solLoading } = useSolBalance();
  const { walletAddress: tradingWalletAddress, loading: tradingLoading, createIfMissing } = useTradingWallet();
  
  const { cryptoPrices, isLoading: cryptoLoading } = useCryptoData();
  const { watchlist, toggleWatchlist } = useWatchlist();

  // Initialize trading wallet ONLY once when authenticated (don't create multiple)
  useEffect(() => {
    // Remove automatic creation - let it load existing wallet first
    // User can manually create via the wallet management modal if needed
  }, [fullyAuthed]);

  // Convert wallet balances to holdings
  useEffect(() => {
    if (!fullyAuthed || !cryptoPrices?.length) return;

    console.log('Portfolio: Converting wallet balances to holdings');
    console.log('Auth status:', { authedSol, authedEvm, solAddress, evmAddress });
    console.log('Balances:', { solBalance, evmBalances });

    const newHoldings: PortfolioHolding[] = [];

    // Add SOL balance if authenticated with Solana
    if (authedSol && solBalance && solBalance > 0) {
      const solPrice = cryptoPrices.find(c => c.symbol === "SOL");
      console.log('SOL price found:', solPrice);
      if (solPrice) {
        newHoldings.push({
          id: "sol-main",
          symbol: "SOL",
          name: "Solana",
          amount: solBalance,
          avgBuyPrice: solPrice.price, // Using current price as avg for demo
          currentPrice: solPrice.price,
          image: solPrice.image,
          chain: 'SOL'
        });
      }
    }

    // Add ETH balance if authenticated with Ethereum
    if (authedEvm && evmBalances?.length) {
      evmBalances.forEach((balance) => {
        console.log('Processing EVM balance:', balance);
        if (balance.balanceWei > 0n) {
          const ethPrice = cryptoPrices.find(c => c.symbol === "ETH");
          if (ethPrice && balance.symbol === "ETH") {
            newHoldings.push({
              id: `eth-${balance.chainId}`,
              symbol: "ETH",
              name: "Ethereum",
              amount: parseFloat(balance.balance),
              avgBuyPrice: ethPrice.price,
              currentPrice: ethPrice.price,
              image: ethPrice.image,
              chain: 'ETH'
            });
          }
        }
      });
    }

    console.log('Final holdings:', newHoldings);
    setHoldings(newHoldings);
  }, [authedSol, authedEvm, solBalance, evmBalances, cryptoPrices, fullyAuthed]);

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
    return formatUsd(amount);
  };

  const totalValue = calculateTotalValue();
  const totalPnL = calculateTotalPnL();
  const pnlPercentage = calculatePnLPercentage();

  // Show authentication required screen
  if (!fullyAuthed) {
    return (
      <div className="min-h-screen bg-background">
        {isMobile ? <MobileHeader title="PORTFÖLJ" /> : <Header />}
        
        <main className={`container mx-auto px-4 ${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-20'}`}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="relative">
              <ShieldCheck className="h-20 w-20 text-primary mx-auto mb-6" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-destructive rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-md">
              <h1 className="font-crypto text-3xl font-bold">
                <span className="text-brand-turquoise">AUTENTISERING</span>
                <span className="text-brand-white"> KRÄVS</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Du måste ansluta och autentisera din wallet för att komma åt din portfölj
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 max-w-md w-full">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>Steg 1: Anslut din wallet</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Steg 2: Signera autentisering</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <PieChart className="h-4 w-4" />
                  <span>Steg 3: Utforska din portfölj</span>
                </div>
                
                <div className="pt-4">
                  <ConnectWalletButton />
                </div>
              </div>
            </Card>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              Tillbaka till startsidan
            </Button>
          </div>
        </main>
        
        {isMobile && <MobileBottomNavigation />}
      </div>
    );
  }

  // Show loading state with better error handling
  if (cryptoLoading || (fullyAuthed && (solLoading || evmLoading || tradingLoading))) {
    console.log('Portfolio: Loading state', { cryptoLoading, solLoading, evmLoading, tradingLoading });
    return (
      <div className="min-h-screen bg-background">
        {isMobile ? <MobileHeader title="PORTFÖLJ" /> : <Header />}
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {cryptoLoading ? 'Laddar marknadspriser...' : 
                 solLoading ? 'Laddar Solana balans...' :
                 evmLoading ? 'Laddar Ethereum balans...' :
                 tradingLoading ? 'Laddar trading wallet...' :
                 'Laddar portföljdata...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader title="PORTFÖLJ" /> : <Header />}
      
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
              Realtidsdata från dina anslutna wallets
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              {!isMobile && "MINA WALLETS"}
            </Button>
            <ConnectWalletButton />
          </div>
        </div>

        {/* Wallet Status Cards */}
        <div className={`${isMobile ? 'grid grid-cols-1 gap-4 mb-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'}`}>
          {/* Connected Wallet */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-success/10 to-accent/10 border-success/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Ansluten Wallet</h3>
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div className="text-lg font-bold text-success mb-2">
              {authedSol ? 'Solana' : authedEvm ? 'Ethereum' : 'Ingen'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {authedSol ? solAddress : authedEvm ? evmAddress : 'Ej ansluten'}
            </div>
          </Card>

          {/* Trading Wallet */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Trading Wallet</h3>
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary mb-2">
              {tradingWalletAddress ? 'Aktiv' : 'Skapar...'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {tradingWalletAddress ? `${tradingWalletAddress.slice(0, 8)}...${tradingWalletAddress.slice(-8)}` : 'Genererar automatiskt...'}
            </div>
            <div className="text-xs text-secondary mt-1">
              Auto-genererad för plattformen
            </div>
          </Card>

          {/* Total Value */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-accent/10 to-warning/10 border-accent/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Totalt värde</h3>
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent mb-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {holdings.length > 0 ? `Från ${holdings.length} holdings` : 'Portfolio balans'}
            </div>
            <div className="text-xs text-secondary mt-1">
              {totalValue > 0 ? 'Realtidspriser' : 'Väntar på data'}
            </div>
          </Card>

          {/* Holdings Count */}
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-secondary/10 to-muted/10 border-secondary/30`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Holdings</h3>
              <PieChart className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-secondary mb-2">
              {holdings.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Olika kryptovalutor
            </div>
            <div className="text-xs text-secondary mt-1">
              {holdings.length > 0 ? 'Live balancer' : 'Ingen data än'}
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
              {holdings.length > 0 ? holdings.map((holding) => {
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
                          <Badge variant="secondary" className="absolute -bottom-1 -right-1 h-5 w-5 p-0 text-xs">
                            {holding.chain}
                          </Badge>
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
                          {showValues ? `${holding.amount.toFixed(6)} ${holding.symbol}` : "••••••"}
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
              }) : (
                <Card className="p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Inga holdings hittades</h3>
                  <p className="text-muted-foreground mb-6">
                    {solBalance === null && evmBalances?.length === 0 ? 
                      'Det verkar som att dina wallets inte har några balanser, eller så har vi problem att hämta data från blockchain-nätverket.' :
                      'Dina anslutna wallets verkar vara tomma eller så använder vi inte stödda tokens ännu'
                    }
                  </p>
                  
                  {/* Debug info for development */}
                  <div className="text-xs text-muted-foreground mb-4 space-y-2">
                    <div>Debug info:</div>
                    <div>SOL Balance: {solBalance !== null ? `${solBalance} SOL` : 'Laddar...'}</div>
                    <div>ETH Balances: {evmBalances?.length || 0} found</div>
                    <div>Crypto Prices: {cryptoPrices?.length || 0} loaded</div>
                    <div>Auth Status: SOL={authedSol ? '✓' : '✗'}, ETH={authedEvm ? '✓' : '✗'}</div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/meme')} className="bg-gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Börja handla
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                    >
                      Ladda om
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            {watchlist.length > 0 ? (
              <div className="space-y-4">
                {watchlist.map((item) => {
                  const cryptoData = cryptoPrices?.find(c => c.symbol === item.symbol);
                  
                  if (!cryptoData) return null;

                  return (
                    <Card 
                      key={item.id} 
                      className="group relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                    >
                      <div className={`p-4 flex items-center justify-between`}>
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
                        
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(cryptoData.price)}</div>
                          <div className={`text-sm ${cryptoData.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.change24h.toFixed(2)}%
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
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Din watchlist är tom</h3>
                <p className="text-muted-foreground mb-6">
                  Börja med att lägga till kryptovalutor från marknaden
                </p>
                <Button 
                  onClick={() => navigate('/marknad')}
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
              <h3 className="font-semibold text-lg mb-2">Avancerad analys kommer snart</h3>
              <p className="text-muted-foreground">
                Vi utvecklar kraftfulla analysverktyg för din portfölj med AI-insikter
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <WalletManagementModal 
        open={showWalletModal} 
        onOpenChange={setShowWalletModal} 
      />
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default PortfolioPage;