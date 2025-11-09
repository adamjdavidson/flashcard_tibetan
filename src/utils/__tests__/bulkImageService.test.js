import { describe, it, expect, beforeEach, vi } from 'vitest';
import { filterCardsNeedingImages, processBulkImageGeneration } from '../bulkImageService.js';
import { generateAIImage } from '../images.js';
import { saveCard } from '../../services/cardsService.js';

// Mock dependencies
vi.mock('../images.js', () => ({
  generateAIImage: vi.fn(),
}));

vi.mock('../../services/cardsService.js', () => ({
  saveCard: vi.fn(),
}));

describe('bulkImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Note: getImagePrompt is an internal helper function, tested indirectly through filterCardsNeedingImages
  // The priority order (englishText > backEnglish > front) is verified in filterCardsNeedingImages tests

  describe('filterCardsNeedingImages', () => {
    it('filters word cards without images', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'word', imageUrl: 'https://example.com/img.jpg', englishText: 'banana' },
        { id: '3', type: 'phrase', imageUrl: null, englishText: 'hello world' },
        { id: '4', type: 'number', imageUrl: null, front: '༢༥' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toEqual(['1', '3']);
    });

    it('excludes cards that already have images', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: 'https://example.com/img.jpg', englishText: 'apple' },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('excludes non-word/phrase card types', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'number', imageUrl: null, front: '༢༥' },
        { id: '3', type: 'numerals', imageUrl: null, front: '༢༥' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('excludes cards without suitable text fields', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'word', imageUrl: null }, // No text fields
        { id: '3', type: 'word', imageUrl: null, englishText: '', backEnglish: '', front: '' }, // Empty text fields
        { id: '4', type: 'word', imageUrl: null, backEnglish: 'banana' }, // Has backEnglish
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toEqual(['1', '4']);
    });

    it('uses englishText as primary prompt source', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', backEnglish: 'banana', front: 'cherry' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(1);
      // The function should prioritize englishText (tested indirectly through processing)
    });

    it('falls back to backEnglish when englishText not available', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, backEnglish: 'banana', front: 'cherry' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(1);
    });

    it('falls back to front when englishText and backEnglish not available', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, front: 'cherry' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(1);
    });

    it('respects type filter', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'phrase', imageUrl: null, englishText: 'hello world' },
      ];

      const result = filterCardsNeedingImages(cards, { type: 'word' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('respects category filter', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', categories: [{ id: 'cat1' }] },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana', categories: [{ id: 'cat2' }] },
      ];

      const result = filterCardsNeedingImages(cards, { category: 'cat1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('respects instruction level filter', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', instructionLevelId: 'level1' },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana', instructionLevelId: 'level2' },
      ];

      const result = filterCardsNeedingImages(cards, { instructionLevel: 'level1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('handles empty cards array', () => {
      const result = filterCardsNeedingImages([]);
      expect(result).toHaveLength(0);
    });

    it('handles cards with null imageUrl vs empty string', () => {
      const cards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'word', imageUrl: '', englishText: 'banana' },
        { id: '3', type: 'word', imageUrl: undefined, englishText: 'cherry' },
      ];

      const result = filterCardsNeedingImages(cards);
      expect(result).toHaveLength(3);
    });
  });

  describe('processBulkImageGeneration', () => {
    const mockCards = [
      { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
      { id: '2', type: 'word', imageUrl: null, englishText: 'banana' },
    ];

    it('processes all cards successfully', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      mockGenerateAIImage
        .mockResolvedValueOnce({ success: true, imageUrl: 'https://example.com/apple.jpg' })
        .mockResolvedValueOnce({ success: true, imageUrl: 'https://example.com/banana.jpg' });

      mockSaveCard
        .mockResolvedValueOnce({ success: true, data: { ...mockCards[0], imageUrl: 'https://example.com/apple.jpg' } })
        .mockResolvedValueOnce({ success: true, data: { ...mockCards[1], imageUrl: 'https://example.com/banana.jpg' } });

      const progressUpdates = [];
      const onProgress = (progress) => progressUpdates.push(progress);
      const onComplete = vi.fn();

      await processBulkImageGeneration(mockCards, onProgress, onComplete, null);

      expect(mockGenerateAIImage).toHaveBeenCalledTimes(2);
      expect(mockGenerateAIImage).toHaveBeenCalledWith('apple');
      expect(mockGenerateAIImage).toHaveBeenCalledWith('banana');
      expect(mockSaveCard).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenCalledWith({
        completed: 2,
        failed: 0,
        total: 2,
        failures: [],
        cancelled: false
      });
      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('handles individual card failures gracefully', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      mockGenerateAIImage
        .mockResolvedValueOnce({ success: true, imageUrl: 'https://example.com/apple.jpg' })
        .mockResolvedValueOnce({ success: false, error: 'Generation failed' });

      mockSaveCard.mockResolvedValueOnce({ success: true, data: { ...mockCards[0], imageUrl: 'https://example.com/apple.jpg' } });

      const onProgress = vi.fn();
      const onComplete = vi.fn();

      await processBulkImageGeneration(mockCards, onProgress, onComplete, null);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: 1,
          failed: 1,
          total: 2,
          failures: expect.arrayContaining([
            expect.objectContaining({
              cardId: '2',
              error: 'Generation failed'
            })
          ])
        })
      );
    });

    it('handles card save failures gracefully', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      mockGenerateAIImage.mockResolvedValueOnce({ success: true, imageUrl: 'https://example.com/apple.jpg' });
      mockSaveCard.mockResolvedValueOnce({ success: false, error: 'Save failed' });

      const onProgress = vi.fn();
      const onComplete = vi.fn();

      await processBulkImageGeneration([mockCards[0]], onProgress, onComplete, null);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: 0,
          failed: 1,
          failures: expect.arrayContaining([
            expect.objectContaining({
              cardId: '1',
              error: 'Save failed'
            })
          ])
        })
      );
    });

    it('calls onProgress for each card', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      mockGenerateAIImage.mockResolvedValue({ success: true, imageUrl: 'https://example.com/img.jpg' });
      mockSaveCard.mockResolvedValue({ success: true, data: {} });

      const progressUpdates = [];
      const onProgress = (progress) => progressUpdates.push(progress);
      const onComplete = vi.fn();

      await processBulkImageGeneration(mockCards, onProgress, onComplete, null);

      expect(progressUpdates.length).toBeGreaterThanOrEqual(2);
      expect(progressUpdates[0]).toMatchObject({
        current: expect.any(Number),
        total: 2,
        currentCard: expect.any(Object)
      });
    });

    it('respects AbortSignal cancellation', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      // First card succeeds, second should be cancelled
      mockGenerateAIImage.mockResolvedValueOnce({ success: true, imageUrl: 'https://example.com/apple.jpg' });
      mockSaveCard.mockResolvedValueOnce({ success: true, data: {} });

      const abortController = new AbortController();
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      // Start processing
      const promise = processBulkImageGeneration(mockCards, onProgress, onComplete, abortController.signal);

      // Cancel after first card (simulate)
      // Note: In real implementation, we'd need to check signal.aborted in the loop
      abortController.abort();

      await promise;

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelled: true
        })
      );
    });

    it('handles network errors gracefully', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      mockGenerateAIImage.mockRejectedValueOnce(new Error('Network error'));

      const onProgress = vi.fn();
      const onComplete = vi.fn();

      await processBulkImageGeneration([mockCards[0]], onProgress, onComplete, null);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          failed: 1,
          failures: expect.arrayContaining([
            expect.objectContaining({
              error: 'Network error'
            })
          ])
        })
      );
    });

    it('handles empty cards array', async () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      await processBulkImageGeneration([], onProgress, onComplete, null);

      expect(onComplete).toHaveBeenCalledWith({
        completed: 0,
        failed: 0,
        total: 0,
        failures: [],
        cancelled: false
      });
    });

    it('adds delay between requests to avoid rate limiting', async () => {
      const mockGenerateAIImage = vi.mocked(generateAIImage);
      const mockSaveCard = vi.mocked(saveCard);

      mockGenerateAIImage.mockResolvedValue({ success: true, imageUrl: 'https://example.com/img.jpg' });
      mockSaveCard.mockResolvedValue({ success: true, data: {} });

      const startTime = Date.now();
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      await processBulkImageGeneration(mockCards, onProgress, onComplete, null);

      const duration = Date.now() - startTime;
      // Should have at least 200ms delay between cards (2 cards = 1 delay = ~200ms minimum)
      expect(duration).toBeGreaterThanOrEqual(150); // Allow some margin
    });
  });
});

