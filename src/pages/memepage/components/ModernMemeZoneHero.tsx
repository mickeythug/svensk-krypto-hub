import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Crown, 
  Rocket, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign,
  PlusCircle,
  Zap,
  Target,
  Diamond,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { useIsMobile } from '@/hooks/use-mobile';

const ModernMemeZoneHero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const stats = [
    { icon: TrendingUp, label: 'Live Tokens', value: '247+', color: 'text-primary' },
    { icon: Users, label: 'Active Traders', value: '5.2K', color: 'text-purple-400' },
    { icon: DollarSign, label: 'Daily Volume', value: '$2.1M', color: 'text-green-400' },
    { icon: Star, label: 'Success Rate', value: '89%', color: 'text-yellow-400' },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/5"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-pink-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,225,159,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,225,159,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 mb-8"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-orbitron font-bold text-foreground tracking-wider">PREMIUM TRADING PLATFORM</span>
            <Crown className="w-5 h-5 text-yellow-400" />
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`font-orbitron font-black tracking-wider mb-6 ${
              isMobile 
                ? 'text-5xl leading-tight' 
                : 'text-8xl leading-none'
            }`}
          >
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MEME ZONE
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto mb-12 ${
              isMobile ? 'text-lg px-4' : 'text-xl'
            }`}
          >
            Upptäck och handla med de hetaste meme-tokens på Solana. 
            Professionell trading-platform med real-time data och avancerade verktyg.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className={`flex gap-6 justify-center mb-16 ${
              isMobile ? 'flex-col items-center px-4' : 'flex-row'
            }`}
          >
            {/* Primary CTA - Create Token */}
            <Button
              onClick={() => navigate('/meme/create')}
              size={isMobile ? 'default' : 'lg'}
              className={`group bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground font-orbitron font-bold tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                isMobile ? 'w-full py-4 text-base' : 'px-12 py-6 text-lg'
              }`}
            >
              <PlusCircle className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              SKAPA DIN TOKEN
              <Sparkles className="w-5 h-5 ml-3 group-hover:scale-110 transition-transform duration-300" />
            </Button>

            {/* Secondary CTA - Explore */}
            <Button
              onClick={() => {
                const element = document.querySelector('[data-section="meme-explorer"]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="outline"
              size={isMobile ? 'default' : 'lg'}
              className={`group border-2 border-primary/40 text-foreground hover:bg-primary/10 font-orbitron font-bold tracking-wider transition-all duration-300 hover:scale-105 ${
                isMobile ? 'w-full py-4 text-base' : 'px-12 py-6 text-lg'
              }`}
            >
              <Target className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              UTFORSKA TOKENS
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className={`grid gap-6 mb-20 ${
            isMobile 
              ? 'grid-cols-2 px-4' 
              : 'grid-cols-4 max-w-6xl mx-auto'
          }`}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
            >
              <Card className="group p-6 bg-card/60 backdrop-blur-xl border border-border/60 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                <div className="text-center space-y-3">
                  <div className={`inline-flex p-3 rounded-full bg-gradient-to-br from-background to-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="font-orbitron font-black text-2xl text-foreground tracking-wider">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className={`grid gap-8 ${
            isMobile ? 'grid-cols-1 px-4' : 'grid-cols-3 max-w-7xl mx-auto'
          }`}
        >
          {/* Live Trading */}
          <Card className="group p-8 bg-gradient-to-br from-primary/10 via-card/80 to-card/60 backdrop-blur-xl border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-xl text-foreground mb-3 tracking-wider">
                  LIVE TRADING
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time marknadsdata och omedelbar exekvering av trades. 
                  Följ prisrörelser live och agera snabbt på marknadsförändringar.
                </p>
              </div>
            </div>
          </Card>

          {/* Professional Tools */}
          <Card className="group p-8 bg-gradient-to-br from-purple-500/10 via-card/80 to-card/60 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                <Diamond className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-xl text-foreground mb-3 tracking-wider">
                  PROFESSIONELLA VERKTYG
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Avancerade analys-verktyg, tekniska indikatorer och portföljhantering. 
                  Allt du behöver för professionell trading.
                </p>
              </div>
            </div>
          </Card>

          {/* Secure Platform */}
          <Card className="group p-8 bg-gradient-to-br from-green-500/10 via-card/80 to-card/60 backdrop-blur-xl border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10">
                <Timer className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-xl text-foreground mb-3 tracking-wider">
                  SÄKER PLATTFORM
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Högsta säkerhetsstandarder med krypterade transaktioner. 
                  Din investering är skyddad med modern blockchain-teknologi.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-3 text-muted-foreground mb-8">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="font-medium">Redo att börja?</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
          
          <Button
            onClick={() => {
              const element = document.querySelector('[data-section="meme-explorer"]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="ghost"
            className="group text-primary hover:text-primary-glow font-orbitron font-bold tracking-wider text-lg transition-all duration-300"
          >
            <span>Börja utforska tokens</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-2"
            >
              ↓
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernMemeZoneHero;