import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, type MemeCategory } from '../../hooks/useMemeTokens';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Crown,
  Flame,
  Target,
  Star,
  Zap
} from 'lucide-react';

interface Props {
  category: MemeCategory;
}

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(n);
}

function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

const MobileMemeTokenGrid: React.FC<Props> = ({ category }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { tokens, loading, error, hasMore } = useMemeTokens(category, 20, page);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset to first page on category change
  useEffect(() => {
    setPage(1);
  }, [category]);

  const loadMore = async () => {
    if (hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(p => p + 1);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 500);
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 p-4 animate-pulse">
            <div className="flex gap-4">
              <Skeleton className="w-16 h-16 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20 bg-white/10" />
                  <Skeleton className="h-4 w-16 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-32 bg-white/10" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-20 bg-white/10" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Försök igen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token, index) => {
        const positive = token.change24h > 0;
        const isTop3 = index < 3;
        const isTop1 = index === 0;

        return (
          <Card
            key={token.id}
            className={`group relative overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer ${
              isTop1 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20' :
              isTop3 ? 'border-orange-400/50 bg-gradient-to-r from-orange-900/20 to-red-900/20' :
              'hover:border-white/20'
            }`}
            onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Rank & Image */}
                <div className="relative">
                  {isTop3 && (
                    <Badge className={`absolute -top-2 -left-2 z-10 text-xs px-2 py-1 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black animate-pulse' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                    }`}>
                      {index === 0 && <Crown className="w-3 h-3 mr-1" />}
                      #{index + 1}
                    </Badge>
                  )}
                  
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <OptimizedImage
                      src={token.image || '/placeholder.svg'}
                      alt={`${token.name} logo`}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder.svg"
                    />
                  </div>
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-lg text-white truncate">{token.symbol}</h3>
                      <p className="text-white/60 text-sm truncate">{token.name}</p>
                    </div>
                    
                    {/* Price Change */}
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {positive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {positive ? '+' : ''}{formatPercentage(token.change24h)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Price
                      </div>
                      <div className="text-white font-bold text-sm">{formatPrice(token.price)}</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        MCap
                      </div>
                      <div className="text-white font-bold text-sm">{formatCompact(token.marketCap)}</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Vol 24h
                      </div>
                      <div className="text-white font-bold text-sm">{formatCompact(token.volume24h)}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    size="sm"
                    className={`w-full bg-gradient-to-r from-primary/80 to-primary text-black font-bold rounded-lg transition-all duration-300 ${
                      isTop1 ? 'animate-pulse shadow-lg' : ''
                    }`}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    HANDLA NU
                  </Button>
                </div>
              </div>

              {/* Hot Badge */}
              {isTop3 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1">
                    {isTop1 ? '🔥 HOT' : '⭐ TOP'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4">
          <Button
            onClick={loadMore}
            disabled={loading || isLoadingMore}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold py-3"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Laddar fler...
              </div>
            ) : (
              'Ladda fler tokens'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileMemeTokenGrid;