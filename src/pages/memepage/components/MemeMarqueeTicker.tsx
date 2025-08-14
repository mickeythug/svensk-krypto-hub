import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';

const TokenChip = ({ symbol, name, marketCap, change24h, image }: any) => {
  const positive = change24h > 0;
  const formatCompactUsd = (n: number) => {
    if (!isFinite(n) || n <= 0) return '—';
    const v = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    return `$${v} MCAP`;
  };
  return (
    <div className="group flex items-center gap-3 px-4 py-2 rounded-full border border-border/60 bg-card/70 backdrop-blur-sm hover:shadow-glow-secondary transition">
      {image ? (
        <OptimizedImage src={image} alt={`${name} logotyp`} className="h-6 w-6 rounded-full object-cover" fallbackSrc="/placeholder.svg" />
      ) : (
        <div className="h-6 w-6 rounded-full bg-primary/20" />
      )}
      <div className="flex items-center gap-3">
        <span className="font-bold">{symbol}</span>
        <span className="text-muted-foreground hidden sm:inline">{name}</span>
        <span className="tabular-nums text-sm">{formatCompactUsd(marketCap)}</span>
        <Badge variant="outline" className={`${positive ? 'text-success border-success/40' : 'text-destructive border-destructive/40'} bg-transparent`}>
          {positive ? '+' : ''}{change24h.toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
};

const MemeMarqueeTicker = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 12);
  const list = useMemo(() => (loading ? Array.from({ length: 12 }).map((_, i) => ({ id: i, symbol: '...', name: 'Loading', price: 0, change24h: 0 })) : tokens), [loading, tokens]);

  if (error) return null;

  return (
    <section aria-label="Rullande crypto-ticker" className="relative">
      <Card className="overflow-hidden border border-border/60 bg-card/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-80" />
          <div className="flex whitespace-nowrap animate-ticker will-change-transform">
            <div className="flex gap-4 px-4 py-3">
              {list.map((t: any, i: number) => (
                <TokenChip key={`a-${t.id ?? i}`} {...t} />
              ))}
            </div>
            <div className="flex gap-4 px-4 py-3" aria-hidden="true">
              {list.map((t: any, i: number) => (
                <TokenChip key={`b-${t.id ?? i}`} {...t} />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default MemeMarqueeTicker;
