import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, blur = 'md', border = true, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass morphism styles
          'relative overflow-hidden',
          'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
          'backdrop-blur-xl',
          
          // Border with gradient
          border && 'border border-white/[0.1]',
          
          // Rounded corners
          'rounded-xl',
          
          // Shadow effects
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
          
          // Glow effect
          glow && 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
          
          // Before pseudo for inner glow
          'before:absolute before:inset-0 before:rounded-xl',
          'before:bg-gradient-to-br before:from-white/[0.05] before:to-transparent',
          'before:pointer-events-none',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';