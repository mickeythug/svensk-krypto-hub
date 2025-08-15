import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  amount: number;
  price: number;
  userAddress: string;
  chain: string;
  estimatedTotal: number;
  estimatedFee: number;
  netTotal: number;
  feeBreakdown: {
    tradingFee: number;
    networkFee: number;
    totalFeeUsd: number;
    totalFeePercent: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      symbol, 
      side, 
      orderType, 
      amount, 
      price, 
      userAddress, 
      chain, 
      estimatedTotal, 
      estimatedFee, 
      netTotal, 
      feeBreakdown 
    }: TradeRequest = await req.json();

    console.log('Execute trade request:', {
      symbol,
      side,
      orderType,
      amount,
      price,
      userAddress,
      estimatedTotal,
      estimatedFee
    });

    // Validate required fields
    if (!symbol || !side || !orderType || !amount || !userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate minimum order value ($1)
    if (estimatedTotal < 1) {
      return new Response(
        JSON.stringify({ error: 'Minimum order value is $1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For market orders, execute immediately
    if (orderType === 'market') {
      // Log the trade execution to order history
      const { data: orderHistory, error: historyError } = await supabase
        .from('order_history')
        .insert({
          user_address: userAddress,
          chain: chain || 'SOL',
          symbol,
          side,
          event_type: 'market_order',
          base_amount: amount,
          quote_amount: estimatedTotal,
          price_quote: price,
          price_usd: price,
          fee_quote: feeBreakdown.tradingFee,
          source: 'hyperliquid_ui',
          meta: {
            orderType,
            estimatedFee,
            netTotal,
            feeBreakdown,
            executedAt: new Date().toISOString()
          }
        });

      if (historyError) {
        console.error('Error logging order history:', historyError);
        return new Response(
          JSON.stringify({ error: 'Failed to log order history' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: orderHistory?.[0]?.id,
          message: `${side.toUpperCase()} market order executed`,
          executedPrice: price,
          executedAmount: amount,
          totalCost: netTotal,
          fees: estimatedFee,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For limit/stop orders, create limit order
    if (orderType === 'limit' || orderType === 'stop') {
      const { data: limitOrder, error: limitError } = await supabase
        .from('limit_orders')
        .insert({
          user_address: userAddress,
          chain: chain || 'SOL',
          symbol,
          side,
          amount,
          limit_price: price,
          status: 'open'
        })
        .select()
        .single();

      if (limitError) {
        console.error('Error creating limit order:', limitError);
        return new Response(
          JSON.stringify({ error: 'Failed to create limit order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: limitOrder.id,
          message: `${side.toUpperCase()} ${orderType} order created`,
          orderPrice: price,
          orderAmount: amount,
          status: 'open',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid order type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing trade:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});