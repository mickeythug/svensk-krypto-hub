import React from 'react';
import { cn } from '@/lib/utils';

interface CasinoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'golden' | 'platinum' | 'diamond';
  glow?: boolean;
  animate?: boolean;
}

export const CasinoCard = React.forwardRef<HTMLDivElement, CasinoCardProps>(
  ({ className, children, variant = 'default', glow = false, animate = false, ...props }, ref) => {
    const variants = {
      default: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-white/20',
      golden: 'bg-gradient-to-br from-yellow-900/80 to-orange-900/80 border-yellow-400/50',
      platinum: 'bg-gradient-to-br from-gray-700/80 to-gray-600/80 border-gray-300/50',
      diamond: 'bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-400/50'
    };

    const glowVariants = {
      default: 'shadow-glow-primary',
      golden: 'shadow-glow-casino-gold',
      platinum: 'shadow-glow-neon-cyan',
      diamond: 'shadow-glow-neon-purple'
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base casino card styles
          'relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl transition-all duration-500',
          
          // 3D Transform effects
          'transform-gpu perspective-1000',
          
          // Variant styles
          variants[variant],
          
          // Glow effects
          glow && glowVariants[variant],
          
          // Hover effects
          'hover:scale-105 hover:rotate-1 hover:shadow-2xl',
          'hover:border-opacity-70 hover:bg-opacity-90',
          
          // Animation
          animate && 'animate-pulse-glow',
          
          // Glass morphism shadow
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
          
          // Inner glow
          'before:absolute before:inset-0 before:rounded-2xl',
          'before:bg-gradient-to-br before:from-white/10 before:to-transparent',
          'before:pointer-events-none before:z-0',
          
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

CasinoCard.displayName = 'CasinoCard';