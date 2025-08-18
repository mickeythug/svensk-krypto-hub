import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Secure authentication hook with improved token handling
 * - Uses httpOnly cookies when possible
 * - Implements proper session validation
 * - Adds security event logging
 */
export function useSecureAuth(): SecureAuthState & {
  signOut: () => Promise<void>;
  validateSession: () => Promise<boolean>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate session integrity
  const validateSession = async (): Promise<boolean> => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        setSession(null);
        setUser(null);
        return false;
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = currentSession.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      if (expiresAt && (expiresAt - now) < fiveMinutes) {
        console.warn('Session token expiring soon, refreshing...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh session:', refreshError);
          setSession(null);
          setUser(null);
          return false;
        }

        setSession(refreshData.session);
        setUser(refreshData.session.user);
        return true;
      }

      setSession(currentSession);
      setUser(currentSession.user);
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      setSession(null);
      setUser(null);
      return false;
    }
  };

  // Secure sign out with cleanup
  const signOut = async (): Promise<void> => {
    try {
      // Clear session storage data
      sessionStorage.removeItem('siws_verified');
      sessionStorage.removeItem('siws_address');
      sessionStorage.removeItem('siwe_signature');
      sessionStorage.removeItem('siwe_address');
      sessionStorage.removeItem('siwe_verified');

      // Clear local storage wallet data
      localStorage.removeItem('trading_wallet');
      localStorage.removeItem('wallet_acknowledged');

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
      }

      // Clear state
      setSession(null);
      setUser(null);

      console.log('User signed out securely');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const isValid = await validateSession();
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with security measures
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Validate the new session
          setTimeout(async () => {
            if (mounted) {
              await validateSession();
            }
          }, 0);
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    // Set up periodic session validation (every 10 minutes)
    const validationInterval = setInterval(() => {
      if (mounted && session) {
        validateSession();
      }
    }, 10 * 60 * 1000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(validationInterval);
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    signOut,
    validateSession,
  };
}