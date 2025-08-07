import { useState, useEffect, useRef, useCallback } from 'react';

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  lastUpdateId: number;
  symbol: string;
}

interface BinanceDepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BinanceStreamData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID in event
  u: number; // Final update ID in event
  b: [string, string][]; // Bids to be updated
  a: [string, string][]; // Asks to be updated
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/depth';

export const useBinanceOrderbook = (symbol: string, limit: number = 20) => {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateIdRef = useRef<number>(0);
  const bufferRef = useRef<BinanceStreamData[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Convert symbol for Binance format (e.g., BTC -> BTCUSDT)
  const binanceSymbol = `${symbol.toUpperCase()}USDT`;

  // Debug logging
  useEffect(() => {
    console.log('useBinanceOrderbook hook initialized for symbol:', binanceSymbol);
  }, [binanceSymbol]);

  const processOrderBookData = useCallback((bids: [string, string][], asks: [string, string][]) => {
    let totalBids = 0;
    let totalAsks = 0;

    // Process bids (highest price first)
    const processedBids = bids
      .slice(0, limit)
      .map(([price, quantity]) => {
        const size = parseFloat(quantity);
        totalBids += size;
        return {
          price: parseFloat(price),
          size,
          total: totalBids
        };
      });

    // Process asks (lowest price first) 
    const processedAsks = asks
      .slice(0, limit)
      .map(([price, quantity]) => {
        const size = parseFloat(quantity);
        totalAsks += size;
        return {
          price: parseFloat(price),
          size,
          total: totalAsks
        };
      });

    return { processedBids, processedAsks };
  }, [limit]);

  const fetchInitialSnapshot = useCallback(async () => {
    console.log('Fetching initial orderbook snapshot for:', binanceSymbol);
    
    try {
      const response = await fetch(`${BINANCE_API_URL}?symbol=${binanceSymbol}&limit=${limit * 2}`);
      
      console.log('Binance API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BinanceDepthResponse = await response.json();
      console.log('Received orderbook data:', data);
      
      const { processedBids, processedAsks } = processOrderBookData(data.bids, data.asks);
      
      setOrderBook({
        bids: processedBids,
        asks: processedAsks,
        lastUpdateId: data.lastUpdateId,
        symbol: binanceSymbol
      });
      
      lastUpdateIdRef.current = data.lastUpdateId;
      setError(null);
      console.log('Orderbook initialized successfully');
      
    } catch (err) {
      console.error('Failed to fetch initial orderbook:', err);
      setError('Failed to fetch orderbook data');
    }
  }, [binanceSymbol, limit, processOrderBookData]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting WebSocket for symbol:', binanceSymbol);
    const streamName = `${binanceSymbol.toLowerCase()}@depth`;
    const ws = new WebSocket(`${BINANCE_WS_URL}${streamName}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected for orderbook');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: BinanceStreamData = JSON.parse(event.data);
        console.log('WebSocket message received:', data.e, 'Updates:', data.b?.length + data.a?.length);
        
        if (data.e === 'depthUpdate') {
          // Process immediately if we have initial snapshot
          if (lastUpdateIdRef.current > 0) {
            updateOrderBook(data);
          } else {
            // Buffer updates until we have the initial snapshot
            bufferRef.current.push(data);
            console.log('Buffering update, waiting for initial snapshot');
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connectWebSocket();
        }, timeout);
      } else {
        setError('Failed to maintain connection after multiple attempts');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    wsRef.current = ws;
  }, [binanceSymbol]);

  const updateOrderBook = useCallback((data: BinanceStreamData) => {
    console.log('Updating orderbook with WebSocket data, updateId:', data.u);
    
    setOrderBook(prev => {
      if (!prev) return null;

      const newBids = [...prev.bids];
      const newAsks = [...prev.asks];

      // Update bids
      data.b.forEach(([price, quantity]) => {
        const priceFloat = parseFloat(price);
        const quantityFloat = parseFloat(quantity);
        const index = newBids.findIndex(bid => bid.price === priceFloat);
        
        if (quantityFloat === 0) {
          // Remove if quantity is 0
          if (index !== -1) {
            newBids.splice(index, 1);
          }
        } else {
          // Update or add
          if (index !== -1) {
            newBids[index].size = quantityFloat;
          } else {
            newBids.push({ price: priceFloat, size: quantityFloat, total: 0 });
          }
        }
      });

      // Update asks
      data.a.forEach(([price, quantity]) => {
        const priceFloat = parseFloat(price);
        const quantityFloat = parseFloat(quantity);
        const index = newAsks.findIndex(ask => ask.price === priceFloat);
        
        if (quantityFloat === 0) {
          // Remove if quantity is 0
          if (index !== -1) {
            newAsks.splice(index, 1);
          }
        } else {
          // Update or add
          if (index !== -1) {
            newAsks[index].size = quantityFloat;
          } else {
            newAsks.push({ price: priceFloat, size: quantityFloat, total: 0 });
          }
        }
      });

      // Sort properly: bids high to low, asks low to high
      newBids.sort((a, b) => b.price - a.price);
      newAsks.sort((a, b) => a.price - b.price);

      // Recalculate totals
      let totalBids = 0;
      newBids.forEach(bid => {
        totalBids += bid.size;
        bid.total = totalBids;
      });

      let totalAsks = 0;
      newAsks.forEach(ask => {
        totalAsks += ask.size;
        ask.total = totalAsks;
      });

      return {
        bids: newBids.slice(0, limit),
        asks: newAsks.slice(0, limit),
        lastUpdateId: data.u,
        symbol: binanceSymbol
      };
    });

    lastUpdateIdRef.current = data.u;
    console.log('Orderbook updated, new updateId:', data.u);
  }, [limit, binanceSymbol]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    bufferRef.current = [];
    lastUpdateIdRef.current = 0;
  }, []);

  useEffect(() => {
    console.log('Starting orderbook for:', binanceSymbol);
    fetchInitialSnapshot().then(() => {
      // Process any buffered updates after getting initial snapshot
      if (bufferRef.current.length > 0) {
        console.log('Processing', bufferRef.current.length, 'buffered updates');
        bufferRef.current.forEach(update => {
          if (update.U <= lastUpdateIdRef.current + 1 && update.u >= lastUpdateIdRef.current + 1) {
            updateOrderBook(update);
          }
        });
        bufferRef.current = [];
      }
      connectWebSocket();
    });

    return disconnect;
  }, [fetchInitialSnapshot, connectWebSocket, disconnect, updateOrderBook]);

  return {
    orderBook,
    isConnected,
    error,
    refresh: fetchInitialSnapshot
  };
};