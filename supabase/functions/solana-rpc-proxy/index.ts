import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, solana-client',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Solana RPC Proxy request:', req.method, req.url);
    
    const heliusApiKey = Deno.env.get('HELIUS_RPC_API_KEY');
    
    if (!heliusApiKey) {
      console.error('HELIUS_RPC_API_KEY not found in environment');
      // Fallback to public RPC endpoint
      const publicRpcEndpoint = 'https://api.mainnet-beta.solana.com';
      
      try {
        const body = req.method !== 'GET' ? await req.text() : undefined;
        console.log('Using public RPC, request body:', body);
        
        const rpcResponse = await fetch(publicRpcEndpoint, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        });

        const responseData = await rpcResponse.text();
        console.log('Public RPC response status:', rpcResponse.status);
        
        return new Response(responseData, {
          status: rpcResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (fallbackError) {
        console.error('Public RPC fallback failed:', fallbackError);
        return new Response(
          JSON.stringify({ error: 'All RPC endpoints unavailable', details: String(fallbackError) }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    const body = req.method !== 'GET' ? await req.text() : undefined;
    
    console.log('Using Helius RPC, request body:', body);
    
    // Forward the request to Helius RPC
    const rpcResponse = await fetch(rpcEndpoint, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const responseData = await rpcResponse.text();
    console.log('Helius RPC response status:', rpcResponse.status);
    
    return new Response(responseData, {
      status: rpcResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in solana-rpc-proxy:', error);
    return new Response(
      JSON.stringify({ 
        error: 'RPC proxy error', 
        details: String(error),
        message: 'Failed to connect to Solana network'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});