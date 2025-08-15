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
          // Base glass morphism with pure black background
          'relative overflow-hidden',
          'bg-black',
          'backdrop-blur-xl',
          
          // Neon turquoise glowing border
          border && 'border-2 border-primary',
          border && 'shadow-[0_0_30px_hsl(var(--primary)/0.8),inset_0_0_30px_hsl(var(--primary)/0.1)]',
          
          // Rounded corners
          'rounded-xl',
          
          // Enhanced shadow effects with neon glow
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.9)]',
          
          // Ultra strong glow effect
          glow && 'shadow-[0_0_60px_hsl(var(--primary)/1),0_0_120px_hsl(var(--primary)/0.8)]',
          
          // Neon inner glow effect
          'before:absolute before:inset-0 before:rounded-xl',
          'before:bg-gradient-to-br before:from-primary/[0.1] before:to-transparent',
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