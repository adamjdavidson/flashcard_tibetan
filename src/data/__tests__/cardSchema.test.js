import { describe, it, expect } from 'vitest';
import { createCard, validateCard } from '../cardSchema.js';

describe('cardSchema', () => {
  describe('createCard', () => {
    it('creates a word card with default tags', () => {
      const card = createCard({
        type: 'word',
        front: 'ཞབས་ཏོག',
        backEnglish: 'service',
        backTibetanScript: 'ཞབས་ཏོག'
      });
      
      expect(card.type).toBe('word');
      expect(card.tags).toEqual(['Word']);
      expect(card.front).toBe('ཞབས་ཏོག');
      expect(card.backEnglish).toBe('service');
      expect(card.id).toBeDefined();
    });

    it('creates a number card with Numerals tag', () => {
      const card = createCard({
        type: 'number',
        subcategory: 'numerals',
        front: '༢༥',
        backArabic: '25',
        backTibetanNumeral: '༢༥'
      });
      
      expect(card.type).toBe('number');
      expect(card.tags).toEqual(['Numerals']);
      expect(card.subcategory).toBe('numerals');
    });

    it('preserves existing tags', () => {
      const card = createCard({
        type: 'word',
        tags: ['Custom']
      });
      expect(card.tags).toEqual(['Custom']);
    });

    it('generates unique ID when not provided', () => {
      const card1 = createCard({ type: 'word', front: 'Test1' });
      const card2 = createCard({ type: 'word', front: 'Test2' });
      expect(card1.id).not.toBe(card2.id);
    });

    it('preserves provided ID', () => {
      const card = createCard({ id: 'custom-id', type: 'word', front: 'Test' });
      expect(card.id).toBe('custom-id');
    });
  });

  describe('validateCard', () => {
    it('validates a valid word card', () => {
      const card = {
        type: 'word',
        front: 'ཞབས་ཏོག',
        backEnglish: 'service',
        backTibetanScript: 'ཞབས་ཏོག'
      };
      expect(validateCard(card)).toBe(true);
    });

    it('validates a valid number card', () => {
      const card = {
        type: 'number',
        front: '༢༥',
        backArabic: '25',
        backTibetanNumeral: '༢༥'
      };
      expect(validateCard(card)).toBe(true);
    });

    it('rejects word card without front or new bidirectional fields', () => {
      // Word card needs either front/backEnglish OR tibetanText/englishText
      const card = { type: 'word' };
      expect(validateCard(card)).toBe(false);
    });

    it('accepts word card with new bidirectional fields (no front)', () => {
      // Word card can use new bidirectional fields instead of front
      const card = { type: 'word', tibetanText: 'ཞབས་ཏོག', englishText: 'service' };
      expect(validateCard(card)).toBe(true);
    });

    it('rejects number card without front', () => {
      // Number cards still require front
      const card = { type: 'number', backArabic: '25' };
      expect(validateCard(card)).toBe(false);
    });

    it('rejects word card without backEnglish', () => {
      const card = {
        type: 'word',
        front: 'test',
        backTibetanScript: 'test'
      };
      expect(validateCard(card)).toBe(false);
    });

    it('accepts word card without backTibetanScript (now optional)', () => {
      const card = {
        type: 'word',
        front: 'test',
        backEnglish: 'test'
        // backTibetanScript is optional - translation tool populates it
      };
      expect(validateCard(card)).toBe(true);
    });

    it('rejects number card without backArabic', () => {
      const card = {
        type: 'number',
        front: '༢༥',
        backTibetanNumeral: '༢༥'
      };
      expect(validateCard(card)).toBe(false);
    });

    it('rejects number card without backTibetanScript or backTibetanNumeral', () => {
      const card = {
        type: 'number',
        front: '༢༥',
        backArabic: '25'
      };
      expect(validateCard(card)).toBe(false);
    });

    it('rejects invalid card type', () => {
      const card = {
        type: 'invalid',
        front: 'test'
      };
      expect(validateCard(card)).toBe(false);
    });

    it('accepts number card with backTibetanScript (script cards)', () => {
      const card = {
        type: 'number',
        front: 'ཉི་ཤུ་རྩ་ལྔ',
        backArabic: '25',
        backTibetanScript: 'ཉི་ཤུ་རྩ་ལྔ'
      };
      expect(validateCard(card)).toBe(true);
    });

    it('accepts number card with backTibetanNumeral (numeral cards)', () => {
      const card = {
        type: 'number',
        front: '༢༥',
        backArabic: '25',
        backTibetanNumeral: '༢༥'
      };
      expect(validateCard(card)).toBe(true);
    });
  });
});

