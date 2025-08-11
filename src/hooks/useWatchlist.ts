import { useState, useEffect } from 'react';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: number;
}

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('crypto-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    }
  }, []);

  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    setWatchlist(newWatchlist);
    localStorage.setItem('crypto-watchlist', JSON.stringify(newWatchlist));
  };

  const addToWatchlist = (crypto: { id: string; symbol: string; name: string }) => {
    const isAlreadyInWatchlist = watchlist.some(item => item.id === crypto.id);
    if (!isAlreadyInWatchlist) {
      const newItem: WatchlistItem = {
        ...crypto,
        addedAt: Date.now()
      };
      saveWatchlist([...watchlist, newItem]);
      return true;
    }
    return false;
  };

  const removeFromWatchlist = (id: string) => {
    const newWatchlist = watchlist.filter(item => item.id !== id);
    saveWatchlist(newWatchlist);
  };

  const isInWatchlist = (id: string) => {
    return watchlist.some(item => item.id === id);
  };

  const toggleWatchlist = (crypto: { id: string; symbol: string; name: string }) => {
    if (isInWatchlist(crypto.id)) {
      removeFromWatchlist(crypto.id);
      return false;
    } else {
      addToWatchlist(crypto);
      return true;
    }
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
};