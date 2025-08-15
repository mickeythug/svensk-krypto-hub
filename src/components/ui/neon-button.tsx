import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'neon-pink' | 'neon-cyan' | 'neon-gold' | 'neon-purple' | 'casino-rainbow';
  glow?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'neon-cyan', 
    glow = true, 
    pulse = false, 
    size = 'md',
    ...props 
  }, ref) => {
    const variants = {
      'neon-pink': 'bg-gradient-premium-purple hover:opacity-90 text-white border-purple-400/60',
      'neon-cyan': 'bg-gradient-premium-cyan hover:opacity-90 text-white border-cyan-400/60',
      'neon-gold': 'bg-gradient-premium-silver hover:opacity-90 text-slate-900 border-slate-400/60',
      'neon-purple': 'bg-gradient-premium-purple hover:opacity-90 text-white border-purple-400/60',
      'casino-rainbow': 'bg-gradient-premium-dark hover:bg-gradient-premium-purple text-white border-purple-400/40'
    };

    const glowVariants = {
      'neon-pink': 'shadow-glow-premium-purple',
      'neon-cyan': 'shadow-glow-premium-cyan',
      'neon-gold': 'shadow-glow-premium-silver',
      'neon-purple': 'shadow-glow-premium-purple',
      'casino-rainbow': 'shadow-glow-premium-purple'
    };

    const sizes = {
      sm: 'text-sm px-4 py-2 h-8',
      md: 'text-base px-6 py-3 h-10',
      lg: 'text-lg px-8 py-4 h-12',
      xl: 'text-xl px-12 py-6 h-16'
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // Base neon button styles with optimized spacing
          'relative overflow-hidden font-bold transition-all duration-250 ease-out',
          'border-2 rounded-xl backdrop-blur-sm casino-button focus-ring',
          'transform-gpu will-change-transform perspective-1000',
          
          // Size variants with improved proportions
          sizes[size],
          
          // Refined hover effects for better UX
          'hover:scale-[1.03] hover:rotate-[0.5deg] hover:-translate-y-0.5',
          'active:scale-[0.98] active:rotate-0 active:translate-y-0 active:duration-100',
          
          // Variant colors with enhanced contrast
          variants[variant],
          
          // Glow effects with optimized performance
          glow && glowVariants[variant],
          
          // Pulse animation with smoother timing
          pulse && 'animate-pulse-glow',
          
          // Enhanced shimmer effect with better timing
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-transparent before:via-white/30 before:to-transparent',
          'before:translate-x-[-100%] hover:before:translate-x-[100%]',
          'before:transition-transform before:duration-600 before:ease-out',
          'before:z-0',
          
          // Professional focus state with better contrast
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:ring-offset-black focus:ring-current',
          
          // Enhanced disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale',
          'disabled:hover:scale-100 disabled:hover:rotate-0 disabled:hover:translate-y-0',
          
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 number-display">
          {children}
        </span>
      </Button>
    );
  }
);

NeonButton.displayName = 'NeonButton';