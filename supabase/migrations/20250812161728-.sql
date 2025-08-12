-- Fix database function security issues
-- Update search_path for all functions and add proper security

-- First, fix the existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.store_encrypted_key(
  p_user_id uuid,
  p_wallet_address text,
  p_private_key_encrypted bytea DEFAULT NULL,
  p_pump_api_key_encrypted bytea DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing keys for this user and wallet
  DELETE FROM private.encrypted_keys 
  WHERE user_id = p_user_id 
  AND wallet_address = p_wallet_address;
  
  -- Insert new encrypted keys (only if provided)
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
$$;

CREATE OR REPLACE FUNCTION public.get_encrypted_key(
  p_user_id uuid,
  p_wallet_address text,
  p_key_type text
)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.delete_user_keys(
  p_user_id uuid,
  p_wallet_address text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_wallet_address IS NOT NULL THEN
    -- Delete keys for specific wallet
    DELETE FROM private.encrypted_keys 
    WHERE user_id = p_user_id 
    AND wallet_address = p_wallet_address;
  ELSE
    -- Delete all keys for user
    DELETE FROM private.encrypted_keys 
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Add session security enhancements
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be called periodically to clean up expired data
  DELETE FROM wallet_verification_proofs WHERE expires_at < now();
  DELETE FROM news_cache WHERE expires_at < now();
  DELETE FROM ai_market_intel_cache WHERE expires_at < now();
END;
$$;

-- Add audit logging table for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage audit logs
CREATE POLICY "Service role can manage audit logs"
ON public.security_audit_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Add function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    success,
    error_message,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_success,
    p_error_message,
    p_metadata
  );
END;
$$;