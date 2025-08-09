// Resolve TradingView symbol from CoinGecko tickers with exchange preference
// Public endpoint: GET /functions/v1/tv-symbol-resolver?id=coingecko-id&symbol=BTC

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXCHANGE_CODE_MAP: Record<string, string> = {
  'Binance': 'BINANCE',
  'Binance US': 'BINANCEUS',
  'Bybit': 'BYBIT',
  'MEXC': 'MEXC',
  'MEXC Global': 'MEXC',
  'OKX': 'OKX',
  'KuCoin': 'KUCOIN',
  'KuCoin Futures': 'KUCOINF',
  'Gate.io': 'GATEIO',
  'Kraken': 'KRAKEN',
  'Coinbase': 'COINBASE',
  'Coinbase Pro': 'COINBASE',
  'Bitfinex': 'BITFINEX',
  'Bitstamp': 'BITSTAMP',
  'Huobi': 'HUOBI',
  'HTX': 'HUOBI',
  'Poloniex': 'POLONIEX',
  'Bittrex': 'BITTREX',
};

const PREFERRED_EXCHANGES = [
  'Binance', 'Bybit', 'MEXC', 'OKX', 'KuCoin', 'Gate.io', 'Kraken', 'Coinbase'
];
const PREFERRED_TARGETS = ['USDT', 'USD', 'USDC'];

function buildTvSymbol(exchangeName: string, base: string, target: string) {
  const code = EXCHANGE_CODE_MAP[exchangeName] || EXCHANGE_CODE_MAP[Object.keys(EXCHANGE_CODE_MAP).find(k => exchangeName.includes(k)) || ''];
  if (!code) return null;
  return { tvSymbol: `${code}:${base.toUpperCase()}${target.toUpperCase()}`, exchange: code };
}

async function fetchTickers(coinGeckoId: string) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/tickers?include_exchange_logo=false`;
  const res = await fetch(url, { headers: { 'accept': 'application/json', 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`Tickers fetch failed: ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const id = (url.searchParams.get('id') || '').trim();
    const symbol = (url.searchParams.get('symbol') || '').toUpperCase().trim();

    if (!id && !symbol) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing id or symbol' }), { status: 400, headers: { 'content-type': 'application/json', ...corsHeaders } });
    }

    if (!id) {
      // No CoinGecko id → conservative fallback guesses across popular venues
      const guesses = ['BYBIT', 'OKX', 'KUCOIN', 'MEXC', 'GATEIO', 'COINBASE', 'KRAKEN', 'BINANCE'];
      return new Response(JSON.stringify({ ok: true, tvSymbol: `${guesses[0]}:${symbol}USDT`, exchange: guesses[0] }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
    }

    const data = await fetchTickers(id);
    const tickers: any[] = data?.tickers || [];

    // Prefer targets and exchanges
    for (const ex of PREFERRED_EXCHANGES) {
      for (const tgt of PREFERRED_TARGETS) {
        const candidates = tickers
          .filter(t => t?.market?.name?.includes(ex) && (t?.target || '').toUpperCase() === tgt)
          .sort((a, b) => (b?.trust_score || 0) - (a?.trust_score || 0) || (b?.converted_volume?.usd || 0) - (a?.converted_volume?.usd || 0));
        if (candidates.length) {
          const { base, target, market } = candidates[0];
          const built = buildTvSymbol(market.name, base, target);
          if (built) return new Response(JSON.stringify({ ok: true, ...built }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
        }
      }
    }

    // Any market from preferred exchanges
    for (const ex of PREFERRED_EXCHANGES) {
      const any = tickers.find(t => t?.market?.name?.includes(ex));
      if (any) {
        const { base, target, market } = any;
        const built = buildTvSymbol(market.name, base, target);
        if (built) return new Response(JSON.stringify({ ok: true, ...built }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
      }
    }

    // Fallback to common guess
    const fallback = { tvSymbol: `BYBIT:${symbol || 'BTC'}USDT`, exchange: 'BYBIT' };
    return new Response(JSON.stringify({ ok: true, ...fallback }), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('tv-symbol-resolver error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'content-type': 'application/json', ...corsHeaders } });
  }
});
