/**
 * Card utility functions for filtering, selecting, and managing cards
 */

import { isCardDue } from './sm2Algorithm.js';

/**
 * Gets cards that are due for review
 * @param {Array} cards - Array of cards
 * @param {Object} progressMap - Progress map: { [cardId]: progress } (legacy) or { [cardId]: { tibetan_to_english?: progress, english_to_tibetan?: progress } } (new)
 * @param {string} studyDirection - 'tibetan_to_english' | 'english_to_tibetan' | 'both' (for word/phrase cards)
 */
export function getDueCards(cards, progressMap, studyDirection = 'tibetan_to_english') {
  return cards.filter(card => {
    const cardProgressData = progressMap[card.id];
    if (!cardProgressData) {
      return true; // New cards are always due
    }
    
    // For word/phrase cards, use direction-specific progress
    if (card.type === 'word' || card.type === 'phrase') {
      // If 'both', card is due if it's due in EITHER direction (or if it's new in one direction)
      if (studyDirection === 'both') {
        const tibetanProgress = cardProgressData.tibetan_to_english || 
          (typeof cardProgressData === 'object' && 
           !cardProgressData.tibetan_to_english && 
           !cardProgressData.english_to_tibetan ? cardProgressData : null);
        const englishProgress = cardProgressData.english_to_tibetan;
        
        // Due if either direction is due, or if one direction has no progress (new)
        const tibetanDue = !tibetanProgress || isCardDue(tibetanProgress);
        const englishDue = !englishProgress || isCardDue(englishProgress);
        return tibetanDue || englishDue;
      }
      
      // Single direction
      const cardProgress = cardProgressData[studyDirection];
      if (!cardProgress) {
        // Try legacy progress (treated as tibetan_to_english)
        if (studyDirection === 'tibetan_to_english' && 
            typeof cardProgressData === 'object' && 
            !cardProgressData.tibetan_to_english && 
            !cardProgressData.english_to_tibetan) {
          return isCardDue(cardProgressData);
        }
        return true; // New direction is always due
      }
      return isCardDue(cardProgress);
    } else {
      // Number cards: use legacy structure or any available progress
      const cardProgress = typeof cardProgressData === 'object' && 
                          !cardProgressData.tibetan_to_english && 
                          !cardProgressData.english_to_tibetan
                          ? cardProgressData 
                          : cardProgressData[studyDirection] || cardProgressData.tibetan_to_english || null;
      if (!cardProgress) {
        return true; // New cards are always due
      }
      return isCardDue(cardProgress);
    }
  });
}

/**
 * Selects a random card from the provided cards
 */
export function selectRandomCard(cards) {
  if (cards.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
}

/**
 * Gets the next card to study
 * Priority: due cards > all cards
 * @param {Array} cards - Array of cards
 * @param {Object} progressMap - Progress map (direction-aware for word/phrase cards)
 * @param {string} studyDirection - 'tibetan_to_english' | 'english_to_tibetan' | 'both' (for word/phrase cards)
 */
export function getNextCard(cards, progressMap, studyDirection = 'tibetan_to_english') {
  const dueCards = getDueCards(cards, progressMap, studyDirection);
  
  if (dueCards.length > 0) {
    return selectRandomCard(dueCards);
  }
  
  // If no cards are due, select from all cards
  return selectRandomCard(cards);
}

/**
 * Filters cards by type
 */
export function filterCardsByType(cards, type) {
  if (!type) return cards;
  return cards.filter(card => card.type === type);
}

/**
 * Filters cards by category
 */
export function filterCardsByCategory(cards, category) {
  if (!category) return cards;
  return cards.filter(card => card.category === category);
}

/**
 * Filters cards by tags
 * @param {Array} cards - Array of cards
 * @param {Array} selectedTags - Array of selected tag names (e.g., ['Numerals', 'Numbers'])
 * @returns {Array} Filtered cards
 */
export function filterCardsByTags(cards, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) {
    return cards;
  }
  // If "All cards" is selected (represented by empty array or 'all'), return all cards
  if (selectedTags.includes('all')) {
    return cards;
  }
  return cards.filter(card => {
    const cardTags = card.tags || [];
    return selectedTags.some(tag => cardTags.includes(tag));
  });
}

/**
 * Gets unique card types from cards
 */
export function getCardTypes(cards) {
  const types = new Set(cards.map(card => card.type));
  return Array.from(types);
}

/**
 * Gets unique categories from cards
 */
export function getCardCategories(cards) {
  const categories = new Set(
    cards
      .map(card => card.category)
      .filter(cat => cat !== null && cat !== undefined)
  );
  return Array.from(categories);
}

/**
 * Calculates overall statistics
 * Handles bidirectional progress structure: { [cardId]: { tibetan_to_english?: progress, english_to_tibetan?: progress } }
 */
export function calculateStats(cards, progressMap) {
  const totalCards = cards.length;
  
  // Count unique cards with progress (across all directions)
  const cardsWithProgress = new Set();
  let totalReviews = 0;
  
  Object.keys(progressMap).forEach(cardId => {
    const cardProgress = progressMap[cardId];
    
    // Handle both new nested structure and legacy flat structure
    if (cardProgress && typeof cardProgress === 'object') {
      // New bidirectional structure
      if (cardProgress.tibetan_to_english || cardProgress.english_to_tibetan) {
        // It's the new nested structure
        if (cardProgress.tibetan_to_english) {
          cardsWithProgress.add(cardId);
          totalReviews += (cardProgress.tibetan_to_english.reviewCount || 0);
        }
        if (cardProgress.english_to_tibetan) {
          cardsWithProgress.add(cardId);
          totalReviews += (cardProgress.english_to_tibetan.reviewCount || 0);
        }
      } else {
        // Legacy flat structure (treat as single progress entry)
        cardsWithProgress.add(cardId);
        totalReviews += (cardProgress.reviewCount || 0);
      }
    }
  });
  
  const totalProgress = cardsWithProgress.size;
  const dueCount = getDueCards(cards, progressMap).length;

  return {
    totalCards,
    totalProgress,
    dueCount,
    totalReviews,
    cardsLearned: totalProgress,
    cardsDue: dueCount
  };
}

