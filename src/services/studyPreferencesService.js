/**
 * Study Preferences Service
 * Handles user study direction preferences (Tibetan-first vs English-first)
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Load study preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, preferredDirection?: string, error?: string}>}
 */
export async function loadStudyPreferences(userId) {
  if (!isSupabaseConfigured() || !userId) {
    // Default to Tibetan-to-English if not configured
    return { success: true, preferredDirection: 'tibetan_to_english' };
  }

  try {
    const { data, error } = await supabase
      .from('user_study_preferences')
      .select('preferred_direction')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading study preferences:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // No preferences found - return default
      return { success: true, preferredDirection: 'tibetan_to_english' };
    }

    return { success: true, preferredDirection: data.preferred_direction };
  } catch (error) {
    console.error('Error loading study preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save study preferences for a user
 * @param {string} userId - User ID
 * @param {string} direction - 'tibetan_to_english' | 'english_to_tibetan'
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveStudyPreferences(userId, direction) {
  if (!isSupabaseConfigured() || !userId) {
    // Silently fail if not configured (localStorage fallback could be added later)
    return { success: false, error: 'Supabase not configured' };
  }

  if (!['tibetan_to_english', 'english_to_tibetan'].includes(direction)) {
    return { success: false, error: 'Invalid direction. Must be tibetan_to_english or english_to_tibetan' };
  }

  try {
    const { error } = await supabase
      .from('user_study_preferences')
      .upsert({
        user_id: userId,
        preferred_direction: direction,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving study preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving study preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get default study direction
 * @returns {string} Default direction ('tibetan_to_english')
 */
export function getDefaultDirection() {
  return 'tibetan_to_english';
}

