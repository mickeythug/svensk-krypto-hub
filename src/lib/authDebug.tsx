import React, { useEffect, useMemo, useState } from 'react';

// Lightweight auth debug logger with optional on-screen overlay
// Usage:
//  - Call authLog(label, data?) anywhere in auth/connect code
//  - Add ?authdebug=1 to the URL to see the live overlay
//  - Toggle with window.__SHOW_AUTH_DEBUG = true/false

declare global {
  interface Window {
    __AUTH_LOGS__?: Array<{ t: number; level: 'info'|'error'|'warn'; label: string; data?: any }>;
    __SHOW_AUTH_DEBUG__?: boolean;
  }
}

export function authLog(label: string, data?: any, level: 'info'|'error'|'warn' = 'info') {
  try {
    const entry = { t: Date.now(), level, label, data } as const;
    if (!window.__AUTH_LOGS__) window.__AUTH_LOGS__ = [];
    window.__AUTH_LOGS__!.push(entry);
    // Console mirror
    const prefix = `[AUTH:${level}]`;
    if (level === 'error') console.error(prefix, label, data ?? '');
    else if (level === 'warn') console.warn(prefix, label, data ?? '');
    else console.info(prefix, label, data ?? '');
    // Dispatch event for live overlay updates
    window.dispatchEvent(new CustomEvent('auth-debug-log', { detail: entry }));
  } catch (e) {
    // Swallow
  }
}

function useAuthLogs() {
  const [logs, setLogs] = useState(window.__AUTH_LOGS__ ?? []);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLogs((prev) => [...prev, detail]);
    };
    window.addEventListener('auth-debug-log', handler as any);
    return () => window.removeEventListener('auth-debug-log', handler as any);
  }, []);
  return logs;
}

export function AuthDebugOverlay() {
  const logs = useAuthLogs();
  const show = useMemo(() => {
    const urlShow = new URLSearchParams(window.location.search).get('authdebug') === '1';
    return urlShow || window.__SHOW_AUTH_DEBUG__ === true;
  }, [window.location.search, window.__SHOW_AUTH_DEBUG__]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-h-[40vh] w-[min(92vw,560px)] overflow-hidden rounded-md border bg-background/90 text-foreground shadow-lg backdrop-blur">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm font-medium">Auth Debug</div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded border hover:bg-accent"
            onClick={() => { window.__AUTH_LOGS__ = []; window.dispatchEvent(new CustomEvent('auth-debug-log', { detail: { t: Date.now(), level: 'info', label: 'Cleared logs' } })); }}
          >
            Clear
          </button>
          <button
            className="text-xs px-2 py-1 rounded border hover:bg-accent"
            onClick={() => { window.__SHOW_AUTH_DEBUG__ = false; (window as any).location = window.location.pathname; }}
          >
            Hide
          </button>
        </div>
      </div>
      <div className="max-h-[30vh] overflow-auto text-xs font-mono p-3 space-y-1">
        {logs.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap leading-snug">
            <span className={l.level === 'error' ? 'text-destructive font-semibold' : l.level === 'warn' ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}>
              {new Date(l.t).toLocaleTimeString()} [{l.level.toUpperCase()}]
            </span>
            <span className="ml-2">{l.label}</span>
            {typeof l.data !== 'undefined' && (
              <pre className="mt-1 bg-muted/50 p-2 rounded overflow-x-auto">{JSON.stringify(l.data, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
