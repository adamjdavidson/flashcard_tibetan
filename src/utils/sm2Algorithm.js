/**
 * Anki SM-2 Spaced Repetition Algorithm (Enhanced)
 * Based on the SuperMemo 2 algorithm with Anki/RemNote enhancements
 * 
 * Quality levels:
 * 0 - Forgot (wrong, forgot)
 * 1 - Partial Recall (barely recalled)
 * 3 - Hard Recall (correctly recalled with effort)
 * 5 - Easy Recall (easily recalled)
 * 
 * Features:
 * - Learning Phase with fixed steps (30m, 2h, 2d)
 * - Late review bonus (if reviewing late and still remembering)
 * - Random noise to prevent card clustering
 * - Lapse interval multiplier (0.1) instead of full reset
 * - Partial Recall uses intermediate interval (1.2x)
 */

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.3; // 230% (Anki default)
const INITIAL_INTERVAL = 1; // days
const LAPSE_INTERVAL_MULTIPLIER = 0.1; // When you forget, multiply by 0.1 instead of resetting
const EASY_BONUS = 1.3; // Easy recall multiplier
const INTERVAL_MULTIPLIER = 1.0; // Global interval multiplier (default: no change)
const RANDOM_NOISE_PERCENT = 0.15; // ±15% random noise to prevent clustering

// Learning Phase steps (in minutes): 30m, 2h (120m), 2d (2880m)
const LEARNING_PHASE_STEPS = [
  30,      // 30 minutes
  120,     // 2 hours
  2880     // 2 days
];

const EASY_EXIT_INTERVAL = 4; // days when exiting learning phase with Easy

/**
 * Parses time string to minutes (e.g., "30m", "2h", "2d")
 */
// eslint-disable-next-line no-unused-vars
function parseTimeToMinutes(timeString) {
  // Function is unused but kept for potential future use
  const match = timeString.match(/^(\d+)([mhd])$/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'm': return value;
    case 'h': return value * 60;
    case 'd': return value * 24 * 60;
    default: return null;
  }
}

/**
 * Converts minutes to days
 */
function minutesToDays(minutes) {
  return minutes / (24 * 60);
}

/**
 * Adds random noise to interval (±15% by default)
 */
function addRandomNoise(interval) {
  const noise = (Math.random() - 0.5) * 2 * RANDOM_NOISE_PERCENT; // -15% to +15%
  return Math.round(interval * (1 + noise));
}

/**
 * Calculates days late if reviewing after due date
 */
function calculateDaysLate(cardProgress) {
  if (!cardProgress.nextReviewDate) return 0;
  const now = Date.now();
  const dueDate = cardProgress.nextReviewDate;
  if (now < dueDate) return 0;
  return (now - dueDate) / (24 * 60 * 60 * 1000); // Days late
}

/**
 * Checks if card is in Learning Phase
 */
export function isInLearningPhase(cardProgress) {
  if (cardProgress.learningStepIndex === undefined || cardProgress.learningStepIndex === null) {
    return false;
  }
  return cardProgress.learningStepIndex < LEARNING_PHASE_STEPS.length;
}

/**
 * Calculates the next interval and updates ease factor based on quality rating
 * Implements Anki SM-2 algorithm with enhancements
 * 
 * @param {Object} cardProgress - Current progress state for the card
 * @param {number} quality - Quality rating (0, 1, 3, or 5)
 * @returns {Object} Updated progress with new interval, ease factor, and next review date
 */
export function calculateReview(cardProgress, quality) {
  const isNewCard = cardProgress.repetitions === 0 && cardProgress.learningStepIndex === undefined;
  let { interval, easeFactor, repetitions, learningStepIndex } = cardProgress;
  
  // Initialize learning phase if new card
  if (isNewCard) {
    learningStepIndex = 0;
  }
  
  // Calculate days late (for late review bonus)
  const daysLate = calculateDaysLate(cardProgress);
  
  // Determine if we're in Learning Phase
  const inLearningPhase = learningStepIndex !== undefined && learningStepIndex < LEARNING_PHASE_STEPS.length;
  
  if (inLearningPhase) {
    // LEARNING PHASE
    if (quality === 0) {
      // Forgot: Return to first step
      learningStepIndex = 0;
      interval = minutesToDays(LEARNING_PHASE_STEPS[0]);
    } else if (quality === 1) {
      // Partial Recall: Stay on same step, wait half time to next step
      const currentStep = LEARNING_PHASE_STEPS[learningStepIndex];
      const nextStep = LEARNING_PHASE_STEPS[learningStepIndex + 1] || currentStep;
      interval = minutesToDays((currentStep + nextStep) / 2);
    } else if (quality === 3) {
      // Hard Recall: Move to next step
      learningStepIndex += 1;
      if (learningStepIndex < LEARNING_PHASE_STEPS.length) {
        // Still in learning phase
        interval = minutesToDays(LEARNING_PHASE_STEPS[learningStepIndex]);
      } else {
        // Exiting learning phase, enter exponential phase
        // Use the last step's interval (2 days), then next review will be exponential
        const lastStep = LEARNING_PHASE_STEPS[LEARNING_PHASE_STEPS.length - 1];
        interval = minutesToDays(lastStep);
        learningStepIndex = undefined;
        // Don't set repetitions = 1 here - keep it at 0 so next review knows it's first in exponential
        repetitions = 0;
      }
    } else if (quality === 5) {
      // Easy Recall: Immediately exit to exponential phase
      interval = EASY_EXIT_INTERVAL;
      learningStepIndex = undefined;
      // Don't set repetitions = 1 here - keep it at 0 so next review knows it's first in exponential
      repetitions = 0;
    }
    
    // Update ease factor (same as exponential phase)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeChange);
    
  } else {
    // EXPONENTIAL PHASE
    
    // Check if this is the first review after exiting learning phase
    const isFirstExponentialReview = repetitions === 0 && cardProgress.learningStepIndex === undefined;
    
    if (quality === 0) {
      // Forgot: Use lapse interval multiplier (0.1) and send to relearning phase
      interval = Math.max(1, Math.round(interval * LAPSE_INTERVAL_MULTIPLIER));
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2); // Decrease ease by 20%
      repetitions = 0; // Reset repetitions (enters relearning phase)
      learningStepIndex = 0; // Enter relearning phase
    } else if (quality === 1) {
      // Partial Recall: Use interval factor of 1.2, decrease ease by 15%
      // EF' = EF - 0.15
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      const intervalFactor = 1.2;
      
      // Apply late review bonus if applicable
      if (daysLate > 0) {
        interval = interval + (daysLate / 4); // Hardness divider = 4
      }
      
      interval = Math.round(interval * intervalFactor);
      repetitions += 1;
    } else if (quality === 3) {
      // Hard Recall: Use interval factor equal to ease factor, ease unchanged
      // Note: RemNote's "Recalled with effort" keeps ease unchanged (but we use classic SM-2 formula)
      // We'll still apply the classic formula but it should result in minimal change
      const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeChange);
      
      // First review in exponential phase uses fixed 6 days (classic SM-2)
      if (isFirstExponentialReview) {
        interval = 6;
      } else {
        const intervalFactor = easeFactor;
        
        // Apply late review bonus if applicable
        if (daysLate > 0) {
          interval = interval + (daysLate / 2); // Hardness divider = 2
        }
        
        interval = Math.round(interval * intervalFactor);
      }
      repetitions += 1;
    } else if (quality === 5) {
      // Easy Recall: Use interval factor = ease * easy bonus, increase ease by 15%
      easeFactor = Math.min(3.0, easeFactor + 0.15); // Cap at 300%
      
      // First review in exponential phase: use EASY_EXIT_INTERVAL (already set if from learning phase)
      // Otherwise use ease * easy bonus
      if (isFirstExponentialReview && interval === EASY_EXIT_INTERVAL) {
        // Interval already set from learning phase exit
      } else {
        const intervalFactor = easeFactor * EASY_BONUS;
        
        // Apply late review bonus if applicable
        if (daysLate > 0) {
          interval = interval + daysLate; // Hardness divider = 1
        }
        
        interval = Math.round(interval * intervalFactor);
      }
      repetitions += 1;
    } else {
      // Fallback: Update ease factor using classic formula
      const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeChange);
      
      // First review in exponential phase uses fixed 6 days
      if (isFirstExponentialReview) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }
    
    // Apply interval multiplier (default: 1.0, no change)
    interval = Math.round(interval * INTERVAL_MULTIPLIER);
    
    // Add random noise to prevent clustering
    interval = addRandomNoise(interval);
  }

  // Ensure minimum interval of 1 day
  interval = Math.max(1, interval);

  // Calculate next review date
  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    ...cardProgress,
    interval,
    easeFactor,
    repetitions,
    quality,
    learningStepIndex,
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
    learningStepIndex: 0, // Start in learning phase
    lastReviewDate: null,
    nextReviewDate: null,
    reviewCount: 0
  };
}

/**
 * Checks if a card is due for review
 * For learning phase cards, allows showing slightly early (up to 15 minutes)
 */
export function isCardDue(cardProgress) {
  if (!cardProgress.nextReviewDate) {
    return true; // New card, always due
  }
  
  const now = Date.now();
  const dueDate = cardProgress.nextReviewDate;
  
  // Allow learning phase cards to show up to 15 minutes early
  const inLearningPhase = cardProgress.learningStepIndex !== undefined && 
                         cardProgress.learningStepIndex < LEARNING_PHASE_STEPS.length;
  
  if (inLearningPhase) {
    const learnAheadLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
    return now >= (dueDate - learnAheadLimit);
  }
  
  return now >= dueDate;
}

/**
 * Gets quality level from button selection
 * @param {string} buttonType - 'forgot', 'partial', 'hard', 'easy'
 * @returns {number} Quality level (0, 1, 3, or 5)
 */
export function getQualityFromButton(buttonType) {
  const qualityMap = {
    'forgot': 0,
    'partial': 1,
    'hard': 3,
    'easy': 5
  };
  return qualityMap[buttonType] ?? 3;
}
