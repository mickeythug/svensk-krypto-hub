-- Completely disable RLS on trading_wallets table to make it truly public
ALTER TABLE public.trading_wallets DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we're disabling RLS
DROP POLICY IF EXISTS "Public can read trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Public can insert trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Public can update trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Service role full access" ON public.trading_wallets;

-- Verify the table is accessible without authentication
COMMENT ON TABLE public.trading_wallets IS 'Public table for trading wallet management - no authentication required';