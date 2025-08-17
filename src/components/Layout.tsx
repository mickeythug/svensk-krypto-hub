import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

import Header from '@/components/Header';
import MobileHeader from '@/components/mobile/MobileHeader';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import MemeLiveTicker from '@/pages/memepage/components/MemeLiveTicker';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showTicker?: boolean;
}

const Layout = memo(({ children, title, showTicker = true }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { t } = useLanguage();
  
  
  // Check if we're on crypto trading pages
  const isTradingPage = location.pathname.startsWith('/crypto/');
  
  // Check if we're on meme pages
  const isMemeZone = location.pathname.startsWith('/meme');
  
  // Don't show ticker on trading pages
  const shouldShowTicker = showTicker && !isTradingPage;
  
  // Mobile header titles for different pages
  const getMobileTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/nyheter':
        return t('nav.news').toUpperCase();
      case '/marknad':
        return t('nav.market').toUpperCase();
      case '/verktyg':
        return 'VERKTYG';
      case '/portfolio':
        return 'PORTFÖLJ';
      default:
        if (location.pathname.startsWith('/artikel/')) return 'ARTIKEL';
        if (location.pathname.startsWith('/crypto/')) return 'TRADING';
        if (location.pathname.startsWith('/meme/token/')) {
          // Extract token symbol from URL for individual token pages
          const symbol = location.pathname.split('/').pop()?.toUpperCase() || 'TOKEN';
          return symbol;
        }
        if (location.pathname.startsWith('/meme')) return 'MEME ZONE';
        return 'CRYPTO NETWORK';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Don't show on profile page */}
      {location.pathname !== '/profile' && (
        isMobile ? (
          <MobileHeader title={getMobileTitle()} />
        ) : (
          <Header showTicker={shouldShowTicker} />
        )
      )}
      
      {/* Main content with proper spacing for fixed header with integrated ticker */}
      <main className={`
        ${isMobile ? 'pt-16' : 'pt-20'}
        ${shouldShowTicker ? (isMobile ? 'mt-14' : 'mt-12') : ''}
        ${isTradingPage && isMobile ? 'pb-0' : 'pb-4'}
        ${isMemeZone && isMobile ? 'pb-0' : ''}
        min-h-screen
      `}>
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;