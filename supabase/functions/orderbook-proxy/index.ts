// Order Book Proxy: fetch depth from multiple exchanges server-side and normalize
// Public endpoint. Usage:
//   GET /functions/v1/orderbook-proxy?exchange=BYBIT&pair=BTCUSDT&limit=40
//   Returns: { bids: [ [price, qty], ... ], asks: [ [price, qty], ... ], lastUpdateId }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function toHyphenPair(p: string) {
  if (!p) return p;
  if (p.includes('-')) return p;
  const m = p.match(/([A-Z]+)(USDT|USD|USDC|BTC|ETH)$/);
  return m ? `${m[1]}-${m[2]}` : p;
}
function toUnderscorePair(p: string) {
  if (!p) return p;
  if (p.includes('_')) return p.replace('-', '_');
  const m = p.match(/([A-Z]+)(USDT|USD|USDC|BTC|ETH)$/);
  return m ? `${m[1]}_${m[2]}` : p;
}

async function fetchBybit(pair: string, limit: number) {
  const url1 = `https://api.bybit.com/spot/quote/v1/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`;
  let res = await fetch(url1);
  if (!res.ok) res = await fetch(`https://api.bybit.com/spot/quote/v3/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`);
  if (!res.ok) throw new Error(`Bybit error ${res.status}`);
  const data = await res.json();
  const bids = data?.bids || data?.result?.bids || [];
  const asks = data?.asks || data?.result?.asks || [];
  const lastUpdateId = data?.lastUpdateId || data?.result?.lastUpdateId || Date.now();
  return { bids, asks, lastUpdateId };
}

async function fetchMexc(pair: string, limit: number) {
  const url = `https://api.mexc.com/api/v3/depth?symbol=${pair}&limit=${Math.min(50, limit * 2)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MEXC error ${res.status}`);
  const data = await res.json();
  return { bids: data?.bids || [], asks: data?.asks || [], lastUpdateId: data?.lastUpdateId || Date.now() };
}

async function fetchOkx(pair: string, limit: number) {
  const instId = toHyphenPair(pair);
  const url = `https://www.okx.com/api/v5/market/books?instId=${instId}&sz=${Math.min(50, limit * 2)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OKX error ${res.status}`);
  const data = await res.json();
  const book = data?.data?.[0];
  const bids = (book?.bids || []).map((row: any[]) => [row[0], row[1]]);
  const asks = (book?.asks || []).map((row: any[]) => [row[0], row[1]]);
  const lastUpdateId = Number(book?.ts) || Date.now();
  return { bids, asks, lastUpdateId };
}

async function fetchKucoin(pair: string, limit: number) {
  const sym = toHyphenPair(pair);
  // level2_{n}, choices: 20/100
  const depth = Math.min(100, Math.max(20, limit * 2));
  const endpoint = depth <= 20 ? 'level2_20' : 'level2_100';
  const url = `https://api.kucoin.com/api/v1/market/orderbook/${endpoint}?symbol=${sym}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KuCoin error ${res.status}`);
  const json = await res.json();
  const data = json?.data || {};
  const bids = data?.bids || [];
  const asks = data?.asks || [];
  const lastUpdateId = Number(data?.time) || Date.now();
  return { bids, asks, lastUpdateId };
}

async function fetchGate(pair: string, limit: number) {
  const cp = toUnderscorePair(pair);
  const url = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${cp}&limit=${Math.min(50, limit * 2)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gate error ${res.status}`);
  const data = await res.json();
  // Gate may return arrays [[price, amount]] or objects; normalize both
  const mapSide = (side: any[]) => side.map((row: any) => Array.isArray(row) ? [row[0], row[1]] : [row.p, row.s]);
  const bids = mapSide(data?.bids || []);
  const asks = mapSide(data?.asks || []);
  const lastUpdateId = Date.now();
  return { bids, asks, lastUpdateId };
}

async function fetchCoinbase(pair: string, limit: number) {
  const cp = toHyphenPair(pair);
  const url = `https://api.exchange.coinbase.com/products/${cp}/book?level=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Coinbase error ${res.status}`);
  const data = await res.json();
  const bids = (data?.bids || []).map((r: any[]) => [r[0], r[1]]);
  const asks = (data?.asks || []).map((r: any[]) => [r[0], r[1]]);
  const lastUpdateId = Number(data?.sequence) || Date.now();
  return { bids, asks, lastUpdateId };
}

async function fetchKraken(pair: string, limit: number) {
  // Kraken pairs can differ (e.g., XBTUSD). Assume tvSymbol already mapped by upstream; try as-is.
  const url = `https://api.kraken.com/0/public/Depth?pair=${pair}&count=${Math.min(100, limit * 2)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kraken error ${res.status}`);
  const json = await res.json();
  const result = json?.result || {};
  const firstKey = Object.keys(result)[0];
  const book = result[firstKey] || {};
  const bids = (book?.bids || []).map((r: any[]) => [r[0], r[1]]);
  const asks = (book?.asks || []).map((r: any[]) => [r[0], r[1]]);
  const lastUpdateId = Date.now();
  return { bids, asks, lastUpdateId };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const exch = (url.searchParams.get('exchange') || '').toUpperCase();
    const pair = (url.searchParams.get('pair') || '').toUpperCase();
    const limit = Math.max(5, Math.min(200, Number(url.searchParams.get('limit') || '40')));

    if (!exch || !pair) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing exchange or pair' }), { status: 400, headers: { 'content-type': 'application/json', ...corsHeaders } });
    }

    let data;
    switch (exch) {
      case 'BYBIT': data = await fetchBybit(pair, limit); break;
      case 'MEXC': data = await fetchMexc(pair, limit); break;
      case 'OKX': data = await fetchOkx(pair, limit); break;
      case 'KUCOIN':
      case 'KCS': data = await fetchKucoin(pair, limit); break;
      case 'GATE':
      case 'GATEIO': data = await fetchGate(pair, limit); break;
      case 'COINBASE':
      case 'COINBASEPRO': data = await fetchCoinbase(pair, limit); break;
      case 'KRAKEN': data = await fetchKraken(pair, limit); break;
      default:
        // Best-effort fallback to MEXC style
        data = await fetchMexc(pair, limit);
    }

    return new Response(JSON.stringify({ ok: true, ...data }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('orderbook-proxy error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'content-type': 'application/json', ...corsHeaders } });
  }
});
