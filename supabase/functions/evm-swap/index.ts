// Supabase Edge Function: evm-swap
// Purpose: Build swap transactions via 1inch for EVM chains (Ethereum, BNB) with a 1% platform fee.
// Notes:
// - Uses 1inch Developer Portal (v6) endpoint
// - Requires ONEINCH_API_KEY (secret) and FEE_RECIPIENT_EVM (secret)
// - CORS enabled

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvmSwapRequest {
  chainId: number; // 1 (ETH), 56 (BNB)
  fromToken: string; // token address
  toToken: string; // token address
  amount: string; // in wei
  fromAddress: string; // EVM address
  slippage: number; // percent, e.g., 1
  disableEstimate?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ONEINCH_API_KEY = Deno.env.get('ONEINCH_API_KEY');
    const FEE_RECIPIENT_EVM = Deno.env.get('FEE_RECIPIENT_EVM');

    if (!ONEINCH_API_KEY || !FEE_RECIPIENT_EVM) {
      return new Response(
        JSON.stringify({ error: 'Server not configured: ONEINCH_API_KEY or FEE_RECIPIENT_EVM missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Use POST with JSON body' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = (await req.json()) as EvmSwapRequest;
    const { chainId, fromToken, toToken, amount, fromAddress, slippage, disableEstimate } = body;

    if (!chainId || !fromToken || !toToken || !amount || !fromAddress || slippage === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const url = new URL(`https://api.1inch.dev/swap/v6.0/${chainId}/swap`);
    url.searchParams.set('src', fromToken);
    url.searchParams.set('dst', toToken);
    url.searchParams.set('amount', amount);
    url.searchParams.set('fromAddress', fromAddress);
    url.searchParams.set('slippage', String(slippage)); // percent
    url.searchParams.set('disableEstimate', String(Boolean(disableEstimate)));
    // Partner fee settings (1%)
    url.searchParams.set('referrerAddress', FEE_RECIPIENT_EVM);
    url.searchParams.set('fee', '1'); // 1% (see 1inch portal docs for units)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ONEINCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('1inch error', { status: res.status, data });
      return new Response(
        JSON.stringify({ error: '1inch error', details: data }),
        { status: res.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('Unexpected error in evm-swap', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
