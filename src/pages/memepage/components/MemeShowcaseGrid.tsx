import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import c1 from '@/assets/meme-covers/meme-cover-1.jpg';
import c2 from '@/assets/meme-covers/meme-cover-2.jpg';
import c3 from '@/assets/meme-covers/meme-cover-3.jpg';
import c4 from '@/assets/meme-covers/meme-cover-4.jpg';
import c5 from '@/assets/meme-covers/meme-cover-5.jpg';
import c6 from '@/assets/meme-covers/meme-cover-6.jpg';
import c7 from '@/assets/meme-covers/meme-cover-7.jpg';
import c8 from '@/assets/meme-covers/meme-cover-8.jpg';
import c9 from '@/assets/meme-covers/meme-cover-9.jpg';
import c10 from '@/assets/meme-covers/meme-cover-10.jpg';
import c11 from '@/assets/meme-covers/meme-cover-11.jpg';
import c12 from '@/assets/meme-covers/meme-cover-12.jpg';

const covers = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12];

// Prefer real token logos when available
import doge from '@/assets/crypto-logos/doge.png';
import shib from '@/assets/crypto-logos/shib.png';
const tokenImages: Record<string, string> = {
  doge,
  shib,
};

const formatPrice = (price: number): string => {
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const Change = ({ value }: { value: number }) => {
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? 'text-success' : value < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : value < 0 ? <TrendingDown className="h-3 w-3" /> : null}
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
};

const MemeShowcaseGrid = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 8);

  const items = useMemo(() => tokens.map((t, i) => ({ ...t, cover: covers[i % covers.length] })), [tokens]);

  if (error) {
    return <div className="text-center text-destructive">Kunde inte ladda trending tokens.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {(loading ? Array.from({ length: 8 }) : items).map((item, i) => (
        <Card key={i} className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
          <AspectRatio ratio={4/5}>
            {loading ? (
              <div className="h-full w-full bg-muted animate-pulse" />
            ) : (
              <>
                <OptimizedImage
                  src={tokenImages[((item as any).symbol || '').toLowerCase()] ?? (item as any).cover}
                  alt={`${(item as any).name} – logotyp / omslagsbild`}
                  className="h-full w-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-lg md:text-xl">{(item as any).emoji} {(item as any).symbol}</h3>
                      <p className="truncate text-xs md:text-sm text-muted-foreground">{(item as any).name}</p>
                    </div>
                    <Badge className="shrink-0 bg-primary/20 text-primary border border-primary/30">HOT</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="tabular-nums font-bold">{formatPrice((item as any).price)}</span>
                    <Change value={(item as any).change24h} />
                  </div>
                </div>
              </>
            )}
          </AspectRatio>
        </Card>
      ))}
    </div>
  );
};

export default MemeShowcaseGrid;
