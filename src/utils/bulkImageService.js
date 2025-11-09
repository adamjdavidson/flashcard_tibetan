/**
 * Bulk Image Generation Service
 * Handles bulk image generation for multiple cards
 */

import { generateAIImage } from './images.js';
import { saveCard } from '../services/cardsService.js';

/**
 * Generate image prompt from card
 * Priority: englishText > backEnglish > front
 * @param {Object} card - Card object
 * @returns {string|null} Prompt text or null if no suitable text field
 */
function getImagePrompt(card) {
  return card.englishText || card.backEnglish || card.front || null;
}

/**
 * Filter cards that need images
 * Returns cards of type 'word' or 'phrase' without imageUrl
 * @param {Array} cards - Array of card objects
 * @param {Object} filters - Filter options (type, category, instructionLevel)
 * @returns {Array} Filtered cards that need images and have suitable text fields
 */
export function filterCardsNeedingImages(cards, filters = {}) {
  // Filter by type (word/phrase) and missing imageUrl
  let filtered = cards.filter(card => 
    (card.type === 'word' || card.type === 'phrase') &&
    !card.imageUrl
  );

  // Apply type filter if provided
  if (filters.type) {
    filtered = filtered.filter(card => card.type === filters.type);
  }

  // Apply category filter if provided
  if (filters.category) {
    filtered = filtered.filter(card => 
      card.categories?.some(cat => (cat.id || cat.categoryId) === filters.category)
    );
  }

  // Apply instruction level filter if provided
  if (filters.instructionLevel) {
    filtered = filtered.filter(card => 
      card.instructionLevelId === filters.instructionLevel || 
      card.instruction_level_id === filters.instructionLevel
    );
  }

  // Filter out cards without suitable text fields
  return filtered
    .map(card => ({ card, prompt: getImagePrompt(card) }))
    .filter(({ prompt }) => prompt && prompt.trim())
    .map(({ card }) => card);
}

/**
 * Process bulk image generation
 * @param {Array} cards - Cards to process
 * @param {Function} onProgress - Callback for progress updates (progress: {current, total, completed, failed, currentCard})
 * @param {Function} onComplete - Callback when complete (result: {completed, failed, total, failures, cancelled})
 * @param {AbortSignal} signal - Abort signal for cancellation
 */
export async function processBulkImageGeneration(cards, onProgress, onComplete, signal) {
  const total = cards.length;
  let completed = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < cards.length; i++) {
    // Check for cancellation
    if (signal?.aborted) {
      break;
    }

    const card = cards[i];
    const prompt = getImagePrompt(card);

    // Update progress
    if (onProgress) {
      onProgress({
        current: i,
        total,
        completed,
        failed,
        currentCard: card
      });
    }

    try {
      // Generate image
      const result = await generateAIImage(prompt);
      
      if (!result.success) {
        failures.push({
          cardId: card.id,
          cardText: prompt,
          error: result.error || 'Image generation failed',
          timestamp: new Date()
        });
        failed++;
        continue;
      }

      // Save card with image URL
      const updatedCard = { ...card, imageUrl: result.imageUrl };
      const saveResult = await saveCard(updatedCard);

      if (!saveResult.success) {
        failures.push({
          cardId: card.id,
          cardText: prompt,
          error: saveResult.error || 'Failed to save card',
          timestamp: new Date()
        });
        failed++;
        continue;
      }

      completed++;

      // Small delay to avoid rate limiting (200ms between requests)
      if (i < cards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      failures.push({
        cardId: card.id,
        cardText: prompt,
        error: error.message || 'Unknown error',
        timestamp: new Date()
      });
      failed++;
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      current: total,
      total,
      completed,
      failed,
      currentCard: null
    });
  }

  // Call completion callback
  if (onComplete) {
    onComplete({
      completed,
      failed,
      total,
      failures,
      cancelled: signal?.aborted || false
    });
  }
}

