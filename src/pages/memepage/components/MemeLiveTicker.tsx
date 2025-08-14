import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';

const TokenChip = ({ symbol, name, marketCap, change24h, image, isMobile }: any) => {
  const positive = change24h > 0;
  const formatCompactUsd = (n: number) => {
    if (!isFinite(n) || n <= 0) return '—';
    const v = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    return `$${v} MCAP`;
  };
  
  if (isMobile) {
    return (
      <div className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/40 bg-gradient-to-r from-card/95 to-card/85 backdrop-blur-sm min-w-[140px] shadow-sm">
        {image ? (
          <div className="relative">
            <OptimizedImage 
              src={image}
              alt={`${name} logo`} 
              className="h-6 w-6 rounded-full object-contain" 
              fallbackSrc="/placeholder.svg" 
            />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-gradient-primary animate-pulse"></div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-foreground">{symbol}</span>
            <span className={`font-bold text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
              {positive ? '+' : ''}{Math.abs(change24h).toFixed(1)}%
            </span>
          </div>
          <span className="tabular-nums font-bold text-[10px] text-accent">{formatCompactUsd(marketCap)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm hover:shadow-glow-rainbow transition-all duration-300 min-w-[280px]">
      {image ? (
        <div className="relative">
          <OptimizedImage 
            src={image}
            alt={`${name} logo`} 
            className="h-12 w-12 rounded-full object-contain animate-float" 
            fallbackSrc="/placeholder.svg" 
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-gradient-primary animate-pulse-glow"></div>
      )}
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="font-black text-lg text-foreground">{symbol}</span>
          <span className={`font-bold text-lg ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {positive ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground truncate max-w-[120px]">{name}</span>
          <span className="tabular-nums font-bold text-accent">{formatCompactUsd(marketCap)}</span>
        </div>
      </div>
    </div>
  );
};

const MemeLiveTicker = () => {
  const isMobile = useIsMobile();
  const { tokens, loading, error } = useMemeTokens('trending', 15);
  const list = useMemo(() => (loading ? Array.from({ length: 15 }).map((_, i) => ({ 
    id: i, symbol: '...', name: 'Laddar', marketCap: 0, change24h: 0 
  })) : tokens), [loading, tokens]);

  if (error) return null;

  return (
    <section className="w-full">
      <Card className={`overflow-hidden border-0 ${isMobile ? 'border-t border-b' : 'border-t-2 border-b-2'} border-primary/30 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm shadow-glow-primary rounded-none`}>
        <div className="relative">
          {/* Rainbow gradient overlay */}
          <div className="absolute inset-0 bg-gradient-rainbow opacity-10 pointer-events-none"></div>
          
          {/* Scrolling content */}
          <div className="flex whitespace-nowrap animate-ticker will-change-transform">
            <div className={`flex ${isMobile ? 'gap-2 px-3 py-3' : 'gap-6 px-6 py-6'}`}>
              {list.map((t: any, i: number) => (
                <TokenChip key={`a-${t.id ?? i}`} {...t} isMobile={isMobile} />
              ))}
            </div>
            <div className={`flex ${isMobile ? 'gap-2 px-3 py-3' : 'gap-6 px-6 py-6'}`} aria-hidden="true">
              {list.map((t: any, i: number) => (
                <TokenChip key={`b-${t.id ?? i}`} {...t} isMobile={isMobile} />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default MemeLiveTicker;