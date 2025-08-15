import { useState, useEffect, useRef, useCallback } from 'react';

export interface BinanceTickerData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  volumeQuote: number;
  openPrice: number;
  lastQty: number;
  bidPrice: number;
  askPrice: number;
}

interface BinanceTickerResponse {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/24hr';

export const useBinanceTicker = (symbol: string) => {
  const [tickerData, setTickerData] = useState<BinanceTickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Convert symbol for Binance format (e.g., BTC -> BTCUSDT)
  const binanceSymbol = `${symbol.toUpperCase()}USDT`;

  const processTickerData = useCallback((data: BinanceTickerResponse): BinanceTickerData => {
    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      volumeQuote: parseFloat(data.quoteVolume),
      openPrice: parseFloat(data.openPrice),
      lastQty: parseFloat(data.lastQty),
      bidPrice: parseFloat(data.bidPrice),
      askPrice: parseFloat(data.askPrice),
    };
  }, []);

  // Fetch initial ticker data via REST API
  const fetchInitialData = useCallback(async () => {
    try {
      console.log('🔄 Fetching initial ticker data for', binanceSymbol);
      const response = await fetch(`${BINANCE_API_URL}?symbol=${binanceSymbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: BinanceTickerResponse = await response.json();
      const processedData = processTickerData(data);
      setTickerData(processedData);
      setError(null);
      
      console.log('✅ Initial ticker data loaded:', processedData.price);
    } catch (err) {
      console.error('❌ Error fetching initial ticker data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ticker data');
    }
  }, [binanceSymbol, processTickerData]);

  // WebSocket connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const tickerStream = `${binanceSymbol.toLowerCase()}@ticker`;
      const wsUrl = `${BINANCE_WS_URL}${tickerStream}`;
      
      console.log('🔗 Connecting to Binance ticker WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Binance ticker WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.e === '24hrTicker') {
            const processedData: BinanceTickerData = {
              symbol: data.s,
              price: parseFloat(data.c),
              priceChange: parseFloat(data.P),
              priceChangePercent: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume: parseFloat(data.v),
              volumeQuote: parseFloat(data.q),
              openPrice: parseFloat(data.o),
              lastQty: parseFloat(data.Q),
              bidPrice: parseFloat(data.b),
              askPrice: parseFloat(data.a),
            };
            
            setTickerData(processedData);
          }
        } catch (err) {
          console.error('❌ Error processing ticker WebSocket data:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Binance ticker WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('🔌 Binance ticker WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reconnecting ticker in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error('❌ Error creating ticker WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [binanceSymbol]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Initialize connection and fetch initial data
  useEffect(() => {
    fetchInitialData();
    connect();
    
    return cleanup;
  }, [fetchInitialData, connect, cleanup]);

  // Periodically refetch data as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchInitialData();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isConnected, fetchInitialData]);

  return {
    tickerData,
    isConnected,
    error,
    refresh: fetchInitialData
  };
};