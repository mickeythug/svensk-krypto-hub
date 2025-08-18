import { useEffect } from 'react';

/**
 * Security configuration hook
 * Implements security headers and Content Security Policy
 */
export function useSecurityConfig() {
  useEffect(() => {
    // Set up Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://s.tradingview.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: ws:",
      "frame-src 'self' https://www.tradingview.com https://s.tradingview.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');

    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    // Set up other security headers via meta tags where possible
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    ];

    securityHeaders.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Disable right-click context menu in production for additional security
    const handleContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    // Disable common developer shortcuts in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Validate current origin and protocol
  const validateOrigin = (): boolean => {
    if (import.meta.env.PROD) {
      // In production, ensure we're using HTTPS
      return window.location.protocol === 'https:';
    }
    return true; // Allow HTTP in development
  };

  // Clear potentially sensitive data from browser
  const clearSensitiveData = () => {
    // Clear session storage of sensitive keys
    const sensitiveKeys = [
      'siws_verified',
      'siws_address', 
      'siws_timestamp',
      'siwe_verified',
      'siwe_address',
      'siwe_signature',
      'siwe_timestamp'
    ];

    sensitiveKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Clear any trading wallet data from localStorage
    localStorage.removeItem('trading_wallet');
    localStorage.removeItem('wallet_acknowledged');
  };

  // Security event logging
  const logSecurityEvent = (event: string, details?: any) => {
    console.warn(`Security Event: ${event}`, details);
    // In production, you might want to send this to your logging service
  };

  return {
    validateOrigin,
    clearSensitiveData,
    logSecurityEvent,
  };
}