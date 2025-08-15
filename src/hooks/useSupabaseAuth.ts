import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authLog } from '@/lib/authDebug';
import { useWalletAuthStatus } from './useWalletAuthStatus';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { fullyAuthed, solAddress, evmAddress } = useWalletAuthStatus();

  // Initialize Supabase auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        authLog('Supabase auth state change', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          authLog('Error getting session', error, 'error');
        } else {
          authLog('Initial session check', { hasSession: !!session, hasUser: !!session?.user });
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        authLog('Failed to initialize auth', error, 'error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Create anonymous session for wallet users
  const createWalletSession = useCallback(async (walletAddress: string, chain: 'SOL' | 'EVM') => {
    try {
      authLog('Creating wallet session', { walletAddress, chain });
      
      // Create a unique email for the wallet
      const uniqueId = `${walletAddress.toLowerCase()}-${chain.toLowerCase()}`;
      const email = `${uniqueId}@wallet.local`;
      const password = `wallet_${walletAddress}_${chain}_${Date.now()}`;

      // Try to sign in first (user might already exist)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInData?.user) {
        authLog('Wallet user signed in', { userId: signInData.user.id });
        return { success: true, user: signInData.user };
      }

      // If sign in fails, create new user
      if (signInError) {
        authLog('Sign in failed, creating new user', { error: signInError });
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              wallet_address: walletAddress,
              wallet_chain: chain,
              created_via: 'wallet'
            }
          }
        });

        if (signUpError) {
          authLog('Failed to create wallet user', signUpError, 'error');
          return { success: false, error: signUpError };
        }

        authLog('Wallet user created', { userId: signUpData.user?.id });
        return { success: true, user: signUpData.user };
      }

      return { success: false, error: signInError };
    } catch (error) {
      authLog('Error creating wallet session', error, 'error');
      return { success: false, error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      authLog('Signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      if (error) {
        authLog('Sign out error', error, 'error');
        return { success: false, error };
      }
      return { success: true };
    } catch (error) {
      authLog('Sign out failed', error, 'error');
      return { success: false, error };
    }
  }, []);

  // Auto-create session when wallet is authenticated
  useEffect(() => {
    if (fullyAuthed && !user && !loading) {
      const walletAddress = solAddress || evmAddress;
      const chain = solAddress ? 'SOL' : 'EVM';
      
      if (walletAddress) {
        authLog('Wallet authenticated, creating Supabase session', { walletAddress, chain });
        createWalletSession(walletAddress, chain);
      }
    }
  }, [fullyAuthed, solAddress, evmAddress, user, loading, createWalletSession]);

  const isAuthenticated = !!user && !!session;

  return {
    user,
    session,
    loading,
    isAuthenticated,
    createWalletSession,
    signOut
  };
}