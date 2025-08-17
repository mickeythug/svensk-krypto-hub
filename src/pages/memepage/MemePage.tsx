import { useEffect, useState } from 'react';
import ModernTokenGrid from './components/SlotMachineTokenGrid';
import ModernControlPanel from './components/ModernControlPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import MobileMemeZoneApp from './components/mobile/MobileMemeZoneApp';
import { useLanguage } from '@/contexts/LanguageContext';
const MemePage: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    t
  } = useLanguage();
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
  return <div className="meme-zone min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <main className="relative">
        {/* Professional Control Panel */}
        <section className="py-8 px-4 lg:px-8">
          <div className="w-full">
            <div className="mb-8">
              <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4 tracking-wider">
                <span className="text-white">CRY</span><span className="text-[#12E19F]">PTO</span><span className="text-white"> NE</span><span className="text-[#12E19F]">TWO</span><span className="text-white">RK </span><span className="text-[#12E19F]">MEM</span><span className="text-white">E Z</span><span className="text-[#12E19F]">ONE</span>
              </h1>
              
            </div>
            
            <ModernControlPanel onSearch={setSearchQuery} onFilterChange={setFilterType} onSortChange={setSortBy} onViewChange={setCurrentView} currentView={currentView} />
          </div>
        </section>

        {/* Token Display Section */}
        <section className="pb-20 px-4 lg:px-8">
          <div className="w-full">
            <ModernTokenGrid view={currentView} searchQuery={searchQuery} filterType={filterType} sortBy={sortBy} />
          </div>
        </section>
      </main>
    </div>;
};
export default MemePage;