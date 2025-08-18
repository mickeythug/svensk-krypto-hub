-- Fix function search_path security warnings
ALTER FUNCTION public.audit_sensitive_operations() 
SET search_path = 'public';

ALTER FUNCTION public.get_encrypted_key(text, text, text) 
SET search_path = 'public';

ALTER FUNCTION public.store_encrypted_key(text, text, bytea, bytea) 
SET search_path = 'public';

-- Create triggers for audit logging on sensitive tables
CREATE TRIGGER audit_user_wallets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

CREATE TRIGGER audit_trading_wallets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.trading_wallets
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();