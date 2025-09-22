import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Suspense, lazy, memo } from "react";

// Lazy load pages för optimal bundling
const Index = lazy(() => import("./pages/Index"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const MarketOverviewPage = lazy(() => import("./pages/MarketOverviewPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CryptoDetailPage = lazy(() => import("./pages/CryptoDetailPage"));
const MemePage = lazy(() => import("./pages/memepage"));
const CreateTokenPage = lazy(() => import("./pages/memepage/CreateTokenPage"));
const BuyTokenPage = lazy(() => import("./pages/memepage/BuyTokenPage"));
const MemeStatsPage = lazy(() => import("./pages/memepage/MemeStatsPage"));
const MemeTokenDetailPage = lazy(() => import("./pages/memepage/MemeTokenDetailPage"));
const MobileConnectPage = lazy(() => import("./pages/MobileConnectPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { queryClient } from "@/lib/queryClient";
import { AuthDebugOverlay } from "@/lib/authDebug";

// Loading component för Suspense
const LoadingFallback = memo(() => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
});

LoadingFallback.displayName = 'LoadingFallback';

const AppContent = memo(() => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Hide main navigation on trading pages and meme zone pages (they have custom nav)
  const isTradingPage = location.pathname.startsWith('/crypto/');
  const isMemeZonePage = location.pathname.startsWith('/meme');
  const shouldShowMobileNav = isMobile && !isTradingPage && !isMemeZonePage;

  return (
    <div className={`min-h-screen bg-background ${shouldShowMobileNav ? 'pb-20' : ''}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/news" element={<Layout><NewsPage /></Layout>} />
          <Route path="/article/:id" element={<Layout><ArticleDetailPage /></Layout>} />
          <Route path="/market" element={<Layout><MarketOverviewPage /></Layout>} />
          <Route path="/tools" element={<Layout><ToolsPage /></Layout>} />
          <Route path="/community" element={<Layout><CommunityPage /></Layout>} />
          <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
          <Route path="/crypto/:symbol" element={<Layout><CryptoDetailPage /></Layout>} />
          <Route path="/meme" element={<Layout><MemePage /></Layout>} />
          <Route path="/meme/create" element={<Layout><CreateTokenPage /></Layout>} />
          <Route path="/meme/buy" element={<Layout><BuyTokenPage /></Layout>} />
          <Route path="/meme/stats" element={<Layout><MemeStatsPage /></Layout>} />
          <Route path="/meme/token/:symbol" element={<Layout showTicker={false}><MemeTokenDetailPage /></Layout>} />
          <Route path="/connect" element={<Layout showTicker={false}><MobileConnectPage /></Layout>} />
          <Route path="*" element={<Layout showTicker={false}><NotFound /></Layout>} />
        </Routes>
      </Suspense>
      {shouldShowMobileNav && <MobileBottomNavigation />}
    </div>
  );
});

AppContent.displayName = 'AppContent';

const App = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthDebugOverlay />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;
