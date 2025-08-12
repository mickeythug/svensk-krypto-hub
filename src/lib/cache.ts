// Lightweight centralized cache with TTL using localStorage
// Stores JSON-serializable data only

export interface CacheOptions {
  ttlMs?: number; // time to live in milliseconds
}

interface CacheEntry<T> {
  data: T;
  ts: number; // timestamp when stored
  ttlMs: number; // ttl at store time
}

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

function keyOf(key: string) {
  return `cache:${key}`;
}

export function setCache<T>(key: string, data: T, opts: CacheOptions = {}) {
  if (!isBrowser) return;
  const entry: CacheEntry<T> = {
    data,
    ts: Date.now(),
    ttlMs: opts.ttlMs ?? 2 * 60 * 1000, // default 2 minutes
  };
  try {
    localStorage.setItem(keyOf(key), JSON.stringify(entry));
  } catch {}
}

export function getCache<T>(key: string): { data: T; fresh: boolean } | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(keyOf(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    const fresh = Date.now() - entry.ts <= entry.ttlMs;
    return { data: entry.data, fresh };
  } catch {
    return null;
  }
}

export function getCacheStaleOk<T>(key: string): T | null {
  // Returns cached data even if stale (for offline/fallback rendering)
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(keyOf(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry.data;
  } catch {
    return null;
  }
}
