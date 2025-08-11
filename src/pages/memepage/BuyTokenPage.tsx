import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, DollarSign, BarChart3, Info, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';

const BuyTokenPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [activeView, setActiveView] = useState<'info' | 'chart'>('info');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Mock token data - in real app, this would come from API
  const mockTokenData = {
    symbol: 'BONK',
    name: 'Bonk Inu',
    logo: '/src/assets/crypto-logos/btc.png', // placeholder
    price: '$0.000015',
    change24h: '+12.5%',
    marketCap: '$1.2B',
    holders: '125,000',
    volume24h: '$45M',
    contractAddress: '5vMjf47c8LKLqK7ZiYBG8pTMRiRgTJyqVnkPqUPmmp1',
    socials: {
      twitter: '@bonk_inu',
      telegram: 't.me/bonkinu',
      website: 'bonkinu.com'
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

  const handleSearch = () => {
    if (searchTerm.toLowerCase() === 'bonk' || searchTerm === mockTokenData.contractAddress) {
      setSelectedToken(mockTokenData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/meme')}
            className="h-10 w-10 rounded-full"
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

      <main className={`${isMobile ? 'pb-24 px-4' : 'px-8'} pt-6`}>
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
                placeholder="Sök token namn eller klistra in contract address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 text-base border-primary/30 focus:border-primary"
              />
              <Button 
                onClick={handleSearch}
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['BONK', 'DOGE', 'SHIB', 'PEPE'].map((token) => (
                <Badge 
                  key={token}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setSearchTerm(token)}
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
            <Card className="bg-gradient-to-br from-card to-card/80 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedToken.logo} 
                      alt={selectedToken.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkY4RkMiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwMCI+e3NlbGVjdGVkVG9rZW4uc3ltYm9sWzBdfTwvdGV4dD4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedToken.name}</h2>
                    <p className="text-muted-foreground">{selectedToken.symbol}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-semibold">{selectedToken.price}</span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        {selectedToken.change24h}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Market Cap</span>
                    </div>
                    <p className="font-semibold">{selectedToken.marketCap}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Holders</span>
                    </div>
                    <p className="font-semibold">{selectedToken.holders}</p>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex bg-muted rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setActiveView('info')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                      activeView === 'info' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    Info & Köp
                  </button>
                  <button
                    onClick={() => setActiveView('chart')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                      activeView === 'chart' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Chart
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Content based on active view */}
            {activeView === 'info' ? (
              <div className="space-y-6">
                {/* Token Stats */}
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Token Statistik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Volym</span>
                      <span className="font-semibold">{selectedToken.volume24h}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract Address</span>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {selectedToken.contractAddress.slice(0, 8)}...{selectedToken.contractAddress.slice(-8)}
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-muted-foreground">Sociala länkar</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">Twitter: {selectedToken.socials.twitter}</Badge>
                        <Badge variant="outline">Web: {selectedToken.socials.website}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Buy/Sell Section */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Handla {selectedToken.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="h-12 text-lg font-semibold bg-green-600 hover:bg-green-700">
                        Köp
                      </Button>
                      <Button variant="outline" className="h-12 text-lg font-semibold border-red-500 text-red-500 hover:bg-red-500/10">
                        Sälj
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Handeln kommer att öppnas i din anslutna plånbok
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {selectedToken.symbol} Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Chart kommer här</p>
                      <p className="text-sm text-muted-foreground">TradingView integration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedToken && (
          <Card className="bg-card/30 backdrop-blur-sm border-dashed border-primary/30">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sök efter en token</h3>
              <p className="text-muted-foreground">
                Använd sökrutan ovan för att hitta och analysera meme tokens
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default BuyTokenPage;