import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, Crown, Diamond, Star, Zap, Target, DollarSign, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';
import { useNavigate } from 'react-router-dom';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';

// Format utilities
function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
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

// Slot machine card tier component
const SlotMachineCard: React.FC<{
  token: any;
  tier: 'jackpot' | 'premium' | 'gold' | 'silver' | 'standard';
  rank: number;
  onClick: () => void;
}> = ({ token, tier, rank, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const positive = token.change24h > 0;

  const tierStyles = {
    jackpot: {
      gradient: 'from-purple-600 via-pink-600 to-red-600',
      glow: 'shadow-2xl shadow-purple-500/50',
      border: 'border-purple-500/70',
      badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: <Crown className="w-6 h-6" />,
      label: '💎 JACKPOT'
    },
    premium: {
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      glow: 'shadow-2xl shadow-yellow-500/50',
      border: 'border-yellow-500/70',
      badge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: <Diamond className="w-6 h-6" />,
      label: '🥇 PREMIUM'
    },
    gold: {
      gradient: 'from-amber-500 via-yellow-500 to-amber-600',
      glow: 'shadow-2xl shadow-amber-500/50',
      border: 'border-amber-500/70',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      icon: <Star className="w-6 h-6" />,
      label: '⭐ GOLD'
    },
    silver: {
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      glow: 'shadow-2xl shadow-gray-500/50',
      border: 'border-gray-500/70',
      badge: 'bg-gradient-to-r from-gray-400 to-gray-500',
      icon: <Zap className="w-6 h-6" />,
      label: '🥈 SILVER'
    },
    standard: {
      gradient: 'from-gray-600 via-gray-700 to-gray-800',
      glow: 'shadow-xl shadow-gray-700/30',
      border: 'border-gray-600/50',
      badge: 'bg-gradient-to-r from-gray-600 to-gray-700',
      icon: <Target className="w-6 h-6" />,
      label: '⚡ ACTIVE'
    }
  };

  const style = tierStyles[tier];

  return (
    <Card 
      className={`
        group relative overflow-hidden cursor-pointer h-[600px] bg-black/90 backdrop-blur-xl
        border-2 ${style.border} ${style.glow}
        transform transition-all duration-500 ease-out
        ${isHovered ? 'scale-105 rotate-1' : 'hover:scale-105 hover:rotate-1'}
        ${tier === 'jackpot' ? 'animate-pulse-glow' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Casino Lighting Effects */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-20 ${tier === 'jackpot' ? 'animate-shimmer' : ''}`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
      
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 z-20">
        <Badge className={`${style.badge} text-white font-black px-4 py-2 text-lg shadow-lg animate-float`}>
          #{rank}
        </Badge>
      </div>

      {/* Tier Badge */}
      <div className="absolute top-4 right-4 z-20">
        <Badge className={`${style.badge} text-white font-black px-4 py-2 flex items-center gap-2 shadow-lg ${tier === 'jackpot' ? 'animate-elastic-pop' : ''}`}>
          {style.icon}
          {style.label}
        </Badge>
      </div>

      {/* Token Image */}
      <div className="relative mt-20 mx-6 mb-6">
        <AspectRatio ratio={16 / 10}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl"></div>
          <OptimizedImage
            src={token.image || '/placeholder.svg'}
            alt={`${token.name} logo`}
            className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
            fallbackSrc="/placeholder.svg"
          />
          {/* Overlay effects based on tier */}
          {tier === 'jackpot' && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl animate-pulse"></div>
          )}
          {tier === 'premium' && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl"></div>
          )}
        </AspectRatio>
      </div>

      {/* Token Info */}
      <div className="relative z-10 px-6 pb-6 space-y-4">
        {/* Symbol and Change */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-2xl text-white truncate max-w-[60%]">
            {token.symbol}
          </h3>
          <div className={`flex items-center gap-2 text-xl font-black ${
            positive ? 'text-green-400' : 'text-red-400'
          }`}>
            {positive ? (
              <TrendingUp className="w-6 h-6 animate-bounce" />
            ) : (
              <TrendingDown className="w-6 h-6 animate-bounce" />
            )}
            <span>{positive ? '+' : ''}{formatPercentage(token.change24h)}</span>
          </div>
        </div>

        {/* Token Name */}
        <p className="text-white/80 text-lg font-medium truncate">{token.name}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold">PRICE</span>
            </div>
            <div className="text-xl font-black text-white">{formatPrice(token.price)}</div>
          </div>
          
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Diamond className="w-4 h-4" />
              <span className="font-bold">MCAP</span>
            </div>
            <div className="text-xl font-black text-white">{formatCompact(token.marketCap)}</div>
          </div>
        </div>

        {/* Volume */}
        <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="font-bold">VOLUME 24H</span>
          </div>
          <div className="text-xl font-black text-white">{formatCompact(token.volume24h)}</div>
        </div>

        {/* Trade Button */}
        <Button className={`
          w-full font-black text-lg py-4 rounded-xl border-2 transition-all duration-300
          ${tier === 'jackpot' ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 hover:from-pink-600 hover:to-red-600' :
            tier === 'premium' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400 hover:from-orange-600 hover:to-red-600' :
            tier === 'gold' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-400 hover:from-yellow-600 hover:to-orange-600' :
            'bg-gradient-to-r from-primary to-cyan-600 border-primary hover:from-cyan-600 hover:to-purple-600'
          }
          text-white shadow-lg transform hover:scale-105
        `}>
          <Target className="w-5 h-5 mr-2" />
          🎰 PLAY {token.symbol}
        </Button>
      </div>

      {/* Special effects for top tiers */}
      {tier === 'jackpot' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-2 right-2 w-4 h-4 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>
      )}
    </Card>
  );
};

interface SlotMachineTokenGridProps {
  view?: 'grid' | 'list' | 'compact';
  searchQuery?: string;
  filterType?: string;
  sortBy?: string;
}

const SlotMachineTokenGrid: React.FC<SlotMachineTokenGridProps> = ({ 
  view = 'grid', 
  searchQuery = '', 
  filterType = 'all', 
  sortBy = 'hotness' 
}) => {
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens('trending', 20, 1);

  // Filter and sort tokens
  const filteredAndSortedTokens = tokens
    .filter(token => {
      // Search filter
      const matchesSearch = !searchQuery || 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesFilter = filterType === 'all' || 
        (filterType === 'trending' && token.change24h > 10) ||
        (filterType === 'hot' && token.volume24h > 100000) ||
        (filterType === 'premium' && token.marketCap > 1000000) ||
        (filterType === 'new' && true); // All tokens for now
      
      return matchesSearch && matchesFilter && token.volume24h && token.change24h;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return (b.volume24h || 0) - (a.volume24h || 0);
        case 'change':
          return Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0);
        case 'marketcap':
          return (b.marketCap || 0) - (a.marketCap || 0);
        case 'newest':
          return Math.random() - 0.5; // Random for now
        default: // hotness
          const scoreA = (a.volume24h || 0) * Math.abs(a.change24h || 0);
          const scoreB = (b.volume24h || 0) * Math.abs(b.change24h || 0);
          return scoreB - scoreA;
      }
    });

  const getTier = (index: number): 'jackpot' | 'premium' | 'gold' | 'silver' | 'standard' => {
    if (index === 0) return 'jackpot';
    if (index < 3) return 'premium';
    if (index < 6) return 'gold';
    if (index < 10) return 'silver';
    return 'standard';
  };

  const handleTokenClick = (token: any) => {
    navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-[600px] rounded-3xl bg-white/10" />
        ))}
      </div>
    );
  }

  if (error || filteredAndSortedTokens.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-8">🎰</div>
        <p className="text-white/80 text-3xl mb-12">
          {searchQuery || filterType !== 'all' ? 'No tokens match your filters...' : 'Loading The Casino...'}
        </p>
        <Button className="bg-gradient-to-r from-primary to-purple-600 text-white font-black text-xl px-12 py-6 rounded-2xl">
          🎲 Retry 🎲
        </Button>
      </div>
    );
  }

  // Grid layouts based on view type
  const getGridLayout = () => {
    switch (view) {
      case 'list':
        return 'grid grid-cols-1 gap-4 p-8';
      case 'compact':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-8';
      default: // grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8';
    }
  };

  return (
    <div className={getGridLayout()}>
      {filteredAndSortedTokens.map((token, index) => (
        <SlotMachineCard
          key={token.id}
          token={token}
          tier={getTier(index)}
          rank={index + 1}
          onClick={() => handleTokenClick(token)}
        />
      ))}
    </div>
  );
};

export default SlotMachineTokenGrid;