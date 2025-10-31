/**
 * Progress Service
 * Handles card progress CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Load progress for all cards for a specific user
 */
export async function loadProgress(userId, fallbackLoad) {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback to localStorage
    return fallbackLoad ? fallbackLoad() : {};
  }

  try {
    const { data, error } = await supabase
      .from('card_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading progress:', error);
      return fallbackLoad ? fallbackLoad() : {};
    }

    // Transform to progress map format
    const progressMap = {};
    data.forEach(progress => {
      progressMap[progress.card_id] = transformProgressFromDB(progress);
    });

    return progressMap;
  } catch (error) {
    console.error('Error loading progress:', error);
    return fallbackLoad ? fallbackLoad() : {};
  }
}

/**
 * Save progress for a single card
 */
export async function saveCardProgress(userId, cardId, progress, fallbackSave) {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback to localStorage
    if (fallbackSave) {
      fallbackSave(cardId, progress);
    }
    return { success: true };
  }

  try {
    const progressData = transformProgressToDB(userId, cardId, progress);
    const { error } = await supabase
      .from('card_progress')
      .upsert(progressData, { onConflict: 'user_id,card_id' });

    if (error) {
      console.error('Error saving progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save progress for multiple cards (batch operation)
 */
export async function saveProgressBatch(userId, progressMap, fallbackSave) {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback to localStorage
    if (fallbackSave) {
      fallbackSave(progressMap);
    }
    return { success: true };
  }

  try {
    const progressDataArray = Object.entries(progressMap).map(([cardId, progress]) =>
      transformProgressToDB(userId, cardId, progress)
    );

    if (progressDataArray.length === 0) {
      return { success: true };
    }

    const { error } = await supabase
      .from('card_progress')
      .upsert(progressDataArray, { onConflict: 'user_id,card_id' });

    if (error) {
      console.error('Error saving progress batch:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving progress batch:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save progress map (all progress for a user)
 */
export async function saveProgress(userId, progressMap, fallbackSave) {
  return saveProgressBatch(userId, progressMap, fallbackSave);
}

/**
 * Delete progress for a card
 */
export async function deleteProgress(userId, cardId, fallbackDelete) {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback to localStorage
    if (fallbackDelete) {
      fallbackDelete(cardId);
    }
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('card_progress')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', cardId);

    if (error) {
      console.error('Error deleting progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time changes in progress table for a user
 */
export function subscribeToProgress(userId, callback) {
  if (!isSupabaseConfigured() || !userId) {
    return null;
  }

    const subscription = supabase
      .channel('progress-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'card_progress',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          const progress = transformProgressFromDB(payload.new);
          callback({ 
            type: payload.eventType, 
            data: { 
              ...progress,
              cardId: payload.new.card_id 
            } 
          });
        } else if (payload.old) {
          callback({ 
            type: payload.eventType, 
            data: { 
              cardId: payload.old.card_id 
            } 
          });
        }
      })
      .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Transform progress from database format to app format
 */
function transformProgressFromDB(dbProgress) {
  return {
    interval: dbProgress.interval,
    easeFactor: dbProgress.ease_factor,
    repetitions: dbProgress.repetitions,
    quality: dbProgress.quality,
    learningStepIndex: dbProgress.learning_step_index ?? undefined,
    lastReviewDate: dbProgress.last_review_date,
    nextReviewDate: dbProgress.next_review_date,
    reviewCount: dbProgress.review_count || 0
  };
}

/**
 * Transform progress from app format to database format
 */
function transformProgressToDB(userId, cardId, progress) {
  return {
    user_id: userId,
    card_id: cardId,
    interval: progress.interval,
    ease_factor: progress.easeFactor,
    repetitions: progress.repetitions,
    quality: progress.quality,
    learning_step_index: progress.learningStepIndex ?? null,
    last_review_date: progress.lastReviewDate,
    next_review_date: progress.nextReviewDate,
    review_count: progress.reviewCount || 0
  };
}

