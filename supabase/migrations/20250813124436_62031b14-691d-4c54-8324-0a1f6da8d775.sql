-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own trading wallet" ON public.trading_wallets;
DROP POLICY IF EXISTS "Users can insert their own trading wallet" ON public.trading_wallets;
DROP POLICY IF EXISTS "Users can update their own trading wallet" ON public.trading_wallets;
DROP POLICY IF EXISTS "Users can delete their own trading wallet" ON public.trading_wallets;

-- Drop existing constraint
ALTER TABLE public.trading_wallets DROP CONSTRAINT IF EXISTS trading_wallets_user_id_unique;

-- Change user_id column to text to store Solana addresses
ALTER TABLE public.trading_wallets ALTER COLUMN user_id TYPE text;

-- Re-add unique constraint
ALTER TABLE public.trading_wallets ADD CONSTRAINT trading_wallets_user_id_unique UNIQUE (user_id);

-- Create new policies based on Solana address verification
CREATE POLICY "Trading wallets can be viewed publicly" 
ON public.trading_wallets 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage trading wallets" 
ON public.trading_wallets 
FOR ALL 
USING ((auth.role() = 'service_role'::text))
WITH CHECK ((auth.role() = 'service_role'::text));

-- Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Create encrypted_keys table in private schema
CREATE TABLE IF NOT EXISTS private.encrypted_keys (
    user_id text NOT NULL,
    wallet_address text NOT NULL,
    private_key_encrypted bytea,
    pump_api_key_encrypted bytea,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, wallet_address)
);

-- Enable RLS on private.encrypted_keys
ALTER TABLE private.encrypted_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access encrypted keys
CREATE POLICY "Service role only access to encrypted keys" 
ON private.encrypted_keys 
FOR ALL 
USING ((auth.role() = 'service_role'::text))
WITH CHECK ((auth.role() = 'service_role'::text));

-- Update functions to work with text user_id
DROP FUNCTION IF EXISTS public.store_encrypted_key(uuid, text, bytea, bytea);
DROP FUNCTION IF EXISTS public.get_encrypted_key(uuid, text, text);
DROP FUNCTION IF EXISTS public.delete_user_keys(uuid, text);

CREATE OR REPLACE FUNCTION public.store_encrypted_key(p_user_id text, p_wallet_address text, p_private_key_encrypted bytea DEFAULT NULL::bytea, p_pump_api_key_encrypted bytea DEFAULT NULL::bytea)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM private.encrypted_keys 
  WHERE user_id = p_user_id 
  AND wallet_address = p_wallet_address;
  
  IF p_private_key_encrypted IS NOT NULL OR p_pump_api_key_encrypted IS NOT NULL THEN
    INSERT INTO private.encrypted_keys (
      user_id, 
      wallet_address, 
      private_key_encrypted, 
      pump_api_key_encrypted
    ) VALUES (
      p_user_id, 
      p_wallet_address, 
      p_private_key_encrypted, 
      p_pump_api_key_encrypted
    );
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_encrypted_key(p_user_id text, p_wallet_address text, p_key_type text)
 RETURNS bytea
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result bytea;
BEGIN
  IF p_key_type = 'private_key' THEN
    SELECT private_key_encrypted INTO result
    FROM private.encrypted_keys
    WHERE user_id = p_user_id AND wallet_address = p_wallet_address;
  ELSIF p_key_type = 'pump_api_key' THEN
    SELECT pump_api_key_encrypted INTO result
    FROM private.encrypted_keys
    WHERE user_id = p_user_id AND wallet_address = p_wallet_address;
  END IF;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_keys(p_user_id text, p_wallet_address text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_wallet_address IS NOT NULL THEN
    DELETE FROM private.encrypted_keys 
    WHERE user_id = p_user_id 
    AND wallet_address = p_wallet_address;
  ELSE
    DELETE FROM private.encrypted_keys 
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;