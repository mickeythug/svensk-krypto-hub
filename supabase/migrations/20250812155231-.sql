-- Step 1: Create the private schema first
CREATE SCHEMA IF NOT EXISTS private;

-- Step 2: Create a secure key vault table that's only accessible by service role
CREATE TABLE IF NOT EXISTS private.secure_key_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    wallet_address TEXT NOT NULL,
    private_key_encrypted BYTEA,
    pump_api_key_encrypted BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_address)
);

-- Step 3: Move existing data to secure vault (if any exists)
INSERT INTO private.secure_key_vault (user_id, wallet_address, private_key_encrypted, pump_api_key_encrypted)
SELECT user_id, wallet_address, private_key_encrypted, pump_api_key_encrypted 
FROM public.trading_wallets 
WHERE private_key_encrypted IS NOT NULL OR pump_api_key_encrypted IS NOT NULL
ON CONFLICT (user_id, wallet_address) DO NOTHING;

-- Step 4: Remove sensitive columns from public table
ALTER TABLE public.trading_wallets 
DROP COLUMN IF EXISTS private_key_encrypted,
DROP COLUMN IF EXISTS pump_api_key_encrypted;