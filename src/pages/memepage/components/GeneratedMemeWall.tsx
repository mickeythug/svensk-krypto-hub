import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/OptimizedImage';

import frog1 from '@/assets/meme-generated/meme-coin-frog-1.webp';
import shiba1 from '@/assets/meme-generated/meme-coin-shiba-1.webp';
import doghat1 from '@/assets/meme-generated/meme-coin-dog-hat-1.webp';
import cat1 from '@/assets/meme-generated/meme-coin-cat-1.webp';
import doglaser1 from '@/assets/meme-generated/meme-coin-doge-laser-1.webp';
import frogpx1 from '@/assets/meme-generated/meme-coin-frog-pixel-1.webp';

const imgs = [frog1, shiba1, doghat1, cat1, doglaser1, frogpx1];

const GeneratedMemeWall = () => {
  return (
    <section aria-labelledby="generated-memes-title" className="relative">
      <h3 id="generated-memes-title" className="mb-4 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">🎨 Genererade Meme‑bilder</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {imgs.map((src, i) => (
          <Card key={i} className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm animate-fade-in">
            <AspectRatio ratio={1}>
              <OptimizedImage src={src} alt={`Genererad meme‑token bild ${i + 1}`} className="h-full w-full object-cover" fallbackSrc="/placeholder.svg" />
            </AspectRatio>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default GeneratedMemeWall;
