-- Fix security vulnerability: Restrict limit_orders access to wallet owners only

-- Drop the existing policy that allows everyone to read limit orders
DROP POLICY IF EXISTS "Limit orders readable by everyone" ON public.limit_orders;

-- Add secure policies that only allow users to access their own verified wallet orders
CREATE POLICY "Users can view their own limit orders" 
ON public.limit_orders 
FOR SELECT 
TO authenticated
USING (user_owns_wallet(user_address));

CREATE POLICY "Users can create limit orders for their wallets" 
ON public.limit_orders 
FOR INSERT 
TO authenticated
WITH CHECK (user_owns_wallet(user_address));

CREATE POLICY "Users can update their own limit orders" 
ON public.limit_orders 
FOR UPDATE 
TO authenticated
USING (user_owns_wallet(user_address))
WITH CHECK (user_owns_wallet(user_address));

CREATE POLICY "Users can delete their own limit orders" 
ON public.limit_orders 
FOR DELETE 
TO authenticated
USING (user_owns_wallet(user_address));

-- Block all anonymous access to limit orders
CREATE POLICY "Block anonymous access to limit orders" 
ON public.limit_orders 
FOR ALL 
TO anon
USING (false);