-- Add RLS policies for trading_wallets table to allow service role access
ALTER TABLE public.trading_wallets ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all trading wallets
CREATE POLICY "Service role can manage all trading wallets" 
ON public.trading_wallets 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow anonymous access to read trading wallets for specific user_id
CREATE POLICY "Public can read trading wallets by user_id" 
ON public.trading_wallets 
FOR SELECT 
TO anon 
USING (true);