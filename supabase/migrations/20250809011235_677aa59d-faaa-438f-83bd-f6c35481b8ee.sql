-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- Table to store hourly market snapshots (full top-N dataset)
create table if not exists public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_time timestamptz not null default now(),
  source text not null default 'coingecko',
  page_count integer not null default 2,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Helpful index for fast retrieval of latest snapshot
create index if not exists idx_market_snapshots_time_desc on public.market_snapshots (snapshot_time desc);

-- Latest token prices updated frequently (every ~3 minutes)
create table if not exists public.latest_token_prices (
  symbol text primary key,
  name text,
  price numeric,
  change_24h numeric,
  market_cap numeric,
  image text,
  coin_gecko_id text,
  updated_at timestamptz not null default now(),
  data jsonb
);

create index if not exists idx_latest_token_prices_updated_at on public.latest_token_prices (updated_at desc);

-- Enable Row Level Security
alter table public.market_snapshots enable row level security;
alter table public.latest_token_prices enable row level security;

-- Policies: allow public read-only access; writes are only via service role (which bypasses RLS)
drop policy if exists "Market snapshots are viewable by everyone" on public.market_snapshots;
create policy "Market snapshots are viewable by everyone"
  on public.market_snapshots for select
  using (true);



drop policy if exists "Latest prices are viewable by everyone" on public.latest_token_prices;
create policy "Latest prices are viewable by everyone"
  on public.latest_token_prices for select
  using (true);

-- Optional: trigger to keep updated_at current on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger latest_token_prices_set_updated_at
before update on public.latest_token_prices
for each row execute function public.set_updated_at();