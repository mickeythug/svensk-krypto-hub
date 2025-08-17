import React from 'react';
import { cn } from '@/lib/utils';

interface BrandedHeadingProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const BrandedHeading: React.FC<BrandedHeadingProps> = ({ 
  children, 
  className, 
  as: Component = 'h1',
  size = 'xl'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl'
  };

  // Split text into letters and alternate colors
  const renderColoredText = (text: string) => {
    return text.split('').map((char, index) => {
      // For every 3 characters white, then 4 characters brand color
      const groupIndex = Math.floor(index / 7); // Groups of 7 (3+4)
      const positionInGroup = index % 7;
      const isWhite = positionInGroup < 3;
      
      return (
        <span
          key={index}
          className={isWhite ? 'text-white' : 'text-[#12E19F]'}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <Component 
      className={cn(
        'font-orbitron font-bold tracking-wider',
        sizeClasses[size],
        className
      )}
    >
      {renderColoredText(children)}
    </Component>
  );
};