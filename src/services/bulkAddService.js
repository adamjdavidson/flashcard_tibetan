/**
 * Bulk Add Service
 * Handles bulk card creation with duplicate detection, translation, and image generation
 */

import { loadCards, saveCards } from './cardsService.js';
import { loadCategories, createCategory } from './categoriesService.js';
import { createCard } from '../data/cardSchema.js';
import { supabase, isSupabaseConfigured } from './supabase.js';
import { translateText } from '../utils/translation.js';
import { generateAIImage } from '../utils/images.js';

/**
 * Check which words already exist in the database (duplicates)
 * @param {string[]} words - Array of words to check (will be normalized)
 * @returns {Promise<{duplicates: string[], newWords: string[]}>}
 */
export async function checkDuplicates(words) {
  // Normalize words: trim and lowercase
  const normalizedWords = words
    .map(word => word.trim())
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase());

  if (normalizedWords.length === 0) {
    return { duplicates: [], newWords: [] };
  }

  // Load all cards and filter client-side (acceptable for admin feature)
  const allCards = await loadCards(() => [], null, true); // Admin view to see all cards
  
  // Create set of existing English words (case-insensitive)
  const existingWords = new Set(
    allCards
      .filter(card => card.englishText && card.englishText.trim())
      .map(card => card.englishText.trim().toLowerCase())
  );

  // Check which words are duplicates
  const duplicates = [];
  const newWords = [];

  words.forEach(word => {
    const normalized = word.trim().toLowerCase();
    if (normalized.length === 0) {
      return; // Skip empty words
    }
    if (existingWords.has(normalized)) {
      duplicates.push(word); // Keep original casing for display
    } else {
      newWords.push(word);
    }
  });

  return { duplicates, newWords };
}

/**
 * Ensure the "new" category exists, creating it if necessary
 * @returns {Promise<string>} Category ID
 */
export async function ensureNewCategory() {
  const categories = await loadCategories();
  const newCategory = categories.find(cat => 
    cat.name && cat.name.toLowerCase() === 'new'
  );

  if (newCategory) {
    return newCategory.id;
  }

  // Create "new" category if it doesn't exist
  const result = await createCategory({
    name: 'new',
    description: 'Cards created via bulk add, pending review',
    created_by: null // Admin-created category
  });

  if (result.success && result.data) {
    return result.data.id;
  }

  throw new Error('Failed to create "new" category');
}

/**
 * Process a bulk add operation
 * @param {Object} request - Bulk add request
 * @param {string[]} request.words - Array of words to process (2-100 words)
 * @param {string} request.cardType - Card type ('word' or 'phrase')
 * @param {string[]} request.categoryIds - Array of category IDs (optional)
 * @param {string|null} request.instructionLevelId - Instruction level ID (optional)
 * @param {boolean} request.markAsNew - Whether to assign "new" category (default: true)
 *   - When true: Ensures "new" category exists and assigns it to all created cards
 *   - When false: Skips "new" category assignment, uses only selected categories
 *   - Defaults to true for backward compatibility
 * @param {Object} options - Processing options
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Bulk add summary
 */
export async function processBulkAdd(request, options = {}) {
  const { words, cardType, categoryIds = [], instructionLevelId = null, markAsNew = true } = request;
  const { onProgress } = options;

  // Validate request
  if (!words || !Array.isArray(words)) {
    throw new Error('Words must be an array');
  }

  // Parse and normalize words (trim, remove empty lines)
  const normalizedWords = words
    .map(word => word.trim())
    .filter(word => word.length > 0);

  // Validate word count
  if (normalizedWords.length < 2) {
    throw new Error('At least 2 words are required');
  }
  if (normalizedWords.length > 100) {
    throw new Error('Maximum 100 words allowed');
  }

  // Validate card type
  if (cardType !== 'word' && cardType !== 'phrase') {
    throw new Error('Card type must be "word" or "phrase"');
  }

  // Report progress: checking duplicates
  if (onProgress) {
    onProgress({
      stage: 'checking',
      current: 0,
      total: normalizedWords.length,
      details: {}
    });
  }

  // Check for duplicates
  const { duplicates, newWords } = await checkDuplicates(normalizedWords);

  if (newWords.length === 0) {
    // All words are duplicates
    return {
      totalWords: normalizedWords.length,
      cardsCreated: 0,
      duplicatesSkipped: duplicates.length,
      translationFailures: [],
      imageFailures: [],
      errors: [],
      createdCards: [],
      duplicateWords: duplicates
    };
  }

  // Conditionally ensure "new" category exists and add to category list
  let allCategoryIds = [...categoryIds];
  if (markAsNew) {
    let newCategoryId;
    try {
      newCategoryId = await ensureNewCategory();
      if (!allCategoryIds.includes(newCategoryId)) {
        allCategoryIds.push(newCategoryId);
      }
    } catch (error) {
      // Log error but continue processing (partial success)
      console.error('Failed to create "new" category:', error);
      // Continue without "new" category
    }
  }

  // Translate words (batched with delays)
  const translationResults = [];
  const translationFailures = [];
  const BATCH_SIZE = 5;

  if (onProgress) {
    onProgress({
      stage: 'translating',
      current: 0,
      total: newWords.length,
      details: {}
    });
  }

  for (let i = 0; i < newWords.length; i += BATCH_SIZE) {
    const batch = newWords.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (word) => {
        try {
          const result = await translateText(word.trim(), 'en', 'bo');
          if (result.success && result.translated) {
            return { word, success: true, translated: result.translated };
          } else {
            return { word, success: false, error: result.error || 'Translation failed' };
          }
        } catch (error) {
          return { word, success: false, error: error.message || 'Translation error' };
        }
      })
    );
    
    translationResults.push(...batchResults);
    
    // Update progress
    if (onProgress) {
      onProgress({
        stage: 'translating',
        current: Math.min(i + BATCH_SIZE, newWords.length),
        total: newWords.length,
        details: {}
      });
    }
    
    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < newWords.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Track translation failures
  translationResults.forEach(result => {
    if (!result.success) {
      translationFailures.push({ word: result.word, error: result.error });
    }
  });

  // Generate images (sequential with delays)
  const imageResults = [];
  const imageFailures = [];

  if (onProgress) {
    onProgress({
      stage: 'generating',
      current: 0,
      total: newWords.length,
      details: {}
    });
  }

  for (let i = 0; i < newWords.length; i++) {
    const word = newWords[i];
    try {
      const result = await generateAIImage(word.trim());
      if (result.success && result.imageUrl) {
        imageResults.push({ word, success: true, imageUrl: result.imageUrl });
      } else {
        imageResults.push({ word, success: false, error: result.error || 'Image generation failed' });
        imageFailures.push({ word, error: result.error || 'Image generation failed' });
      }
    } catch (error) {
      imageResults.push({ word, success: false, error: error.message || 'Image generation error' });
      imageFailures.push({ word, error: error.message || 'Image generation error' });
    }

    // Update progress
    if (onProgress) {
      onProgress({
        stage: 'generating',
        current: i + 1,
        total: newWords.length,
        details: {}
      });
    }

    // Delay between image generation requests (2 seconds)
    if (i < newWords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Create cards with translation and image data
  const cardsToCreate = newWords.map((word, index) => {
    const translationResult = translationResults[index];
    const imageResult = imageResults[index];
    
    return createCard({
      type: cardType,
      englishText: word.trim(),
      tibetanText: translationResult?.success ? translationResult.translated : null,
      imageUrl: imageResult?.success ? imageResult.imageUrl : null,
      categoryIds: allCategoryIds,
      instructionLevelId: instructionLevelId
    });
  });

  // Save cards in batch
  const saveResult = await saveCards(cardsToCreate, () => {});

  if (!saveResult.success) {
    return {
      totalWords: normalizedWords.length,
      cardsCreated: 0,
      duplicatesSkipped: duplicates.length,
      translationFailures: [],
      imageFailures: [],
      errors: [{ word: 'system', error: saveResult.error || 'Failed to save cards' }],
      createdCards: [],
      duplicateWords: duplicates
    };
  }

  let createdCards = saveResult.data || [];

  // Handle category associations for each card (saveCards doesn't handle this)
  if (isSupabaseConfigured() && createdCards.length > 0 && allCategoryIds.length > 0) {
    try {
      // Create associations for all cards
      const associations = [];
      createdCards.forEach(card => {
        allCategoryIds.forEach(categoryId => {
          associations.push({
            card_id: card.id,
            category_id: categoryId
          });
        });
      });

      if (associations.length > 0) {
        // Delete existing associations first
        const cardIds = createdCards.map(card => card.id);
        await supabase
          .from('card_categories')
          .delete()
          .in('card_id', cardIds);

        // Insert new associations
        const { error: categoryError } = await supabase
          .from('card_categories')
          .insert(associations);

        if (categoryError) {
          console.error('Error saving card categories:', categoryError);
          // Cards are saved, but categories failed - continue with partial success
        }
      }
    } catch (error) {
      console.error('Error handling category associations:', error);
      // Cards are saved, but categories failed - continue with partial success
    }
  }

  return {
    totalWords: normalizedWords.length,
    cardsCreated: createdCards.length,
    duplicatesSkipped: duplicates.length,
    translationFailures: translationFailures,
    imageFailures: imageFailures,
    errors: [],
    createdCards: createdCards,
    duplicateWords: duplicates
  };
}

