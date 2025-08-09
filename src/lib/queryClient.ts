import { QueryClient } from "@tanstack/react-query";

// Centralized singleton QueryClient for the entire app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute fresh
      gcTime: 5 * 60_000, // 5 minutes in cache
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Lightweight helpers to interact with cache programmatically
export function getCachedData<T = unknown>(key: readonly unknown[]) {
  return queryClient.getQueryData<T>(key);
}

export function setCachedData<T = unknown>(key: readonly unknown[], updater: T | ((old?: T) => T)) {
  return queryClient.setQueryData<T>(key, updater as any);
}
