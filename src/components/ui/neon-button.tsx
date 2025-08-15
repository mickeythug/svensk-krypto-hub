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
      'neon-pink': 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white border-pink-400/80',
      'neon-cyan': 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-cyan-400/80',
      'neon-gold': 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black border-yellow-400/80',
      'neon-purple': 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white border-purple-400/80',
      'casino-rainbow': 'bg-gradient-casino-rainbow hover:bg-gradient-meme-energy text-white border-transparent'
    };

    const glowVariants = {
      'neon-pink': 'shadow-glow-neon-pink hover:shadow-glow-neon-pink',
      'neon-cyan': 'shadow-glow-neon-cyan hover:shadow-glow-neon-cyan',
      'neon-gold': 'shadow-glow-casino-gold hover:shadow-glow-casino-gold',
      'neon-purple': 'shadow-glow-neon-purple hover:shadow-glow-neon-purple',
      'casino-rainbow': 'shadow-glow-rainbow hover:shadow-glow-rainbow'
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
          // Base neon button styles with professional spacing
          'relative overflow-hidden font-bold transition-all duration-300 ease-out',
          'border-2 rounded-xl backdrop-blur-sm casino-button focus-ring',
          'transform-gpu perspective-1000',
          
          // Size variants
          sizes[size],
          
          // Enhanced hover effects
          'hover:scale-[1.05] hover:rotate-1 hover:-translate-y-1',
          'active:scale-[0.98] active:rotate-0 active:translate-y-0',
          
          // Variant colors with better contrast
          variants[variant],
          
          // Glow effects with improved intensity
          glow && glowVariants[variant],
          
          // Pulse animation
          pulse && 'animate-pulse-glow',
          
          // Enhanced shimmer effect
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-transparent before:via-white/25 before:to-transparent',
          'before:translate-x-[-100%] hover:before:translate-x-[100%]',
          'before:transition-transform before:duration-700 before:ease-out',
          
          // Professional focus state
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:ring-offset-black focus:ring-current',
          
          // Better disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
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