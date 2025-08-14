import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens } from '../../hooks/useMemeTokens';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
  Crown,
  Flame,
  Sparkles,
  Target,
  Rocket,
  DollarSign,
  BarChart3,
  Users,
  Search,
  Filter,
  Plus,
  Home,
  Wallet,
  User,
  Settings,
  Grid3X3,
  List,
  ArrowUp
} from 'lucide-react';
import WorldClassMobileMemeHero from './WorldClassMobileMemeHero';
import WorldClassMobileMemeTokenGrid from './WorldClassMobileMemeTokenGrid';
import MobileMemeStats from './MobileMemeStats';
import MobileMemeNavigation from './MobileMemeNavigation';

const MobileMemeZoneApp = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent scroll bounce on mobile
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.documentElement.style.overscrollBehavior = 'auto';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="mobile-meme-app min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* iOS-like status bar overlay with safe area support */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-between px-4 safe-area-top">
        <div className="text-white text-sm font-semibold">9:41</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
          <div className="w-1 h-2 bg-white rounded-sm opacity-60"></div>
          <div className="w-6 h-3 border border-white rounded-sm opacity-80">
            <div className="w-4 h-1.5 bg-green-400 rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Dynamic background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-black opacity-90"></div>
      <div className="fixed inset-0 bg-gradient-casino-rainbow opacity-5 animate-shimmer"></div>

      {/* Main content with enhanced safe areas and consistent padding */}
      <div className="relative z-10 pt-11 pb-20 safe-area-inset">
        {/* Hero Section */}
        <WorldClassMobileMemeHero />

        {/* Stats Overview */}
        <MobileMemeStats />

        {/* Main Tabs with enhanced spacing and layout */}
        <div className="container-padding space-y-6">
          {/* Enhanced View Toggle Button with better UX */}
          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-2xl rounded-2xl p-1.5 border border-white/20 shadow-xl shadow-black/20">
              <div className="flex bg-black/20 rounded-xl p-1">
                <Button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-500 flex items-center gap-2 font-semibold btn-feedback ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg shadow-purple-500/25 scale-105 border border-purple-400/30' 
                      : 'text-white/60 hover:text-white hover:bg-white/10 hover:scale-102'
                  }`}
                  variant="ghost"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="text-xs text-dynamic">Grid</span>
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-500 flex items-center gap-2 font-semibold btn-feedback ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-white shadow-lg shadow-blue-500/25 scale-105 border border-blue-400/30' 
                      : 'text-white/60 hover:text-white hover:bg-white/10 hover:scale-102'
                  }`}
                  variant="ghost"
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs text-dynamic">Lista</span>
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-2xl rounded-3xl p-3 border border-white/20 shadow-2xl shadow-purple-500/10">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                  <TabsTrigger 
                    value="trending" 
                    className="rounded-2xl py-3 px-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/25 data-[state=active]:to-pink-500/25 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-purple-400/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out transform hover:scale-102 flex items-center justify-center gap-1 btn-feedback min-w-0"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold whitespace-nowrap">Trending</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="new" 
                    className="rounded-2xl py-3 px-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/25 data-[state=active]:to-cyan-500/25 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-500/40 data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-blue-400/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out transform hover:scale-102 flex items-center justify-center gap-1 btn-feedback min-w-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold whitespace-nowrap">New</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gainers" 
                    className="rounded-2xl py-3 px-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/25 data-[state=active]:to-emerald-500/25 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/40 data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-green-400/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out transform hover:scale-102 flex items-center justify-center gap-1 btn-feedback min-w-0"
                  >
                    <Rocket className="w-4 h-4" />
                    <span className="text-xs font-semibold whitespace-nowrap">Gainers</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="volume" 
                    className="rounded-2xl py-3 px-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/25 data-[state=active]:to-yellow-500/25 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-orange-500/40 data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-orange-400/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out transform hover:scale-102 flex items-center justify-center gap-1 btn-feedback min-w-0"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs font-semibold whitespace-nowrap">Volume</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content with improved loading states */}
            <TabsContent value="trending" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="trending" viewMode={viewMode} />
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="newest" viewMode={viewMode} />
            </TabsContent>
            
            <TabsContent value="gainers" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="gainers" viewMode={viewMode} />
            </TabsContent>
            
            <TabsContent value="volume" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="volume" viewMode={viewMode} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Bottom Navigation with safe area support */}
      <MobileMemeNavigation />
    </div>
  );
};

export default MobileMemeZoneApp;