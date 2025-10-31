/**
 * Card utility functions for filtering, selecting, and managing cards
 */

import { isCardDue } from './sm2Algorithm.js';

/**
 * Gets cards that are due for review
 */
export function getDueCards(cards, progressMap) {
  return cards.filter(card => {
    const cardProgress = progressMap[card.id];
    if (!cardProgress) {
      return true; // New cards are always due
    }
    return isCardDue(cardProgress);
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
 */
export function getNextCard(cards, progressMap) {
  const dueCards = getDueCards(cards, progressMap);
  
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
 */
export function calculateStats(cards, progressMap) {
  const totalCards = cards.length;
  const totalProgress = Object.keys(progressMap).length;
  const dueCount = getDueCards(cards, progressMap).length;
  
  const totalReviews = Object.values(progressMap).reduce(
    (sum, progress) => sum + (progress.reviewCount || 0),
    0
  );

  return {
    totalCards,
    totalProgress,
    dueCount,
    totalReviews,
    cardsLearned: totalProgress,
    cardsDue: dueCount
  };
}

