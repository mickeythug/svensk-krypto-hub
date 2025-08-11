-- Fix RLS policy security issue - create proper secure wallet authentication
-- Remove the problematic policy that references user metadata
DROP POLICY IF EXISTS "Users can only view their own order history" ON public.order_history;

-- Create a profiles table to securely store wallet addresses linked to authenticated users
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address text NOT NULL,
  chain text NOT NULL CHECK (chain IN ('SOL', 'EVM')),
  verified_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, wallet_address, chain)
);

-- Enable RLS on user_wallets table
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own wallet addresses
CREATE POLICY "Users can manage their own wallets" 
ON public.user_wallets 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure function to check wallet ownership
CREATE OR REPLACE FUNCTION public.user_owns_wallet(wallet_addr text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_wallets 
    WHERE user_id = auth.uid() 
    AND wallet_address = wallet_addr
  );
$$;

-- Create secure RLS policy for order history using the function
CREATE POLICY "Users can view their verified wallet order history" 
ON public.order_history 
FOR SELECT 
TO authenticated
USING (public.user_owns_wallet(user_address));

-- Allow public read access only for service operations (temporary fallback)
-- This should be removed once wallet verification is fully implemented
CREATE POLICY "Service operations require authentication" 
ON public.order_history 
FOR SELECT 
TO anon
USING (false); -- Deny all anonymous access