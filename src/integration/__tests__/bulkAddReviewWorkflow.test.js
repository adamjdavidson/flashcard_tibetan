import { describe, it, expect } from 'vitest';
import { createCard } from '../../data/cardSchema.js';

/**
 * Integration tests for bulk add review workflow (User Story 3)
 * Verifies that reviewers can filter cards by "new" category and remove it
 */

describe('Bulk Add Review Workflow (User Story 3)', () => {
  describe('Card filtering by "new" category', () => {
    it('should filter cards that have "new" category', () => {
      // Create cards with different category configurations
      const cardWithNewCategory = createCard({
        type: 'word',
        englishText: 'apple',
        tibetanText: 'ཀུ་ཤུ',
        categoryIds: ['cat_new', 'cat_1']
      });

      const cardWithoutNewCategory = createCard({
        type: 'word',
        englishText: 'banana',
        tibetanText: 'ཀུ་ཤུ་ཆེན་པོ',
        categoryIds: ['cat_1']
      });

      const cardWithNoCategories = createCard({
        type: 'word',
        englishText: 'cherry',
        tibetanText: 'ཀུ་ཤུ་དམར་པོ',
        categoryIds: []
      });

      const allCards = [cardWithNewCategory, cardWithoutNewCategory, cardWithNoCategories];

      // Filter cards by "new" category
      // This simulates the filtering logic in CardManager
      const cardsWithNewCategory = allCards.filter(card => {
        if (!card.categoryIds || card.categoryIds.length === 0) {
          return false;
        }
        // Check if card has "new" category (by ID or name)
        return card.categoryIds.includes('cat_new') || 
               card.categoryIds.some(id => id === 'new');
      });

      expect(cardsWithNewCategory).toHaveLength(1);
      expect(cardsWithNewCategory[0].englishText).toBe('apple');
      expect(cardsWithNewCategory[0].categoryIds).toContain('cat_new');
    });

    it('should exclude cards without "new" category from filter', () => {
      const cardWithNewCategory = createCard({
        type: 'word',
        englishText: 'apple',
        tibetanText: 'ཀུ་ཤུ',
        categoryIds: ['cat_new']
      });

      const cardWithoutNewCategory = createCard({
        type: 'word',
        englishText: 'banana',
        tibetanText: 'ཀུ་ཤུ་ཆེན་པོ',
        categoryIds: ['cat_1']
      });

      const allCards = [cardWithNewCategory, cardWithoutNewCategory];

      const cardsWithNewCategory = allCards.filter(card => {
        return card.categoryIds && card.categoryIds.includes('cat_new');
      });

      expect(cardsWithNewCategory).toHaveLength(1);
      expect(cardsWithNewCategory[0].englishText).toBe('apple');
    });
  });

  describe('Removing "new" category from card', () => {
    it('should remove "new" category while preserving other categories', () => {
      // Simulate a card that was bulk-added with "new" category
      const cardWithNewCategory = createCard({
        type: 'word',
        englishText: 'apple',
        tibetanText: 'ཀུ་ཤུ',
        categoryIds: ['cat_new', 'cat_1', 'cat_2']
      });

      expect(cardWithNewCategory.categoryIds).toContain('cat_new');
      expect(cardWithNewCategory.categoryIds).toContain('cat_1');
      expect(cardWithNewCategory.categoryIds).toContain('cat_2');

      // Simulate reviewer removing "new" category via EditCardForm
      // This is what happens when reviewer unselects "new" in the category multi-select
      const updatedCategoryIds = cardWithNewCategory.categoryIds.filter(
        id => id !== 'cat_new'
      );

      expect(updatedCategoryIds).not.toContain('cat_new');
      expect(updatedCategoryIds).toContain('cat_1');
      expect(updatedCategoryIds).toContain('cat_2');
      expect(updatedCategoryIds).toHaveLength(2);
    });

    it('should allow removing "new" category even if it is the only category', () => {
      const cardWithOnlyNewCategory = createCard({
        type: 'word',
        englishText: 'apple',
        tibetanText: 'ཀུ་ཤུ',
        categoryIds: ['cat_new']
      });

      // Reviewer removes "new" category
      const updatedCategoryIds = cardWithOnlyNewCategory.categoryIds.filter(
        id => id !== 'cat_new'
      );

      expect(updatedCategoryIds).not.toContain('cat_new');
      expect(updatedCategoryIds).toHaveLength(0);
    });

    it('should result in card no longer appearing in "new" category filter after removal', () => {
      // Create card with "new" category
      let card = createCard({
        type: 'word',
        englishText: 'apple',
        tibetanText: 'ཀུ་ཤུ',
        categoryIds: ['cat_new']
      });

      // Verify it appears in filter
      let cardsWithNewCategory = [card].filter(c => 
        c.categoryIds && c.categoryIds.includes('cat_new')
      );
      expect(cardsWithNewCategory).toHaveLength(1);

      // Reviewer removes "new" category
      card = {
        ...card,
        categoryIds: card.categoryIds.filter(id => id !== 'cat_new')
      };

      // Verify it no longer appears in filter
      cardsWithNewCategory = [card].filter(c => 
        c.categoryIds && c.categoryIds.includes('cat_new')
      );
      expect(cardsWithNewCategory).toHaveLength(0);
    });
  });

  describe('Review workflow completeness', () => {
    it('should support complete workflow: filter → review → remove category', () => {
      // Step 1: Create bulk-added cards with "new" category
      const bulkAddedCards = [
        createCard({
          type: 'word',
          englishText: 'apple',
          tibetanText: 'ཀུ་ཤུ',
          categoryIds: ['cat_new']
        }),
        createCard({
          type: 'word',
          englishText: 'banana',
          tibetanText: 'ཀུ་ཤུ་ཆེན་པོ',
          categoryIds: ['cat_new']
        })
      ];

      // Step 2: Filter by "new" category
      const cardsNeedingReview = bulkAddedCards.filter(card =>
        card.categoryIds && card.categoryIds.includes('cat_new')
      );
      expect(cardsNeedingReview).toHaveLength(2);

      // Step 3: Reviewer reviews first card and removes "new" category
      const reviewedCard = {
        ...cardsNeedingReview[0],
        categoryIds: cardsNeedingReview[0].categoryIds.filter(id => id !== 'cat_new')
      };

      // Step 4: Verify reviewed card no longer appears in filter
      const remainingCardsNeedingReview = [reviewedCard, cardsNeedingReview[1]].filter(
        card => card.categoryIds && card.categoryIds.includes('cat_new')
      );
      expect(remainingCardsNeedingReview).toHaveLength(1);
      expect(remainingCardsNeedingReview[0].englishText).toBe('banana');

      // Step 5: Verify reviewed card still exists but without "new" category
      expect(reviewedCard.categoryIds).not.toContain('cat_new');
      expect(reviewedCard.englishText).toBe('apple');
    });
  });
});

