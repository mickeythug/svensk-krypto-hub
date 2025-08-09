declare global {
  interface Window {
    TradingView?: any;
    __tvScriptPromise?: Promise<void>;
  }
}

export function loadTradingView(): Promise<void> {
  if (window.TradingView) return Promise.resolve();
  if (window.__tvScriptPromise) return window.__tvScriptPromise;

  window.__tvScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.__tvScriptPromise;
}
