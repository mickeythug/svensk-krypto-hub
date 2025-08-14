import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, type MemeCategory } from '../../hooks/useMemeTokens';
import { useNavigate } from 'react-router-dom';
import MobilePagination from './MobilePagination';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Crown, Flame, Target, Star, Eye, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
interface Props {
  category: MemeCategory;
  viewMode?: 'grid' | 'list';
}
function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, {
    maximumFractionDigits: 4
  })}`;
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
const PremiumTokenListItem = ({
  token,
  index,
  onClick,
  t
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const positive = token.change24h > 0;
  const isTop3 = index < 3;
  const isTop1 = index === 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
      style={{ transitionDelay: `${index * 25}ms` }}
    >
      <Card 
        className={`relative overflow-hidden bg-black/15 backdrop-blur-xl border border-white/10 cursor-pointer hover:bg-black/25 hover:border-white/20 hover:scale-[1.01] transition-all duration-300 ease-out ${
          isTop1 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/10 to-orange-900/10' : 
          isTop3 ? 'border-orange-400/40 bg-gradient-to-r from-orange-900/10 to-red-900/10' : ''
        }`}
        onClick={onClick}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Rank & Image */}
            <div className="relative flex items-center gap-3">
              {isTop3 && (
                <Badge className={`text-xs px-1.5 py-0.5 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' : 
                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' : 
                  'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                }`}>
                  {index === 0 && <Crown className="w-2 h-2 mr-1" />}
                  #{index + 1}
                </Badge>
              )}
              
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:scale-105 transition-all duration-300">
                <OptimizedImage 
                  src={token.image || '/placeholder.svg'} 
                  alt={`${token.name} logo`} 
                  className="w-full h-full object-cover" 
                  fallbackSrc="/placeholder.svg" 
                />
              </div>
            </div>

            {/* Enhanced Token Info with better text handling */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="font-bold text-base text-white text-truncate-1 max-w-[120px]">
                    {token.symbol}
                  </h3>
                  <p className="text-white/50 text-xs text-truncate-1 font-medium max-w-[120px]">{token.name}</p>
                </div>
                
                {/* Clean Price Change display */}
                <div className={`flex items-center gap-1 text-sm font-bold transition-colors duration-300 btn-feedback ${positive ? 'text-green-400' : 'text-red-400'}`}>
                  {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-numbers">{positive ? '+' : ''}{formatPercentage(token.change24h)}</span>
                </div>
              </div>

              {/* Enhanced Stats with truncation */}
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-blue-400" />
                  <span className="text-white text-xs font-medium font-numbers text-truncate-1">{formatCompact(token.marketCap)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-green-400" />
                  <span className="text-white/70 text-xs font-numbers text-truncate-1">{formatCompact(token.volume24h)}</span>
                </div>
              </div>
            </div>

            {/* Hot Badge for top tokens */}
            {isTop3 && (
              <div className="animate-fade-in">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1">
                  {isTop1 ? '🔥' : '⭐'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const PremiumTokenCard = ({
  token,
  index,
  onClick,
  t
}) => {
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
  const handleShare = e => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${token.symbol} - ${token.name}`,
        text: `Check out ${token.symbol} on Meme Zone!`,
        url: window.location.href
      });
    }
  };
  return <div className={`group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{
    transitionDelay: `${index * 50}ms`
  }}>
      <Card className={`relative overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 cursor-pointer mobile-backdrop group-hover:bg-black/30 group-hover:border-white/20 group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-500 ease-out ${isTop1 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 shadow-lg shadow-yellow-500/10' : isTop3 ? 'border-orange-400/50 bg-gradient-to-r from-orange-900/20 to-red-900/20 shadow-lg shadow-orange-500/10' : 'group-hover:shadow-xl group-hover:shadow-primary/5'}`} onClick={onClick}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Enhanced Rank & Image */}
            <div className="relative">
              {isTop3 && <div className="absolute -top-2 -left-2 z-10 animate-fade-in">
                    <Badge className={`text-xs px-2 py-1 ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/25' : index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black shadow-lg' : 'bg-gradient-to-r from-orange-400 to-orange-600 text-black shadow-lg shadow-orange-500/25'}`}>
                      {index === 0 && <Crown className="w-3 h-3 mr-1" />}
                      #{index + 1}
                    </Badge>
                  </div>}
                
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 transition-all duration-500">
                <OptimizedImage src={token.image || '/placeholder.svg'} alt={`${token.name} logo`} className="w-full h-full object-cover" fallbackSrc="/placeholder.svg" />
              </div>
            </div>

            {/* Enhanced Token Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1 pr-2 text-container no-fancy-effects">
                  <h3 className="font-bold text-lg text-white truncate transition-colors duration-300 text-clean font-sans">
                    {token.symbol}
                  </h3>
                  <p className="text-white/60 text-sm truncate font-medium text-clean font-sans">{token.name}</p>
                </div>
                
                {/* Clean Price Change display */}
                <div className={`flex items-center gap-1 text-sm font-bold transition-colors duration-300 pl-2 no-fancy-effects font-sans ${positive ? 'text-green-400' : 'text-red-400'}`}>
                  {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="truncate max-w-[60px] text-clean font-numbers">{positive ? '+' : ''}{formatPercentage(token.change24h)}</span>
                </div>
              </div>

              {/* Enhanced Stats Grid - Only MCap and Volume */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[{
                icon: BarChart3,
                label: "MCap",
                value: formatCompact(token.marketCap),
                color: "text-blue-400"
              }, {
                icon: Users,
                label: "Vol 24h",
                value: formatCompact(token.volume24h),
                color: "text-green-400"
              }].map((stat, statIndex) => <div key={statIndex} className="bg-white/5 rounded-lg p-3 border border-white/10 group-hover:bg-white/10 transition-all duration-300" style={{
                transitionDelay: `${statIndex * 50}ms`
              }}>
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-1 font-medium no-fancy-effects text-clean font-sans">
                      <stat.icon className={`w-3 h-3 ${stat.color}`} />
                      {stat.label}
                    </div>
                    <div className="text-white font-bold text-base text-clean text-container font-numbers truncate">
                      {stat.value}
                    </div>
                  </div>)}
              </div>

              {/* Action Button */}
              <Button size="sm" className="w-full bg-gradient-to-r from-primary/80 to-primary text-black font-bold rounded-lg transition-all duration-300 mobile-backdrop hover:scale-105 hover:shadow-lg hover:shadow-primary/25 font-sans">
                <Target className="w-4 h-4 mr-2" />
                {t('memeZone.buyNow')}
              </Button>

              {/* Social engagement indicators */}
              
            </div>
          </div>

          {/* Enhanced Hot Badge */}
          {isTop3 && <div className="absolute top-2 right-2 animate-fade-in">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse shadow-lg">
              {isTop1 ? `🔥 ${t('memeZone.hot')}` : `⭐ ${t('memeZone.topGainer')}`}
            </Badge>
            </div>}

          {/* Hover glow effect */}
          <div className={`absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isTop1 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-gradient-to-r from-primary/5 to-accent/5'}`} />
        </div>
      </Card>
    </div>;
};
const WorldClassMobileMemeTokenGrid: React.FC<Props> = ({
  category,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const {
    tokens,
    loading,
    error,
    hasMore,
    lastUpdated,
    totalPages,
    currentPage,
    totalTokens
  } = useMemeTokens(category, 20, page); // Fixed 20 per page
  
  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (totalPages || 10)) {
      setPage(newPage);
    }
  };
  if (loading && tokens.length === 0) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 p-3 animate-pulse mobile-backdrop">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-3 w-12 bg-white/10" />
                  </div>
                  <Skeleton className="h-3 w-24 bg-white/10" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16 bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/10" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    }
    
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
    return <div className="text-center py-8 animate-fade-in">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300">
          {t('crypto.retry')}
        </Button>
      </div>;
  }
  return (
    <div className="space-y-4">
      {/* Real-time update indicator */}
      {lastUpdated && (
        <div className="text-center py-2">
          <span className="text-xs text-white/60 font-medium">
            {t('common.refresh')}: {new Date(lastUpdated).toLocaleTimeString('sv-SE')}
          </span>
        </div>
      )}

      {tokens.map((token, index) => 
        viewMode === 'list' ? (
          <PremiumTokenListItem 
            key={token.id} 
            token={token} 
            index={index} 
            onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)} 
            t={t}
          />
        ) : (
          <PremiumTokenCard 
            key={token.id} 
            token={token} 
            index={index} 
            onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)} 
            t={t}
          />
        )
      )}

      {/* Enhanced Pagination with page numbers */}
      <MobilePagination 
        currentPage={page} 
        hasMore={hasMore} 
        onPageChange={handlePageChange} 
        loading={loading}
        totalPages={totalPages || 10}
        totalTokens={totalTokens}
      />
    </div>
  );
};
export default WorldClassMobileMemeTokenGrid;