import { useEffect } from 'react';
import UltraModernMemeHero from './components/UltraModernMemeHero';
import SlotMachineTokenGrid from './components/SlotMachineTokenGrid';
import CasinoControlPanel from './components/CasinoControlPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import MobileMemeZoneApp from './components/mobile/MobileMemeZoneApp';
import { useLanguage } from '@/contexts/LanguageContext';

const MemePage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  useEffect(() => {
    const title = t('meme.main.title') + ' | Crypto Network Sweden';
    const description = t('meme.main.description');
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

  // Mobile app version - completely different experience
  if (isMobile) {
    return <MobileMemeZoneApp />;
  }

  // Desktop version - Ultra Modern Casino Design
  return (
    <div className="meme-page font-sans bg-black min-h-screen overflow-x-hidden">
      {/* Ultra Casino Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Multi-layer neon background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/8 via-transparent to-yellow-500/8 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Dynamic casino grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,225,159,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,225,159,0.05)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30"></div>
        
        {/* Floating lights */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-pink-500/10 to-transparent rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <main className="relative z-10 w-full min-h-screen">
        {/* Ultra Modern Hero Section */}
        <UltraModernMemeHero />

        {/* Casino Control Panel */}
        <section data-section="meme-explorer" className="py-16">
          <CasinoControlPanel />
        </section>

        {/* Slot Machine Token Grid */}
        <section className="pb-20">
          <SlotMachineTokenGrid />
        </section>
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default MemePage;