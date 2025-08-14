import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import hero from '@/assets/meme-hero.jpg';

const MemeHeader = memo(() => {
  const floatingIcons = [
    { emoji: '🚀', left: '10%', top: '20%', delay: 0 },
    { emoji: '💎', left: '80%', top: '25%', delay: 0.2 },
    { emoji: '🌙', left: '20%', top: '70%', delay: 0.4 },
    { emoji: '⚡', left: '75%', top: '70%', delay: 0.6 },
  ];

  return (
    <section className="text-center mb-16 relative overflow-hidden">
      {/* Hero Banner - fixed height to avoid CLS */}
      <div className="relative w-full max-w-6xl mx-auto mb-8 rounded-2xl overflow-hidden border border-border/60 shadow-[var(--shadow-elegant)]">
        <OptimizedImage
          src={hero}
          alt="Färgglad meme crypto collage hero bild"
          className="block h-[320px] w-full object-cover"
          fallbackSrc="/placeholder.svg"
        />
      </div>

      {/* Subtle Floating Background Emojis (deterministic positions) */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-5xl opacity-10"
            style={{ left: icon.left, top: icon.top }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: icon.delay }}
          >
            {icon.emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MEME TOKEN ZON
          </h1>
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          🎉 Welcome to the wildest part of crypto! Discover trending meme tokens,
          småcap-gems och community-drivna coins som tar internet med storm!
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-bold px-8"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Utforska Tokens
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary text-primary hover:bg-primary/10 font-bold px-8"
          >
            <Zap className="mr-2 h-5 w-5" />
            Trending Now
          </Button>
        </div>

        {/* Compact Stats Bar */}
        <div className="flex justify-center gap-8 text-center">
          <div className="bg-card/70 backdrop-blur rounded-lg p-4 border border-primary/20">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <div className="text-sm text-muted-foreground">Meme Tokens</div>
          </div>
          <div className="bg-card/70 backdrop-blur rounded-lg p-4 border border-warning/20">
            <div className="text-2xl font-bold text-warning">24h</div>
            <div className="text-sm text-muted-foreground">Live Data</div>
          </div>
          <div className="bg-card/70 backdrop-blur rounded-lg p-4 border border-success/20">
            <div className="text-2xl font-bold text-success">+150%</div>
            <div className="text-sm text-muted-foreground">Avg Daily Move</div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default MemeHeader;