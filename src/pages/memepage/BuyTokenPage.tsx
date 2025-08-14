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
import { useTradingWallet } from '@/hooks/useTradingWallet';
import { usePumpTrade } from '@/hooks/usePumpTrade';
import TradingWalletOnboardingModal from './components/TradingWalletOnboardingModal';
import { useLanguage } from '@/contexts/LanguageContext';

const BuyTokenPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [activeView, setActiveView] = useState<'info' | 'chart'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { walletAddress, privateKey, acknowledged, createIfMissing, confirmBackup } = useTradingWallet();
  const { loading: tradeLoading, trade } = usePumpTrade();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const title = t('meme.buyToken.title') + ' - Crypto Network Sweden';
    const description = t('meme.buyToken.description');
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
  }, [t]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const mint = searchTerm.trim();
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.functions.invoke('dextools-proxy', {
        body: { action: 'tokenFull', address: mint },
      });
      if (error) throw error;
      const d: any = data || {};
      const price = d?.price?.price ?? null;
      const variation24h = d?.price?.variation24h ?? 0;
      const mcap = d?.info?.mcap ?? null;
      const holders = d?.info?.holders ?? null;
      const socials = d?.meta?.socialInfo || {};

      const formatPrice = (p: number | null) => {
        if (p == null) return '—';
        if (p < 0.000001) return `$${p.toExponential(2)}`;
        if (p < 0.01) return `$${p.toFixed(6)}`;
        if (p < 1) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
      };
      const formatNumber = (n: number | null) => (n == null ? '—' : Number(n).toLocaleString());

      setSelectedToken({
        symbol: d?.meta?.symbol || mint.slice(0, 4).toUpperCase(),
        name: d?.meta?.name || 'Token',
        logo: d?.meta?.logo || '/placeholder.svg',
        price: formatPrice(price),
        change24h: `${variation24h >= 0 ? '+' : ''}${Number(variation24h).toFixed(2)}%`,
        marketCap: mcap == null ? '—' : `$${formatNumber(mcap)}`,
        holders: formatNumber(holders),
        volume24h: d?.poolPrice?.volume24h ? `$${formatNumber(d.poolPrice.volume24h)}` : '—',
        contractAddress: mint,
        supply: d?.info?.totalSupply ? formatNumber(d.info.totalSupply) : '—',
        verified: (d?.audit?.isContractRenounced === 'yes') && (d?.audit?.isHoneypot === 'no'),
        risk: d?.audit?.isHoneypot === 'yes' ? 'High' : 'Low',
        socials: { twitter: socials.twitter || '', telegram: socials.telegram || '', website: socials.website || '' },
      });
      toast({ title: t('meme.buyToken.tokenFound'), description: `${(d?.meta?.symbol || 'TOKEN')} — ${mint.slice(0,8)}...` });
    } catch (e: any) {
      console.error('DEXTools token fetch failed', e);
      toast({ title: t('meme.buyToken.fetchFailed'), description: t('meme.buyToken.checkAddress'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: t('meme.buyToken.invalidAmount'),
        description: t('meme.buyToken.enterValidAmount'),
        variant: "destructive",
      });
      return;
    }
    toast({
      title: t('meme.buyToken.buyInitiated'),
      description: `${t('meme.buyToken.buyDescription')} ${amount} SOL ${t('common.of')} ${selectedToken?.symbol}`,
    });
  };

  const handleSell = () => {
    toast({
      title: t('meme.buyToken.sellInitiated'), 
      description: `${t('meme.buyToken.sellDescription')} ${selectedToken?.symbol}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 font-inter">
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
                {t('meme.buyToken.title')}
              </h1>
            </div>
          </div>
        </div>
        {/* Search Section */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              {t('common.search')} Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder={t('meme.buyToken.searchPlaceholder')}
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
                        {selectedToken.risk} {t('meme.buyToken.risk')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{selectedToken.symbol} • {t('meme.buyToken.totalSupply')}: {selectedToken.supply}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-bold font-numbers">{selectedToken.price}</span>
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
                      <span className="text-xs font-medium">{t('meme.buyToken.marketCap')}</span>
                    </div>
                    <p className="font-bold text-sm font-numbers">{selectedToken.marketCap}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">{t('meme.buyToken.holders')}</span>
                    </div>
                    <p className="font-bold text-sm font-numbers">{selectedToken.holders}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">{t('meme.buyToken.volume24h')}</span>
                    </div>
                    <p className="font-bold text-sm font-numbers">{selectedToken.volume24h}</p>
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
                    {t('meme.buyToken.infoTrade')}
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
                    {t('meme.buyToken.priceChart')}
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
                      {t('meme.buyToken.tokenInformation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-sm">{t('meme.buyToken.totalSupply')}</span>
                        <p className="font-bold font-numbers">{selectedToken.supply}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-muted-foreground text-sm">{t('meme.buyToken.verifiedStatus')}</span>
                        <p className="font-bold text-green-400">{selectedToken.verified ? t('meme.buyToken.verified') : t('meme.buyToken.unverified')}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">{t('meme.buyToken.contractAddress')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-muted/80 px-3 py-2 rounded-lg flex-1">
                          {selectedToken.contractAddress.slice(0, 8)}...{selectedToken.contractAddress.slice(-8)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedToken.contractAddress);
                            toast({ title: t('meme.buyToken.copied'), description: t('meme.buyToken.copiedDescription') });
                          }}
                        >
                          {t('meme.buyToken.copy')}
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <span className="text-muted-foreground text-sm">{t('meme.buyToken.socialLinks')}</span>
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
                      {t('meme.buyToken.trade')} {selectedToken.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">{t('meme.buyToken.amount')} ({t('meme.buyToken.sol')})</label>
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
                        {t('meme.buyToken.buyNow')}
                      </Button>
                      <Button 
                        onClick={handleSell}
                        variant="outline" 
                        className="h-12 text-lg font-semibold border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                      >
                        {t('meme.buyToken.sell')}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
                      💡 {t('meme.buyToken.tradeNote')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {selectedToken.symbol} {t('meme.buyToken.priceChart')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('meme.buyToken.advancedChart')}</h3>
                      <p className="text-muted-foreground mb-1">{t('meme.buyToken.tradingViewIntegration')}</p>
                      <p className="text-sm text-muted-foreground">{t('meme.buyToken.realtimePriceData')}</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Badge variant="secondary">{t('meme.buyToken.liveData')}</Badge>
                        <Badge variant="secondary">{t('meme.buyToken.technicalAnalysis')}</Badge>
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
                <h3 className="text-xl font-bold mb-2">{t('meme.buyToken.discoverTokens')}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t('meme.buyToken.discoverDescription')}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-xs">{t('meme.buyToken.realtimeData')}</Badge>
                <Badge variant="outline" className="text-xs">{t('meme.buyToken.secureTrade')}</Badge>
                <Badge variant="outline" className="text-xs">{t('meme.buyToken.advancedAnalysis')}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default BuyTokenPage;