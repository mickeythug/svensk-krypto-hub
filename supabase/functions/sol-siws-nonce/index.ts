// Supabase Edge Function: sol-siws-nonce
// Purpose: Issue a SIWS message + nonce for Phantom to sign (public, CORS enabled)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body = {
  address?: string;
  domain?: string;
};

function makeNonce(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { address = '', domain = '' } = (await req.json().catch(() => ({}))) as Body;
    const now = new Date().toISOString();
    const nonce = makeNonce();

    const parsedDomain = domain || new URL(req.headers.get('origin') || 'http://localhost').host;

    const message = [
      `${parsedDomain} vill verifiera din wallet`,
      '',
      `Adress: ${address}`,
      `Kedja: Solana`,
      `Syfte: Sign-In With Solana (SIWS)`,
      `Nonce: ${nonce}`,
      `Issued At: ${now}`,
    ].join('\n');

    return new Response(
      JSON.stringify({ message, nonce, issuedAt: now, domain: parsedDomain }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('sol-siws-nonce error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
