alter table public.latest_token_prices
  add column if not exists change_1h numeric,
  add column if not exists change_7d numeric;