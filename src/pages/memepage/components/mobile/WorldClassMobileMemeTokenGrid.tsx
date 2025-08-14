import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Eye,
  Heart,
  Share2
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

const PremiumTokenCard = ({ token, index, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  const [isVisible, setIsVisible] = useState(false);
  const positive = token.change24h > 0;
  const isTop3 = index < 3;
  const isTop1 = index === 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${token.symbol} - ${token.name}`,
        text: `Check out ${token.symbol} on Meme Zone!`,
        url: window.location.href
      });
    }
  };

  return (
    <div 
      className={`group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <Card
        className={`relative overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 cursor-pointer mobile-backdrop group-hover:bg-black/30 group-hover:border-white/20 group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-500 ease-out ${
          isTop1 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 shadow-lg shadow-yellow-500/10' :
          isTop3 ? 'border-orange-400/50 bg-gradient-to-r from-orange-900/20 to-red-900/20 shadow-lg shadow-orange-500/10' :
          'group-hover:shadow-xl group-hover:shadow-primary/5'
        }`}
        onClick={onClick}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Enhanced Rank & Image */}
            <div className="relative">
              {isTop3 && (
                <div className="absolute -top-2 -left-2 z-10 animate-fade-in">
                  <Badge className={`text-xs px-2 py-1 animate-bounce ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/25' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black shadow-lg' :
                    'bg-gradient-to-r from-orange-400 to-orange-600 text-black shadow-lg shadow-orange-500/25'
                  }`}>
                    {index === 0 && <Crown className="w-3 h-3 mr-1 animate-pulse" />}
                    #{index + 1}
                  </Badge>
                </div>
              )}
              
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <OptimizedImage
                  src={token.image || '/placeholder.svg'}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
            </div>

            {/* Enhanced Token Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1 group-hover:translate-x-1 transition-transform duration-300">
                  <h3 className="font-black text-lg text-white truncate group-hover:text-primary transition-colors duration-300">
                    {token.symbol}
                  </h3>
                  <p className="text-white/60 text-sm truncate">{token.name}</p>
                </div>
                
                {/* Enhanced Price Change */}
                <div className={`flex items-center gap-1 text-sm font-bold group-hover:scale-110 transition-transform duration-300 ${
                  positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {positive ? (
                    <TrendingUp className="w-4 h-4 animate-pulse" />
                  ) : (
                    <TrendingDown className="w-4 h-4 animate-pulse" />
                  )}
                  {positive ? '+' : ''}{formatPercentage(token.change24h)}
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { icon: DollarSign, label: "Price", value: formatPrice(token.price), color: "text-blue-400" },
                  { icon: BarChart3, label: "MCap", value: formatCompact(token.marketCap), color: "text-purple-400" },
                  { icon: Users, label: "Vol 24h", value: formatCompact(token.volume24h), color: "text-green-400" }
                ].map((stat, statIndex) => (
                  <div
                    key={statIndex}
                    className="bg-white/5 rounded-lg p-2 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300"
                    style={{ transitionDelay: `${statIndex * 50}ms` }}
                  >
                    <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <stat.icon className={`w-3 h-3 ${stat.color}`} />
                      {stat.label}
                    </div>
                    <div className="text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium Action Button */}
              <Button 
                size="sm"
                className={`w-full bg-gradient-to-r from-primary/80 to-primary text-black font-bold rounded-lg transition-all duration-300 mobile-backdrop hover:scale-105 hover:shadow-lg hover:shadow-primary/25 ${
                  isTop1 ? 'animate-pulse shadow-lg shadow-primary/20' : ''
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                HANDLA NU
              </Button>

              {/* Social engagement indicators */}
              <div className="flex items-center justify-between mt-3 text-white/50 text-xs">
                <button 
                  className="flex items-center gap-1 hover:text-red-400 transition-colors duration-300 group/heart"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                >
                  <Heart className={`w-3 h-3 group-hover/heart:scale-125 transition-transform duration-300 ${
                    isLiked ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </button>
                
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{viewCount}</span>
                </div>

                <button 
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-300 group/share"
                  onClick={handleShare}
                >
                  <Share2 className="w-3 h-3 group-hover/share:scale-125 transition-transform duration-300" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Hot Badge */}
          {isTop3 && (
            <div className="absolute top-2 right-2 animate-fade-in">
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse shadow-lg">
                {isTop1 ? '🔥 HOT' : '⭐ TOP'}
              </Badge>
            </div>
          )}

          {/* Hover glow effect */}
          <div className={`absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isTop1 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-gradient-to-r from-primary/5 to-accent/5'
          }`} />
        </div>
      </Card>
    </div>
  );
};

const WorldClassMobileMemeTokenGrid: React.FC<Props> = ({ category }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { tokens, loading, error, hasMore } = useMemeTokens(category, 20, page);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const loadMore = async () => {
    if (hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(p => p + 1);
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 500);
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 p-4 animate-pulse mobile-backdrop">
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
      <div className="text-center py-8 animate-fade-in">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
        >
          Försök igen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token, index) => (
        <PremiumTokenCard
          key={token.id}
          token={token}
          index={index}
          onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
        />
      ))}

      {/* Enhanced Load More Button */}
      {hasMore && (
        <div className="pt-4 animate-fade-in">
          <Button
            onClick={loadMore}
            disabled={loading || isLoadingMore}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 font-semibold py-4 mobile-backdrop transition-all duration-300 hover:shadow-lg"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

export default WorldClassMobileMemeTokenGrid;