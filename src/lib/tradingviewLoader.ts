declare global {
  interface Window {
    TradingView: any;
  }
}

export function loadTradingView(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.TradingView && typeof window.TradingView.widget === 'function') {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = false; // Load synchronously for reliability
    
    script.onload = () => {
      // Wait for TradingView to be fully available
      const checkTradingView = () => {
        if (window.TradingView && typeof window.TradingView.widget === 'function') {
          resolve();
        } else {
          setTimeout(checkTradingView, 100);
        }
      };
      checkTradingView();
    };

    script.onerror = () => {
      reject(new Error('Failed to load TradingView script'));
    };

    document.head.appendChild(script);
  });
}
