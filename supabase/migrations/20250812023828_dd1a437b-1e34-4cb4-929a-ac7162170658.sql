-- Centralized cache for Meme Zone tokens
BEGIN;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.meme_tokens_cache (
  category TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS
ALTER TABLE public.meme_tokens_cache ENABLE ROW LEVEL SECURITY;

-- Allow public (anon/authenticated) reads; writes are only via service role (which bypasses RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'meme_tokens_cache' AND policyname = 'Public can read meme cache'
  ) THEN
    CREATE POLICY "Public can read meme cache"
    ON public.meme_tokens_cache
    FOR SELECT
    USING (true);
  END IF;
END$$;

-- Optional grants (RLS still applies)
GRANT SELECT ON public.meme_tokens_cache TO anon, authenticated;

-- 3) updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_meme_tokens_cache_updated_at'
  ) THEN
    CREATE TRIGGER set_meme_tokens_cache_updated_at
    BEFORE UPDATE ON public.meme_tokens_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

COMMIT;