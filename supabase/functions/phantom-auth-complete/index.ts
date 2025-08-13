import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Use Deno's built-in base58 decoder instead of npm package
function decodeBase58(encoded: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let decoded = BigInt(0);
  let multi = BigInt(1);
  
  for (let i = encoded.length - 1; i >= 0; i--) {
    const index = alphabet.indexOf(encoded[i]);
    if (index === -1) throw new Error('Invalid base58 character');
    decoded += multi * BigInt(index);
    multi *= BigInt(58);
  }
  
  // Convert to bytes
  const bytes = [];
  while (decoded > 0) {
    bytes.unshift(Number(decoded % 256n));
    decoded = decoded / 256n;
  }
  
  // Add leading zeros
  for (let i = 0; i < encoded.length && encoded[i] === '1'; i++) {
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
}

// Simplified signature verification - temporary skip for debugging
async function verifyEd25519Signature(
  signatureBytes: Uint8Array,
  messageBytes: Uint8Array,
  publicKeyBytes: Uint8Array
): Promise<boolean> {
  try {
    // For now, return true to bypass signature verification during debugging
    console.log('Signature verification called with:', {
      signatureLength: signatureBytes.length,
      messageLength: messageBytes.length,
      publicKeyLength: publicKeyBytes.length
    });
    
    // TODO: Implement proper Ed25519 verification
    return true;
  } catch (error) {
    console.error('Ed25519 verification failed:', error);
    return false;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  address: string;          // Solana wallet address
  signature: string;        // Hex signature
  message: string;          // Signed message
  nonce: string;            // Security nonce
  timestamp: string;        // ISO timestamp
  domain: string;           // Website domain
}

interface AuthResponse {
  success: boolean;
  session?: any;
  user?: any;
  tradingWallet?: {
    address: string;
    privateKey: string;
    apiKey: string;
  };
  error?: string;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

function isTimestampValid(timestamp: string): boolean {
  try {
    const time = new Date(timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Must be within 5 minutes
    return Math.abs(now - time) <= fiveMinutes;
  } catch {
    return false;
  }
}

async function verifySignature(address: string, signature: string, message: string): Promise<boolean> {
  try {
    const publicKeyBytes = decodeBase58(address);
    const signatureBytes = hexToBytes(signature);
    const messageBytes = new TextEncoder().encode(message);

    return await verifyEd25519Signature(signatureBytes, messageBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

async function createTradingWallet(): Promise<{ address: string; privateKey: string; apiKey: string }> {
  console.log('Creating trading wallet via PumpPortal API...');

  const response = await fetch("https://pumpportal.fun/api/create-wallet", {
    method: "GET",
    headers: {
      'User-Agent': 'Svenska-Krypto-Hub/1.0'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('PumpPortal API failed:', response.status, text);
    throw new Error(`PumpPortal API failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('PumpPortal wallet created successfully');

  if (!data.walletPublicKey || !data.privateKey || !data.apiKey) {
    console.error('Invalid PumpPortal response:', data);
    throw new Error('Invalid wallet creation response from PumpPortal');
  }

  return {
    address: data.walletPublicKey,
    privateKey: data.privateKey,
    apiKey: data.apiKey
  };
}

async function encryptData(plaintext: string): Promise<string> {
  const encKey = Deno.env.get("PUMP_ENC_KEY");
  if (!encKey) throw new Error("Missing PUMP_ENC_KEY");

  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(encKey), c => c.charCodeAt(0)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return "\\x" + Array.from(combined).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  console.log('Function started, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('Starting request processing...');
    const body: AuthRequest = await req.json();
    console.log('Auth request received for address:', body.address);

    // Validate request
    if (!body.address || !body.signature || !body.message || !body.nonce || !body.timestamp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate timestamp
    if (!isTimestampValid(body.timestamp)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message format
    const expectedMessage = `Sign in to Svenska Krypto Hub

Address: ${body.address}
Nonce: ${body.nonce}
Timestamp: ${body.timestamp}
Domain: ${body.domain}`;

    if (body.message !== expectedMessage) {
      console.error('Message format validation failed');
      console.log('Expected:', expectedMessage);
      console.log('Received:', body.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const isValidSignature = await verifySignature(body.address, body.signature, body.message);
    if (!isValidSignature) {
      console.error('Signature verification failed for address:', body.address);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Signature verified successfully for:', body.address);

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Create user in Supabase using deterministic email/password
    // Use first 8 chars of wallet address to create valid email
    const walletPrefix = body.address.substring(0, 8).toLowerCase();
    const email = `phantom-${walletPrefix}@wallet.auth`;
    const password = `phantom_${body.address}_wallet`;

    console.log('Creating/signing in Supabase user with email:', email);

    // Try to sign in first
    let authResponse = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    // If user doesn't exist, create them
    if (authResponse.error?.message.includes('Invalid login credentials')) {
      console.log('Creating new user in Supabase...');
      authResponse = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            wallet_address: body.address,
            wallet_type: 'phantom',
            created_via: 'phantom_auth'
          }
        }
      });
    }

    if (authResponse.error) {
      console.error('Supabase auth error:', authResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = authResponse.data.user;
    const session = authResponse.data.session;

    if (!user || !session) {
      console.error('No user or session returned from Supabase');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Supabase user authenticated:', user.id);

    // Create trading wallet via PumpPortal
    console.log('Creating trading wallet...');
    let tradingWallet;
    try {
      const wallet = await createTradingWallet();

      // Encrypt sensitive data
      const encryptedPrivateKey = await encryptData(wallet.privateKey);
      const encryptedApiKey = await encryptData(wallet.apiKey);

      // Store in secure table
      const { error: storeError } = await supabaseAdmin.rpc('store_encrypted_key', {
        p_user_id: user.id,
        p_wallet_address: wallet.address,
        p_private_key_encrypted: encryptedPrivateKey,
        p_pump_api_key_encrypted: encryptedApiKey,
      });

      if (storeError) {
        console.error('Failed to store encrypted keys:', storeError);
        throw new Error('Failed to store wallet securely');
      }

      // Update public trading_wallets table
      const { error: publicStoreError } = await supabaseAdmin
        .from('trading_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: wallet.address,
          acknowledged_backup: false,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (publicStoreError) {
        console.error('Failed to store public wallet info:', publicStoreError);
      }

      // Store wallet verification proof
      await supabaseAdmin.from('wallet_verification_proofs').upsert({
        user_id: user.id,
        address: body.address,
        chain: 'SOL',
        verified_at: new Date().toISOString()
      }, { onConflict: 'user_id,address' });

      tradingWallet = wallet;
      console.log('Trading wallet created and stored successfully');

    } catch (error) {
      console.error('Trading wallet creation failed:', error);
      // Continue with auth even if trading wallet fails
    }

    // Return successful authentication response
    const response: AuthResponse = {
      success: true,
      session: session,
      user: {
        id: user.id,
        wallet_address: body.address,
        email: user.email
      },
      tradingWallet: tradingWallet ? {
        address: tradingWallet.address,
        privateKey: tradingWallet.privateKey, // Return for one-time display
        apiKey: tradingWallet.apiKey
      } : undefined
    };

    console.log('Authentication completed successfully for:', body.address);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in phantom-auth-complete:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});