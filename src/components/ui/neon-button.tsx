import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'neon-pink' | 'neon-cyan' | 'neon-gold' | 'neon-purple' | 'casino-rainbow';
  glow?: boolean;
  pulse?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, children, variant = 'neon-cyan', glow = true, pulse = false, ...props }, ref) => {
    const variants = {
      'neon-pink': 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white border-pink-400',
      'neon-cyan': 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-cyan-400',
      'neon-gold': 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black border-yellow-400',
      'neon-purple': 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white border-purple-400',
      'casino-rainbow': 'bg-gradient-casino-rainbow hover:bg-gradient-meme-energy text-white border-transparent'
    };

    const glowVariants = {
      'neon-pink': 'shadow-glow-neon-pink hover:shadow-glow-neon-pink',
      'neon-cyan': 'shadow-glow-neon-cyan hover:shadow-glow-neon-cyan',
      'neon-gold': 'shadow-glow-casino-gold hover:shadow-glow-casino-gold',
      'neon-purple': 'shadow-glow-neon-purple hover:shadow-glow-neon-purple',
      'casino-rainbow': 'shadow-glow-rainbow hover:shadow-glow-rainbow'
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // Base neon button styles
          'relative overflow-hidden font-bold text-lg transition-all duration-300',
          'border-2 rounded-xl backdrop-blur-sm',
          
          // Transform effects
          'hover:scale-105 hover:rotate-1 active:scale-95',
          
          // Variant colors
          variants[variant],
          
          // Glow effects
          glow && glowVariants[variant],
          
          // Pulse animation
          pulse && 'animate-pulse-glow',
          
          // Special effects
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-transparent before:via-white/20 before:to-transparent',
          'before:translate-x-[-100%] hover:before:translate-x-[100%]',
          'before:transition-transform before:duration-700 before:ease-out',
          
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

NeonButton.displayName = 'NeonButton';