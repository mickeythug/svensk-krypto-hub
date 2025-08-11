-- Fix security vulnerability: Restrict AI market intel cache access to authenticated users only

-- Drop the current public read policy that allows anyone to access trading intelligence
DROP POLICY IF EXISTS "AI market intel cache readable by everyone" ON public.ai_market_intel_cache;

-- Create new policy that only allows authenticated users to read market intel
CREATE POLICY "Authenticated users can read AI market intel cache" 
ON public.ai_market_intel_cache 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Create policy to allow users to only see recent data (last 24 hours)
-- This further limits exposure while maintaining functionality
CREATE POLICY "Users can only access recent AI market intel" 
ON public.ai_market_intel_cache 
FOR SELECT 
TO authenticated
USING (expires_at > now() - interval '24 hours');

-- Drop the broader policy and keep only the time-restricted one
DROP POLICY IF EXISTS "Authenticated users can read AI market intel cache" ON public.ai_market_intel_cache;