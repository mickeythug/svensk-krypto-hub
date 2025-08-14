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

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Connect to Helius WebSocket - use standard RPC endpoint for WebSocket
  const heliusWs = new WebSocket(`wss://${heliusApiKey}.helius-rpc.com`);
  
  console.log('Creating WebSocket proxy to Helius');

  heliusWs.onopen = () => {
    console.log('Connected to Helius WebSocket');
  };

  heliusWs.onmessage = (event) => {
    console.log('Received from Helius:', event.data);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };

  heliusWs.onerror = (error) => {
    console.error('Helius WebSocket error:', error);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ error: 'Helius connection error' }));
    }
  };

  heliusWs.onclose = () => {
    console.log('Helius WebSocket closed');
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected');
  };

  socket.onmessage = (event) => {
    console.log('Received from client:', event.data);
    if (heliusWs.readyState === WebSocket.OPEN) {
      heliusWs.send(event.data);
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('Client WebSocket closed');
    if (heliusWs.readyState === WebSocket.OPEN) {
      heliusWs.close();
    }
  };

  return response;
});