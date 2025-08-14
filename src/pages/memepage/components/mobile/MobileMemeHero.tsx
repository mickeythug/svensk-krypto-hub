import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import OptimizedImage from '@/components/OptimizedImage';
import MobileMemeSearch from './MobileMemeSearch';
import {
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Star,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import heroImage from '@/assets/meme-hero.jpg';

const MobileMemeHero = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <MobileMemeSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    <div className="relative px-4 pt-8 pb-6">
      {/* Header with search and notifications */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Meme Zone</h1>
          <p className="text-white/70 text-sm">Upptäck hetaste tokens</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="icon" 
            variant="ghost" 
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5 text-white" />
          </Button>
          <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 relative">
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-600/90 via-red-600/90 to-pink-600/90 border-none shadow-2xl backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <OptimizedImage
            src={heroImage}
            alt="Meme Hero Background"
            className="w-full h-full object-cover"
            fallbackSrc="/placeholder.svg"
          />
        </div>
        
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-20 animate-shimmer"></div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Flame className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
              <Crown className="w-3 h-3 mr-1 animate-pulse" />
              Premium
            </Badge>
          </div>
          
          {/* Main content */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <h2 className="text-2xl font-black text-white">HETASTE TOKENS</h2>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            
            <p className="text-white/90 text-sm mb-6 max-w-xs mx-auto">
              Upptäck de mest explosiva meme tokens med live-data och realtidsuppdateringar
            </p>
            
            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold rounded-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Utforska
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Skapa Token
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 text-center">
          <div className="text-2xl font-black font-numbers text-white mb-1">1,247</div>
          <div className="text-white/70 text-xs font-medium">Active Tokens</div>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 text-center">
          <div className="text-2xl font-black font-numbers text-green-400 mb-1">+84%</div>
          <div className="text-white/70 text-xs font-medium">Avg Gain 24h</div>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 text-center">
          <div className="text-2xl font-black font-numbers text-yellow-400 mb-1">$2.4M</div>
          <div className="text-white/70 text-xs font-medium">Total Volume</div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default MobileMemeHero;