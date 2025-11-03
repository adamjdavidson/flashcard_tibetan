/**
 * Progress Service
 * Handles card progress CRUD operations with Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Load progress for all cards for a specific user
 * Returns: { [cardId]: { tibetan_to_english?: progress, english_to_tibetan?: progress } }
 * Legacy progress (study_direction = NULL) is treated as tibetan_to_english
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

    // Transform to progress map format by direction
    const progressMap = {};
    data.forEach(progress => {
      const cardId = progress.card_id;
      const direction = progress.study_direction || 'tibetan_to_english'; // Legacy progress treated as tibetan_to_english
      
      if (!progressMap[cardId]) {
        progressMap[cardId] = {};
      }
      
      progressMap[cardId][direction] = transformProgressFromDB(progress);
    });

    return progressMap;
  } catch (error) {
    console.error('Error loading progress:', error);
    return fallbackLoad ? fallbackLoad() : {};
  }
}

/**
 * Save progress for a single card
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID
 * @param {Object} progress - Progress object
 * @param {Function} fallbackSave - Fallback save function
 * @param {string} studyDirection - Optional: 'tibetan_to_english' | 'english_to_tibetan'. Defaults to 'tibetan_to_english'
 */
export async function saveCardProgress(userId, cardId, progress, fallbackSave, studyDirection = 'tibetan_to_english') {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback to localStorage
    if (fallbackSave) {
      fallbackSave(cardId, progress);
    }
    return { success: true };
  }

  try {
    const progressData = transformProgressToDB(userId, cardId, progress, studyDirection);
    const { error } = await supabase
      .from('card_progress')
      .upsert(progressData, { onConflict: 'user_id,card_id,study_direction' });

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
    // progressMap structure: { [cardId]: { tibetan_to_english?: progress, english_to_tibetan?: progress } }
    // OR legacy: { [cardId]: progress } (treated as tibetan_to_english)
    const progressDataArray = [];
    Object.entries(progressMap).forEach(([cardId, progressData]) => {
      // Check if new format (object with directions) or legacy format (single progress object)
      if (progressData.tibetan_to_english || progressData.english_to_tibetan) {
        // New format: separate progress per direction
        if (progressData.tibetan_to_english) {
          progressDataArray.push(transformProgressToDB(userId, cardId, progressData.tibetan_to_english, 'tibetan_to_english'));
        }
        if (progressData.english_to_tibetan) {
          progressDataArray.push(transformProgressToDB(userId, cardId, progressData.english_to_tibetan, 'english_to_tibetan'));
        }
      } else {
        // Legacy format: single progress object (treated as tibetan_to_english)
        progressDataArray.push(transformProgressToDB(userId, cardId, progressData, 'tibetan_to_english'));
      }
    });

    if (progressDataArray.length === 0) {
      return { success: true };
    }

    const { error } = await supabase
      .from('card_progress')
      .upsert(progressDataArray, { onConflict: 'user_id,card_id,study_direction' });

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
    reviewCount: dbProgress.review_count || 0,
    studyDirection: dbProgress.study_direction || 'tibetan_to_english' // Legacy progress treated as tibetan_to_english
  };
}

/**
 * Transform progress from app format to database format
 */
function transformProgressToDB(userId, cardId, progress, studyDirection = 'tibetan_to_english') {
  return {
    user_id: userId,
    card_id: cardId,
    study_direction: studyDirection,
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

/**
 * Get progress for a specific card and direction
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID
 * @param {string} direction - 'tibetan_to_english' | 'english_to_tibetan'
 * @returns {Promise<Object|null>} Progress object or null if not found
 */
export async function getProgressForDirection(userId, cardId, direction) {
  if (!isSupabaseConfigured() || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('card_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('study_direction', direction)
      .maybeSingle();

    if (error) {
      console.error('Error loading progress for direction:', error);
      return null;
    }

    if (!data) {
      // Check for legacy progress (study_direction = NULL) if requesting tibetan_to_english
      if (direction === 'tibetan_to_english') {
        const { data: legacyData, error: legacyError } = await supabase
          .from('card_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('card_id', cardId)
          .is('study_direction', null)
          .maybeSingle();

        if (!legacyError && legacyData) {
          return transformProgressFromDB(legacyData);
        }
      }
      return null;
    }

    return transformProgressFromDB(data);
  } catch (error) {
    console.error('Error loading progress for direction:', error);
    return null;
  }
}

/**
 * Save progress for a specific card and direction
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID
 * @param {string} direction - 'tibetan_to_english' | 'english_to_tibetan'
 * @param {Object} progress - Progress object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveProgressForDirection(userId, cardId, direction, progress) {
  return saveCardProgress(userId, cardId, progress, null, direction);
}

/**
 * Load progress map organized by direction
 * Returns: { [cardId]: { tibetan_to_english?: progress, english_to_tibetan?: progress } }
 */
export async function loadProgressMapByDirection(userId) {
  return loadProgress(userId);
}

