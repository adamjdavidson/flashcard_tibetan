import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDueCards,
  selectRandomCard,
  getNextCard,
  filterCardsByType,
  filterCardsByCategory,
  filterCardsByTags,
  getCardTypes,
  getCardCategories,
  calculateStats
} from '../cardUtils.js';

describe('cardUtils', () => {
  const mockCards = [
    { id: '1', type: 'word', category: 'vocabulary', tags: ['Word'] },
    { id: '2', type: 'number', category: 'numbers', tags: ['Numerals'] },
    { id: '3', type: 'word', category: 'vocabulary', tags: ['Word'] },
  ];

  const mockProgressMap = {
    '1': {
      nextReviewDate: Date.now() - 1000, // Due (past date)
      reviewCount: 1
    },
    '2': {
      nextReviewDate: Date.now() + 86400000, // Not due (future date)
      reviewCount: 1
    }
  };

  describe('getDueCards', () => {
    it('returns cards that are due for review', () => {
      const due = getDueCards(mockCards, mockProgressMap);
      expect(due).toHaveLength(2); // Card 1 (due) + Card 3 (no progress = due)
      expect(due.find(c => c.id === '1')).toBeDefined();
      expect(due.find(c => c.id === '3')).toBeDefined();
    });

    it('treats cards without progress as due', () => {
      const due = getDueCards(mockCards, {});
      expect(due).toHaveLength(3); // All cards are due
    });

    it('returns empty array when no cards provided', () => {
      expect(getDueCards([], {})).toEqual([]);
    });
  });

  describe('selectRandomCard', () => {
    it('returns a random card from the array', () => {
      const card = selectRandomCard(mockCards);
      expect(card).toBeDefined();
      expect(mockCards).toContain(card);
    });

    it('returns null when array is empty', () => {
      expect(selectRandomCard([])).toBeNull();
    });

    it('always returns one of the provided cards', () => {
      for (let i = 0; i < 10; i++) {
        const card = selectRandomCard(mockCards);
        expect(mockCards).toContain(card);
      }
    });
  });

  describe('getNextCard', () => {
    it('prefers due cards over non-due cards', () => {
      const next = getNextCard(mockCards, mockProgressMap);
      const due = getDueCards(mockCards, mockProgressMap);
      expect(due).toContain(next);
    });

    it('returns any card when none are due', () => {
      const futureProgress = {
        '1': { nextReviewDate: Date.now() + 86400000 },
        '2': { nextReviewDate: Date.now() + 86400000 },
        '3': { nextReviewDate: Date.now() + 86400000 }
      };
      const next = getNextCard(mockCards, futureProgress);
      expect(mockCards).toContain(next);
    });

    it('returns null when no cards provided', () => {
      expect(getNextCard([], {})).toBeNull();
    });
  });

  describe('filterCardsByType', () => {
    it('filters cards by type', () => {
      const words = filterCardsByType(mockCards, 'word');
      expect(words).toHaveLength(2);
      expect(words.every(c => c.type === 'word')).toBe(true);
    });

    it('returns all cards when type is not provided', () => {
      expect(filterCardsByType(mockCards, '')).toEqual(mockCards);
      expect(filterCardsByType(mockCards, null)).toEqual(mockCards);
    });
  });

  describe('filterCardsByCategory', () => {
    it('filters cards by category', () => {
      const vocabulary = filterCardsByCategory(mockCards, 'vocabulary');
      expect(vocabulary).toHaveLength(2);
      expect(vocabulary.every(c => c.category === 'vocabulary')).toBe(true);
    });

    it('returns all cards when category is not provided', () => {
      expect(filterCardsByCategory(mockCards, '')).toEqual(mockCards);
    });
  });

  describe('filterCardsByTags', () => {
    it('filters cards by tags', () => {
      const words = filterCardsByTags(mockCards, ['Word']);
      expect(words).toHaveLength(2);
      expect(words.every(c => c.tags.includes('Word'))).toBe(true);
    });

    it('returns all cards when "all" tag is selected', () => {
      expect(filterCardsByTags(mockCards, ['all'])).toEqual(mockCards);
    });

    it('returns all cards when no tags provided', () => {
      expect(filterCardsByTags(mockCards, [])).toEqual(mockCards);
      expect(filterCardsByTags(mockCards, null)).toEqual(mockCards);
    });

    it('returns cards that match any of the selected tags', () => {
      const filtered = filterCardsByTags(mockCards, ['Word', 'Numerals']);
      expect(filtered).toHaveLength(3);
    });
  });

  describe('getCardTypes', () => {
    it('returns unique card types', () => {
      const types = getCardTypes(mockCards);
      expect(types).toContain('word');
      expect(types).toContain('number');
      expect(types).toHaveLength(2);
    });

    it('returns empty array when no cards provided', () => {
      expect(getCardTypes([])).toEqual([]);
    });
  });

  describe('getCardCategories', () => {
    it('returns unique categories', () => {
      const categories = getCardCategories(mockCards);
      expect(categories).toContain('vocabulary');
      expect(categories).toContain('numbers');
      expect(categories).toHaveLength(2);
    });

    it('filters out null/undefined categories', () => {
      const cardsWithNull = [
        { id: '1', category: 'vocabulary' },
        { id: '2', category: null },
        { id: '3', category: undefined },
      ];
      const categories = getCardCategories(cardsWithNull);
      expect(categories).toEqual(['vocabulary']);
    });
  });

  describe('calculateStats', () => {
    it('calculates correct statistics', () => {
      const stats = calculateStats(mockCards, mockProgressMap);
      expect(stats.totalCards).toBe(3);
      expect(stats.totalProgress).toBe(2);
      expect(stats.totalReviews).toBe(2);
      expect(stats.cardsDue).toBeGreaterThan(0);
    });

    it('handles empty cards and progress', () => {
      const stats = calculateStats([], {});
      expect(stats.totalCards).toBe(0);
      expect(stats.totalProgress).toBe(0);
      expect(stats.totalReviews).toBe(0);
      expect(stats.cardsDue).toBe(0);
    });
  });
});

