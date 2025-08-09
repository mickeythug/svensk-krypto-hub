// Supabase Edge Function: wc-project
// Purpose: Expose the public WalletConnect Project ID to the frontend (no auth).
// Notes:
// - WALLETCONNECT_PROJECT_ID is not a secret; exposing it is safe.
// - CORS enabled

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const projectId = Deno.env.get('WALLETCONNECT_PROJECT_ID') || '';

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'WALLETCONNECT_PROJECT_ID saknas i Supabase secrets' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ projectId }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('wc-project error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
