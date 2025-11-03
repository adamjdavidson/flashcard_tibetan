/**
 * Tibetan Text Utilities
 * Helper functions for detecting and working with Tibetan text
 */

/**
 * Check if a string contains Tibetan Unicode characters
 * Tibetan Unicode range: U+0F00 to U+0FFF
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains Tibetan characters
 */
export function containsTibetan(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Tibetan Unicode block: U+0F00 to U+0FFF
  // This includes Tibetan letters, numbers, and punctuation
  return /[\u0F00-\u0FFF]/.test(text);
}

/**
 * Check if a string contains ONLY Tibetan characters (no English/Latin)
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains only Tibetan characters
 */
export function isOnlyTibetan(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Remove Tibetan characters and check if anything remains
  const withoutTibetan = text.replace(/[\u0F00-\u0FFF]/g, '').trim();
  return withoutTibetan.length === 0;
}

