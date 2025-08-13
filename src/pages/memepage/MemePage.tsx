import { useEffect } from 'react';
import MemeHeroNew from './components/MemeHeroNew';
import MemeLiveTicker from './components/MemeLiveTicker';
import MemeTopCoins from './components/MemeTopCoins';

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
  return (
    <div className="meme-page font-sans bg-background min-h-screen">
      <main className="relative z-10 w-full min-h-screen">
        {/* Hero Section - Fixed Container */}
        <section className="w-full">
          <MemeHeroNew />
        </section>

        {/* Top Tokens Section - Fixed Container */}
        <section className="w-full">
          <MemeTopCoins />
        </section>

        {/* Stats Banner - Fixed Container with proper spacing */}
        <section className="w-full py-8">
          <MemeStatsBanner />
        </section>

        {/* Explore Section - Fixed Container */}
        <section className="w-full">
          <MemeZoneTabs />
        </section>
      </main>
      
      {/* Mobile Navigation - Fixed positioning */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MemeZoneBottomNavigation />
        </div>
      )}
    </div>
  );
};
export default MemePage;