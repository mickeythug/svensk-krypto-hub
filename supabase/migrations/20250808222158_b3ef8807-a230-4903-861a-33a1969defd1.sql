-- Create a cache table for aggregated crypto news
CREATE TABLE IF NOT EXISTS public.news_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- Allow only service role (Edge Functions) to read/write cache
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'news_cache' AND policyname = 'service role can manage cache'
  ) THEN
    CREATE POLICY "service role can manage cache"
    ON public.news_cache
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Helpful index for cache expiry lookups
CREATE INDEX IF NOT EXISTS idx_news_cache_expires_at ON public.news_cache (expires_at);
