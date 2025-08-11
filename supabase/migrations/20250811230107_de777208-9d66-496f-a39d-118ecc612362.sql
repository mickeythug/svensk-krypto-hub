-- trading_wallets table for PumpPortal integration (per-user wallet metadata)
create extension if not exists pgcrypto;

create table if not exists public.trading_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  wallet_address text not null,
  pump_api_key text not null,
  acknowledged_backup boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- Enable Row Level Security
alter table public.trading_wallets enable row level security;

-- Policies: owner-only access
create policy "Users can view their own trading wallet" on public.trading_wallets
for select using (auth.uid() = user_id);

create policy "Users can insert their own trading wallet" on public.trading_wallets
for insert with check (auth.uid() = user_id);

create policy "Users can update their own trading wallet" on public.trading_wallets
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own trading wallet" on public.trading_wallets
for delete using (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_trading_wallets_user_id on public.trading_wallets(user_id);
