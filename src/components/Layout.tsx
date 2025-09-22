import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

import Header from '@/components/Header';
import MobileHeader from '@/components/mobile/MobileHeader';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';

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
  
  // Don't show ticker on trading pages
  const shouldShowTicker = showTicker && !isTradingPage;
  
  // Mobile header titles for different pages
  const getMobileTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/news':
        return 'NEWS';
      case '/market':
        return 'MARKET';
      case '/tools':
        return 'TOOLS';
      case '/portfolio':
        return 'PORTFOLIO';
      default:
        if (location.pathname.startsWith('/artikel/')) return 'ARTICLE';
        if (location.pathname.startsWith('/crypto/')) return 'TRADING';
        return 'VELO';
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
        min-h-screen
      `}>
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;