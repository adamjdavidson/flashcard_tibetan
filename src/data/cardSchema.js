/**
 * Card data structure definition
 * Each card follows this schema
 */
export const CARD_SCHEMA = {
  id: 'string (unique identifier)',
  type: "'number' | 'word' | 'phrase'",
  category: 'string (optional)',
  // Legacy fields (for backward compatibility)
  front: 'Tibetan script (Unicode) - legacy, use tibetanText/englishText for word/phrase',
  backEnglish: 'English translation - legacy, use tibetanText/englishText for word/phrase',
  // New bidirectional fields (for word/phrase cards)
  tibetanText: 'string (optional) - Tibetan text content (word/phrase cards only)',
  englishText: 'string (optional) - English text content (word/phrase cards only)',
  backTibetanSpelling: 'Romanized spelling (Wylie/phonetic)',
  notes: 'string (optional)',
  tags: 'array (optional)',
  imageUrl: 'string (optional) - URL to image',
  audioUrl: 'string (optional) - URL to audio pronunciation file',
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
    // Legacy fields (for backward compatibility)
    front: data.front || '',
    backArabic: data.backArabic || null, // For number cards
    backEnglish: data.backEnglish || '',
    backTibetanScript: data.backTibetanScript || null, // For word cards (Tibetan translation)
    backTibetanNumeral: data.backTibetanNumeral || null, // For number cards (Tibetan numerals)
    // New bidirectional fields (for word/phrase cards)
    tibetanText: data.tibetanText || null,
    englishText: data.englishText || null,
    backTibetanSpelling: data.backTibetanSpelling || '',
    notes: data.notes || null,
    tags: tags,
    subcategory: data.subcategory || (data.type === 'numerals' ? 'numerals' : data.type === 'numbers' ? 'script' : null),
    imageUrl: data.imageUrl || null, // URL to image
    audioUrl: data.audioUrl || null, // URL to audio pronunciation file
    createdAt: data.createdAt || Date.now(),
    // Classification data (optional)
    categoryIds: data.categoryIds || [],
    instructionLevelId: data.instructionLevelId || data.instruction_level_id || null
  };
}

/**
 * Validates a card object (basic synchronous validation)
 */
export function validateCard(card) {
  // For number cards, need front (legacy)
  // For word/phrase cards, need either new fields OR legacy fields
  if (card.type === 'number') {
    if (!card.front) {
      return false;
    }
    if (!card.backArabic) {
      return false;
    }
    // Number cards should have either Tibetan script (for numeral cards) or Tibetan numerals (for script cards)
    if (!card.backTibetanScript && !card.backTibetanNumeral) {
      return false;
    }
  } else {
    // For word/phrase cards, need either new fields OR legacy fields (backward compatibility)
    // Prefer new bidirectional fields if available
    const hasTibetanText = card.tibetanText && card.tibetanText.trim();
    const hasEnglishText = card.englishText && card.englishText.trim();
    const hasLegacyFields = card.backEnglish && card.backEnglish.trim();
    
    // Must have English (new field OR legacy field)
    if (!hasEnglishText && !hasLegacyFields) {
      return false;
    }
    
    // Note: Tibetan text is optional - can be populated by translation tool
    // If using new fields, tibetanText can be added later
    // If using legacy fields, backTibetanScript can be added later
  }
  if (!['number', 'word', 'phrase'].includes(card.type)) {
    return false;
  }
  
  // Basic validation for classification data structure
  // Note: Actual existence validation is done async in services
  if (card.categoryIds && !Array.isArray(card.categoryIds)) {
    return false;
  }
  if (card.instructionLevelId && typeof card.instructionLevelId !== 'string') {
    return false;
  }
  
  // Audio URL validation (if provided)
  if (card.audioUrl) {
    // Must be valid HTTPS URL
    if (typeof card.audioUrl !== 'string' || !card.audioUrl.startsWith('https://')) {
      return false;
    }
    
    // Should reference Supabase Storage card-audio bucket (optional validation)
    if (!card.audioUrl.includes('/storage/v1/object/public/card-audio/')) {
      console.warn('Audio URL does not appear to be from card-audio bucket');
    }
  }
  
  return true;
}

/**
 * Async validation helper - validates that instruction level and categories exist
 * This should be called before saving cards to ensure classification data is valid
 */
export async function validateCardClassification(card, loadInstructionLevels, loadCategories) {
  const errors = [];
  
  // Validate instruction level exists if provided
  if (card.instructionLevelId) {
    try {
      const levels = await loadInstructionLevels();
      const levelExists = levels.some(level => level.id === card.instructionLevelId);
      if (!levelExists) {
        errors.push(`Instruction level with ID ${card.instructionLevelId} does not exist`);
      }
    } catch (err) {
      errors.push(`Failed to validate instruction level: ${err.message}`);
    }
  }
  
  // Validate categories exist if provided
  if (card.categoryIds && card.categoryIds.length > 0) {
    try {
      const categories = await loadCategories();
      const categoryIds = categories.map(cat => cat.id);
      const invalidCategories = card.categoryIds.filter(id => !categoryIds.includes(id));
      if (invalidCategories.length > 0) {
        errors.push(`Categories with IDs ${invalidCategories.join(', ')} do not exist`);
      }
    } catch (err) {
      errors.push(`Failed to validate categories: ${err.message}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get Tibetan text from card (with fallback to legacy fields)
 * @param {Object} card - Card object
 * @returns {string|null} Tibetan text or null
 */
export function getTibetanText(card) {
  if (!card) return null;
  
  // For word/phrase cards, prefer new bidirectional field
  if (card.type === 'word' || card.type === 'phrase') {
    if (card.tibetanText && card.tibetanText.trim()) {
      return card.tibetanText.trim();
    }
    // Fallback to legacy fields
    if (card.subcategory === 'english_to_tibetan') {
      return card.backTibetanScript || null;
    }
    if (card.subcategory === 'tibetan_to_english') {
      return card.front || null;
    }
    // Try to detect: if front contains Tibetan, use it; otherwise use backTibetanScript
    const containsTibetan = /[\u0F00-\u0FFF]/.test(card.front || '');
    return containsTibetan ? (card.front || null) : (card.backTibetanScript || null);
  }
  
  // For number cards, use legacy structure
  return card.front || card.backTibetanScript || card.backTibetanNumeral || null;
}

/**
 * Get English text from card (with fallback to legacy fields)
 * @param {Object} card - Card object
 * @returns {string|null} English text or null
 */
export function getEnglishText(card) {
  if (!card) return null;
  
  // For word/phrase cards, prefer new bidirectional field
  if (card.type === 'word' || card.type === 'phrase') {
    if (card.englishText && card.englishText.trim()) {
      return card.englishText.trim();
    }
    // Fallback to legacy fields
    if (card.subcategory === 'english_to_tibetan') {
      return card.front || card.backEnglish || null;
    }
    if (card.subcategory === 'tibetan_to_english') {
      return card.backEnglish || null;
    }
    // Try to detect: if front contains English (no Tibetan), use it; otherwise use backEnglish
    const containsTibetan = /[\u0F00-\u0FFF]/.test(card.front || '');
    return containsTibetan ? (card.backEnglish || null) : (card.front || card.backEnglish || null);
  }
  
  // For number cards, use legacy structure
  return card.backEnglish || null;
}

/**
 * Ensure card has bidirectional fields populated (from legacy fields if needed)
 * @param {Object} card - Card object
 * @returns {Object} Card with bidirectional fields populated
 */
export function ensureBidirectionalFields(card) {
  if (!card) return card;
  
  // Only for word/phrase cards
  if (card.type !== 'word' && card.type !== 'phrase') {
    return card;
  }
  
  // If already has new fields, return as-is
  if (card.tibetanText && card.englishText) {
    return card;
  }
  
  // Populate from legacy fields
  const tibetanText = getTibetanText(card);
  const englishText = getEnglishText(card);
  
  return {
    ...card,
    tibetanText: tibetanText || card.tibetanText || null,
    englishText: englishText || card.englishText || null
  };
}

