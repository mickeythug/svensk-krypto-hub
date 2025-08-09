import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy, memo } from "react";

// Lazy load pages för optimal bundling
const Index = lazy(() => import("./pages/Index"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const MarketOverviewPage = lazy(() => import("./pages/MarketOverviewPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const CryptoDetailPage = lazy(() => import("./pages/CryptoDetailPage"));
const MemePage = lazy(() => import("./pages/memepage"));
const CreateTokenPage = lazy(() => import("./pages/memepage/CreateTokenPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { queryClient } from "@/lib/queryClient";

// Loading component för Suspense
const LoadingFallback = memo(() => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Laddar...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const App = memo(() => {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <div className={`min-h-screen bg-background ${isMobile ? 'pb-16' : ''}`}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/nyheter" element={<NewsPage />} />
                  <Route path="/artikel/:id" element={<ArticleDetailPage />} />
                  <Route path="/marknad" element={<MarketOverviewPage />} />
                  <Route path="/verktyg" element={<ToolsPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/crypto/:symbol" element={<CryptoDetailPage />} />
                  <Route path="/meme" element={<MemePage />} />
                  <Route path="/meme/create" element={<CreateTokenPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              {isMobile && <MobileBottomNavigation />}
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;
