-- Remove the public read policy that allows everyone to access AI market intelligence
DROP POLICY IF EXISTS "AI market intel cache readable by everyone" ON public.ai_market_intel_cache;

-- Create a new policy that only allows authenticated users to read the AI market intelligence
CREATE POLICY "AI market intel cache readable by authenticated users only" 
ON public.ai_market_intel_cache 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the service role policy for background operations (no changes needed)
-- The "Service role can manage AI market intel cache" policy remains unchanged