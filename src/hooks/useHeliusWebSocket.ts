import { useEffect, useRef, useState } from 'react';

interface WebSocketSubscription {
  id: string;
  method: string;
  params: any[];
  callback: (data: any) => void;
  subscriptionId?: number;
}

interface HeliusWebSocketOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export class HeliusWebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, WebSocketSubscription>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelay: number;
  private readonly autoReconnect: boolean;
  private requestId = 1;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

  constructor(
    private endpoint: string,
    options: HeliusWebSocketOptions = {}
  ) {
    this.autoReconnect = options.autoReconnect ?? true;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    this.reconnectDelay = options.reconnectDelay ?? 2000;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket:', this.endpoint);
        this.ws = new WebSocket(this.endpoint);

        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.error('WebSocket connection timeout');
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('Connected to Helius WebSocket via proxy');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e, event.data);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('Disconnected from Helius WebSocket:', event.code, event.reason);
          this.isConnected = false;
          
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            
            if (this.reconnectTimeoutId) {
              clearTimeout(this.reconnectTimeoutId);
            }
            
            this.reconnectTimeoutId = setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          this.isConnected = false;
          
          // Don't immediately reject - let onclose handle reconnection
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    // Handle subscription confirmations
    if (data.result && typeof data.result === 'number') {
      const sub = Array.from(this.subscriptions.values())
        .find(s => s.id === data.id?.toString());
      if (sub) {
        sub.subscriptionId = data.result;
        console.log(`Subscription ${sub.method} confirmed with ID: ${data.result}`);
      }
      return;
    }

    // Handle notifications
    if (data.method?.endsWith('Notification')) {
      const sub = Array.from(this.subscriptions.values())
        .find(s => s.subscriptionId === data.params?.subscription);
      if (sub?.callback) {
        sub.callback(data.params.result);
      }
      return;
    }

    // Handle errors
    if (data.error) {
      console.error('WebSocket RPC error:', data.error);
    }
  }

  subscribe(method: string, params: any[], callback: (data: any) => void): string {
    const id = (this.requestId++).toString();
    const subscription: WebSocketSubscription = {
      id,
      method,
      params,
      callback,
    };

    this.subscriptions.set(id, subscription);

    if (this.isConnected && this.ws) {
      this.sendSubscription(subscription);
    }

    return id;
  }

  private sendSubscription(subscription: WebSocketSubscription) {
    if (!this.ws || !this.isConnected) {
      console.warn('Cannot send subscription, WebSocket not connected');
      return;
    }

    const message = {
      jsonrpc: '2.0',
      id: subscription.id,
      method: subscription.method,
      params: subscription.params,
    };

    console.log('Sending subscription:', message);
    this.ws.send(JSON.stringify(message));
  }

  private resubscribeAll() {
    console.log('Resubscribing to all subscriptions:', this.subscriptions.size);
    for (const subscription of this.subscriptions.values()) {
      subscription.subscriptionId = undefined;
      this.sendSubscription(subscription);
    }
  }

  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription?.subscriptionId && this.ws && this.isConnected) {
      // Send unsubscribe message
      const unsubMethod = subscription.method.replace('Subscribe', 'Unsubscribe');
      const message = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method: unsubMethod,
        params: [subscription.subscriptionId],
      };
      
      console.log('Sending unsubscribe:', message);
      this.ws.send(JSON.stringify(message));
    }
    this.subscriptions.delete(subscriptionId);
  }

  disconnect() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export function useHeliusWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsManager = useRef<HeliusWebSocketManager | null>(null);

  useEffect(() => {
    // Use our Supabase Edge Function proxy for WebSocket connections
    const endpoint = `wss://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/helius-websocket-proxy`;
    wsManager.current = new HeliusWebSocketManager(endpoint, {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
    });

    wsManager.current.connect()
      .then(() => setIsConnected(true))
      .catch((error) => {
        console.error('Failed to connect to Helius WebSocket:', error);
        setIsConnected(false);
      });

    return () => {
      if (wsManager.current) {
        wsManager.current.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  return {
    wsManager: wsManager.current,
    isConnected,
  };
}