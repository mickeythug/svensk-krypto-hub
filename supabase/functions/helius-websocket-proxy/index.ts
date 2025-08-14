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
  
  if (!heliusApiKey) {
    console.error('HELIUS_RPC_API_KEY not found in environment');
    return new Response("API key not configured", { 
      status: 500,
      headers: corsHeaders 
    });
  }

  console.log('Creating WebSocket proxy to Helius');

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to Helius WebSocket - include API key in URL since headers might not work
    const heliusWsUrl = `wss://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    const heliusWs = new WebSocket(heliusWsUrl);

    heliusWs.onopen = () => {
      console.log('Connected to Helius WebSocket');
    };

    heliusWs.onmessage = (event) => {
      console.log('Received from Helius:', typeof event.data, event.data.length > 100 ? event.data.substring(0, 100) + '...' : event.data);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    heliusWs.onerror = (error) => {
      console.error('Helius WebSocket error:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          error: 'Helius connection error',
          message: String(error)
        }));
      }
    };

    heliusWs.onclose = (event) => {
      console.log('Helius WebSocket closed:', event.code, event.reason);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(event.code, event.reason);
      }
    };

    socket.onopen = () => {
      console.log('Client WebSocket connected');
    };

    socket.onmessage = (event) => {
      console.log('Received from client:', typeof event.data, event.data.length > 100 ? event.data.substring(0, 100) + '...' : event.data);
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
      if (heliusWs.readyState === WebSocket.OPEN) {
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