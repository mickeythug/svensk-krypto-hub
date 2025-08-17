import { useEffect, useState } from 'react';
import ModernMemeZoneHero from './components/ModernMemeZoneHero';
import SlotMachineTokenGrid from './components/SlotMachineTokenGrid';
import CasinoControlPanel from './components/CasinoControlPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import MobileMemeZoneApp from './components/mobile/MobileMemeZoneApp';
import { useLanguage } from '@/contexts/LanguageContext';

const MemePage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'compact'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('hotness');

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

  // Desktop version - Modern Professional Design
  return (
    <div className="meme-page min-h-screen bg-background">
      {/* Modern Hero Section */}
      <ModernMemeZoneHero />
      
      <main className="relative z-10">
        {/* Modern Control Panel */}
        <section data-section="meme-explorer" className="py-16 bg-gradient-to-b from-background/50 to-background">
          <CasinoControlPanel 
            onSearch={setSearchQuery}
            onFilterChange={setFilterType}
            onSortChange={setSortBy}
            onViewChange={setCurrentView}
            currentView={currentView}
          />
        </section>

        {/* Token Display Section */}
        <section className="pb-20 bg-background">
          <SlotMachineTokenGrid 
            view={currentView}
            searchQuery={searchQuery}
            filterType={filterType}
            sortBy={sortBy}
          />
        </section>
      </main>
    </div>
  );
};

export default MemePage;