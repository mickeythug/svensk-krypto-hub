import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Flame, Crown, Diamond, Shuffle, RotateCcw, Grid3X3, List, Eye, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface ModernControlPanelProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list' | 'compact') => void;
  currentView?: 'grid' | 'list' | 'compact';
}

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
    primary: active 
      ? 'bg-primary text-primary-foreground shadow-lg' 
      : 'bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
    gold: active 
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
      : 'bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
    purple: active 
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
      : 'bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
    cyan: active 
      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
      : 'bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <Button 
      onClick={onClick} 
      className={`
        ${variants[variant]}
        font-semibold px-4 py-2 rounded-lg
        transition-all duration-200 transform hover:scale-105
        flex items-center gap-2
      `}
      variant="outline"
    >
      {icon}
      {children}
    </Button>
  );
};

const ModernControlPanel: React.FC<ModernControlPanelProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  onViewChange,
  currentView = 'grid'
}) => {
  const navigate = useNavigate();
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
    <div className="space-y-6">

      {/* Main Control Panel */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg">
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Sök efter meme tokens... (t.ex. DOGE, SHIB, PEPE)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 text-lg bg-background border-border focus:border-primary rounded-xl"
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Filter Buttons */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <span className="text-foreground font-semibold text-lg">Filtrera kategorier:</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <FilterButton 
                active={activeFilter === 'all'} 
                onClick={() => handleFilterClick('all')} 
                variant="primary" 
                icon={<Shuffle className="w-4 h-4" />}
              >
                Alla Tokens
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
                🌶️ Heta
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
                ✨ Nya
              </FilterButton>
            </div>
          </div>

          {/* Sort & View Options */}
          <div className="space-y-4">
            
            {/* Sort Options */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">Sortera efter:</span>
              </div>
              
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full bg-background border-border rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-lg">
                  <SelectItem value="hotness">🔥 Popularitet</SelectItem>
                  <SelectItem value="volume">📊 Volym 24h</SelectItem>
                  <SelectItem value="change">📈 Prisförändring</SelectItem>
                  <SelectItem value="marketcap">💎 Marknadsvärde</SelectItem>
                  <SelectItem value="newest">⭐ Senaste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">Vy:</span>
              </div>
              
              <div className="flex bg-background border border-border rounded-lg p-1">
                <Button
                  onClick={() => onViewChange?.('grid')}
                  variant={currentView === 'grid' ? 'default' : 'ghost'}
                  className={`flex-1 ${currentView === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
                  size="sm"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Kort
                </Button>
                
                <Button
                  onClick={() => onViewChange?.('list')}
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  className={`flex-1 ${currentView === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
                  size="sm"
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernControlPanel;