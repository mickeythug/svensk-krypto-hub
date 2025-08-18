-- Fix critical RLS policies for trading_wallets table
DROP POLICY IF EXISTS "Service role can manage all trading wallets" ON public.trading_wallets;
DROP POLICY IF EXISTS "Public can read trading wallets by user_id" ON public.trading_wallets;

-- Create secure RLS policies for trading_wallets
CREATE POLICY "Service role can manage all trading wallets" 
ON public.trading_wallets 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Users can view their own trading wallets" 
ON public.trading_wallets 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own trading wallets" 
ON public.trading_wallets 
FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Fix critical RLS policies for helius_account_data table
DROP POLICY IF EXISTS "Allow public read access" ON public.helius_account_data;
DROP POLICY IF EXISTS "Allow authenticated insert/update" ON public.helius_account_data;

-- Create secure RLS policies for helius_account_data
CREATE POLICY "Service role can manage helius data" 
ON public.helius_account_data 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Authenticated users can view helius data" 
ON public.helius_account_data 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Add user_id column to helius_account_data for better access control
ALTER TABLE public.helius_account_data 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_helius_account_data_user_id 
ON public.helius_account_data(user_id);

-- Strengthen order_history RLS policies
DROP POLICY IF EXISTS "Service operations require authentication" ON public.order_history;

CREATE POLICY "Authenticated users can view order history with valid wallet" 
ON public.order_history 
FOR SELECT 
USING (auth.role() = 'authenticated'::text AND user_owns_wallet(user_address));

-- Add better indexing for security functions
CREATE INDEX IF NOT EXISTS idx_user_wallets_lookup 
ON public.user_wallets(user_id, wallet_address);

-- Add audit logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log wallet creation/deletion
  IF TG_TABLE_NAME = 'user_wallets' THEN
    PERFORM public.log_security_event(
      TG_OP || '_WALLET',
      'user_wallets',
      true,
      NULL,
      jsonb_build_object(
        'wallet_address', COALESCE(NEW.wallet_address, OLD.wallet_address),
        'chain', COALESCE(NEW.chain, OLD.chain)
      )
    );
  END IF;
  
  -- Log trading wallet operations
  IF TG_TABLE_NAME = 'trading_wallets' THEN
    PERFORM public.log_security_event(
      TG_OP || '_TRADING_WALLET',
      'trading_wallets',
      true,
      NULL,
      jsonb_build_object(
        'wallet_address', COALESCE(NEW.wallet_address, OLD.wallet_address)
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;