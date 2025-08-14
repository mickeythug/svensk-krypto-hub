import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  mint?: string;
  chain: 'SOL' | 'ETH';
  price?: number;
  change24h?: number;
  change7d?: number;
  change1h?: number;
  marketCap?: number;
  volume?: number;
  image?: string;
  addedAt: Date;
}

export function useRealWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's watchlist from database
  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setWatchlist([]);
        return;
      }

      // For now, create a demo watchlist since we don't have a watchlist table
      // In a real implementation, you'd have a user_watchlist table
      const demoWatchlist: WatchlistItem[] = [
        {
          id: '1',
          symbol: 'BTC',
          name: 'Bitcoin',
          chain: 'SOL',
          addedAt: new Date(),
        },
        {
          id: '2',
          symbol: 'ETH',
          name: 'Ethereum',
          chain: 'ETH',
          addedAt: new Date(),
        },
        {
          id: '3',
          symbol: 'SOL',
          name: 'Solana',
          chain: 'SOL',
          addedAt: new Date(),
        },
      ];

      // Get current prices for watchlist items
      const enrichedWatchlist = await Promise.all(
        demoWatchlist.map(async (item) => {
          try {
            // Try to get price data from latest_token_prices table
            const { data: priceData } = await supabase
              .from('latest_token_prices')
              .select('*')
              .eq('symbol', item.symbol.toUpperCase())
              .single();

            if (priceData) {
              return {
                ...item,
                price: Number(priceData.price),
                change24h: Number(priceData.change_24h),
                change7d: Number(priceData.change_7d),
                change1h: Number(priceData.change_1h),
                marketCap: Number(priceData.market_cap),
                image: priceData.image,
              };
            }

            return item;
          } catch (error) {
            console.error(`Error fetching price for ${item.symbol}:`, error);
            return item;
          }
        })
      );

      setWatchlist(enrichedWatchlist);

    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add token to watchlist
  const addToWatchlist = async (token: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newItem: WatchlistItem = {
        ...token,
        id: Date.now().toString(),
        addedAt: new Date(),
      };

      // In a real implementation, you'd save to database here
      setWatchlist(prev => [...prev, newItem]);
      
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  };

  // Remove token from watchlist
  const removeFromWatchlist = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you'd delete from database here
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
      
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  // Check if token is in watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol.toLowerCase() === symbol.toLowerCase());
  };

  // Toggle watchlist status
  const toggleWatchlist = async (token: { symbol: string; name: string; chain?: 'SOL' | 'ETH' }) => {
    const existingItem = watchlist.find(
      item => item.symbol.toLowerCase() === token.symbol.toLowerCase()
    );

    if (existingItem) {
      return await removeFromWatchlist(existingItem.id);
    } else {
      return await addToWatchlist({
        symbol: token.symbol,
        name: token.name,
        chain: token.chain || 'SOL',
      });
    }
  };

  // Refresh prices for watchlist items
  const refreshPrices = async () => {
    if (watchlist.length === 0) return;

    try {
      const symbols = watchlist.map(item => item.symbol.toUpperCase());
      
      const { data: priceUpdates } = await supabase
        .from('latest_token_prices')
        .select('*')
        .in('symbol', symbols);

      if (priceUpdates) {
        setWatchlist(prev => prev.map(item => {
          const priceUpdate = priceUpdates.find(
            p => p.symbol === item.symbol.toUpperCase()
          );
          
          if (priceUpdate) {
            return {
              ...item,
              price: Number(priceUpdate.price),
              change24h: Number(priceUpdate.change_24h),
              change7d: Number(priceUpdate.change_7d),
              change1h: Number(priceUpdate.change_1h),
              marketCap: Number(priceUpdate.market_cap),
              image: priceUpdate.image,
            };
          }
          
          return item;
        }));
      }
    } catch (error) {
      console.error('Error refreshing watchlist prices:', error);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshPrices, 30000);
    return () => clearInterval(interval);
  }, [watchlist.length]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    refreshPrices,
    refreshWatchlist: fetchWatchlist,
  };
}