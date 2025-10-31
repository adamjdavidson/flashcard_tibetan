/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm
 * 
 * Quality levels:
 * 0 - Again (wrong, hard)
 * 1 - Hard (barely recalled)
 * 3 - Good (correctly recalled)
 * 5 - Easy (easily recalled)
 */

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1; // days

/**
 * Calculates the next interval and updates ease factor based on quality rating
 * 
 * @param {Object} cardProgress - Current progress state for the card
 * @param {number} quality - Quality rating (0, 1, 3, or 5)
 * @returns {Object} Updated progress with new interval, ease factor, and next review date
 */
export function calculateReview(cardProgress, quality) {
  const isNewCard = cardProgress.repetitions === 0;
  let { interval, easeFactor, repetitions } = cardProgress;

  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeChange);

  if (quality < 3) {
    // If quality is less than 3 (Again or Hard), reset
    repetitions = 0;
    interval = INITIAL_INTERVAL;
  } else {
    // If quality is 3 or higher (Good or Easy)
    repetitions += 1;

    if (isNewCard) {
      // First review
      interval = 1;
    } else if (repetitions === 1) {
      // Second review
      interval = 6;
    } else {
      // Subsequent reviews: interval = previous interval * ease factor
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    ...cardProgress,
    interval,
    easeFactor,
    repetitions,
    quality,
    lastReviewDate: Date.now(),
    nextReviewDate,
    reviewCount: (cardProgress.reviewCount || 0) + 1
  };
}

/**
 * Initializes progress for a new card
 */
export function initializeCardProgress(cardId) {
  return {
    cardId,
    interval: INITIAL_INTERVAL,
    easeFactor: INITIAL_EASE_FACTOR,
    repetitions: 0,
    quality: null,
    lastReviewDate: null,
    nextReviewDate: null,
    reviewCount: 0
  };
}

/**
 * Checks if a card is due for review
 */
export function isCardDue(cardProgress) {
  if (!cardProgress.nextReviewDate) {
    return true; // New card, always due
  }
  return Date.now() >= cardProgress.nextReviewDate;
}

/**
 * Gets quality level from button selection
 * @param {string} buttonType - 'again', 'hard', 'good', 'easy'
 * @returns {number} Quality level (0, 1, 3, or 5)
 */
export function getQualityFromButton(buttonType) {
  const qualityMap = {
    'again': 0,
    'hard': 1,
    'good': 3,
    'easy': 5
  };
  return qualityMap[buttonType] ?? 3;
}

