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
  Settings
} from 'lucide-react';
import WorldClassMobileMemeHero from './WorldClassMobileMemeHero';
import WorldClassMobileMemeTokenGrid from './WorldClassMobileMemeTokenGrid';
import MobileMemeStats from './MobileMemeStats';
import MobileMemeNavigation from './MobileMemeNavigation';

const MobileMemeZoneApp = () => {
  const [activeTab, setActiveTab] = useState('trending');
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
      {/* iOS-like status bar overlay */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-between px-6">
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

      {/* Main content */}
      <div className="relative z-10 pt-11 pb-20">
        {/* Hero Section */}
        <WorldClassMobileMemeHero />

        {/* Stats Overview */}
        <MobileMemeStats />

        {/* Main Tabs */}
        <div className="px-4 pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-2xl rounded-3xl p-3 border border-white/20 shadow-2xl shadow-purple-500/10">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
                  <TabsTrigger 
                    value="trending" 
                    className="rounded-2xl py-4 px-4 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/30 data-[state=active]:scale-105 data-[state=active]:border data-[state=active]:border-purple-400/30 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-500 ease-out transform"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="new" 
                    className="rounded-2xl py-4 px-4 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/30 data-[state=active]:scale-105 data-[state=active]:border data-[state=active]:border-blue-400/30 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-500 ease-out transform"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    New
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gainers" 
                    className="rounded-2xl py-4 px-4 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-green-500/30 data-[state=active]:scale-105 data-[state=active]:border data-[state=active]:border-green-400/30 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-500 ease-out transform"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Gainers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="volume" 
                    className="rounded-2xl py-4 px-4 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-orange-500/30 data-[state=active]:scale-105 data-[state=active]:border data-[state=active]:border-orange-400/30 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-500 ease-out transform"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Volume
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value="trending" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="trending" />
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="newest" />
            </TabsContent>
            
            <TabsContent value="gainers" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="gainers" />
            </TabsContent>
            
            <TabsContent value="volume" className="mt-0">
              <WorldClassMobileMemeTokenGrid category="volume" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* iOS-style Bottom Navigation */}
      <MobileMemeNavigation />
    </div>
  );
};

export default MobileMemeZoneApp;