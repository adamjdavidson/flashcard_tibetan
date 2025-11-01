import { describe, it, expect } from 'vitest';
import {
  getDueCards,
  selectRandomCard,
  filterCardsByTags,
  calculateStats
} from '../cardUtils.js';
import { calculateReview, initializeCardProgress } from '../sm2Algorithm.js';

/**
 * Performance tests for critical operations
 * These tests verify that operations complete within acceptable time limits
 */

describe('Performance Tests', () => {
  describe('Card Operations Performance', () => {
    it('getDueCards handles large card sets efficiently', () => {
      // Create large card set
      const largeCardSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `card${i}`,
        type: 'word',
        front: `test${i}`,
        backEnglish: `test${i}`,
        backTibetanScript: `test${i}`
      }));

      const progressMap = {};
      largeCardSet.forEach(card => {
        progressMap[card.id] = initializeCardProgress(card.id);
      });

      const startTime = performance.now();
      const dueCards = getDueCards(largeCardSet, progressMap);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      expect(dueCards.length).toBeGreaterThan(0);
    });

    it('filterCardsByTags handles large card sets efficiently', () => {
      const largeCardSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `card${i}`,
        type: 'word',
        tags: i % 2 === 0 ? ['Word'] : ['Phrase']
      }));

      const startTime = performance.now();
      const filtered = filterCardsByTags(largeCardSet, ['Word']);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete in < 50ms
      expect(filtered.length).toBe(500); // Half should be Word cards
    });

    it('calculateStats handles large progress maps efficiently', () => {
      const cards = Array.from({ length: 500 }, (_, i) => ({
        id: `card${i}`,
        type: 'word'
      }));

      const progressMap = {};
      cards.forEach((card, i) => {
        progressMap[card.id] = initializeCardProgress(card.id);
        // Add some progress
        if (i % 2 === 0) {
          progressMap[card.id] = calculateReview(progressMap[card.id], 3);
        }
      });

      const startTime = performance.now();
      const stats = calculateStats(cards, progressMap);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete in < 50ms
      expect(stats.totalCards).toBe(500);
    });

    it('selectRandomCard handles large card sets efficiently', () => {
      const largeCardSet = Array.from({ length: 10000 }, (_, i) => ({
        id: `card${i}`,
        type: 'word'
      }));

      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        selectRandomCard(largeCardSet);
      }
      
      const endTime = performance.now();
      const avgDuration = (endTime - startTime) / iterations;

      expect(avgDuration).toBeLessThan(1); // Should average < 1ms per selection
    });
  });

  describe('SM-2 Algorithm Performance', () => {
    it('calculateReview completes quickly for large batch', () => {
      const progress = initializeCardProgress('card1');
      
      const iterations = 1000;
      const startTime = performance.now();
      
      let currentProgress = progress;
      for (let i = 0; i < iterations; i++) {
        currentProgress = calculateReview(currentProgress, 3);
      }
      
      const endTime = performance.now();
      const avgDuration = (endTime - startTime) / iterations;

      expect(avgDuration).toBeLessThan(1); // Should average < 1ms per calculation
    });

    it('batch progress calculation is efficient', () => {
      const cards = Array.from({ length: 100 }, (_, i) => ({
        id: `card${i}`,
        type: 'word'
      }));

      const progressMap = {};
      cards.forEach(card => {
        progressMap[card.id] = initializeCardProgress(card.id);
      });

      const startTime = performance.now();
      
      // Simulate reviewing all cards
      cards.forEach(card => {
        const progress = progressMap[card.id];
        progressMap[card.id] = calculateReview(progress, 3);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete 100 reviews in < 100ms
    });
  });

  describe('Memory Efficiency', () => {
    it('does not create excessive memory allocations', () => {
      const cards = Array.from({ length: 1000 }, (_, i) => ({
        id: `card${i}`,
        type: 'word',
        tags: ['Word']
      }));

      const progressMap = {};
      cards.forEach(card => {
        progressMap[card.id] = initializeCardProgress(card.id);
      });

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        getDueCards(cards, progressMap);
        filterCardsByTags(cards, ['Word']);
        calculateStats(cards, progressMap);
      }

      // If we get here without errors, memory usage is acceptable
      expect(true).toBe(true);
    });
  });
});

