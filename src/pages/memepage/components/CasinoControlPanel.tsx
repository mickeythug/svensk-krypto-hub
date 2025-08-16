import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Flame, Crown, Diamond, Shuffle, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CasinoControlPanelProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
}

// Casino filter buttons
const FilterButton: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'gold' | 'purple' | 'cyan';
  icon?: React.ReactNode;
}> = ({ active = false, children, onClick, variant = 'primary', icon }) => {
  const variants = {
    primary: active ? 'bg-gradient-to-r from-primary to-cyan-500 text-black' : 'bg-black/60 text-white border-primary/50 hover:bg-primary/20',
    gold: active ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' : 'bg-black/60 text-white border-yellow-500/50 hover:bg-yellow-500/20',
    purple: active ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-black/60 text-white border-purple-500/50 hover:bg-purple-500/20',
    cyan: active ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' : 'bg-black/60 text-white border-cyan-500/50 hover:bg-cyan-500/20'
  };

  return (
    <Button
      onClick={onClick}
      className={`
        ${variants[variant]}
        backdrop-blur-xl border-2 font-black px-6 py-3 rounded-xl
        transition-all duration-300 transform hover:scale-105
        ${active ? 'shadow-lg animate-pulse-glow' : 'hover:shadow-lg'}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};

// Live stats ticker component
const LiveStatsTicker: React.FC = () => {
  const stats = [
    { label: 'Hot Tokens', value: '247', icon: '🔥' },
    { label: 'Live Traders', value: '1,337', icon: '👥' },
    { label: 'Total Volume', value: '$50.2M', icon: '💰' },
    { label: 'Winners Today', value: '89%', icon: '🎯' },
    { label: 'New Jackpots', value: '12', icon: '💎' },
  ];

  return (
    <div className="relative overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-4 mb-8">
      <div className="flex items-center gap-8 animate-ticker">
        {[...stats, ...stats].map((stat, index) => (
          <div key={index} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-primary font-black text-lg">{stat.value}</div>
              <div className="text-white/60 text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CasinoControlPanel: React.FC<CasinoControlPanelProps> = ({ 
  onSearch, 
  onFilterChange, 
  onSortChange 
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

  return (
    <div className="relative z-10 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-xl">
      {/* Live Stats Ticker */}
      <LiveStatsTicker />

      {/* Main Control Panel */}
      <div className="bg-black/80 backdrop-blur-xl border-2 border-primary/30 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
            🎰 CASINO CONTROL PANEL 🎰
          </h2>
          <p className="text-white/80 text-lg">
            Filter, sort, and discover the hottest meme tokens
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border-2 border-primary/50 rounded-2xl p-2">
            <div className="flex items-center gap-4">
              <Search className="w-6 h-6 text-primary ml-4" />
              <Input
                type="text"
                placeholder="🔍 Search for meme tokens... (e.g., DOGE, SHIB, PEPE)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white text-lg font-medium placeholder:text-white/50 focus:ring-0"
              />
              <Button 
                className="bg-gradient-to-r from-primary to-cyan-500 text-black font-black px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
                onClick={() => handleSearch(searchQuery)}
              >
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
            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => handleFilterClick('all')}
              variant="primary"
              icon={<Shuffle className="w-4 h-4" />}
            >
              All Tokens
            </FilterButton>
            
            <FilterButton
              active={activeFilter === 'trending'}
              onClick={() => handleFilterClick('trending')}
              variant="gold"
              icon={<TrendingUp className="w-4 h-4" />}
            >
              🔥 Trending
            </FilterButton>
            
            <FilterButton
              active={activeFilter === 'hot'}
              onClick={() => handleFilterClick('hot')}
              variant="purple"
              icon={<Flame className="w-4 h-4" />}
            >
              🌶️ Hot
            </FilterButton>
            
            <FilterButton
              active={activeFilter === 'premium'}
              onClick={() => handleFilterClick('premium')}
              variant="cyan"
              icon={<Crown className="w-4 h-4" />}
            >
              👑 Premium
            </FilterButton>
            
            <FilterButton
              active={activeFilter === 'new'}
              onClick={() => handleFilterClick('new')}
              variant="primary"
              icon={<Diamond className="w-4 h-4" />}
            >
              ✨ New
            </FilterButton>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between flex-wrap gap-4">
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

          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black px-4 py-2 text-lg animate-pulse">
              🎯 89% Win Rate
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black px-4 py-2 text-lg animate-pulse">
              🏆 247 Active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoControlPanel;