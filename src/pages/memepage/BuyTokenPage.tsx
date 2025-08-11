import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, DollarSign, BarChart3, Info, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';

const BuyTokenPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [activeView, setActiveView] = useState<'info' | 'chart'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Expanded mock token data with more realistic information
  const mockTokens = {
    'BONK': {
      symbol: 'BONK',
      name: 'Bonk Inu',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkE1MDAiLz4KPHR4dCB4PSIyMCIgeT0iMjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGIj5CTks8L3RleHQ+Cjwvc3ZnPg==',
      price: '$0.000015234',
      change24h: '+12.5%',
      marketCap: '$1.2B',
      holders: '125,847',
      volume24h: '$45.2M',
      contractAddress: '5vMjf47c8LKLqK7ZiYBG8pTMRiRgTJyqVnkPqUPmmp1',
      supply: '100T',
      verified: true,
      risk: 'Medium',
      socials: {
        twitter: '@bonk_inu',
        telegram: 't.me/bonkinu',
        website: 'bonkinu.com'
      }
    },
    'DOGE': {
      symbol: 'DOGE',
      name: 'Dogecoin',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNDM0E2MzQiLz4KPHR4dCB4PSIyMCIgeT0iMjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGIj5ETzwvdGV4dD4KPC9zdmc+',
      price: '$0.087432',
      change24h: '+8.2%',
      marketCap: '$12.8B',
      holders: '4.2M',
      volume24h: '$892M',
      contractAddress: 'DGE8KBPyqUeHFXnhX9AaqnJGwFcR34F7jjx5uqG7h6jk',
      supply: '146B',
      verified: true,
      risk: 'Low',
      socials: {
        twitter: '@dogecoin',
        telegram: 't.me/dogecoin',
        website: 'dogecoin.com'
      }
    }
  };

  useEffect(() => {
    const title = 'Köp Meme Tokens - Crypto Network Sweden';
    const description = 'Köp och sälj meme tokens med avancerad analys och realtidsdata';
    document.title = title;
    
    const ensureTag = (selector: string, create: () => HTMLElement) => {
      const existing = document.head.querySelector(selector);
      if (existing) return existing as HTMLElement;
      const el = create();
      document.head.appendChild(el);
      return el;
    };

    const md = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    md.setAttribute('content', description);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const searchKey = searchTerm.toUpperCase();
    const token = mockTokens[searchKey as keyof typeof mockTokens];
    
    if (token) {
      setSelectedToken(token);
      toast({
        title: "Token hittad!",
        description: `${token.name} (${token.symbol}) laddad framgångsrikt.`,
      });
    } else {
      toast({
        title: "Token ej hittad",
        description: "Försök med BONK eller DOGE för demo.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleBuy = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Ogiltigt belopp",
        description: "Ange ett giltigt belopp att köpa för.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Köp initierat",
      description: `Öppnar wallet för att köpa ${amount} SOL av ${selectedToken?.symbol}`,
    });
  };

  const handleSell = () => {
    toast({
      title: "Sälj initierat", 
      description: `Öppnar wallet för att sälja ${selectedToken?.symbol}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <main className={`${isMobile ? 'pb-24 px-4 pt-12' : 'px-8 pt-12'}`}>
        {/* Internal Page Header - Extra margin to prevent overlap */}
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 mb-6 shadow-lg mt-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/meme')}
              className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Köp Meme Tokens
              </h1>
              <p className="text-sm text-muted-foreground">Handla med avancerad analys</p>
            </div>
          </div>
        </div>
        {/* Search Section */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Sök Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Sök token namn (BONK, DOGE) eller klistra in contract address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-12 h-12 text-base border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSearch}
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['BONK', 'DOGE'].map((token) => (
                <Badge 
                  key={token}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/20 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    setSearchTerm(token);
                    handleSearch();
                  }}
                >
                  {token}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Details */}
        {selectedToken && (
          <div className="space-y-6">
            {/* Token Header */}
            <Card className="bg-gradient-to-br from-card/90 to-card/60 border-primary/30 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                      <img
                        src={selectedToken.logo} 
                        alt={selectedToken.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    {selectedToken.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold">{selectedToken.name}</h2>
                      <Badge variant={selectedToken.risk === 'Low' ? 'default' : selectedToken.risk === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">
                        {selectedToken.risk} Risk
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{selectedToken.symbol} • Supply: {selectedToken.supply}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-bold">{selectedToken.price}</span>
                      <Badge variant="secondary" className={`${
                        selectedToken.change24h.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      } animate-pulse`}>
                        {selectedToken.change24h}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Market Cap</span>
                    </div>
                    <p className="font-bold text-sm">{selectedToken.marketCap}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Holders</span>
                    </div>
                    <p className="font-bold text-sm">{selectedToken.holders}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">24h Volume</span>
                    </div>
                    <p className="font-bold text-sm">{selectedToken.volume24h}</p>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex bg-muted/80 rounded-xl p-1 mb-6 backdrop-blur-sm">
                  <button
                    onClick={() => setActiveView('info')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeView === 'info' 
                        ? 'bg-background text-foreground shadow-lg scale-[0.98] font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    Info & Handel
                  </button>
                  <button
                    onClick={() => setActiveView('chart')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeView === 'chart' 
                        ? 'bg-background text-foreground shadow-lg scale-[0.98] font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Pris Chart
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Content based on active view */}
            {activeView === 'info' ? (
              <div className="space-y-6">
                {/* Token Stats */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Token Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-sm">Total Supply</span>
                        <p className="font-bold">{selectedToken.supply}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-sm">Verified</span>
                        <p className="font-bold text-green-400">{selectedToken.verified ? 'Verified ✓' : 'Unverified'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">Contract Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-muted/80 px-3 py-2 rounded-lg flex-1">
                          {selectedToken.contractAddress.slice(0, 8)}...{selectedToken.contractAddress.slice(-8)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedToken.contractAddress);
                            toast({ title: "Kopierad!", description: "Contract address kopierad till urklipp." });
                          }}
                        >
                          Kopiera
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <span className="text-muted-foreground text-sm">Sociala länkar</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="hover:bg-blue-500/10 cursor-pointer">
                          Twitter: {selectedToken.socials.twitter}
                        </Badge>
                        <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                          Web: {selectedToken.socials.website}
                        </Badge>
                        <Badge variant="outline" className="hover:bg-blue-400/10 cursor-pointer">
                          Telegram: {selectedToken.socials.telegram}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Buy/Sell Section */}
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Handla {selectedToken.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Belopp (SOL)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-12 text-lg font-mono bg-background/50"
                      />
                      <div className="flex gap-2">
                        {['0.1', '0.5', '1.0', '5.0'].map((preset) => (
                          <Button
                            key={preset}
                            variant="outline"
                            size="sm"
                            onClick={() => setAmount(preset)}
                            className="text-xs"
                          >
                            {preset} SOL
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={handleBuy}
                        className="h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg"
                      >
                        Köp Nu
                      </Button>
                      <Button 
                        onClick={handleSell}
                        variant="outline" 
                        className="h-12 text-lg font-semibold border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                      >
                        Sälj
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
                      💡 Handeln kommer att öppnas i din anslutna plånbok (Phantom, Solflare, etc.)
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {selectedToken.symbol} Pris Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Avancerat Chart</h3>
                      <p className="text-muted-foreground mb-1">TradingView integration kommer här</p>
                      <p className="text-sm text-muted-foreground">Realtids prisdata och teknisk analys</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Badge variant="secondary">Live Data</Badge>
                        <Badge variant="secondary">Technical Analysis</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Empty state */}
        {!selectedToken && (
          <Card className="bg-gradient-to-br from-card/30 to-background/30 backdrop-blur-sm border-dashed border-primary/30 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upptäck Meme Tokens</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Använd sökfunktionen för att hitta och analysera meme tokens. Få detaljerad information, prisdata och handelsverktyg.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-xs">Realtids data</Badge>
                <Badge variant="outline" className="text-xs">Säker handel</Badge>
                <Badge variant="outline" className="text-xs">Avancerad analys</Badge>
              </div>
              <Button 
                onClick={() => setSearchTerm('BONK')}
                className="bg-primary hover:bg-primary/90"
              >
                Prova med BONK
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default BuyTokenPage;