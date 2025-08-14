import { motion, useAnimation, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import {
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Star,
  Bell,
  Search,
  Plus,
  Zap,
  Rocket
} from 'lucide-react';
import heroImage from '@/assets/meme-hero.jpg';
import MobileMemeSearch from './MobileMemeSearch';

const FloatingIcon = ({ icon: Icon, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute ${className}`}
  >
    <Icon className="w-6 h-6 text-primary/60" />
  </motion.div>
);

const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value.replace(/[^\d]/g, ''));
      const timer = setInterval(() => {
        start += end / (duration / 16);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {value.includes('.') ? count.toFixed(1) : count.toLocaleString()}
      {value.includes('K') && 'K'}
      {value.includes('M') && 'M'}
      {value.includes('%') && '%'}
      {value.includes('$') && '$'}
    </span>
  );
};

const PremiumMobileMemeHero = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateX: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className="relative px-4 pt-8 pb-6 overflow-hidden"
    >
      <MobileMemeSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Floating background elements */}
      <FloatingIcon icon={Sparkles} delay={0} className="top-4 left-8" />
      <FloatingIcon icon={Star} delay={1} className="top-16 right-12" />
      <FloatingIcon icon={Zap} delay={2} className="bottom-24 left-16" />
      <FloatingIcon icon={Rocket} delay={1.5} className="bottom-16 right-8" />

      {/* Header with enhanced animations */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.h1 
            className="text-2xl font-black text-white mb-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meme Zone
          </motion.h1>
          <motion.p 
            className="text-white/70 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Upptäck hetaste tokens
          </motion.p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mobile-backdrop"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mobile-backdrop"
            >
              <Bell className="w-5 h-5 text-white" />
              {notificationCount > 0 && (
                <motion.div
                  variants={pulseVariants}
                  animate="animate"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">{notificationCount}</span>
                </motion.div>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Hero Card with 3D effects */}
      <motion.div
        variants={cardVariants}
        style={{ perspective: 1000 }}
        whileHover={{ 
          scale: 1.02,
          rotateX: 2,
          transition: { duration: 0.3 }
        }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-600/90 via-red-600/90 to-pink-600/90 border-none shadow-2xl backdrop-blur-sm mobile-backdrop">
          {/* Dynamic background with parallax effect */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <OptimizedImage
              src={heroImage}
              alt="Meme Hero Background"
              className="w-full h-full object-cover"
              fallbackSrc="/placeholder.svg"
            />
          </motion.div>
          
          {/* Animated gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-casino-rainbow opacity-20"
            animate={{
              background: [
                "linear-gradient(90deg, hsl(0 100% 60%), hsl(60 100% 60%), hsl(120 100% 60%))",
                "linear-gradient(90deg, hsl(60 100% 60%), hsl(120 100% 60%), hsl(180 100% 60%))",
                "linear-gradient(90deg, hsl(120 100% 60%), hsl(180 100% 60%), hsl(240 100% 60%))",
                "linear-gradient(90deg, hsl(0 100% 60%), hsl(60 100% 60%), hsl(120 100% 60%))"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Content with staggered animations */}
          <div className="relative z-10 p-6">
            {/* Premium badges */}
            <motion.div 
              className="flex items-center justify-between mb-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mobile-backdrop">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Flame className="w-3 h-3 mr-1" />
                  </motion.div>
                  LIVE
                </Badge>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                  </motion.div>
                  Premium
                </Badge>
              </motion.div>
            </motion.div>
            
            {/* Main content with enhanced animations */}
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              <motion.div 
                className="flex items-center justify-center gap-2 mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
                
                <motion.h2 
                  className="text-2xl font-black text-white"
                  whileHover={{ 
                    textShadow: "0 0 20px rgba(255,255,255,0.8)"
                  }}
                >
                  HETASTE TOKENS
                </motion.h2>
                
                <motion.div
                  animate={{ 
                    rotate: [0, -15, 15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-white/90 text-sm mb-6 max-w-xs mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Upptäck de mest explosiva meme tokens med live-data och realtidsuppdateringar
              </motion.p>
              
              {/* Premium CTA Buttons */}
              <motion.div 
                className="flex gap-3"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button 
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold rounded-full mobile-backdrop"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Utforska
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 20px 40px rgba(255,193,7,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Skapa Token
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Animated stats with enhanced counter animations */}
      <motion.div 
        className="grid grid-cols-3 gap-4 mt-6"
        variants={containerVariants}
      >
        {[
          { value: "1,247", label: "Active Tokens", color: "text-white" },
          { value: "+84%", label: "Avg Gain 24h", color: "text-green-400" },
          { value: "$2.4M", label: "Total Volume", color: "text-yellow-400" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 text-center mobile-backdrop">
              <motion.div 
                className={`text-2xl font-black mb-1 ${stat.color}`}
                whileHover={{ scale: 1.1 }}
              >
                <AnimatedNumber value={stat.value} />
              </motion.div>
              <motion.div 
                className="text-white/70 text-xs font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 1 }}
              >
                {stat.label}
              </motion.div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default PremiumMobileMemeHero;