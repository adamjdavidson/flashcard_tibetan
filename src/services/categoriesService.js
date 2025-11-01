/**
 * Categories Service
 * Handles all category CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { retrySupabaseQuery } from '../utils/retry.js';

/**
 * Load all categories from Supabase
 * Returns empty array if Supabase not configured
 */
export async function loadCategories() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const result = await retrySupabaseQuery(() =>
      supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
    );

    if (result.error) {
      console.error('Error loading categories from Supabase:', result.error);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

/**
 * Create a new category
 */
export async function createCategory(category) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const result = await retrySupabaseQuery(() =>
      supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description || null,
          created_by: category.created_by || null,
        })
        .select()
        .single()
    );

    if (result.error) {
      console.error('Error creating category:', result.error);
      return { success: false, error: result.error.message, code: result.error.code, details: result.error.details, hint: result.error.hint };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id, updates) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const result = await retrySupabaseQuery(() =>
      supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    );

    if (result.error) {
      console.error('Error updating category:', result.error);
      return { success: false, error: result.error.message, code: result.error.code, details: result.error.details, hint: result.error.hint };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a category
 * Optionally checks if category is used by cards
 */
export async function deleteCategory(id, checkUsage = true) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check card count if requested
    let cardCount = 0;
    if (checkUsage) {
      const { count, error: countError } = await supabase
        .from('card_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError && countError.code !== 'PGRST116') {
        console.error('Error checking category usage:', countError);
        return { success: false, error: countError.message };
      }
      cardCount = count || 0;
    }

    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message, code: error.code, details: error.details, hint: error.hint };
    }

    return { success: true, data, cardCount };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cards in a category
 */
export async function getCardsInCategory(categoryId) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        card_categories!inner(category_id),
        categories!inner(name)
      `)
      .eq('card_categories.category_id', categoryId);

    if (error) {
      console.error('Error getting cards in category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting cards in category:', error);
    return [];
  }
}

