/**
 * Authentication helpers
 * Works with Supabase Auth to manage user sessions and admin roles
 */

import { supabase, isSupabaseConfigured } from '../services/supabase.js';

/**
 * Get current session
 */
export async function getSession() {
  if (!isSupabaseConfigured()) {
    return { data: { session: null }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    console.error('Error getting session:', error);
    return { data: { session: null }, error };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Check if current user is admin
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId = null) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Get current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        return false;
      }
      currentUserId = session.user.id;
    }

    // Check user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUserId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin role - throws error if not admin
 * @param {string} userId - User ID to check
 * @throws {Error} If user is not admin
 */
export async function requireAdmin(userId = null) {
  const admin = await isAdmin(userId);
  if (!admin) {
    throw new Error('Admin access required');
  }
  return true;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) {
    // Return a mock subscription object that doesn't do anything
    return { 
      data: { 
        subscription: {
          unsubscribe: () => {}
        }
      } 
    };
  }

  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return { data: { subscription } };
  } catch (error) {
    console.warn('Error setting up auth subscription:', error);
    return { 
      data: { 
        subscription: {
          unsubscribe: () => {}
        }
      } 
    };
  }
}

