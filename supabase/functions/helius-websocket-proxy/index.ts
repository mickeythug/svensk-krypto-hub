import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const heliusApiKey = Deno.env.get('HELIUS_RPC_API_KEY');
  
  if (!heliusApiKey || heliusApiKey.trim() === '') {
    console.error('HELIUS_RPC_API_KEY not found or empty in environment');
    console.error('Available env vars:', Object.keys(Deno.env.toObject()));
    return new Response("API key not configured", { 
      status: 500,
      headers: corsHeaders 
    });
  }

  console.log('Creating WebSocket proxy to Helius');

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to Helius WebSocket with proper URL
    const heliusWsUrl = `wss://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    console.log('Connecting to Helius WebSocket:', heliusWsUrl.replace(heliusApiKey, '***'));
    
    const heliusWs = new WebSocket(heliusWsUrl);
    
    // Set up connection timeout
    const connectionTimeout = setTimeout(() => {
      if (heliusWs.readyState === WebSocket.CONNECTING) {
        console.error('Helius WebSocket connection timeout');
        heliusWs.close();
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1011, 'Connection timeout');
        }
      }
    }, 10000); // 10 second timeout

    heliusWs.onopen = () => {
      console.log('Successfully connected to Helius WebSocket');
      clearTimeout(connectionTimeout);
    };

    heliusWs.onmessage = (event) => {
      console.log('Received from Helius:', typeof event.data);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    heliusWs.onerror = (error) => {
      console.error('Helius WebSocket error:', error);
      clearTimeout(connectionTimeout);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          error: 'Helius connection error',
          message: 'Failed to connect to Helius'
        }));
        socket.close(1011, 'Helius connection failed');
      }
    };

    heliusWs.onclose = (event) => {
      console.log('Helius WebSocket closed:', event.code, event.reason);
      clearTimeout(connectionTimeout);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(event.code, event.reason || 'Helius connection closed');
      }
    };

    socket.onopen = () => {
      console.log('Client WebSocket connected');
    };

    socket.onmessage = (event) => {
      console.log('Received from client:', typeof event.data);
      if (heliusWs.readyState === WebSocket.OPEN) {
        heliusWs.send(event.data);
      } else {
        console.warn('Helius WebSocket not ready, readyState:', heliusWs.readyState);
        socket.send(JSON.stringify({
          error: 'Helius WebSocket not connected',
          readyState: heliusWs.readyState
        }));
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('Client WebSocket closed:', event.code, event.reason);
      clearTimeout(connectionTimeout);
      if (heliusWs.readyState === WebSocket.OPEN || heliusWs.readyState === WebSocket.CONNECTING) {
        heliusWs.close();
      }
    };

    return response;
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to establish WebSocket connection',
        message: String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});