import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
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

    const requestData = await req.json();
    const walletAddress = requestData.wallet_address;
    const keyType = requestData.key_type || 'private_key';
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'wallet_address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!['private_key', 'pump_api_key'].includes(keyType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid key_type. Must be private_key or pump_api_key' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Retrieve encrypted key using the secure function
    const { data: encryptedKeyBytea, error: retrieveError } = await supabaseAdmin.rpc('get_encrypted_key', {
      p_user_id: user.id,
      p_wallet_address: walletAddress,
      p_key_type: keyType,
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

    // Decrypt the key
    const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const hexToBytes = (hex: string) => {
      const clean = hex.startsWith('\\x') ? hex.slice(2) : hex;
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
      }
      return bytes;
    };

    const getAesKey = async () => {
      const base64 = Deno.env.get("PUMP_ENC_KEY") || "";
      if (!base64) throw new Error("Missing PUMP_ENC_KEY secret");
      const raw = b64ToBytes(base64);
      return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    };

    const decryptString = async (encryptedHex: string) => {
      const key = await getAesKey();
      const packed = hexToBytes(encryptedHex);
      const iv = packed.slice(0, 12);
      const ciphertext = packed.slice(12);
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      return new TextDecoder().decode(decrypted);
    };

    let encryptedHex: string;
    if (typeof encryptedKeyBytea === 'string' && encryptedKeyBytea.startsWith('\\x')) {
      encryptedHex = encryptedKeyBytea;
    } else {
      // Convert other formats to hex
      const buffer = Buffer.from(encryptedKeyBytea);
      encryptedHex = '\\x' + buffer.toString('hex');
    }

    const decryptedKey = await decryptString(encryptedHex);

    console.log(`Successfully decrypted ${keyType} for user ${user.id}, wallet ${walletAddress}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        [keyType]: decryptedKey
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Decrypt key error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});