-- Create order_history table for persistent logging of trades and order events
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  user_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'SOL', -- 'SOL' or 'EVM'
  symbol TEXT,                       -- Optional symbol label (e.g., BONK)
  base_mint TEXT,                    -- SPL/EVM mint/address of base token
  quote_mint TEXT,                   -- SPL/EVM mint/address of quote token
  side TEXT,                         -- 'buy' | 'sell'
  event_type TEXT NOT NULL,          -- 'limit_create' | 'limit_cancel' | 'limit_execute' | 'market_trade'
  source TEXT,                       -- 'JUP' | 'DB' | 'DEX' | 'EVM' | etc

  base_amount NUMERIC,               -- amount of base token (positive numbers)
  quote_amount NUMERIC,              -- amount of quote token spent/received
  price_quote NUMERIC,               -- quote per base
  price_usd NUMERIC,                 -- USD per base at time (best-effort)
  fee_quote NUMERIC,                 -- fees in quote currency if available
  tx_hash TEXT,
  meta JSONB
);

-- Enable RLS and add basic policies
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Anyone can read history (public feed). Adjust later if needed.
DROP POLICY IF EXISTS "Order history readable by everyone" ON public.order_history;
CREATE POLICY "Order history readable by everyone"
ON public.order_history
FOR SELECT
USING (true);

-- Only service role can modify
DROP POLICY IF EXISTS "Order history managed by service role" ON public.order_history;
CREATE POLICY "Order history managed by service role"
ON public.order_history
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Timestamps trigger
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
EXCEPTION WHEN duplicate_function THEN
  NULL;
END $$;

DROP TRIGGER IF EXISTS trg_order_history_updated_at ON public.order_history;
CREATE TRIGGER trg_order_history_updated_at
BEFORE UPDATE ON public.order_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_history_user_time ON public.order_history (user_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_symbol_time ON public.order_history (symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_event_type ON public.order_history (event_type);
