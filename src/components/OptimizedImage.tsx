import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  loading = 'lazy',
  placeholder,
  onLoad,
  onError
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setImageState('error');
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {imageState === 'loading' && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground text-sm">{placeholder}</div>
        </div>
      )}
      
      {/* Main Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
      
      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm text-center p-4">
            <div className="mb-2">⚠️</div>
            <div>Kunde ej ladda bild</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;