-- Additional security hardening for user_wallets table
-- Replace the broad ALL policy with specific granular policies

-- 1. Add a more restrictive SELECT policy
CREATE POLICY "Users can only view their own wallets" 
ON public.user_wallets 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Add a specific INSERT policy to ensure user_id is always set correctly
CREATE POLICY "Users can only create wallets for themselves" 
ON public.user_wallets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Add an UPDATE policy that prevents changing ownership
CREATE POLICY "Users can only update their own wallet details" 
ON public.user_wallets 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Add a DELETE policy
CREATE POLICY "Users can only delete their own wallets" 
ON public.user_wallets 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Remove the overly broad ALL policy and replace with specific ones
DROP POLICY "Users can manage their own wallets" ON public.user_wallets;