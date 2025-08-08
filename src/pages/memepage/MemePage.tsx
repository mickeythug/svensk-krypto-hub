import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Clock, Star, Zap, Filter, Grid } from 'lucide-react';
import MemeHeroNew from './components/MemeHeroNew';
import MemeLiveTicker from './components/MemeLiveTicker';
import MemeTopCoins from './components/MemeTopCoins';
import MemeTokenGrid from './components/MemeTokenGrid';
import MemeStatsBanner from './components/MemeStatsBanner';
import MemePageHeader from './components/MemePageHeader';
const MemePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');

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
  return (
    <>
      {/* Minimal Header with Action Buttons */}
      <MemePageHeader />
      
      <main className="min-h-screen w-full bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
        {/* Live Ticker - Full Width at Top */}
        <MemeLiveTicker />

        {/* Animated background elements */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-accent/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 bg-secondary/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 bg-primary/20 rounded-full animate-spin"></div>
        </div>

        {/* Hero Section */}
        <MemeHeroNew />

        {/* Featured Top Coins */}
        <section className="py-12 w-full">
          <div className="max-w-7xl mx-auto px-6">
            <MemeTopCoins />
          </div>
        </section>

        {/* Stats Banner */}
        <MemeStatsBanner />

        {/* Main Content Area - Full Width */}
        <section className="w-full py-16 bg-gradient-to-b from-transparent to-muted/20">
          <div className="w-full px-6">
            {/* Category Header */}
            <div className="max-w-7xl mx-auto mb-12">
              <div className="text-center mb-8">
                <h2 className="font-crypto text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
                  MEME TOKEN UNIVERSUM
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Upptäck de hetaste meme-coinsen, filtrera efter kategori och håll koll på marknadsrörelserna i realtid
                </p>
              </div>

              {/* Modern Tab Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="grid w-full max-w-4xl grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2">
                    <TabsTrigger 
                      value="trending" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="hidden sm:inline">TRENDING</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="newest" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">NYAST</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="top" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                    >
                      <Star className="w-4 h-4" />
                      <span className="hidden sm:inline">TOP</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="hot" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">HOT</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="under1m" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">UNDER 1M</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center gap-2 py-3 px-4 font-crypto font-bold data-[state=active]:bg-muted data-[state=active]:text-foreground"
                    >
                      <Grid className="w-4 h-4" />
                      <span className="hidden sm:inline">ALLA</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content - Full Width */}
                <div className="w-full">
                  <TabsContent value="trending" className="w-full mt-0">
                    <MemeTokenGrid category="trending" />
                  </TabsContent>
                  
                  <TabsContent value="newest" className="w-full mt-0">
                    <MemeTokenGrid category="trending" />
                  </TabsContent>
                  
                  <TabsContent value="top" className="w-full mt-0">
                    <MemeTokenGrid category="all" />
                  </TabsContent>
                  
                  <TabsContent value="hot" className="w-full mt-0">
                    <MemeTokenGrid category="trending" />
                  </TabsContent>
                  
                  <TabsContent value="under1m" className="w-full mt-0">
                    <MemeTokenGrid category="under1m" />
                  </TabsContent>
                  
                  <TabsContent value="all" className="w-full mt-0">
                    <MemeTokenGrid category="all" />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
export default MemePage;