import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CasinoCard } from '@/components/ui/casino-card';
import { NeonButton } from '@/components/ui/neon-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Search,
  Crown,
  Flame,
  Star,
  Zap,
  Target,
  DollarSign,
  BarChart3,
  Timer,
  Eye,
  Users,
  Volume2
} from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, MemeCategory } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// Format helper functions
function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(n);
}

interface TokenGridProps {
  category: MemeCategory;
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const TokenGrid: React.FC<TokenGridProps> = ({ category, viewMode, sortBy, sortDirection }) => {
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens(category, 40, 1);
  
  // Sort tokens
  const sortedTokens = tokens.sort((a, b) => {
    let aVal: number, bVal: number;
    
    switch (sortBy) {
      case 'price':
        aVal = a.price || 0;
        bVal = b.price || 0;
        break;
      case 'change24h':
        aVal = a.change24h || 0;
        bVal = b.change24h || 0;
        break;
      case 'marketCap':
        aVal = a.marketCap || 0;
        bVal = b.marketCap || 0;
        break;
      case 'volume24h':
        aVal = a.volume24h || 0;
        bVal = b.volume24h || 0;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
        'space-y-4'
      }>
        {Array.from({ length: viewMode === 'grid' ? 16 : 8 }).map((_, i) => (
          <Skeleton key={i} className={
            viewMode === 'grid' ? 'h-[400px] rounded-2xl bg-white/10' : 'h-[120px] rounded-xl bg-white/10'
          } />
        ))}
      </div>
    );
  }

  if (error || sortedTokens.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🎲</div>
        <p className="text-white/80 text-xl mb-6">No tokens found in casino</p>
        <NeonButton variant="casino-rainbow" glow>
          🎰 Try Different Category
        </NeonButton>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {sortedTokens.map((token, index) => {
          const positive = token.change24h > 0;
          const isTop3 = index < 3;
          
          return (
            <CasinoCard
              key={token.id}
              variant={isTop3 ? 'golden' : 'default'}
              glow={index === 0}
              className="group cursor-pointer p-6 hover:scale-[1.02]"
              onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0">
                  <Badge className={`text-lg font-black px-3 py-2 ${
                    index === 0 ? 'bg-gradient-casino-gold text-black' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black' :
                    'bg-gradient-web3-cyber text-white'
                  }`}>
                    {index === 0 && <Crown className="w-4 h-4 mr-1" />}
                    #{index + 1}
                  </Badge>
                </div>

                {/* Image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                  <OptimizedImage
                    src={token.image || '/placeholder.svg'}
                    alt={`${token.name} logo`}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.svg"
                  />
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-xl text-white truncate">{token.symbol}</h3>
                    <Badge className="bg-red-500/20 text-red-300 text-xs px-2 py-1">🔥</Badge>
                  </div>
                  <p className="text-white/60 text-sm truncate">{token.name}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-white/60 mb-1">Price</div>
                    <div className="font-black text-white font-numbers">{formatPrice(token.price)}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-white/60 mb-1">24h</div>
                    <div className={`font-black font-numbers flex items-center gap-1 ${
                      positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {formatPercentage(token.change24h)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-white/60 mb-1">Market Cap</div>
                    <div className="font-black text-white font-numbers">{formatCompact(token.marketCap)}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-white/60 mb-1">Volume</div>
                    <div className="font-black text-white font-numbers">{formatCompact(token.volume24h)}</div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  <NeonButton 
                    variant={isTop3 ? 'neon-gold' : 'neon-cyan'}
                    glow={index === 0}
                    className="px-6 py-2"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    BET
                  </NeonButton>
                </div>
              </div>
            </CasinoCard>
          );
        })}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {sortedTokens.map((token, index) => {
        const positive = token.change24h > 0;
        const isTop3 = index < 3;
        const isTop1 = index === 0;
        
        return (
          <CasinoCard
            key={token.id}
            variant={isTop1 ? 'diamond' : isTop3 ? 'golden' : 'default'}
            glow={isTop3}
            animate={isTop1}
            className="group cursor-pointer h-[400px] flex flex-col"
            onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
          >
            {/* Header */}
            <div className="relative p-4 flex justify-between items-start">
              <Badge className={`font-black px-3 py-2 ${
                isTop1 ? 'bg-gradient-casino-rainbow text-white animate-pulse' :
                isTop3 ? 'bg-gradient-casino-gold text-black' :
                'bg-gradient-web3-cyber text-white'
              }`}>
                {isTop1 && <Crown className="w-4 h-4 mr-1" />}
                #{index + 1}
              </Badge>

              <Badge className="bg-red-500/20 text-red-300 text-xs px-2 py-1">
                🔥
              </Badge>
            </div>

            {/* Image */}
            <div className="relative mx-4 mb-4 overflow-hidden rounded-xl">
              <AspectRatio ratio={16 / 10}>
                <OptimizedImage
                  src={token.image || '/placeholder.svg'}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackSrc="/placeholder.svg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </AspectRatio>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl text-white truncate">{token.symbol}</h3>
                <div className={`flex items-center gap-1 font-black ${
                  positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-numbers">{formatPercentage(token.change24h)}</span>
                </div>
              </div>

              <p className="text-white/60 text-sm truncate">{token.name}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 rounded-lg p-2 border border-white/20">
                  <div className="text-white/60 text-xs mb-1">Price</div>
                  <div className="font-black text-white text-sm font-numbers">{formatPrice(token.price)}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2 border border-white/20">
                  <div className="text-white/60 text-xs mb-1">MCap</div>
                  <div className="font-black text-white text-sm font-numbers">{formatCompact(token.marketCap)}</div>
                </div>
              </div>

              <NeonButton 
                variant={isTop1 ? 'casino-rainbow' : isTop3 ? 'neon-gold' : 'neon-cyan'}
                glow={isTop3}
                pulse={isTop1}
                className="w-full py-2 font-black"
              >
                <Target className="w-4 h-4 mr-2" />
                🎰 BET NOW
              </NeonButton>
            </div>
          </CasinoCard>
        );
      })}
    </div>
  );
};

const CasinoTokenExplorer = () => {
  const [activeCategory, setActiveCategory] = useState<MemeCategory>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { t } = useLanguage();

  const categories = [
    { id: 'trending', label: '🔥 HOT CASINO', icon: Flame },
    { id: 'new', label: '⭐ NEW CHIPS', icon: Star },
    { id: 'gainers', label: '🚀 MEGA WINS', icon: TrendingUp },
    { id: 'volume', label: '💰 HIGH ROLLERS', icon: Volume2 },
    { id: 'under1m', label: '💎 HIDDEN GEMS', icon: Zap },
    { id: 'all', label: '🎰 FULL CASINO', icon: Crown }
  ];

  const sortOptions = [
    { id: 'marketCap', label: 'Pot Size', icon: DollarSign },
    { id: 'volume24h', label: 'Action', icon: BarChart3 },
    { id: 'change24h', label: 'Odds', icon: TrendingUp },
    { id: 'price', label: 'Bet Price', icon: Target }
  ];

  return (
    <section 
      data-section="token-explorer" 
      className="relative w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-meme-energy opacity-10 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(330_100%_65%/0.2)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(186_100%_60%/0.2)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-6xl font-black bg-gradient-casino-rainbow bg-clip-text text-transparent mb-6">
            🎰 TOKEN CASINO 🎰
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Place your bets on the hottest Solana meme tokens. Live odds, real-time action!
          </p>
        </div>

        {/* Controls */}
        <div className="mb-12">
          <CasinoCard variant="default" className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              
              {/* Categories */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    className={`font-bold transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-gradient-casino-gold text-black shadow-glow-casino-gold border-yellow-400'
                        : 'bg-black/40 text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                    }`}
                    onClick={() => setActiveCategory(category.id as MemeCategory)}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* View and Sort Controls */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm font-bold">Sort:</span>
                  <div className="flex gap-1">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant={sortBy === option.id ? 'default' : 'ghost'}
                        size="sm"
                        className={`text-xs ${
                          sortBy === option.id
                            ? 'bg-gradient-web3-cyber text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                        onClick={() => setSortBy(option.id)}
                      >
                        <option.icon className="w-3 h-3 mr-1" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className={viewMode === 'grid' ? 'bg-gradient-web3-cyber text-white' : 'text-white/60'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className={viewMode === 'list' ? 'bg-gradient-web3-cyber text-white' : 'text-white/60'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CasinoCard>
        </div>

        {/* Token Grid */}
        <TokenGrid 
          category={activeCategory}
          viewMode={viewMode}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

      </div>
    </section>
  );
};

export default CasinoTokenExplorer;