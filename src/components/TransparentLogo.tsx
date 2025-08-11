import { useState, useEffect } from "react";
import { createTransparentLogoFromUrl } from "@/utils/backgroundRemoval";

interface TransparentLogoProps {
  originalSrc: string;
  alt: string;
  className?: string;
}

const TransparentLogo = ({ originalSrc, alt, className }: TransparentLogoProps) => {
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        const transparentUrl = await createTransparentLogoFromUrl(originalSrc);
        setTransparentSrc(transparentUrl);
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Failed to process logo');
        // Fallback to original image
        setTransparentSrc(originalSrc);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function to revoke object URL
    return () => {
      if (transparentSrc && transparentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(transparentSrc);
      }
    };
  }, [originalSrc]);

  if (isProcessing) {
    return (
      <div className={`${className} w-6 h-6 rounded-full bg-muted/50 animate-pulse`} />
    );
  }

  if (error && !transparentSrc) {
    return (
      <img 
        src={originalSrc} 
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <img 
      src={transparentSrc || originalSrc} 
      alt={alt}
      className={className}
      style={{
        filter: transparentSrc ? 'drop-shadow(0 0 20px rgba(0, 255, 204, 0.3))' : undefined
      }}
    />
  );
};

export default TransparentLogo;