/**
 * Cards Service
 * Handles all card CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Load all cards from Supabase
 * Falls back to localStorage if Supabase not configured
 */
export async function loadCards(fallbackLoad) {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    return fallbackLoad ? fallbackLoad() : [];
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading cards from Supabase:', error);
      return fallbackLoad ? fallbackLoad() : [];
    }

    // Transform database format to app format
    return data.map(transformCardFromDB);
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
    const cardData = transformCardToDB(card);
    const { data, error } = await supabase
      .from('cards')
      .upsert(cardData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving card:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: transformCardFromDB(data) };
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
    const cardsData = cards.map(transformCardToDB);
    const { data, error } = await supabase
      .from('cards')
      .upsert(cardsData, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error saving cards:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(transformCardFromDB) };
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
    createdAt: dbCard.created_at ? new Date(dbCard.created_at).getTime() : Date.now()
  };
}

/**
 * Transform card from app format to database format
 */
function transformCardToDB(card) {
  return {
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
    updated_at: new Date().toISOString()
  };
}

