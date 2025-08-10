// Supabase Edge Function: jupiter-swap
// Purpose: Build a swap transaction via Jupiter (v6) for Solana. Public, CORS enabled.
// Input: { userPublicKey, inputMint, outputMint, amount, slippageBps }
// Output: { swapTransaction } base64 string to be signed on client

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SwapReq = {
  userPublicKey: string;
  inputMint: string;
  outputMint: string;
  amount: string; // integer amount in smallest units
  slippageBps?: number; // default 50 (0.5%)
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 405 });
    }
    const body = (await req.json()) as SwapReq;
    console.log('jupiter-swap request', body);
    const { userPublicKey, inputMint, outputMint, amount } = body;
    const slippageBps = body.slippageBps ?? 50;

    if (!userPublicKey || !inputMint || !outputMint || !amount) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 });
    }

    const quoteUrl = new URL('https://quote-api.jup.ag/v6/quote');
    quoteUrl.searchParams.set('inputMint', inputMint);
    quoteUrl.searchParams.set('outputMint', outputMint);
    quoteUrl.searchParams.set('amount', amount);
    quoteUrl.searchParams.set('slippageBps', String(slippageBps));

    const quoteRes = await fetch(quoteUrl.toString());
    const quote = await quoteRes.json();
    if (!quoteRes.ok) {
      return new Response(JSON.stringify({ error: 'Quote error', details: quote }), { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: quoteRes.status });
    }

    const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });
    const swapJson = await swapRes.json();
    if (!swapRes.ok) {
      return new Response(JSON.stringify({ error: 'Swap build error', details: swapJson }), { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: swapRes.status });
    }

    return new Response(JSON.stringify({ swapTransaction: swapJson.swapTransaction }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('jupiter-swap error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 });
  }
});
