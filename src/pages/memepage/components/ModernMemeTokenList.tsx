import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Users, Volume2, Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/OptimizedImage';
import { useNavigate } from 'react-router-dom';

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

interface ModernMemeTokenListProps {
  tokens: any[];
}

const ModernMemeTokenList: React.FC<ModernMemeTokenListProps> = ({ tokens }) => {
  const navigate = useNavigate();

  const handleTokenClick = (token: any) => {
    navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`);
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-3 px-8 pb-8">
      {/* Header Row */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 px-6 py-4 text-sm font-orbitron font-bold text-white/60 border-b border-white/10 tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-3">TOKEN</div>
        <div className="col-span-2 text-right">PRIS</div>
        <div className="col-span-2 text-right">24H %</div>
        <div className="col-span-2 text-right">MARKET CAP</div>
        <div className="col-span-1 text-right">VOLYM</div>
        <div className="col-span-1 text-center">ACTION</div>
      </div>

      {/* Token Rows */}
      {tokens.map((token, index) => (
        <div
          key={token.id}
          className="group relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-black/80 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
          onClick={() => handleTokenClick(token)}
        >
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Top Row - Token Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Badge className="absolute -top-2 -left-2 bg-primary/20 text-primary border border-primary/30 text-xs font-bold z-10">
                    #{index + 1}
                  </Badge>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                    <OptimizedImage
                      src={token.image || '/placeholder.svg'}
                      alt={`${token.name} logo`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      fallbackSrc="/placeholder.svg"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-orbitron font-bold text-white text-lg tracking-wider truncate">
                    {token.symbol}
                  </h3>
                  <p className="text-white/60 text-sm truncate">{token.name}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 font-bold text-lg ${getTrendColor(token.change24h)}`}>
                {getTrendIcon(token.change24h)}
                <span>{token.change24h > 0 ? '+' : ''}{formatPercentage(token.change24h)}</span>
              </div>
            </div>

            {/* Bottom Row - Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60 font-medium">Pris:</span>
                <span className="ml-2 text-white font-bold">{formatPrice(token.price)}</span>
              </div>
              <div>
                <span className="text-white/60 font-medium">Market Cap:</span>
                <span className="ml-2 text-white font-bold">{formatCompact(token.marketCap)}</span>
              </div>
              <div>
                <span className="text-white/60 font-medium">Volym 24h:</span>
                <span className="ml-2 text-white font-bold">{formatCompact(token.volume24h)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/60">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">{formatCompact(token.holders || 0)}</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">Social</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-orbitron font-bold tracking-wider"
              onClick={(e) => {
                e.stopPropagation();
                handleTokenClick(token);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              VISA DETALJER
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-center">
            {/* Rank */}
            <div className="col-span-1 text-center">
              <Badge className="bg-primary/20 text-primary border border-primary/30 font-bold">
                #{index + 1}
              </Badge>
            </div>

            {/* Token Info */}
            <div className="col-span-3 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                <OptimizedImage
                  src={token.image || '/placeholder.svg'}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-orbitron font-bold text-white text-lg tracking-wider truncate">
                  {token.symbol}
                </h3>
                <p className="text-white/60 text-sm truncate">{token.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-white/40">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">{formatCompact(token.holders || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-xs">Social</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40">
                    <Volume2 className="w-3 h-3" />
                    <span className="text-xs">Audio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2 text-right">
              <div className="font-bold text-white text-lg">{formatPrice(token.price)}</div>
            </div>

            {/* 24h Change */}
            <div className="col-span-2 text-right">
              <div className={`flex items-center justify-end gap-2 font-bold text-lg ${getTrendColor(token.change24h)}`}>
                {getTrendIcon(token.change24h)}
                <span>{token.change24h > 0 ? '+' : ''}{formatPercentage(token.change24h)}</span>
              </div>
            </div>

            {/* Market Cap */}
            <div className="col-span-2 text-right">
              <div className="font-bold text-white text-lg">{formatCompact(token.marketCap)}</div>
            </div>

            {/* Volume */}
            <div className="col-span-1 text-right">
              <div className="font-bold text-white">{formatCompact(token.volume24h)}</div>
            </div>

            {/* Action */}
            <div className="col-span-1 text-center">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-orbitron font-bold tracking-wider px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTokenClick(token);
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

export default ModernMemeTokenList;