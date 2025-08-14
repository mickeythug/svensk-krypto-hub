import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, solana-client',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the request for debugging
    console.log('Solana RPC Proxy request:', req.method, req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Debug environment variables
    console.log('Available env vars:', Object.keys(Deno.env.toObject()));
    
    const heliusApiKey = Deno.env.get('HELIUS_RPC_API_KEY');
    
    if (!heliusApiKey) {
      console.error('HELIUS_RPC_API_KEY not found in environment');
      console.error('All env vars:', Deno.env.toObject());
      
      // Use public RPC endpoint as fallback
      const publicEndpoint = 'https://api.mainnet-beta.solana.com';
      console.log('Falling back to public Solana RPC:', publicEndpoint);
      
      try {
        const requestBody = req.method !== 'GET' ? await req.text() : '';
        console.log('Request body:', requestBody);
        
        const rpcResponse = await fetch(publicEndpoint, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: req.method !== 'GET' ? requestBody : undefined,
        });

        const responseText = await rpcResponse.text();
        console.log('Public RPC Response status:', rpcResponse.status);
        console.log('Public RPC Response:', responseText.substring(0, 500));
        
        return new Response(responseText, {
          status: rpcResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (fallbackError) {
        console.error('Public RPC also failed:', fallbackError);
        return new Response(
          JSON.stringify({ error: 'All RPC endpoints unavailable', code: 500 }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    
    // Get request body
    const requestBody = req.method !== 'GET' ? await req.text() : '';
    console.log('Request body:', requestBody);
    
    // Forward the request to Helius RPC
    const rpcResponse = await fetch(rpcEndpoint, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: req.method !== 'GET' ? requestBody : undefined,
    });

    const responseText = await rpcResponse.text();
    console.log('RPC Response status:', rpcResponse.status);
    console.log('RPC Response:', responseText.substring(0, 500));
    
    if (!rpcResponse.ok) {
      console.error('RPC request failed:', rpcResponse.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: 'RPC request failed', 
          status: rpcResponse.status,
          message: responseText 
        }),
        { 
          status: rpcResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(responseText, {
      status: rpcResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in solana-rpc-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'RPC proxy error', 
        message: errorMessage,
        details: String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});