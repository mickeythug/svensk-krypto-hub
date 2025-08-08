import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import MemeHeroPro from './components/MemeHeroPro';
import MemeShowcaseGrid from './components/MemeShowcaseGrid';
import MemeTokenGallery from './components/MemeTokenGallery';

interface MemePage {}

const MemePage: React.FC<MemePage> = () => {
  useEffect(() => {
    const title = 'Meme Tokens – Mega-Zon | Crypto Network Sweden';
    const description = 'Världsklass meme token-sida: stora bilder, stabilt, snabbt och produktionredo. Upptäck trending och alla meme-coins.';
    document.title = title;

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      const existing = document.head.querySelector(selector);
      if (existing) return existing as HTMLElement;
      const el = create();
      document.head.appendChild(el);
      return el;
    };

    const md = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    md.setAttribute('content', description);

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    const origin = window.location.origin || 'https://cryptonetworksweden.se';
    canonical.setAttribute('href', `${origin}/meme`);

    const ldId = 'ld-json-meme-page';
    const oldLd = document.getElementById(ldId);
    if (oldLd) oldLd.remove();
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Meme Tokens – Mega-Zon',
      description,
      url: `${origin}/meme`
    });
    document.head.appendChild(ld);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* HERO */}
        <MemeHeroPro />

        {/* TRENDING SHOWCASE */}
        <section className="mb-12" aria-labelledby="trending-heading">
          <h2 id="trending-heading" className="mb-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            🔥 Heta just nu
          </h2>
          <MemeShowcaseGrid />
        </section>

        {/* GALLERY */}
        <section className="mb-12" aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">
            🚀 Alla Meme Tokens
          </h2>
          <MemeTokenGallery />
        </section>

        {/* Varning */}
        <section aria-labelledby="warning-heading">
          <Card className="p-6 border-warning/50 bg-gradient-to-r from-warning/10 to-warning/10">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-warning mt-1" />
              <div>
                <h3 id="warning-heading" className="font-bold text-warning mb-2">⚠️ Meme Token Varning</h3>
                <p className="text-sm text-muted-foreground">
                  Meme tokens är extremt volatila och riskfyllda investeringar. Investera endast vad du har råd att förlora. Gör alltid egen research (DYOR). Denna sida är för utbildning och underhållning.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default MemePage;
