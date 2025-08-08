import { motion } from 'framer-motion';
import { Sparkles, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MemeHeader = () => {
  const floatingIcons = [
    { emoji: '🚀', delay: 0 },
    { emoji: '💎', delay: 0.2 },
    { emoji: '🌙', delay: 0.4 },
    { emoji: '⚡', delay: 0.6 },
    { emoji: '🔥', delay: 0.8 },
    { emoji: '💰', delay: 1.0 },
  ];

  return (
    <section className="text-center mb-16 relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: icon.delay,
            }}
          >
            {icon.emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MEME TOKEN ZON
          </h1>
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        </div>
        
        <motion.p 
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🎉 Välkommen till den vildaste delen av krypto-universum! Upptäck de hetaste meme tokens, 
          trending gems och community-drivna coins som tar internet med storm! 🌪️
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary-glow hover:to-purple-400 text-white font-bold px-8"
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
        </motion.div>

        {/* Animated Stats Bar */}
        <motion.div
          className="flex justify-center gap-8 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-primary/20">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <div className="text-sm text-muted-foreground">Meme Tokens</div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-warning/20">
            <div className="text-2xl font-bold text-warning">24h</div>
            <div className="text-sm text-muted-foreground">Live Data</div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-success/20">
            <div className="text-2xl font-bold text-success">+150%</div>
            <div className="text-sm text-muted-foreground">Avg Daily Move</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MemeHeader;