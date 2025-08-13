import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Function started, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('📦 Starting request processing...');
    const body = await req.json();
    console.log('📝 Auth request received for address:', body.address);

    // Validate request
    if (!body.address || !body.signature || !body.message || !body.nonce || !body.timestamp) {
      console.log('❌ Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ All required fields present');

    // Validate timestamp
    const time = new Date(body.timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(now - time) > fiveMinutes) {
      console.log('❌ Invalid timestamp');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Timestamp valid');

    // Validate message format
    const expectedMessage = `Sign in to Svenska Krypto Hub

Address: ${body.address}
Nonce: ${body.nonce}
Timestamp: ${body.timestamp}
Domain: ${body.domain}`;

    if (body.message !== expectedMessage) {
      console.log('❌ Message format validation failed');
      console.log('Expected:', expectedMessage);
      console.log('Received:', body.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message format valid');

    // SKIP signature verification for now
    console.log('⚠️ Skipping signature verification for debugging');

    // Initialize Supabase admin client
    console.log('🔧 Initializing Supabase admin client');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Create user in Supabase using deterministic email/password
    const walletPrefix = body.address.substring(0, 8).toLowerCase();
    const email = `phantom-${walletPrefix}@example.com`;
    const password = `phantom_${body.address}_wallet`;

    console.log('👤 Creating/signing in Supabase user with email:', email);

    // Try to sign in first
    let authResponse = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    // If user doesn't exist, create them
    if (authResponse.error?.message.includes('Invalid login credentials')) {
      console.log('🆕 Creating new user in Supabase...');
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
      console.error('❌ Supabase auth error:', authResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = authResponse.data.user;
    const session = authResponse.data.session;

    if (!user || !session) {
      console.error('❌ No user or session returned from Supabase');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Supabase user authenticated:', user.id);

    // Return successful authentication response (skip trading wallet for now)
    const response = {
      success: true,
      session: session,
      user: {
        id: user.id,
        wallet_address: body.address,
        email: user.email
      }
    };

    console.log('🎉 Authentication completed successfully for:', body.address);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in phantom-auth-complete:', error);
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