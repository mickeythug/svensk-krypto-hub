-- Create table for limit orders
CREATE TABLE IF NOT EXISTS public.limit_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain text NOT NULL CHECK (chain IN ('SOL','EVM')),
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  limit_price numeric NOT NULL,
  amount numeric NOT NULL,
  user_address text NOT NULL,
  sol_mint text,
  evm_from_token text,
  evm_to_token text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','triggered','filled','canceled','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  triggered_at timestamptz,
  executed_at timestamptz,
  tx_hash text
);

-- Enable RLS and minimal policies
ALTER TABLE public.limit_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can read open orders (for UI lines) and their own address orders; since we don't have auth, allow public select
DROP POLICY IF EXISTS "Limit orders readable by everyone" ON public.limit_orders;
CREATE POLICY "Limit orders readable by everyone"
ON public.limit_orders
FOR SELECT
USING (true);

-- Inserts/updates only via service role (edge functions)
DROP POLICY IF EXISTS "Service role can manage limit orders" ON public.limit_orders;
CREATE POLICY "Service role can manage limit orders"
ON public.limit_orders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_orders_updated_at ON public.limit_orders;
CREATE TRIGGER trg_limit_orders_updated_at
BEFORE UPDATE ON public.limit_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_limit_orders_status ON public.limit_orders(status);
CREATE INDEX IF NOT EXISTS idx_limit_orders_symbol ON public.limit_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_limit_orders_user ON public.limit_orders(user_address);
