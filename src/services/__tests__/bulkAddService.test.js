import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkDuplicates, processBulkAdd } from '../bulkAddService.js';
import { loadCards, saveCards } from '../cardsService.js';
import { loadCategories, createCategory } from '../categoriesService.js';
import { translateText } from '../../utils/translation.js';
import { generateAIImage } from '../../utils/images.js';
import { createCard } from '../../data/cardSchema.js';

// Mock dependencies
vi.mock('../cardsService.js');
vi.mock('../categoriesService.js');
vi.mock('../../utils/translation.js');
vi.mock('../../utils/images.js');
vi.mock('../../data/cardSchema.js');

describe('bulkAddService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkDuplicates', () => {
    it('should identify duplicate words case-insensitively', async () => {
      const existingCards = [
        { id: '1', englishText: 'apple', type: 'word' },
        { id: '2', englishText: 'banana', type: 'word' }
      ];
      
      loadCards.mockResolvedValue(existingCards);
      
      const words = ['Apple', 'BANANA', 'cherry'];
      const result = await checkDuplicates(words);
      
      expect(result.duplicates).toEqual(['Apple', 'BANANA']);
      expect(result.newWords).toEqual(['cherry']);
    });

    it('should trim whitespace when checking duplicates', async () => {
      const existingCards = [
        { id: '1', englishText: 'apple', type: 'word' }
      ];
      
      loadCards.mockResolvedValue(existingCards);
      
      const words = ['  apple  ', 'banana'];
      const result = await checkDuplicates(words);
      
      expect(result.duplicates).toEqual(['  apple  ']);
      expect(result.newWords).toEqual(['banana']);
    });

    it('should return empty duplicates when no matches found', async () => {
      loadCards.mockResolvedValue([]);
      
      const words = ['apple', 'banana', 'cherry'];
      const result = await checkDuplicates(words);
      
      expect(result.duplicates).toEqual([]);
      expect(result.newWords).toEqual(words);
    });

    it('should handle empty word list', async () => {
      loadCards.mockResolvedValue([]);
      
      const words = [];
      const result = await checkDuplicates(words);
      
      expect(result.duplicates).toEqual([]);
      expect(result.newWords).toEqual([]);
    });
  });

  describe('processBulkAdd', () => {
    it('should create cards for new words with shared metadata', async () => {
      // Setup mocks
      loadCards.mockResolvedValue([]); // No existing cards
      loadCategories.mockResolvedValue([
        { id: 'cat_1', name: 'test' },
        { id: 'cat_new', name: 'new' }
      ]);
      
      // Mock createCard to return card objects
      const mockCard1 = { id: 'card_1', englishText: 'apple', type: 'word', categoryIds: ['cat_1', 'cat_new'] };
      const mockCard2 = { id: 'card_2', englishText: 'banana', type: 'word', categoryIds: ['cat_1', 'cat_new'] };
      createCard.mockReturnValueOnce(mockCard1).mockReturnValueOnce(mockCard2);
      
      saveCards.mockResolvedValue({ success: true, data: [mockCard1, mockCard2] });
      
      const request = {
        words: ['apple', 'banana'],
        cardType: 'word',
        categoryIds: ['cat_1'],
        instructionLevelId: 'level_1'
      };

      const result = await processBulkAdd(request);

      expect(result.cardsCreated).toBe(2);
      expect(result.duplicatesSkipped).toBe(0);
      expect(result.totalWords).toBe(2);
      expect(saveCards).toHaveBeenCalled();
    });

    it('should skip duplicate words', async () => {
      const existingCards = [
        { id: '1', englishText: 'apple', type: 'word' }
      ];
      
      loadCards.mockResolvedValue(existingCards);
      loadCategories.mockResolvedValue([
        { id: 'cat_new', name: 'new' }
      ]);
      
      const mockCard = { id: 'card_1', englishText: 'banana', type: 'word', categoryIds: ['cat_new'] };
      createCard.mockReturnValue(mockCard);
      saveCards.mockResolvedValue({ success: true, data: [mockCard] });

      const request = {
        words: ['apple', 'banana'],
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      const result = await processBulkAdd(request);

      expect(result.cardsCreated).toBe(1);
      expect(result.duplicatesSkipped).toBe(1);
      expect(result.duplicateWords).toContain('apple');
    });

    it('should validate word count (minimum 2)', async () => {
      const request = {
        words: ['apple'],
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      await expect(processBulkAdd(request)).rejects.toThrow();
    });

    it('should validate word count (maximum 100)', async () => {
      const words = Array(101).fill('word');
      const request = {
        words,
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      await expect(processBulkAdd(request)).rejects.toThrow();
    });

    it('should trim whitespace and skip empty lines', async () => {
      loadCards.mockResolvedValue([]);
      loadCategories.mockResolvedValue([
        { id: 'cat_new', name: 'new' }
      ]);
      
      const mockCard1 = { id: 'card_1', englishText: 'apple', type: 'word', categoryIds: ['cat_new'] };
      const mockCard2 = { id: 'card_2', englishText: 'banana', type: 'word', categoryIds: ['cat_new'] };
      createCard.mockReturnValueOnce(mockCard1).mockReturnValueOnce(mockCard2);
      saveCards.mockResolvedValue({ success: true, data: [mockCard1, mockCard2] });

      const request = {
        words: ['  apple  ', '', '  ', 'banana'],
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      const result = await processBulkAdd(request);

      expect(result.totalWords).toBe(2); // Only 'apple' and 'banana' after trimming
      expect(result.cardsCreated).toBe(2);
    });

    it('should assign "new" category to all created cards', async () => {
      loadCards.mockResolvedValue([]);
      loadCategories.mockResolvedValue([
        { id: 'cat_new', name: 'new' }
      ]);
      
      const mockCard1 = { id: 'card_1', englishText: 'apple', type: 'word', categoryIds: ['cat_new'] };
      const mockCard2 = { id: 'card_2', englishText: 'banana', type: 'word', categoryIds: ['cat_new'] };
      createCard.mockReturnValueOnce(mockCard1).mockReturnValueOnce(mockCard2);
      saveCards.mockResolvedValue({ success: true, data: [mockCard1, mockCard2] });

      const request = {
        words: ['apple', 'banana'],
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      await processBulkAdd(request);

      // Verify saveCards was called with cards that include 'new' category
      expect(saveCards).toHaveBeenCalled();
      const savedCards = saveCards.mock.calls[0][0];
      savedCards.forEach(card => {
        expect(card.categoryIds).toContain('cat_new');
      });
    });

    it('should create "new" category if it does not exist', async () => {
      loadCards.mockResolvedValue([]);
      loadCategories.mockResolvedValue([]); // No categories exist
      createCategory.mockResolvedValue({
        success: true,
        data: { id: 'cat_new', name: 'new' }
      });
      
      const mockCard = { id: 'card_1', englishText: 'apple', type: 'word', categoryIds: ['cat_new'] };
      createCard.mockReturnValue(mockCard);
      saveCards.mockResolvedValue({ success: true, data: [mockCard] });

      const request = {
        words: ['apple', 'banana'], // Need at least 2 words
        cardType: 'word',
        categoryIds: [],
        instructionLevelId: null
      };

      await processBulkAdd(request);

      expect(createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'new' })
      );
    });
  });
});

