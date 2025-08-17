import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EnhancedCreateTokenButton: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex justify-center mb-12">
      {/* Floating arrows and particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left arrow */}
        <motion.div
          className="absolute -top-8 -left-16"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
            opacity: isHovered ? 1 : 0.6
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-primary">
            <ArrowRight className="w-6 h-6 transform -rotate-45" />
          </div>
        </motion.div>

        {/* Top right arrow */}
        <motion.div
          className="absolute -top-8 -right-16"
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0],
            opacity: isHovered ? 1 : 0.6
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <div className="text-primary">
            <ArrowRight className="w-6 h-6 transform rotate-45" />
          </div>
        </motion.div>

        {/* Bottom left arrow */}
        <motion.div
          className="absolute -bottom-8 -left-16"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
            opacity: isHovered ? 1 : 0.6
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <div className="text-primary">
            <ArrowRight className="w-6 h-6 transform -rotate-135" />
          </div>
        </motion.div>

        {/* Bottom right arrow */}
        <motion.div
          className="absolute -bottom-8 -right-16"
          animate={{
            y: [0, 10, 0],
            rotate: [0, 5, 0],
            opacity: isHovered ? 1 : 0.6
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <div className="text-primary">
            <ArrowRight className="w-6 h-6 transform rotate-135" />
          </div>
        </motion.div>

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + (i * 60)}%`,
              top: `${-20 + (i % 2) * 140}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        ))}
      </div>

      {/* Main button */}
      <motion.div
        className="relative z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={pulseAnimation ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Button 
          onClick={() => navigate('/meme/create')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative group
            bg-gradient-to-r from-primary via-primary/90 to-primary/80
            hover:from-primary hover:via-primary/95 hover:to-primary/85
            text-primary-foreground font-bold text-xl px-12 py-6 h-auto
            rounded-2xl shadow-xl hover:shadow-2xl
            border-2 border-primary/20 hover:border-primary/40
            transition-all duration-500 ease-out
            overflow-hidden
            ${pulseAnimation ? 'animate-pulse-glow' : ''}
          `}
          size="lg"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Content */}
          <div className="relative flex items-center gap-4">
            <motion.div
              animate={isHovered ? { rotate: [0, 180, 360] } : {}}
              transition={{ duration: 0.6 }}
            >
              <Plus className="w-8 h-8" />
            </motion.div>
            
            <span className="tracking-wider">SKAPA DIN TOKEN</span>
            
            <motion.div
              animate={isHovered ? { x: [0, 10, 0] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          </div>
        </Button>

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
          animate={pulseAnimation ? {
            scale: [1, 1.2, 1.4],
            opacity: [0.8, 0.3, 0]
          } : {}}
          transition={{ duration: 2 }}
        />
      </motion.div>

      {/* Call to action text */}
      <motion.div
        className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
        animate={{
          opacity: [0.7, 1, 0.7],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <p className="text-sm text-muted-foreground text-center whitespace-nowrap">
          ✨ Skapa din egen meme token på några sekunder ✨
        </p>
      </motion.div>
    </div>
  );
};

export default EnhancedCreateTokenButton;