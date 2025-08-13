import { useEffect } from 'react';
import MemeHeroNew from './components/MemeHeroNew';
import MemeLiveTicker from './components/MemeLiveTicker';
import MemeTopCoins from './components/MemeTopCoins';
import { Button } from '@/components/ui/button';
import { Crown, Activity, BarChart3, Volume2, TrendingUp, Users, DollarSign } from 'lucide-react';
import MemeStatsBanner from './components/MemeStatsBanner';
import MemePageHeader from './components/MemePageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import MemeZoneTabs from './components/MemeZoneTabs';
const MemePage: React.FC = () => {
  const isMobile = useIsMobile();
  useEffect(() => {
    const title = 'Meme Tokens – Ultimate Meme Coin Universe | Crypto Network Sweden';
    const description = 'Världens mest färgglada meme token-sida med stora bilder, live-data och interaktiv upplevelse. Upptäck de hetaste meme-coinsen nu!';
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
    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    const origin = window.location.origin || 'https://cryptonetworksweden.se';
    canonical.setAttribute('href', `${origin}/meme`);
    const ldId = 'ld-json-meme-page';
    const oldLd = document.getElementById(ldId);
    if (oldLd) oldLd.remove();
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Meme Tokens – Ultimate Meme Coin Universe',
      description,
      url: `${origin}/meme`
    });
    document.head.appendChild(ld);
  }, []);
  return <div className="meme-page font-sans bg-gradient-to-br from-background via-background/95 to-muted/20 min-h-screen">
      {/* Full Screen Gaming Background */}
      <div className="fixed inset-0 bg-gradient-casino-rainbow opacity-5 animate-shimmer pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/hex-pattern.jpg')] opacity-10 pointer-events-none"></div>
      
      <main className="relative z-10 w-full min-h-screen overflow-x-hidden">
        {/* Full Width Hero Section */}
        <div className="w-full">
          <MemeHeroNew />
        </div>

        {/* Navigation Separation Bar */}
        <div className="w-full bg-card/80 border-y border-border/40 backdrop-blur-sm">
          <div className="max-w-[2000px] mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">Sortera efter:</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-medium">Alla tokens</span>
                  <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full">Live Data</span>
                  <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full">Analytics</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-full font-medium">Market Cap ↓</span>
                <span className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-full">Volume</span>
                <span className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-full">24h Change</span>
                <span className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-full">Holders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Top Tokens Section with proper spacing */}
        <div className="w-full pt-8">
          <MemeTopCoins />
        </div>

        {/* Modern Professional Header for Alla Tokens - Exact same style as Hetaste Tokens */}
        <div className="w-full bg-card/50 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-sm mx-4 md:mx-8 my-8">
          <div className="relative z-10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-sans font-bold text-2xl md:text-3xl text-foreground">
                    Alla Tokens
                  </h1>
                  <p className="text-muted-foreground text-sm">Upptäck alla tillgängliga meme tokens</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Live Data
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
              </div>
            </div>

            {/* Professional Sort Navigation */}
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="gap-2 bg-primary text-primary-foreground">
                <BarChart3 className="w-4 h-4" />
                Market Cap ↓
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2 bg-muted hover:bg-muted/80">
                <Volume2 className="w-4 h-4" />
                Volume
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2 bg-muted hover:bg-muted/80">
                <TrendingUp className="w-4 h-4" />
                24h Change
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2 bg-muted hover:bg-muted/80">
                <Users className="w-4 h-4" />
                Holders
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2 bg-muted hover:bg-muted/80">
                <DollarSign className="w-4 h-4" />
                Price
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Banner */}
        <div className="w-full bg-gradient-casino-gold/20 border-y-4 border-yellow-400/30">
          <MemeStatsBanner />
        </div>

        {/* Section Separation Bar */}
        <div className="w-full bg-card/60 border-y border-border/30">
          <div className="max-w-[2000px] mx-auto px-4 md:px-8 py-3">
            
          </div>
        </div>

        {/* Full Screen Explore Section */}
        <div className="w-full">
          <MemeZoneTabs />
        </div>
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && <MemeZoneBottomNavigation />}
    </div>;
};
export default MemePage;