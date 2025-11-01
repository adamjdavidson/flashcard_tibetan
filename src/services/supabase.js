/**
 * Supabase client initialization
 * Singleton pattern to ensure single connection
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. App will use localStorage fallback.');
}

// Create Supabase client singleton
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}

/**
 * Test Supabase connection
 */
export async function testConnection() {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await supabase.from('cards').select('count').limit(1);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

