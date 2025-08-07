import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BinanceTickerResponse {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Lista över symboler vi vill hämta
    const symbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
      'DOTUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'ATOMUSDT',
      'DOGEUSDT', 'SHIBUSDT', 'MATICUSDT', 'LTCUSDT', 'XRPUSDT'
    ];

    // Hämta prisdata från Binance API
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const allTickers: BinanceTickerResponse[] = await response.json();
    
    // Filtrera och formatera data för våra valda symboler
    const filteredPrices = symbols.map(symbol => {
      const ticker = allTickers.find(t => t.symbol === symbol);
      if (!ticker) return null;

      // Konvertera till SEK (ungefärlig kurs: 1 USD = 10.5 SEK)
      const usdPrice = parseFloat(ticker.price);
      const sekPrice = usdPrice * 10.5;
      
      // Mappa till vårt format
      const cryptoNames: { [key: string]: string } = {
        'BTCUSDT': 'Bitcoin',
        'ETHUSDT': 'Ethereum',
        'BNBUSDT': 'Binance Coin',
        'ADAUSDT': 'Cardano',
        'SOLUSDT': 'Solana',
        'DOTUSDT': 'Polkadot',
        'AVAXUSDT': 'Avalanche',
        'LINKUSDT': 'Chainlink',
        'UNIUSDT': 'Uniswap',
        'ATOMUSDT': 'Cosmos',
        'DOGEUSDT': 'Dogecoin',
        'SHIBUSDT': 'Shiba Inu',
        'MATICUSDT': 'Polygon',
        'LTCUSDT': 'Litecoin',
        'XRPUSDT': 'XRP'
      };

      return {
        symbol: symbol.replace('USDT', ''),
        name: cryptoNames[symbol] || symbol.replace('USDT', ''),
        price: sekPrice,
        change24h: parseFloat(ticker.priceChangePercent),
        lastUpdated: new Date().toISOString()
      };
    }).filter(Boolean);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: filteredPrices,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})