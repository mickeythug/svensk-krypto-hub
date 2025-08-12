import { useEffect, useRef, useState, useCallback } from 'react';

// Singleton WebSocket manager for PumpPortal
let ws: WebSocket | null = null;
let openPromise: Promise<void> | null = null;
const subscribers = new Set<(msg: any) => void>();

function ensureConnection() {
  if (ws && ws.readyState === WebSocket.OPEN) return Promise.resolve();
  if (openPromise) return openPromise;
  openPromise = new Promise<void>((resolve, reject) => {
    try {
      ws = new WebSocket('wss://pumpportal.fun/api/data');
      ws.onopen = () => resolve();
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as any);
          subscribers.forEach((cb) => cb(msg));
        } catch {}
      };
      ws.onclose = () => { openPromise = null; };
      ws.onerror = () => { openPromise = null; };
    } catch (e) {
      openPromise = null;
      reject(e);
    }
  });
  return openPromise;
}

export type PumpSubscribeMethod = 'subscribeNewToken' | 'subscribeTokenTrade' | 'subscribeAccountTrade' | 'subscribeMigration';

// Non-hook API for modules that can't add hooks safely (e.g., libraries/hooks files)
export async function pumpSubscribe(method: PumpSubscribeMethod, keys?: string[]) {
  await ensureConnection();
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(keys ? { method, keys } : { method }));
  }
}

export function pumpOnMessage(cb: (msg: any) => void) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export async function pumpUnsubscribe(method: Exclude<PumpSubscribeMethod, 'subscribeMigration'>, keys?: string[]) {
  const map: Record<string, string> = {
    subscribeNewToken: 'unsubscribeNewToken',
    subscribeTokenTrade: 'unsubscribeTokenTrade',
    subscribeAccountTrade: 'unsubscribeAccountTrade',
    subscribeMigration: 'unsubscribeMigration',
  };
  await ensureConnection();
  if (ws?.readyState === WebSocket.OPEN) {
    const payload = keys ? { method: map[method], keys } : { method: map[method] };
    ws.send(JSON.stringify(payload));
  }
}


export function usePumpPortalWS() {
  const [connected, setConnected] = useState(false);
  const localHandlers = useRef<((msg: any) => void)[]>([]);

  useEffect(() => {
    let mounted = true;
    ensureConnection().then(() => mounted && setConnected(true));
    const handler = (msg: any) => localHandlers.current.forEach((h) => h(msg));
    subscribers.add(handler);
    return () => { subscribers.delete(handler); };
  }, []);

  const send = useCallback(async (payload: any) => {
    await ensureConnection();
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, []);

  const onMessage = useCallback((cb: (msg: any) => void) => {
    localHandlers.current.push(cb);
    return () => {
      localHandlers.current = localHandlers.current.filter((f) => f !== cb);
    };
  }, []);

  const subscribe = useCallback((method: PumpSubscribeMethod, keys?: string[]) => {
    return send(keys ? { method, keys } : { method });
  }, [send]);

  const unsubscribe = useCallback((method: Exclude<PumpSubscribeMethod, 'subscribeMigration'>) => {
    const map: Record<string, string> = {
      subscribeNewToken: 'unsubscribeNewToken',
      subscribeTokenTrade: 'unsubscribeTokenTrade',
      subscribeAccountTrade: 'unsubscribeAccountTrade',
      subscribeMigration: 'unsubscribeMigration',
    };
    return send({ method: map[method] });
  }, [send]);

  return { connected, subscribe, unsubscribe, onMessage } as const;
}
