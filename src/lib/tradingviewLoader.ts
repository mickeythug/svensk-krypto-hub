declare global {
  interface Window {
    TradingView: any;
    __tvScriptPromise?: Promise<void>;
  }
}

export function loadTradingView(): Promise<void> {
  if (window.TradingView) {
    console.log('TradingView already loaded');
    return Promise.resolve();
  }
  
  if (window.__tvScriptPromise) {
    console.log('TradingView loading in progress');
    return window.__tvScriptPromise;
  }

  console.log('Loading TradingView script...');
  
  window.__tvScriptPromise = new Promise<void>((resolve, reject) => {
    // Remove any existing TradingView scripts first
    const existingScripts = document.querySelectorAll('script[src*="tradingview"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      console.error('TradingView script loading timeout');
      tryFallbackUrls();
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ TradingView script loaded successfully');
      // Give TradingView a moment to initialize
      setTimeout(() => {
        if (window.TradingView) {
          resolve();
        } else {
          console.error('TradingView object not available after script load');
          tryFallbackUrls();
        }
      }, 100);
    };

    script.onerror = (err) => {
      clearTimeout(timeout);
      console.error('❌ Failed to load TradingView script:', err);
      tryFallbackUrls();
    };

    document.head.appendChild(script);

    function tryFallbackUrls() {
      console.log('Trying fallback URLs...');
      const fallbackUrls = [
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
        'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
      ];

      let currentIndex = 0;
      
      function tryNext() {
        if (currentIndex >= fallbackUrls.length) {
          reject(new Error('All TradingView script URLs failed'));
          return;
        }

        const fallbackScript = document.createElement('script');
        fallbackScript.src = fallbackUrls[currentIndex];
        fallbackScript.async = true;
        fallbackScript.crossOrigin = 'anonymous';

        fallbackScript.onload = () => {
          console.log('✅ Fallback TradingView script loaded');
          setTimeout(() => {
            if (window.TradingView) {
              resolve();
            } else {
              currentIndex++;
              tryNext();
            }
          }, 100);
        };

        fallbackScript.onerror = () => {
          console.log(`❌ Fallback URL ${currentIndex + 1} failed`);
          currentIndex++;
          tryNext();
        };

        document.head.appendChild(fallbackScript);
      }

      tryNext();
    }
  });

  return window.__tvScriptPromise;
}
