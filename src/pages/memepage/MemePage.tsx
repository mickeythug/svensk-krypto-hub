import { useEffect } from 'react';
import CasinoMemeHero from './components/CasinoMemeHero';
import CasinoTokenExplorer from './components/CasinoTokenExplorer';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import MobileMemeZoneApp from './components/mobile/MobileMemeZoneApp';
import hexPattern from '@/assets/hex-pattern.jpg';
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
      {/* Casino Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-15 animate-shimmer"></div>
        <div className="absolute inset-0 bg-gradient-web3-cyber opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-meme-energy opacity-8 animate-pulse"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(330_100%_65%/0.3)_0%,transparent_30%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,hsl(186_100%_60%/0.3)_0%,transparent_30%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(270_100%_65%/0.2)_0%,transparent_40%)]"></div>
      </div>
      
      <main className="relative z-10 w-full min-h-screen">
        {/* Casino Hero Section */}
        <CasinoMemeHero />

        {/* Casino Token Explorer */}
        <CasinoTokenExplorer />
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default MemePage;