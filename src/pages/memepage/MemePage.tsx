import { useEffect } from 'react';
import MemeHeroNew from './components/MemeHeroNew';
import MemeLiveTicker from './components/MemeLiveTicker';
import MemeTopCoins from './components/MemeTopCoins';
import MemeTokenGrid from './components/MemeTokenGrid';
import MemeStatsBanner from './components/MemeStatsBanner';
import MemePageHeader from './components/MemePageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
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
  return (
    <div className="meme-page">
      <main className={`min-h-screen bg-gradient-to-br from-background via-mute to-background relative overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
        {/* Animated background elements */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-accent rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 bg-secondary rounded-full animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 bg-primary-glow rounded-full animate-spin"></div>
        </div>

        {/* Hero Section */}
        <MemeHeroNew />

        {/* Top Meme Coins with Large Images */}
        <section className={`${isMobile ? 'py-8 px-3' : 'py-16 px-4'}`}>
          <div className="container mx-auto">
            <MemeTopCoins />
          </div>
        </section>

        {/* Stats Banner */}
        <MemeStatsBanner />

        {/* All Meme Tokens Grid */}
        <section className={`${isMobile ? 'py-8 px-3' : 'py-16 px-4'} bg-meme-grid-bg/50`}>
          <div className="container mx-auto">
            <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-bold text-center ${isMobile ? 'mb-6' : 'mb-12'} bg-gradient-neon bg-clip-text text-transparent`}>
              ALLA MEME TOKENS
            </h2>
            <MemeTokenGrid category="all" />
          </div>
        </section>
      </main>
      
      {/* Custom Navigation for Meme Zone */}
      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};
export default MemePage;