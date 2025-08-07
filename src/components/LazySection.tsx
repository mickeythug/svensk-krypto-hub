import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  fallback?: ReactNode;
  once?: boolean;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  className,
  threshold = 0.1,
  fallback,
  once = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            setHasBeenVisible(true);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, once]);

  const shouldRender = once ? (isVisible || hasBeenVisible) : isVisible;

  return (
    <div ref={ref} className={cn(className)}>
      {shouldRender ? (
        <div className="animate-fade-in">
          {children}
        </div>
      ) : (
        fallback || <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />
      )}
    </div>
  );
};

export default LazySection;