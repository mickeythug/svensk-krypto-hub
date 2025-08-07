import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, memo } from "react";

// Lazy load pages för optimal bundling
const Index = lazy(() => import("./pages/Index"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const MarketOverviewPage = lazy(() => import("./pages/MarketOverviewPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const CryptoDetailPage = lazy(() => import("./pages/CryptoDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimerad QueryClient konfiguration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minut
      gcTime: 5 * 60 * 1000, // 5 minuter
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always'
    },
    mutations: {
      retry: 1
    }
  }
});

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

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nyheter" element={<NewsPage />} />
            <Route path="/marknad" element={<MarketOverviewPage />} />
            <Route path="/verktyg" element={<ToolsPage />} />
            <Route path="/crypto/:slug" element={<CryptoDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
));

App.displayName = 'App';

export default App;
