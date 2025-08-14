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

  constructor(
    private endpoint: string,
    options: HeliusWebSocketOptions = {}
  ) {
    this.autoReconnect = options.autoReconnect ?? true;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    this.reconnectDelay = options.reconnectDelay ?? 1000;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.endpoint);

        this.ws.onopen = () => {
          console.log('Connected to Helius WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from Helius WebSocket');
          this.isConnected = false;
          
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
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
    }

    // Handle errors
    if (data.error) {
      console.error('WebSocket error:', data.error);
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
    if (!this.ws || !this.isConnected) return;

    const message = {
      jsonrpc: '2.0',
      id: subscription.id,
      method: subscription.method,
      params: subscription.params,
    };

    this.ws.send(JSON.stringify(message));
  }

  private resubscribeAll() {
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
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: unsubMethod,
        params: [subscription.subscriptionId],
      }));
    }
    this.subscriptions.delete(subscriptionId);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export function useHeliusWebSocket(apiKey?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const wsManager = useRef<HeliusWebSocketManager | null>(null);

  useEffect(() => {
    const endpoint = `wss://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/helius-websocket-proxy`;
    wsManager.current = new HeliusWebSocketManager(endpoint);

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
  }, [apiKey]);

  return {
    wsManager: wsManager.current,
    isConnected,
  };
}