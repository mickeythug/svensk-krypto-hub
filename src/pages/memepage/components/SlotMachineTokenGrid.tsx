import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Skeleton } from '@/components/ui/skeleton';
import ModernMemeTokenList from './ModernMemeTokenList';
import ModernTokenCard from './ModernTokenCard';

// Production-ready format utilities
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

interface ModernTokenGridProps {
  view?: 'grid' | 'list' | 'compact';
  searchQuery?: string;
  filterType?: string;
  sortBy?: string;
}

const ModernTokenGrid: React.FC<ModernTokenGridProps> = ({ 
  view = 'grid', 
  searchQuery = '', 
  filterType = 'all', 
  sortBy = 'hotness' 
}) => {
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens('trending', 50, 1);

  // Filter and sort tokens with improved logic
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
        (filterType === 'new' && true);
      
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
          return Math.random() - 0.5;
        default: // hotness
          const scoreA = (a.volume24h || 0) * Math.abs(a.change24h || 0);
          const scoreB = (b.volume24h || 0) * Math.abs(b.change24h || 0);
          return scoreB - scoreA;
      }
    });

  const handleTokenClick = (token: any) => {
    navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`);
  };

  if (loading) {
    if (view === 'list') {
      return (
        <div className="space-y-3 px-4 lg:px-8 pb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card/60 border border-border rounded-xl px-6 py-4">
              <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-center">
                <Skeleton className="col-span-1 h-8 w-12" />
                <Skeleton className="col-span-3 h-12" />
                <Skeleton className="col-span-2 h-6" />
                <Skeleton className="col-span-2 h-6" />
                <Skeleton className="col-span-2 h-6" />
                <Skeleton className="col-span-1 h-6" />
                <Skeleton className="col-span-1 h-8 w-12" />
              </div>
              <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 lg:px-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-96 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || filteredAndSortedTokens.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-foreground text-2xl font-bold mb-4">
          {searchQuery || filterType !== 'all' ? 'Inga tokens matchar dina filter' : 'Laddar tokens...'}
        </h3>
        <p className="text-muted-foreground mb-8">
          Prova att justera dina sökfilter eller vänta lite.
        </p>
      </div>
    );
  }

  // List view
  if (view === 'list') {
    return <ModernMemeTokenList tokens={filteredAndSortedTokens} />;
  }

  // Grid layouts with proper responsive design
  const getGridLayout = () => {
    switch (view) {
      case 'compact':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 lg:px-8';
      default: // grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 lg:px-8';
    }
  };

  return (
    <div className={getGridLayout()}>
      {filteredAndSortedTokens.map((token, index) => (
        <ModernTokenCard
          key={token.id}
          token={token}
          rank={index + 1}
          onClick={() => handleTokenClick(token)}
        />
      ))}
    </div>
  );
};

export default ModernTokenGrid;