-- Create centralized meme tokens cache table and policies (idempotent)
CREATE TABLE IF NOT EXISTS public.meme_tokens_cache (
  category TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meme_tokens_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Meme cache readable by everyone'
      AND tablename = 'meme_tokens_cache'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Meme cache readable by everyone"
    ON public.meme_tokens_cache
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Service role can manage meme cache'
      AND tablename = 'meme_tokens_cache'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Service role can manage meme cache"
    ON public.meme_tokens_cache
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_meme_tokens_cache_updated_at'
  ) THEN
    CREATE TRIGGER set_meme_tokens_cache_updated_at
    BEFORE UPDATE ON public.meme_tokens_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meme_tokens_cache_updated_at ON public.meme_tokens_cache (updated_at DESC);