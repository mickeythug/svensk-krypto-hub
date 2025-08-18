import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoreKeyRequest {
  wallet_address: string;
  private_key_encrypted?: string;
  pump_api_key_encrypted?: string;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute

  const userLimit = rateLimitStore.get(userId) || { count: 0, lastReset: now };

  if (now - userLimit.lastReset > windowMs) {
    userLimit.count = 0;
    userLimit.lastReset = now;
  }

  userLimit.count++;
  rateLimitStore.set(userId, userLimit);

  return userLimit.count <= maxRequests;
};

// Input validation
const validateInput = (data: StoreKeyRequest): string | null => {
  if (!data.wallet_address || typeof data.wallet_address !== 'string') {
    return 'wallet_address is required and must be a string';
  }

  if (data.wallet_address.length < 10 || data.wallet_address.length > 100) {
    return 'wallet_address length invalid';
  }

  // Basic wallet address format validation
  const walletRegex = /^[A-Za-z0-9]+$/;
  if (!walletRegex.test(data.wallet_address)) {
    return 'wallet_address contains invalid characters';
  }

  return null;
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

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
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

    // Parse and validate request body
    let requestData: StoreKeyRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const validationError = validateInput(requestData);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert base64 strings to bytea format if provided
    const privateKeyBytea = requestData.private_key_encrypted 
      ? `\\x${Buffer.from(requestData.private_key_encrypted, 'base64').toString('hex')}`
      : null;
    
    const pumpApiKeyBytea = requestData.pump_api_key_encrypted 
      ? `\\x${Buffer.from(requestData.pump_api_key_encrypted, 'base64').toString('hex')}`
      : null;

    // Store encrypted keys using the secure function
    const { error: storeError } = await supabaseAdmin.rpc('store_encrypted_key', {
      p_user_id: user.id,
      p_wallet_address: requestData.wallet_address,
      p_private_key_encrypted: privateKeyBytea,
      p_pump_api_key_encrypted: pumpApiKeyBytea,
    });

    if (storeError) {
      console.error('Failed to store encrypted keys:', storeError);
      return new Response(
        JSON.stringify({ error: 'Failed to store keys securely' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Securely stored keys for user ${user.id}, wallet ${requestData.wallet_address}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Keys stored securely' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Secure wallet store error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});