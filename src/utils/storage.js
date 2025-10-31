/**
 * LocalStorage helpers for persisting cards and progress
 */

const CARDS_STORAGE_KEY = 'tibetan_flashcards_cards';
const PROGRESS_STORAGE_KEY = 'tibetan_flashcards_progress';

/**
 * Loads all cards from localStorage
 */
export function loadCards() {
  try {
    const stored = localStorage.getItem(CARDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
}

/**
 * Saves all cards to localStorage
 */
export function saveCards(cards) {
  try {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    return true;
  } catch (error) {
    console.error('Error saving cards:', error);
    return false;
  }
}

/**
 * Loads progress for all cards from localStorage
 */
export function loadProgress() {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading progress:', error);
    return {};
  }
}

/**
 * Saves progress for all cards to localStorage
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

/**
 * Updates progress for a specific card
 */
export function updateCardProgress(cardId, cardProgress) {
  const allProgress = loadProgress();
  allProgress[cardId] = cardProgress;
  saveProgress(allProgress);
  return allProgress;
}

/**
 * Gets progress for a specific card
 */
export function getCardProgress(cardId) {
  const allProgress = loadProgress();
  return allProgress[cardId] || null;
}

/**
 * Migrates existing cards to have proper tags
 * Updates cards to use Numerals/Numbers/Word tags
 */
export function migrateCardTags(cards) {
  return cards.map(card => {
    // If card already has tags, skip migration
    if (card.tags && card.tags.length > 0) {
      return card;
    }

    // Determine tags based on card properties
    const isNumeralCard = card.subcategory === 'numerals' || /[\u0F20-\u0F29]/.test(card.front);
    const isScriptCard = card.subcategory === 'script' || (!isNumeralCard && card.front && /[\u0F00-\u0FFF]/.test(card.front));
    
    let tags = [];
    if (isNumeralCard) {
      tags = ['Numerals'];
    } else if (isScriptCard && (card.type === 'number' || card.category === 'numbers')) {
      tags = ['Numbers'];
    } else if (card.type === 'word') {
      tags = ['Word'];
    } else if (card.type === 'phrase') {
      tags = ['Phrase'];
    } else {
      // Default fallback
      tags = ['Word'];
    }

    return {
      ...card,
      tags
    };
  });
}

/**
 * Merges seed data with existing cards (avoids duplicates)
 * For number cards, replaces old format cards with new dual-format cards
 */
export function mergeSeedData(seedCards, existingCards) {
  // Migrate existing cards to have proper tags
  const migratedCards = migrateCardTags(existingCards);
  
  // Filter out old number cards (with old id format: number_X, number_numeral_X, number_spelling_X, number_script_X)
  // Also filter out old word cards (with old id format: word_X instead of word_en_X or word_tib_X)
  // Keep user-created cards and new seed cards
  const filteredExisting = migratedCards.filter(card => {
    // Remove old format number cards - we'll replace them with new format
    if (card.id && (
      card.id.startsWith('number_') && 
      (!card.id.includes('_numeral_') && !card.id.includes('_script_') && !card.id.includes('_spelling_'))
    )) {
      return false; // Remove old format number cards
    }
    // Also remove old spelling cards - we only want numerals and script now
    if (card.id && card.id.includes('_spelling_')) {
      return false;
    }
    // Remove old format word cards - we'll replace them with new format (english_to_tibetan and tibetan_to_english)
    if (card.id && card.id.startsWith('word_') && card.type === 'word' && 
        !card.id.startsWith('word_en_') && !card.id.startsWith('word_tib_')) {
      return false; // Remove old format word cards
    }
    return true;
  });
  
  const existingIds = new Set(filteredExisting.map(card => card.id));
  const newCards = seedCards.filter(card => !existingIds.has(card.id));
  
  const result = [...filteredExisting, ...newCards];
  
  // Save migrated cards if migration happened
  if (migratedCards.length !== existingCards.length || 
      migratedCards.some((card, i) => JSON.stringify(card.tags) !== JSON.stringify(existingCards[i]?.tags))) {
    saveCards(result);
  }
  
  return result;
}

/**
 * Exports all data as JSON (for backup/import)
 */
export function exportData() {
  return {
    cards: loadCards(),
    progress: loadProgress(),
    exportDate: Date.now()
  };
}

/**
 * Imports data from JSON (for restore)
 */
export function importData(data) {
  try {
    if (data.cards) {
      saveCards(data.cards);
    }
    if (data.progress) {
      saveProgress(data.progress);
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
