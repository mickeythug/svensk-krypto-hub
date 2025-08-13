-- Fix trading_wallets authentication issue by making it truly public
-- First drop existing policies
DROP POLICY IF EXISTS "Allow public read access to trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Allow public insert to trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Allow public update to trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Allow public delete to trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Service role can manage trading wallets" ON public.trading_wallets;

-- Disable RLS temporarily to ensure public access
ALTER TABLE public.trading_wallets DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper public policies
ALTER TABLE public.trading_wallets ENABLE ROW LEVEL SECURITY;

-- Create new policies that truly allow public access
CREATE POLICY "Public can read trading wallets" 
ON public.trading_wallets 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert trading wallets" 
ON public.trading_wallets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update trading wallets" 
ON public.trading_wallets 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access" 
ON public.trading_wallets 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);