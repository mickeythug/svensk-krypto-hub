-- Add encrypted private key storage for trading wallets
ALTER TABLE public.trading_wallets
ADD COLUMN IF NOT EXISTS private_key_encrypted bytea;

-- Optional: comment for clarity
COMMENT ON COLUMN public.trading_wallets.private_key_encrypted IS 'AES-GCM encrypted private key (IV||ciphertext), stored as bytea hex';
