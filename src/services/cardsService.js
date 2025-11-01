/**
 * Cards Service
 * Handles all card CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { retrySupabaseQuery } from '../utils/retry.js';

/**
 * Load all cards from Supabase
 * Falls back to localStorage if Supabase not configured
 * RLS policies automatically filter: users see master + own cards, admins see all
 */
export async function loadCards(fallbackLoad, currentUserId = null, isAdmin = false) {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    return fallbackLoad ? fallbackLoad() : [];
  }

  try {
    // RLS policies handle filtering, but we select all columns including user_id and is_master
    // JOIN with instruction_levels and card_categories/categories for classification data
    const result = await retrySupabaseQuery(() =>
      supabase
        .from('cards')
        .select(`
          *,
          instruction_levels(id, name, order),
          card_categories(
            categories(id, name)
          )
        `)
        .order('created_at', { ascending: false })
    );

    if (result.error) {
      console.error('Error loading cards from Supabase:', result.error);
      return fallbackLoad ? fallbackLoad() : [];
    }
    
    const data = result.data;

    // Transform database format to app format
    const transformed = (data || []).map(transformCardFromDB);
    
    // Additional client-side filtering for safety (RLS should handle this, but double-check)
    if (!isAdmin && currentUserId) {
      return transformed.filter(card => 
        card.isMaster || card.userId === currentUserId
      );
    }
    
    return transformed;
  } catch (error) {
    console.error('Error loading cards:', error);
    return fallbackLoad ? fallbackLoad() : [];
  }
}

/**
 * Save a single card to Supabase
 */
export async function saveCard(card, fallbackSave) {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    if (fallbackSave) {
      fallbackSave([card]);
    }
    return { success: true, data: card };
  }

  try {
    const { cardData, categoryIds } = transformCardToDB(card);
    
    // First, upsert the card
    const { data: cardResult, error: cardError } = await supabase
      .from('cards')
      .upsert(cardData, { onConflict: 'id' })
      .select()
      .single();

    if (cardError) {
      console.error('Error saving card:', cardError);
      return { success: false, error: cardError.message };
    }

    // Then, handle category associations if categoryIds provided
    if (categoryIds && categoryIds.length > 0 && cardResult.id) {
      // Delete existing associations
      await supabase
        .from('card_categories')
        .delete()
        .eq('card_id', cardResult.id);

      // Insert new associations
      const associations = categoryIds.map(categoryId => ({
        card_id: cardResult.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('card_categories')
        .insert(associations);

      if (categoryError) {
        console.error('Error saving card categories:', categoryError);
        // Card is saved, but categories failed - return partial success
      }
    } else if (categoryIds && categoryIds.length === 0 && cardResult.id) {
      // If empty array provided, delete all associations
      await supabase
        .from('card_categories')
        .delete()
        .eq('card_id', cardResult.id);
    }

    // Reload card with classification data
    const { data: fullCard, error: reloadError } = await supabase
      .from('cards')
      .select(`
        *,
        instruction_levels(id, name, order),
        card_categories(
          categories(id, name)
        )
      `)
      .eq('id', cardResult.id)
      .single();

    if (reloadError) {
      console.error('Error reloading card:', reloadError);
      return { success: true, data: transformCardFromDB(cardResult) };
    }

    return { success: true, data: transformCardFromDB(fullCard) };
  } catch (error) {
    console.error('Error saving card:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save multiple cards to Supabase (batch operation)
 */
export async function saveCards(cards, fallbackSave) {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    if (fallbackSave) {
      fallbackSave(cards);
    }
    return { success: true, data: cards };
  }

  try {
    // Transform cards and extract category associations
    const cardsData = cards.map(card => transformCardToDB(card));
    const cardsToUpsert = cardsData.map(item => item.cardData);
    
    const { data, error } = await supabase
      .from('cards')
      .upsert(cardsToUpsert, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error saving cards:', error);
      return { success: false, error: error.message };
    }

    // Handle category associations for each card
    // Note: This is a simplified batch operation - for full category support,
    // you'd need to handle each card's categories individually
    // For now, we'll just return the cards without full category reload
    const transformed = data.map(transformCardFromDB);
    
    return { success: true, data: transformed };
  } catch (error) {
    console.error('Error saving cards:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a card from Supabase
 */
export async function deleteCard(cardId, fallbackDelete) {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    if (fallbackDelete) {
      fallbackDelete(cardId);
    }
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('Error deleting card:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time changes in cards table
 */
export function subscribeToCards(callback) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const subscription = supabase
    .channel('cards-changes')
    .on('postgres_changes', {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'cards'
    }, (payload) => {
      if (payload.new) {
        callback({ type: payload.eventType, data: transformCardFromDB(payload.new) });
      } else if (payload.old) {
        callback({ type: payload.eventType, data: { id: payload.old.id } });
      }
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Transform card from database format to app format
 */
function transformCardFromDB(dbCard) {
  return {
    id: dbCard.id,
    type: dbCard.type,
    front: dbCard.front,
    backArabic: dbCard.back_arabic || null,
    backEnglish: dbCard.back_english || '',
    backTibetanScript: dbCard.back_tibetan_script || null,
    backTibetanNumeral: dbCard.back_tibetan_numeral || null,
    backTibetanSpelling: dbCard.back_tibetan_spelling || '',
    tags: dbCard.tags || [],
    subcategory: dbCard.subcategory || null,
    notes: dbCard.notes || null,
    imageUrl: dbCard.image_url || null,
    createdAt: dbCard.created_at ? new Date(dbCard.created_at).getTime() : Date.now(),
    userId: dbCard.user_id || null,
    isMaster: dbCard.is_master || false,
    // Classification data
    instructionLevelId: dbCard.instruction_level_id || null,
    instructionLevel: dbCard.instruction_levels ? {
      id: dbCard.instruction_levels.id,
      name: dbCard.instruction_levels.name,
      order: dbCard.instruction_levels.order
    } : null,
    categories: dbCard.card_categories && Array.isArray(dbCard.card_categories)
      ? dbCard.card_categories.map(cc => cc.categories ? {
          id: cc.categories.id,
          name: cc.categories.name
        } : null).filter(Boolean)
      : []
  };
}

/**
 * Transform card from app format to database format
 */
function transformCardToDB(card) {
  // Extract category IDs if provided as array of category objects or array of IDs
  let categoryIds = [];
  if (card.categories && Array.isArray(card.categories)) {
    categoryIds = card.categories.map(cat => 
      typeof cat === 'object' && cat !== null ? (cat.id || cat.categoryId) : cat
    ).filter(Boolean);
  } else if (card.categoryIds && Array.isArray(card.categoryIds)) {
    categoryIds = card.categoryIds;
  }

  return {
    cardData: {
      id: card.id,
      type: card.type,
      front: card.front,
      back_arabic: card.backArabic || null,
      back_english: card.backEnglish || '',
      back_tibetan_script: card.backTibetanScript || null,
      back_tibetan_numeral: card.backTibetanNumeral || null,
      back_tibetan_spelling: card.backTibetanSpelling || '',
      tags: card.tags || [],
      subcategory: card.subcategory || null,
      notes: card.notes || null,
      image_url: card.imageUrl || null,
      created_at: card.createdAt ? new Date(card.createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: card.userId || null,
      is_master: card.isMaster !== undefined ? card.isMaster : (card.userId === null || card.userId === undefined),
      // Classification data
      instruction_level_id: card.instructionLevelId || card.instruction_level_id || null
    },
    categoryIds: categoryIds
  };
}

