import React from 'react';
import { cn } from '@/lib/utils';

interface CasinoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'golden' | 'platinum' | 'diamond';
  glow?: boolean;
  animate?: boolean;
  interactive?: boolean;
}

export const CasinoCard = React.forwardRef<HTMLDivElement, CasinoCardProps>(
  ({ 
    className, 
    children, 
    variant = 'default', 
    glow = false, 
    animate = false, 
    interactive = true,
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-400/30',
      golden: 'bg-gradient-premium-silver border-slate-300/50',
      platinum: 'bg-gradient-premium-cyan border-cyan-400/40',
      diamond: 'bg-gradient-premium-purple border-purple-400/50'
    };

    const glowVariants = {
      default: 'shadow-glow-secondary',
      golden: 'shadow-glow-premium-silver',
      platinum: 'shadow-glow-premium-cyan',
      diamond: 'shadow-glow-premium-purple'
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base casino card styles with premium spacing and performance
          'relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl',
          'transition-all duration-300 ease-out transform-gpu will-change-transform',
          
          // Enhanced glass morphism with better depth
          'glass-premium',
          
          // 3D Transform effects optimized for mobile
          'perspective-1000',
          
          // Variant styles with improved contrast
          variants[variant],
          
          // Glow effects with better performance
          glow && glowVariants[variant],
          
          // Interactive states with refined hover behavior
          interactive && [
            'cursor-pointer focus-ring',
            'hover:scale-[1.02] hover:rotate-[0.5deg] hover:shadow-2xl',
            'hover:border-opacity-90 hover:bg-opacity-98',
            'active:scale-[0.99] active:rotate-0 active:duration-100',
            'transition-all duration-300 ease-out'
          ],
          
          // Animation with better performance
          animate && 'animate-pulse-glow',
          
          // Professional shadow system with depth layers
          'shadow-[0_4px_16px_0_rgba(0,0,0,0.3),_0_8px_32px_0_rgba(0,0,0,0.2)]',
          
          // Enhanced inner glow with improved visibility
          'before:absolute before:inset-0 before:rounded-2xl before:z-0',
          'before:bg-gradient-to-br before:from-white/[0.15] before:via-white/[0.08] before:to-transparent',
          'before:pointer-events-none before:opacity-80',
          
          // Subtle border enhancement with better contrast
          'after:absolute after:inset-0 after:rounded-2xl after:z-0',
          'after:bg-gradient-to-br after:from-transparent after:via-white/[0.08] after:to-transparent',
          'after:pointer-events-none after:border after:border-white/10 after:rounded-2xl',
          
          className
        )}
        {...props}
      >
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    );
  }
);

CasinoCard.displayName = 'CasinoCard';