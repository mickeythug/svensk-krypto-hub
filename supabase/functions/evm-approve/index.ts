// Supabase Edge Function: evm-approve
// Purpose: Get 1inch spender and/or build ERC20 approve tx for a given token and amount.
// Input:
//  { chainId: number, tokenAddress: string, amount?: string, action: 'spender' | 'tx' }
// Output:
//  - action 'spender': { spender: string }
//  - action 'tx': { tx: { to, data, value } }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Req = {
  chainId: number;
  tokenAddress: string;
  amount?: string; // in token units (wei)
  action: 'spender' | 'tx';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const ONEINCH_API_KEY = Deno.env.get('ONEINCH_API_KEY');
    if (!ONEINCH_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server not configured: ONEINCH_API_KEY missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST with JSON body' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = (await req.json()) as Req;
    const { chainId, tokenAddress, amount, action } = body;
    if (!chainId || !tokenAddress || !action) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'spender') {
      const url = `https://api.1inch.dev/swap/v6.0/${chainId}/approve/spender`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${ONEINCH_API_KEY}` } });
      const data = await res.json();
      if (!res.ok) return new Response(JSON.stringify({ error: '1inch error', details: data }), { status: res.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // action === 'tx'
    if (!amount) {
      return new Response(JSON.stringify({ error: 'amount required for action tx' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const url = new URL(`https://api.1inch.dev/swap/v6.0/${chainId}/approve/transaction`);
    url.searchParams.set('tokenAddress', tokenAddress);
    url.searchParams.set('amount', amount);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${ONEINCH_API_KEY}` } });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: '1inch error', details: data }), { status: res.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('evm-approve error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
