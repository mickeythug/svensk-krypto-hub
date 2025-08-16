import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Flame, Crown, Diamond, Shuffle, RotateCcw, Grid3X3, List, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CasinoControlPanelProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list' | 'compact') => void;
  currentView?: 'grid' | 'list' | 'compact';
}

// Casino filter buttons
const FilterButton: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'gold' | 'purple' | 'cyan';
  icon?: React.ReactNode;
}> = ({
  active = false,
  children,
  onClick,
  variant = 'primary',
  icon
}) => {
  const variants = {
    primary: active ? 'bg-gradient-to-r from-primary to-cyan-500 text-black' : 'bg-black/60 text-white border-primary/50 hover:bg-primary/20',
    gold: active ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' : 'bg-black/60 text-white border-yellow-500/50 hover:bg-yellow-500/20',
    purple: active ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-black/60 text-white border-purple-500/50 hover:bg-purple-500/20',
    cyan: active ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' : 'bg-black/60 text-white border-cyan-500/50 hover:bg-cyan-500/20'
  };
  return <Button onClick={onClick} className={`
        ${variants[variant]}
        backdrop-blur-xl border-2 font-black px-6 py-3 rounded-xl
        transition-all duration-300 transform hover:scale-105
        ${active ? 'shadow-lg animate-pulse-glow' : 'hover:shadow-lg'}
      `}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>;
};

// Live stats ticker component
const LiveStatsTicker: React.FC = () => {
  const stats = [{
    label: 'Hot Tokens',
    value: '247',
    icon: '🔥'
  }, {
    label: 'Live Traders',
    value: '1,337',
    icon: '👥'
  }, {
    label: 'Total Volume',
    value: '$50.2M',
    icon: '💰'
  }, {
    label: 'Winners Today',
    value: '89%',
    icon: '🎯'
  }, {
    label: 'New Jackpots',
    value: '12',
    icon: '💎'
  }];
  return <div className="relative overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-4 mb-8">
      <div className="flex items-center gap-8 animate-ticker">
        {[...stats, ...stats].map((stat, index) => <div key={index} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-primary font-black text-lg">{stat.value}</div>
              <div className="text-white/60 text-sm font-medium">{stat.label}</div>
            </div>
          </div>)}
      </div>
    </div>;
};
const CasinoControlPanel: React.FC<CasinoControlPanelProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  onViewChange,
  currentView = 'grid'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('hotness');
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };
  return <div className="relative z-10 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-xl">
      {/* Live Stats Ticker */}
      <LiveStatsTicker />

      {/* Main Control Panel */}
      <div className="bg-black/80 backdrop-blur-xl border-2 border-primary/30 rounded-3xl p-8 shadow-2xl">
        {/* Golden Header Box */}
        <div className="relative mb-12">
          {/* Multi-layer golden box effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 rounded-3xl blur-2xl animate-pulse"></div>
          <div className="absolute inset-1 bg-gradient-to-r from-yellow-600/30 via-yellow-400/40 to-yellow-600/30 rounded-3xl blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-2 bg-gradient-to-r from-yellow-700/20 via-yellow-500/30 to-yellow-700/20 rounded-3xl blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Main golden box container */}
          <div className="relative bg-gradient-to-br from-yellow-500/90 via-yellow-400/95 to-yellow-600/90 backdrop-blur-xl border-4 border-yellow-400/50 rounded-3xl p-8 shadow-2xl">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-transparent to-yellow-600/40 rounded-3xl"></div>
            
            {/* Gold texture overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJnb2xkIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiPgo8cGF0aCBkPSJNMzAgMEwzNiAxOEgxOEwyNCAwaDE2eiIgZmlsbD0icmdiYSgyNTUsIDIxNSwgMCwgMC4xKSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dvbGQpIiAvPgo8L3N2Zz4=')] opacity-30 rounded-3xl"></div>
            
            {/* Meme Token Images - Distributed around golden box */}
            
            {/* Left side images */}
            <div className="absolute left-4 top-8 z-20">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float">
                <img 
                  src="/lovable-uploads/9767b44b-a881-4755-8bc3-bf3f207a3285.png" 
                  alt="Doge Coin" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-2xl animate-float">
                <img 
                  src="/lovable-uploads/3a2c10e7-4d5a-4b65-b19d-a3a5eb404c6c.png" 
                  alt="Shiba Token" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute left-4 bottom-8 z-20">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                <img 
                  src="/lovable-uploads/e660102d-e987-4f64-96f3-f76ab8ec4403.png" 
                  alt="Pepe Token" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute left-16 bottom-20 z-20">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '2.5s' }}>
                <img 
                  src="/lovable-uploads/94b0349d-079b-424d-94cb-8a413b837e00.png" 
                  alt="Troll Face" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Right side images */}
            <div className="absolute right-4 top-8 z-20">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '0.5s' }}>
                <img 
                  src="/lovable-uploads/8a8828a6-0dbb-48a6-81af-ca55fc919fa8.png" 
                  alt="Doge Hat" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                <img 
                  src="/lovable-uploads/7d35cfe3-808b-4677-9fb2-d79b0af085ad.png" 
                  alt="Doge Classic" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute right-4 bottom-8 z-20">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '1.5s' }}>
                <img 
                  src="/lovable-uploads/a3f0dc47-8e45-4b7f-9796-a96a131be6e9.png" 
                  alt="Penguin Token" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute right-16 bottom-20 z-20">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '3s' }}>
                <img 
                  src="/lovable-uploads/9c239256-5ae0-4130-bb8d-4db1d635a895.png" 
                  alt="Pepe Classic" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Additional floating memes in corners */}
            <div className="absolute left-20 top-16 z-20">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '3.5s' }}>
                <img 
                  src="/lovable-uploads/97799556-fa2f-4a22-a6a4-e443dfea0e26.png" 
                  alt="Blue Penguin" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute right-20 top-16 z-20">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/70 shadow-2xl animate-float" style={{ animationDelay: '4s' }}>
                <img 
                  src="/lovable-uploads/72aba719-0de9-41fe-a71b-e1fb98f448aa.png" 
                  alt="Green Wojak" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <Crown className="w-8 h-8 text-yellow-900" />
                </div>
                
                <h1 className="text-8xl font-black bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-900 bg-clip-text text-transparent drop-shadow-2xl tracking-wider">
                  MEME ZONE
                </h1>
                
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                  <Diamond className="w-8 h-8 text-yellow-900" />
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-yellow-900 font-bold text-2xl mb-4">
                <Flame className="w-6 h-6 animate-bounce" />
                <span>Ultimate Meme Token Casino Experience</span>
                <Flame className="w-6 h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              
              <p className="text-yellow-800/90 text-lg font-medium max-w-2xl mx-auto">
                Filter, sort, and discover the hottest meme tokens with casino-level excitement
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border-2 border-primary/50 rounded-2xl p-2">
            <div className="flex items-center gap-4">
              <Search className="w-6 h-6 text-primary ml-4" />
              <Input type="text" placeholder="🔍 Search for meme tokens... (e.g., DOGE, SHIB, PEPE)" value={searchQuery} onChange={e => handleSearch(e.target.value)} className="flex-1 bg-transparent border-0 text-white text-lg font-medium placeholder:text-white/50 focus:ring-0" />
              <Button className="bg-gradient-to-r from-primary to-cyan-500 text-black font-black px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300" onClick={() => handleSearch(searchQuery)}>
                SEARCH
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-6 h-6 text-primary" />
            <span className="text-white font-black text-lg">Filter by Category:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <FilterButton active={activeFilter === 'all'} onClick={() => handleFilterClick('all')} variant="primary" icon={<Shuffle className="w-4 h-4" />}>
              All Tokens
            </FilterButton>
            
            <FilterButton active={activeFilter === 'trending'} onClick={() => handleFilterClick('trending')} variant="gold" icon={<TrendingUp className="w-4 h-4" />}>
              🔥 Trending
            </FilterButton>
            
            <FilterButton active={activeFilter === 'hot'} onClick={() => handleFilterClick('hot')} variant="purple" icon={<Flame className="w-4 h-4" />}>
              🌶️ Hot
            </FilterButton>
            
            <FilterButton active={activeFilter === 'premium'} onClick={() => handleFilterClick('premium')} variant="cyan" icon={<Crown className="w-4 h-4" />}>
              👑 Premium
            </FilterButton>
            
            <FilterButton active={activeFilter === 'new'} onClick={() => handleFilterClick('new')} variant="primary" icon={<Diamond className="w-4 h-4" />}>
              ✨ New
            </FilterButton>
          </div>
        </div>

        {/* Sort & View Options */}
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <RotateCcw className="w-6 h-6 text-primary" />
            <span className="text-white font-black text-lg">Sort by:</span>
            
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48 bg-black/60 border-2 border-primary/50 text-white font-bold rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-xl border-2 border-primary/50 rounded-xl">
                <SelectItem value="hotness" className="text-white font-medium hover:bg-primary/20">
                  🔥 Hotness Score
                </SelectItem>
                <SelectItem value="volume" className="text-white font-medium hover:bg-primary/20">
                  📊 Volume 24h
                </SelectItem>
                <SelectItem value="change" className="text-white font-medium hover:bg-primary/20">
                  📈 Price Change
                </SelectItem>
                <SelectItem value="marketcap" className="text-white font-medium hover:bg-primary/20">
                  💎 Market Cap
                </SelectItem>
                <SelectItem value="newest" className="text-white font-medium hover:bg-primary/20">
                  ⭐ Newest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <Eye className="w-6 h-6 text-primary" />
            <span className="text-white font-black text-lg">View:</span>
            
            <div className="flex bg-black/60 border-2 border-primary/50 rounded-xl p-1">
              <Button
                onClick={() => onViewChange?.('grid')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'grid'
                    ? 'bg-gradient-to-r from-primary to-cyan-500 text-black font-black'
                    : 'bg-transparent text-white hover:bg-primary/20'
                }`}
              >
                <Grid3X3 className="w-5 h-5 mr-2" />
                🎰 Cards
              </Button>
              
              <Button
                onClick={() => onViewChange?.('list')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'list'
                    ? 'bg-gradient-to-r from-primary to-cyan-500 text-black font-black'
                    : 'bg-transparent text-white hover:bg-primary/20'
                }`}
              >
                <List className="w-5 h-5 mr-2" />
                📋 List
              </Button>
              
              <Button
                onClick={() => onViewChange?.('compact')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'compact'
                    ? 'bg-gradient-to-r from-primary to-cyan-500 text-black font-black'
                    : 'bg-transparent text-white hover:bg-primary/20'
                }`}
              >
                <Diamond className="w-5 h-5 mr-2" />
                💎 Compact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default CasinoControlPanel;