/**
 * Translation API endpoint
 * Vercel serverless function
 * Translates text using configured translation service
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, fromLang = 'en', toLang = 'bo' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get translation service configuration
    const service = process.env.TRANSLATION_SERVICE || 'google';
    const apiKey = process.env.TRANSLATION_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Translation API key not configured. Please set TRANSLATION_API_KEY or GOOGLE_TRANSLATE_API_KEY environment variable.' 
      });
    }

    // Call appropriate translation service
    let translated = '';
    let pronunciation = '';

    if (service === 'google' || service === 'google-translate' || !service) {
      // Google Translate API (default - supports Tibetan)
      const result = await translateWithGoogle(apiKey, text, fromLang, toLang);
      translated = result.translated;
      pronunciation = result.pronunciation || '';
    } else if (service === 'deepl') {
      // DeepL API (does NOT support Tibetan)
      return res.status(400).json({ 
        error: 'DeepL does not support Tibetan. Please use Google Translate.' 
      });
    } else {
      // Default: Google Translate
      const result = await translateWithGoogle(apiKey, text, fromLang, toLang);
      translated = result.translated;
      pronunciation = result.pronunciation || '';
    }

    return res.status(200).json({
      translated,
      pronunciation
    });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Translation failed' 
    });
  }
}

/**
 * Translate using Google Translate API v2
 * Supports Tibetan language (code: 'bo')
 */
async function translateWithGoogle(apiKey, text, fromLang, toLang) {
  try {
    // Google Cloud Translation API v2 REST endpoint
    const apiUrl = 'https://translation.googleapis.com/language/translate/v2';
    
    // Prepare request body
    const requestBody = {
      q: text,
      source: fromLang,
      target: toLang,
      format: 'text'
    };

    // Make API request
    const response = await fetch(`${apiUrl}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Translation API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract translated text from response
    // Google Translate API v2 response format:
    // {
    //   "data": {
    //     "translations": [{
    //       "translatedText": "...",
    //       "detectedSourceLanguage": "..."
    //     }]
    //   }
    // }
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      const translation = data.data.translations[0];
      return {
        translated: translation.translatedText || text,
        pronunciation: null // Google Translate doesn't provide pronunciation in v2
      };
    } else {
      throw new Error('Unexpected response format from Google Translate API');
    }
  } catch (error) {
    console.error('Google Translate API error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Translate using DeepL API
 */
// eslint-disable-next-line no-unused-vars
async function translateWithDeepL(_apiKey, _text, _fromLang, _toLang) {
  // TODO: Implement DeepL API call
  // Example:
  // const response = await fetch('https://api-free.deepl.com/v2/translate', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `DeepL-Auth-Key ${apiKey}`,
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   body: new URLSearchParams({ text: _text, source_lang: _fromLang.toUpperCase(), target_lang: _toLang.toUpperCase() })
  // });
  
  return {
    translated: _text, // Placeholder - replace with actual translation
    pronunciation: null
  };
}

