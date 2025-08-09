-- Create AI market intel centralized cache table
create table if not exists public.ai_market_intel_cache (
  key text primary key,
  data jsonb not null,
  source text not null default 'openai-o3',
  version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Index to quickly find expiring/expired entries
create index if not exists idx_ai_market_intel_cache_expires_at
  on public.ai_market_intel_cache (expires_at);

-- Trigger to auto-update updated_at on updates
create trigger set_timestamp_ai_market_intel_cache
before update on public.ai_market_intel_cache
for each row execute procedure public.set_updated_at();

-- Enable RLS
alter table public.ai_market_intel_cache enable row level security;

-- Policies: public can read, only service role can write
create policy if not exists "AI market intel cache readable by everyone"
  on public.ai_market_intel_cache
  for select
  using (true);

create policy if not exists "Service role can manage AI market intel cache"
  on public.ai_market_intel_cache
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');