/**
 * useAuth hook
 * Manages authentication state and operations
 */

import { useState, useEffect, useRef } from 'react';
import { getSession, signIn, signOut, isAdmin, onAuthStateChange } from '../utils/auth.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initializationComplete = useRef(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();

    // Subscribe to auth state changes (only if Supabase is configured)
    try {
      const { data: { subscription } } = onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          // User signed in - check admin status
          const currentUser = session?.user || null;
          setUser(currentUser);
          if (currentUser) {
            try {
              const admin = await isAdmin(currentUser.id);
              setIsAdminUser(admin);
            } catch (err) {
              console.error('Error checking admin status:', err);
              setIsAdminUser(false);
            }
          } else {
            setIsAdminUser(false);
          }
          setLoading(false);
          initializationComplete.current = true;
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - update user but don't re-check admin status
          // Admin status doesn't change on token refresh, so avoid unnecessary query
          const currentUser = session?.user || null;
          setUser(currentUser);
          // Only set loading to false if initialization is complete
          // This prevents race condition where TOKEN_REFRESHED fires before initializeAuth completes
          if (initializationComplete.current) {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdminUser(false);
          setLoading(false);
          initializationComplete.current = false;
        }
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (err) {
      // If Supabase not configured, just set loading to false
      console.warn('Auth subscription not available (Supabase may not be configured):', err);
      setLoading(false);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      initializationComplete.current = false;
      const { data, error } = await getSession();
      
      if (error) {
        // Supabase not configured or auth error - continue without auth
        console.warn('Auth session error (may be expected if Supabase not configured):', error.message);
        setUser(null);
        setIsAdminUser(false);
        setLoading(false);
        initializationComplete.current = true;
        return;
      }
      
      if (data?.session?.user) {
        setUser(data.session.user);
        try {
          const admin = await isAdmin(data.session.user.id);
          setIsAdminUser(admin);
        } catch (err) {
          console.warn('Error checking admin status:', err);
          setIsAdminUser(false);
        }
      } else {
        setUser(null);
        setIsAdminUser(false);
      }
    } catch (err) {
      // If Supabase not configured, this is expected - just continue without auth
      console.warn('Auth initialization error (may be expected if Supabase not configured):', err.message);
      setUser(null);
      setIsAdminUser(false);
    } finally {
      setLoading(false);
      initializationComplete.current = true;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        const admin = await isAdmin(data.user.id);
        setIsAdminUser(admin);
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await signOut();
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      setIsAdminUser(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin: isAdminUser,
    loading,
    error,
    login,
    logout
  };
}

