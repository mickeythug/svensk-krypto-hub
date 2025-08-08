import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OptimizedImage from '@/components/OptimizedImage';

import frog1 from '@/assets/meme-generated/meme-coin-frog-1.webp';
import shiba1 from '@/assets/meme-generated/meme-coin-shiba-1.webp';
import doghat1 from '@/assets/meme-generated/meme-coin-dog-hat-1.webp';
import cat1 from '@/assets/meme-generated/meme-coin-cat-1.webp';
import doglaser1 from '@/assets/meme-generated/meme-coin-doge-laser-1.webp';
import frogpx1 from '@/assets/meme-generated/meme-coin-frog-pixel-1.webp';

const defaults = [frog1, shiba1, doghat1, cat1, doglaser1, frogpx1];

const MemeTokenCreator = () => {
  const [name, setName] = useState('MegaFrog Coin');
  const [symbol, setSymbol] = useState('MEGA');
  const [emoji, setEmoji] = useState('🐸');
  const [image, setImage] = useState<string | null>(defaults[0]);
  const [idx, setIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => {
    // Cleanup possible object URLs if we made any later
  }, []);

  const cycleImage = () => {
    const next = (idx + 1) % defaults.length;
    setIdx(next);
    setImage(defaults[next]);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImage(url);
  };

  const preview = useMemo(() => ({ name, symbol, emoji, image }), [name, symbol, emoji, image]);

  return (
    <section aria-labelledby="creator-title" className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 bg-card/70 backdrop-blur-sm">
          <h3 id="creator-title" className="font-extrabold text-xl mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Skapa din egen Meme Token</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. MegaFrog Coin" />
            </div>
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().slice(0,6))} placeholder="MEGA" />
            </div>
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input id="emoji" value={emoji} onChange={(e) => setEmoji(e.target.value.slice(0,2))} placeholder="🐸" />
            </div>
            <div>
              <Label>Bild</Label>
              <div className="flex gap-2">
                <Input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="file:mr-2" />
                <Button type="button" variant="outline" onClick={cycleImage}>Slumpa</Button>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Obs: Detta är en visuell prototyp utan blockchain‑deploy. Använd uppladdning eller Slumpa för att få en snygg tokenbild.</p>
        </Card>

        <Card className="p-6 border-border/60 bg-card/70 backdrop-blur-sm">
          <h4 className="font-bold mb-4">Live‑förhandsvisning</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden border border-border/60">
              <OptimizedImage src={preview.image ?? defaults[0]} alt={`${preview.name} omslagsbild`} className="h-64 w-full object-cover" fallbackSrc="/placeholder.svg" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 text-lg font-extrabold">
                  <span>{preview.emoji}</span>
                  <span>{preview.symbol}</span>
                </div>
                <div className="text-sm text-muted-foreground truncate">{preview.name}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 p-4 bg-secondary/30">
                <div className="text-xs text-muted-foreground">Tokennamn</div>
                <div className="font-bold">{preview.name}</div>
              </div>
              <div className="rounded-lg border border-border/60 p-4 bg-secondary/30">
                <div className="text-xs text-muted-foreground">Symbol</div>
                <div className="font-bold">{preview.symbol}</div>
              </div>
              <div className="rounded-lg border border-border/60 p-4 bg-secondary/30">
                <div className="text-xs text-muted-foreground">Emoji</div>
                <div className="font-bold text-2xl leading-none">{preview.emoji}</div>
              </div>
              <Button className="w-full bg-gradient-primary">Generera delningsbild</Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MemeTokenCreator;
