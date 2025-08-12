-- Step 1: Create a secure key vault table that's only accessible by service role
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

-- Create the private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Move existing data to secure vault (if any exists)
INSERT INTO private.secure_key_vault (user_id, wallet_address, private_key_encrypted, pump_api_key_encrypted)
SELECT user_id, wallet_address, private_key_encrypted, pump_api_key_encrypted 
FROM public.trading_wallets 
WHERE private_key_encrypted IS NOT NULL OR pump_api_key_encrypted IS NOT NULL
ON CONFLICT (user_id, wallet_address) DO NOTHING;

-- Remove sensitive columns from public table
ALTER TABLE public.trading_wallets 
DROP COLUMN IF EXISTS private_key_encrypted,
DROP COLUMN IF EXISTS pump_api_key_encrypted;

-- Create secure key management functions (service role only)
CREATE OR REPLACE FUNCTION private.store_encrypted_key(
    p_user_id UUID,
    p_wallet_address TEXT,
    p_private_key_encrypted BYTEA DEFAULT NULL,
    p_pump_api_key_encrypted BYTEA DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
BEGIN
    INSERT INTO private.secure_key_vault (user_id, wallet_address, private_key_encrypted, pump_api_key_encrypted)
    VALUES (p_user_id, p_wallet_address, p_private_key_encrypted, p_pump_api_key_encrypted)
    ON CONFLICT (user_id, wallet_address) 
    DO UPDATE SET 
        private_key_encrypted = COALESCE(EXCLUDED.private_key_encrypted, secure_key_vault.private_key_encrypted),
        pump_api_key_encrypted = COALESCE(EXCLUDED.pump_api_key_encrypted, secure_key_vault.pump_api_key_encrypted),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION private.get_encrypted_key(
    p_user_id UUID,
    p_wallet_address TEXT,
    p_key_type TEXT -- 'private_key' or 'pump_api_key'
)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
DECLARE
    result BYTEA;
BEGIN
    IF p_key_type = 'private_key' THEN
        SELECT private_key_encrypted INTO result
        FROM private.secure_key_vault
        WHERE user_id = p_user_id AND wallet_address = p_wallet_address;
    ELSIF p_key_type = 'pump_api_key' THEN
        SELECT pump_api_key_encrypted INTO result
        FROM private.secure_key_vault
        WHERE user_id = p_user_id AND wallet_address = p_wallet_address;
    END IF;
    
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION private.delete_user_keys(
    p_user_id UUID,
    p_wallet_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
BEGIN
    IF p_wallet_address IS NULL THEN
        DELETE FROM private.secure_key_vault WHERE user_id = p_user_id;
    ELSE
        DELETE FROM private.secure_key_vault WHERE user_id = p_user_id AND wallet_address = p_wallet_address;
    END IF;
    
    RETURN TRUE;
END;
$$;