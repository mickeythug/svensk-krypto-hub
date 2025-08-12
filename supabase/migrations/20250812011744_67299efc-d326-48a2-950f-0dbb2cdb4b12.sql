-- Secure trading API keys at rest and prevent exposure via public SELECTs
-- 1) Add encrypted column and relax NOT NULL on plaintext column for gradual migration
ALTER TABLE public.trading_wallets
  ADD COLUMN IF NOT EXISTS pump_api_key_encrypted bytea;

ALTER TABLE public.trading_wallets
  ALTER COLUMN pump_api_key DROP NOT NULL;

-- 2) Lock down column access: prevent anon/authenticated from selecting sensitive columns
REVOKE SELECT(pump_api_key) ON public.trading_wallets FROM anon, authenticated;
REVOKE SELECT(pump_api_key_encrypted) ON public.trading_wallets FROM anon, authenticated;

-- Also ensure table-level SELECT doesn't override column restrictions
REVOKE SELECT ON public.trading_wallets FROM anon, authenticated;

-- Re-grant safe column-level SELECTs needed by the app (wallet_address + acknowledged_backup)
GRANT SELECT(wallet_address, acknowledged_backup) ON public.trading_wallets TO authenticated;
GRANT SELECT(wallet_address, acknowledged_backup) ON public.trading_wallets TO anon;

-- Service role retains full access implicitly; no change needed

-- Note: Edge functions will be updated to:
--  - Encrypt on write (pump-create-wallet)
--  - Decrypt on read using service role (pump-trade)
--  - Migrate existing rows lazily: if plaintext present but encrypted missing, encrypt and NULL the plaintext
