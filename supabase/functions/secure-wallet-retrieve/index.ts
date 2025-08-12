import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetrieveKeyRequest {
  wallet_address: string;
  key_type: 'private_key' | 'pump_api_key';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: RetrieveKeyRequest = await req.json();
    
    if (!requestData.wallet_address || !requestData.key_type) {
      return new Response(
        JSON.stringify({ error: 'wallet_address and key_type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!['private_key', 'pump_api_key'].includes(requestData.key_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid key_type. Must be private_key or pump_api_key' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Retrieve encrypted key using the secure function
    const { data: encryptedKeyBytea, error: retrieveError } = await supabaseAdmin.rpc('get_encrypted_key', {
      p_user_id: user.id,
      p_wallet_address: requestData.wallet_address,
      p_key_type: requestData.key_type,
    });

    if (retrieveError) {
      console.error('Failed to retrieve encrypted key:', retrieveError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve key' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!encryptedKeyBytea) {
      return new Response(
        JSON.stringify({ error: 'Key not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert bytea back to base64 for client
    let encryptedKeyBase64: string;
    
    if (typeof encryptedKeyBytea === 'string' && encryptedKeyBytea.startsWith('\\x')) {
      // Convert hex string to base64
      const hexString = encryptedKeyBytea.slice(2); // Remove \x prefix
      const buffer = Buffer.from(hexString, 'hex');
      encryptedKeyBase64 = buffer.toString('base64');
    } else {
      // Handle other formats if needed
      encryptedKeyBase64 = Buffer.from(encryptedKeyBytea).toString('base64');
    }

    console.log(`Securely retrieved ${requestData.key_type} for user ${user.id}, wallet ${requestData.wallet_address}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        encrypted_key: encryptedKeyBase64,
        key_type: requestData.key_type 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Secure wallet retrieve error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});