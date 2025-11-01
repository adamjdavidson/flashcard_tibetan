/**
 * Card data structure definition
 * Each card follows this schema
 */
export const CARD_SCHEMA = {
  id: 'string (unique identifier)',
  type: "'number' | 'word' | 'phrase'",
  category: 'string (optional)',
  front: 'Tibetan script (Unicode)',
  backEnglish: 'English translation',
  backTibetanSpelling: 'Romanized spelling (Wylie/phonetic)',
  notes: 'string (optional)',
  tags: 'array (optional)',
  imageUrl: 'string (optional) - URL to image',
  createdAt: 'timestamp'
};

/**
 * Creates a new card object
 */
export function createCard(data) {
  // Determine tag based on type
  let tags = data.tags || [];
  if (!tags.length) {
    if (data.type === 'numerals' || (data.type === 'number' && data.subcategory === 'numerals')) {
      tags = ['Numerals'];
    } else if (data.type === 'numbers' || (data.type === 'number' && data.subcategory === 'script')) {
      tags = ['Numbers'];
    } else if (data.type === 'word') {
      tags = ['Word'];
    } else if (data.type === 'phrase') {
      tags = ['Phrase'];
    }
  }

  // Map card type
  const cardType = (data.type === 'numerals' || data.type === 'numbers') ? 'number' : (data.type || 'word');

  return {
    id: data.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: cardType,
    front: data.front || '',
    backArabic: data.backArabic || null, // For number cards
    backEnglish: data.backEnglish || '',
    backTibetanScript: data.backTibetanScript || null, // For word cards (Tibetan translation)
    backTibetanNumeral: data.backTibetanNumeral || null, // For number cards (Tibetan numerals)
    backTibetanSpelling: data.backTibetanSpelling || '',
    notes: data.notes || null,
    tags: tags,
    subcategory: data.subcategory || (data.type === 'numerals' ? 'numerals' : data.type === 'numbers' ? 'script' : null),
    imageUrl: data.imageUrl || null, // URL to image
    createdAt: data.createdAt || Date.now()
  };
}

/**
 * Validates a card object
 */
export function validateCard(card) {
  if (!card.front) {
    return false;
  }
  // For number cards, need backArabic and either backTibetanScript or backTibetanNumeral
  // backTibetanSpelling is optional for all card types
  if (card.type === 'number') {
    if (!card.backArabic) {
      return false;
    }
    // Number cards should have either Tibetan script (for numeral cards) or Tibetan numerals (for script cards)
    if (!card.backTibetanScript && !card.backTibetanNumeral) {
      return false;
    }
  } else {
    // For word/phrase cards, need backEnglish and backTibetanScript
    // backTibetanSpelling is optional for word/phrase cards
    if (!card.backEnglish || !card.backTibetanScript) {
      return false;
    }
  }
  if (!['number', 'word', 'phrase'].includes(card.type)) {
    return false;
  }
  return true;
}

