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
          // Base casino card styles with professional spacing
          'relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl',
          'transition-all duration-500 ease-out transform-gpu',
          
          // Enhanced glass morphism
          'glass-premium',
          
          // 3D Transform effects with better performance
          'perspective-1000',
          
          // Variant styles
          variants[variant],
          
          // Glow effects
          glow && glowVariants[variant],
          
          // Interactive states
          interactive && [
            'cursor-pointer focus-ring',
            'hover:scale-[1.03] hover:rotate-1 hover:shadow-2xl',
            'hover:border-opacity-80 hover:bg-opacity-95',
            'active:scale-[0.98] active:rotate-0',
            'transition-transform duration-300 ease-out'
          ],
          
          // Animation
          animate && 'animate-pulse-glow',
          
          // Professional shadow system
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
          
          // Enhanced inner glow with better contrast
          'before:absolute before:inset-0 before:rounded-2xl before:z-0',
          'before:bg-gradient-to-br before:from-white/[0.12] before:to-transparent',
          'before:pointer-events-none',
          
          // Subtle border enhancement
          'after:absolute after:inset-0 after:rounded-2xl after:z-0',
          'after:bg-gradient-to-br after:from-transparent after:via-white/[0.05] after:to-transparent',
          'after:pointer-events-none',
          
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