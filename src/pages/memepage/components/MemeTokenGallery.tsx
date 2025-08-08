import { useMemo } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { Card } from '@/components/ui/card';

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

const MemeTokenGallery = () => {
  const { tokens, loading, error } = useMemeTokens('all');
  const items = useMemo(() => tokens.map((t, i) => ({ ...t, cover: covers[i % covers.length], ratio: (i % 3 === 0 ? 1 : 4/5) })), [tokens]);

  if (error) return <div className="text-center text-destructive">Kunde inte ladda tokens.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {(loading ? Array.from({ length: 20 }) : items).map((item, i) => (
        <Card key={i} className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
          <AspectRatio ratio={(loading ? 1 : (item as any).ratio)}>
            {loading ? (
              <div className="h-full w-full bg-muted animate-pulse" />
            ) : (
              <>
                <OptimizedImage
                  src={(item as any).cover}
                  alt={`${(item as any).name} – bild`}
                  className="h-full w-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-background/80 via-background/30 to-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-bold">{(item as any).emoji} {(item as any).symbol}</h3>
                    <span className="text-xs text-muted-foreground">{(item as any).views} visningar</span>
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

export default MemeTokenGallery;
