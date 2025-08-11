-- Fix security vulnerability: Restrict order_history access to authenticated users only
-- Remove the public readable policy that exposes all user trading data
DROP POLICY IF EXISTS "Order history readable by everyone" ON public.order_history;

-- Add secure policy that only allows authenticated users to view their own trading history
-- This requires proper wallet authentication to be implemented
CREATE POLICY "Users can only view their own order history" 
ON public.order_history 
FOR SELECT 
TO authenticated
USING (
  -- Only allow access if the user can prove ownership of the wallet address
  -- This will require implementing proper wallet authentication
  user_address = COALESCE(
    auth.jwt() ->> 'wallet_address',
    auth.jwt() ->> 'user_address', 
    (auth.jwt() -> 'user_metadata' ->> 'wallet_address')
  )
);

-- Add policy for service role to continue managing order history
-- Keep the existing service role policy as is for backend operations