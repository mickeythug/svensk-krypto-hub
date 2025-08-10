import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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
        return 'NYHETER';
      case '/marknad':
        return 'MARKNAD';
      case '/verktyg':
        return 'VERKTYG';
      case '/portfolio':
        return 'PORTFÖLJ';
      default:
        if (location.pathname.startsWith('/artikel/')) return 'ARTIKEL';
        if (location.pathname.startsWith('/crypto/')) return 'TRADING';
        if (location.pathname.startsWith('/meme')) return 'MEME ZONE';
        return 'CRYPTO NETWORK';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isMobile ? (
        <MobileHeader title={getMobileTitle()} />
      ) : (
        <Header />
      )}
      
      {/* Ticker - Hidden on trading pages */}
      {shouldShowTicker && (
        <div className={`${isMobile ? 'fixed top-16 left-0 right-0 z-[45]' : 'fixed top-20 left-0 right-0 z-40'}`}>
          {isMemeZone ? (
            <MemeLiveTicker />
          ) : (
            <CryptoPriceTicker />
          )}
        </div>
      )}
      
      {/* Main content with proper spacing for fixed header and ticker */}
      <main className={`
        ${isMobile ? 'pt-16' : 'pt-20'}
        ${shouldShowTicker ? (isMobile ? 'mt-10' : 'mt-12') : ''}
        ${isTradingPage && isMobile ? 'pb-0' : 'pb-20'}
        min-h-screen
      `}>
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;