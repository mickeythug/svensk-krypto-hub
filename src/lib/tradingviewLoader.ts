declare global {
  interface Window {
    TradingView: any;
    __tvScriptPromise?: Promise<void>;
  }
}

export function loadTradingView(): Promise<void> {
  if (window.TradingView && typeof window.TradingView.widget === 'function') {
    console.log('✅ TradingView already loaded');
    return Promise.resolve();
  }
  
  if (window.__tvScriptPromise) {
    console.log('⏳ TradingView loading in progress');
    return window.__tvScriptPromise;
  }

  console.log('🚀 Loading TradingView script...');
  
  window.__tvScriptPromise = new Promise<void>((resolve, reject) => {
    // Clean up existing scripts first
    document.querySelectorAll('script[src*="tradingview"]').forEach(script => {
      script.remove();
    });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.defer = true;
    
    const timeout = setTimeout(() => {
      script.remove();
      console.error('❌ TradingView script timeout');
      reject(new Error('TradingView script loading timeout'));
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ TradingView script loaded');
      
      // Give TradingView time to initialize
      setTimeout(() => {
        if (window.TradingView && typeof window.TradingView.widget === 'function') {
          console.log('✅ TradingView widget available');
          resolve();
        } else {
          console.error('❌ TradingView widget not available');
          reject(new Error('TradingView widget not initialized'));
        }
      }, 500);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      console.error('❌ Failed to load TradingView script');
      reject(new Error('Failed to load TradingView script'));
    };

    document.head.appendChild(script);
  });

  return window.__tvScriptPromise;
}
