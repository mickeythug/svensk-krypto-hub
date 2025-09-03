declare global {
  interface Window {
    TradingView: any;
    __tvScriptPromise?: Promise<void>;
  }
}

let retryCount = 0;
const MAX_RETRIES = 2;

export function loadTradingView(): Promise<void> {
  if (window.TradingView) {
    console.log('✅ TradingView already loaded');
    return Promise.resolve();
  }
  
  if (window.__tvScriptPromise) {
    console.log('⏳ TradingView loading in progress');
    return window.__tvScriptPromise;
  }

  console.log('🚀 Loading TradingView script...');
  
  window.__tvScriptPromise = new Promise<void>((resolve, reject) => {
    // Clean up existing scripts
    document.querySelectorAll('script[src*="tradingview"]').forEach(script => script.remove());

    const loadScript = (url: string, timeout: number = 8000): Promise<void> => {
      return new Promise((scriptResolve, scriptReject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        const timer = setTimeout(() => {
          script.remove();
          scriptReject(new Error(`Timeout loading ${url}`));
        }, timeout);

        script.onload = () => {
          clearTimeout(timer);
          console.log(`✅ Script loaded: ${url}`);
          
          // Verify TradingView is available
          setTimeout(() => {
            if (window.TradingView && typeof window.TradingView.widget === 'function') {
              scriptResolve();
            } else {
              scriptReject(new Error('TradingView not properly initialized'));
            }
          }, 200);
        };

        script.onerror = () => {
          clearTimeout(timer);
          script.remove();
          scriptReject(new Error(`Failed to load ${url}`));
        };

        document.head.appendChild(script);
      });
    };

    const urls = [
      'https://s3.tradingview.com/tv.js',
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    ];

    // Try loading scripts sequentially
    const tryLoad = async (urlIndex: number = 0): Promise<void> => {
      if (urlIndex >= urls.length) {
        throw new Error('All TradingView URLs failed');
      }

      try {
        await loadScript(urls[urlIndex]);
        resolve();
      } catch (error) {
        console.warn(`⚠️ Failed to load ${urls[urlIndex]}: ${error}`);
        
        if (urlIndex < urls.length - 1) {
          console.log(`🔄 Trying next URL...`);
          await tryLoad(urlIndex + 1);
        } else if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`🔄 Retrying all URLs (attempt ${retryCount + 1})`);
          setTimeout(() => tryLoad(0), 1000);
        } else {
          console.error('❌ All TradingView loading attempts failed');
          reject(error);
        }
      }
    };

    tryLoad().catch(reject);
  });

  return window.__tvScriptPromise;
}
