import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Diamond, BarChart3, Users, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';

// Format utilities
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

interface ModernTokenCardProps {
  token: any;
  rank: number;
  onClick: () => void;
}

const ModernTokenCard: React.FC<ModernTokenCardProps> = ({ token, rank, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const positive = token.change24h > 0;

  const getTierStyle = (rank: number) => {
    if (rank === 1) return {
      border: 'border-gradient-to-r from-yellow-400 to-orange-500',
      badge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      glow: 'shadow-lg shadow-yellow-500/20'
    };
    if (rank <= 3) return {
      border: 'border-gradient-to-r from-purple-400 to-pink-500',
      badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
      glow: 'shadow-lg shadow-purple-500/20'
    };
    if (rank <= 10) return {
      border: 'border-gradient-to-r from-blue-400 to-cyan-500',
      badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      glow: 'shadow-lg shadow-blue-500/20'
    };
    return {
      border: 'border-border',
      badge: 'bg-secondary',
      glow: 'shadow-md'
    };
  };

  const tierStyle = getTierStyle(rank);

  return (
    <Card 
      className={`
        group relative overflow-hidden cursor-pointer h-auto bg-card/95 backdrop-blur-sm
        border-2 ${tierStyle.border} ${tierStyle.glow}
        transform transition-all duration-300 ease-out hover:scale-105
        ${isHovered ? 'shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Rank Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className={`${tierStyle.badge} text-white font-bold px-3 py-1 text-sm shadow-md`}>
            #{rank}
          </Badge>
        </div>

        {/* Hot Badge for top performers */}
        {rank <= 5 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500 text-white font-bold px-2 py-1 text-xs animate-pulse">
              HOT
            </Badge>
          </div>
        )}

        {/* Token Image */}
        <div className="relative mt-8 mb-6">
          <AspectRatio ratio={16 / 10}>
            <OptimizedImage
              src={token.image || '/placeholder.svg'}
              alt={`${token.name} logo`}
              className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
              fallbackSrc="/placeholder.svg"
            />
          </AspectRatio>
        </div>

        {/* Token Info */}
        <div className="space-y-4">
          {/* Symbol and Change */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-foreground truncate max-w-[60%]">
              {token.symbol}
            </h3>
            <div className={`flex items-center gap-2 text-lg font-bold ${
              positive ? 'text-green-500' : 'text-red-500'
            }`}>
              {positive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>{positive ? '+' : ''}{formatPercentage(token.change24h)}</span>
            </div>
          </div>

          {/* Token Name */}
          <p className="text-muted-foreground text-sm font-medium truncate">{token.name}</p>

          {/* Stats Grid - ONLY MCAP AND VOLUME */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Diamond className="w-3 h-3" />
                <span className="font-medium">MARKNADSVÄRDE</span>
              </div>
              <div className="text-lg font-bold text-foreground">{formatCompact(token.marketCap)}</div>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <BarChart3 className="w-3 h-3" />
                <span className="font-medium">VOLYM 24H</span>
              </div>
              <div className="text-lg font-bold text-foreground">{formatCompact(token.volume24h)}</div>
            </div>
          </div>

          {/* Social Metrics */}
          {(token.holders || token.views) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {token.holders && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{formatCompact(token.holders)} innehavare</span>
                </div>
              )}
              {token.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatCompact(token.views)} visningar</span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full font-semibold text-sm py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            variant="default"
          >
            Visa {token.symbol}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernTokenCard;