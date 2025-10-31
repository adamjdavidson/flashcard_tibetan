/**
 * Translation API client
 * Handles calls to the translation API endpoint
 */

const CACHE_KEY = 'translation_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory cache
let translationCache = null;

/**
 * Initialize cache from localStorage
 */
function initCache() {
  if (translationCache === null) {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      translationCache = stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading translation cache:', error);
      translationCache = {};
    }
  }
}

/**
 * Save cache to localStorage
 */
function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
  } catch (error) {
    console.error('Error saving translation cache:', error);
  }
}

/**
 * Get cache key from parameters
 */
function getCacheKey(text, fromLang, toLang) {
  return `${fromLang}_${toLang}_${text.toLowerCase().trim()}`;
}

/**
 * Check if cached translation is still valid
 */
function isCacheValid(cachedItem) {
  if (!cachedItem || !cachedItem.timestamp) {
    return false;
  }
  const age = Date.now() - cachedItem.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Translate text from one language to another
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code (default: 'en')
 * @param {string} toLang - Target language code (default: 'bo' for Tibetan)
 * @returns {Promise<{success: boolean, translated?: string, pronunciation?: string, error?: string}>}
 */
export async function translateText(text, fromLang = 'en', toLang = 'bo') {
  if (!text || !text.trim()) {
    return { success: false, error: 'Text is required' };
  }

  initCache();
  const cacheKey = getCacheKey(text, fromLang, toLang);

  // Check cache first
  const cached = translationCache[cacheKey];
  if (isCacheValid(cached)) {
    return { 
      success: true, 
      translated: cached.translated, 
      pronunciation: cached.pronunciation 
    };
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.trim(),
        fromLang,
        toLang
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: Translation failed` }));
      console.error('Translation API error:', response.status, errorData);
      return { success: false, error: errorData.error || `Translation failed (HTTP ${response.status})` };
    }

    const data = await response.json();

    // Cache the result
    translationCache[cacheKey] = {
      translated: data.translated,
      pronunciation: data.pronunciation,
      timestamp: Date.now()
    };
    saveCache();

    return { 
      success: true, 
      translated: data.translated, 
      pronunciation: data.pronunciation 
    };
  } catch (error) {
    console.error('Error translating text:', error);
    // Check if it's a network error (API route not found)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return { 
        success: false, 
        error: 'API route not found. For local development, please run: npm install -g vercel && vercel dev' 
      };
    }
    return { success: false, error: error.message || 'Translation request failed' };
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache() {
  translationCache = {};
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing translation cache:', error);
  }
}

