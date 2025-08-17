import { memo } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import hero from '@/assets/meme-hero.jpg';

const MemeHeroPro = memo(() => {
  return (
    <section className="relative mb-10 overflow-hidden">
      {/* Fixed-height hero to prevent CLS */}
      <div className="relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden border border-border/60 shadow-[var(--shadow-elegant)]">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background/80" />
        <OptimizedImage
          src={hero}
          alt="Färgglad meme crypto collage – hero"
          className="block h-[320px] w-full object-cover md:h-[480px]"
          fallbackSrc="/placeholder.svg"
          loading="eager"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-sm text-muted-foreground">Crypto Network Sweden</span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-6xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MEME TOKEN MEGA-ZON
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Upptäck de hetaste meme-coinsen med stora, tydliga bilder. Stabil, snabb och produktionredo upplevelse.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-bold px-8">
              <Rocket className="mr-2 h-5 w-5" /> Utforska trender
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 font-bold px-8">
              <Zap className="mr-2 h-5 w-5" /> Live-uppdaterat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

export default MemeHeroPro;
