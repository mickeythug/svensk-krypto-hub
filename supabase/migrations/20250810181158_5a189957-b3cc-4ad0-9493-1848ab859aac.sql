-- Create order_history table for persistent logging of trades and order events
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  user_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'SOL',
  symbol TEXT,
  base_mint TEXT,
  quote_mint TEXT,
  side TEXT,
  event_type TEXT NOT NULL,
  source TEXT,

  base_amount NUMERIC,
  quote_amount NUMERIC,
  price_quote NUMERIC,
  price_usd NUMERIC,
  fee_quote NUMERIC,
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

-- Trigger for timestamps using existing helper
DROP TRIGGER IF EXISTS trg_order_history_updated_at ON public.order_history;
CREATE TRIGGER trg_order_history_updated_at
BEFORE UPDATE ON public.order_history
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_history_user_time ON public.order_history (user_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_symbol_time ON public.order_history (symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_event_type ON public.order_history (event_type);
