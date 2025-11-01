/**
 * Instruction Levels Service
 * Handles all instruction level CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { retrySupabaseQuery } from '../utils/retry.js';

/**
 * Load all instruction levels from Supabase
 * Returns empty array if Supabase not configured
 */
export async function loadInstructionLevels() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const result = await retrySupabaseQuery(() =>
      supabase
        .from('instruction_levels')
        .select('*')
        .order('order', { ascending: true })
    );

    if (result.error) {
      console.error('Error loading instruction levels from Supabase:', result.error);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error('Error loading instruction levels:', error);
    return [];
  }
}

/**
 * Create a new instruction level
 */
export async function createInstructionLevel(level) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const result = await retrySupabaseQuery(() =>
      supabase
        .from('instruction_levels')
        .insert({
          name: level.name,
          order: level.order,
          description: level.description || null,
          is_default: level.is_default || false,
        })
        .select()
        .single()
    );

    if (result.error) {
      console.error('Error creating instruction level:', result.error);
      return { success: false, error: result.error.message, code: result.error.code, details: result.error.details, hint: result.error.hint };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating instruction level:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing instruction level
 */
export async function updateInstructionLevel(id, updates) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const result = await retrySupabaseQuery(() =>
      supabase
        .from('instruction_levels')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    );

    if (result.error) {
      console.error('Error updating instruction level:', result.error);
      return { success: false, error: result.error.message, code: result.error.code, details: result.error.details, hint: result.error.hint };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating instruction level:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an instruction level
 * Optionally checks if level is used by cards
 */
export async function deleteInstructionLevel(id, checkUsage = true) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check card count if requested
    let cardCount = 0;
    if (checkUsage) {
      const { count, error: countError } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('instruction_level_id', id);

      if (countError && countError.code !== 'PGRST116') {
        console.error('Error checking instruction level usage:', countError);
        return { success: false, error: countError.message };
      }
      cardCount = count || 0;
    }

    const { data, error } = await supabase
      .from('instruction_levels')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting instruction level:', error);
      return { success: false, error: error.message, code: error.code, details: error.details, hint: error.hint };
    }

    return { success: true, data, cardCount };
  } catch (error) {
    console.error('Error deleting instruction level:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cards by instruction level
 */
export async function getCardsByInstructionLevel(instructionLevelId) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('instruction_level_id', instructionLevelId);

    if (error) {
      console.error('Error getting cards by instruction level:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting cards by instruction level:', error);
    return [];
  }
}

