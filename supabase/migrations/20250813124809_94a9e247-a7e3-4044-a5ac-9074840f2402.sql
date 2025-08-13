-- Fix RLS policies for trading_wallets to allow anonymous access
-- Since we're not using traditional auth, we need to allow public read access

DROP POLICY IF EXISTS "Trading wallets can be viewed publicly" ON public.trading_wallets;
DROP POLICY IF EXISTS "Service role can manage trading wallets" ON public.trading_wallets;

-- Allow public read access to trading_wallets
CREATE POLICY "Allow public read access to trading wallets" 
ON public.trading_wallets 
FOR SELECT 
USING (true);

-- Allow anyone to insert trading wallets (we'll validate in the app layer)
CREATE POLICY "Allow public insert to trading wallets" 
ON public.trading_wallets 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update trading wallets (we'll validate in the app layer)
CREATE POLICY "Allow public update to trading wallets" 
ON public.trading_wallets 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow anyone to delete trading wallets (we'll validate in the app layer) 
CREATE POLICY "Allow public delete to trading wallets" 
ON public.trading_wallets 
FOR DELETE 
USING (true);

-- Ensure service role can still manage everything
CREATE POLICY "Service role can manage trading wallets" 
ON public.trading_wallets 
FOR ALL 
USING ((auth.role() = 'service_role'::text))
WITH CHECK ((auth.role() = 'service_role'::text));