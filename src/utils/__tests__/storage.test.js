import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadCards,
  saveCards,
  loadProgress,
  saveProgress,
  updateCardProgress,
  getCardProgress,
  migrateCardTags,
  mergeSeedData,
  exportData,
  importData
} from '../storage.js';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage mocks
    vi.clearAllMocks();
  });

  describe('loadCards', () => {
    it('returns empty array when localStorage is empty', () => {
      global.localStorage.getItem.mockReturnValue(null);
      expect(loadCards()).toEqual([]);
    });

    it('returns parsed cards from localStorage', () => {
      const cards = [{ id: '1', type: 'word', front: 'Test' }];
      global.localStorage.getItem.mockReturnValue(JSON.stringify(cards));
      expect(loadCards()).toEqual(cards);
    });

    it('returns empty array on parse error', () => {
      global.localStorage.getItem.mockReturnValue('invalid json');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(loadCards()).toEqual([]);
      consoleError.mockRestore();
    });
  });

  describe('saveCards', () => {
    it('saves cards to localStorage', () => {
      const cards = [{ id: '1', type: 'word' }];
      const result = saveCards(cards);
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'tibetan_flashcards_cards',
        JSON.stringify(cards)
      );
    });

    it('handles save errors gracefully', () => {
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = saveCards([]);
      expect(result).toBe(false);
      consoleError.mockRestore();
    });
  });

  describe('loadProgress', () => {
    it('returns empty object when localStorage is empty', () => {
      global.localStorage.getItem.mockReturnValue(null);
      expect(loadProgress()).toEqual({});
    });

    it('returns parsed progress from localStorage', () => {
      const progress = { card1: { reviewCount: 5 } };
      global.localStorage.getItem.mockReturnValue(JSON.stringify(progress));
      expect(loadProgress()).toEqual(progress);
    });
  });

  describe('saveProgress', () => {
    it('saves progress to localStorage', () => {
      const progress = { card1: { reviewCount: 5 } };
      const result = saveProgress(progress);
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'tibetan_flashcards_progress',
        JSON.stringify(progress)
      );
    });
  });

  describe('updateCardProgress', () => {
    it('updates progress for a specific card', () => {
      const existingProgress = { card1: { reviewCount: 1 } };
      global.localStorage.getItem.mockReturnValue(JSON.stringify(existingProgress));
      
      const newProgress = { reviewCount: 2 };
      const result = updateCardProgress('card1', newProgress);
      
      expect(result.card1).toEqual(newProgress);
      expect(global.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getCardProgress', () => {
    it('returns progress for specific card', () => {
      const progress = { card1: { reviewCount: 5 } };
      global.localStorage.getItem.mockReturnValue(JSON.stringify(progress));
      expect(getCardProgress('card1')).toEqual({ reviewCount: 5 });
    });

    it('returns null when card has no progress', () => {
      global.localStorage.getItem.mockReturnValue(JSON.stringify({}));
      expect(getCardProgress('card1')).toBeNull();
    });
  });

  describe('migrateCardTags', () => {
    it('adds Numerals tag to numeral cards', () => {
      const cards = [{ id: '1', type: 'number', subcategory: 'numerals' }];
      const migrated = migrateCardTags(cards);
      expect(migrated[0].tags).toEqual(['Numerals']);
    });

    it('preserves existing tags', () => {
      const cards = [{ id: '1', tags: ['Custom'] }];
      const migrated = migrateCardTags(cards);
      expect(migrated[0].tags).toEqual(['Custom']);
    });
  });

  describe('mergeSeedData', () => {
    it('merges seed cards with existing cards', () => {
      const seedCards = [{ id: 'seed1', type: 'word' }];
      const existingCards = [{ id: 'existing1', type: 'word' }];
      const merged = mergeSeedData(seedCards, existingCards);
      expect(merged).toHaveLength(2);
      expect(merged.find(c => c.id === 'seed1')).toBeDefined();
      expect(merged.find(c => c.id === 'existing1')).toBeDefined();
    });

    it('filters out duplicate cards by id', () => {
      const seedCards = [{ id: '1', type: 'word' }];
      const existingCards = [{ id: '1', type: 'word' }];
      const merged = mergeSeedData(seedCards, existingCards);
      expect(merged).toHaveLength(1);
    });
  });

  describe('exportData', () => {
    it('exports cards and progress', () => {
      const cards = [{ id: '1' }];
      const progress = { card1: {} };
      global.localStorage.getItem
        .mockReturnValueOnce(JSON.stringify(cards))
        .mockReturnValueOnce(JSON.stringify(progress));
      
      const exported = exportData();
      expect(exported.cards).toEqual(cards);
      expect(exported.progress).toEqual(progress);
      expect(exported.exportDate).toBeDefined();
    });
  });

  describe('importData', () => {
    it('imports cards and progress', () => {
      const data = {
        cards: [{ id: '1' }],
        progress: { card1: {} }
      };
      const result = importData(data);
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('handles import errors', () => {
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('Import failed');
      });
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // importData should handle errors gracefully
      const result = importData({ cards: [{ id: '1' }] });
      expect(typeof result).toBe('boolean');
      
      consoleError.mockRestore();
    });
  });
});

