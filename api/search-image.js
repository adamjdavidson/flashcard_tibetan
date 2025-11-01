/**
 * Image Search API endpoint
 * Vercel serverless function
 * Searches for images on Unsplash
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, per_page = 1 } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get Unsplash API key
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!apiKey) {
      // Fallback to AI generation if Unsplash not configured
      const imageGenApiKey = process.env.IMAGE_GENERATION_API_KEY;
      if (imageGenApiKey) {
        const imageGenService = process.env.IMAGE_GENERATION_SERVICE || 'dalle';
        const result = await generateImageFallback(imageGenService, imageGenApiKey, query);
        return res.status(200).json({
          imageUrl: result.imageUrl,
          attribution: null,
          provider: 'ai-fallback'
        });
      }
      return res.status(500).json({ error: 'Unsplash API key not configured' });
    }

    // Search Unsplash
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query.trim())}&per_page=${Math.min(per_page, 10)}&orientation=landscape`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      // Fallback to AI generation if no results
      const imageGenApiKey = process.env.IMAGE_GENERATION_API_KEY;
      if (imageGenApiKey) {
        const imageGenService = process.env.IMAGE_GENERATION_SERVICE || 'dalle';
        const result = await generateImageFallback(imageGenService, imageGenApiKey, query);
        return res.status(200).json({
          imageUrl: result.imageUrl,
          attribution: null,
          provider: 'ai-fallback'
        });
      }
      return res.status(404).json({ error: 'No images found' });
    }

    // Get first result
    const image = data.results[0];
    const imageUrl = image.urls?.regular || image.urls?.small;

    return res.status(200).json({
      imageUrl,
      attribution: `Photo by ${image.user?.name || 'Unknown'} on Unsplash`,
      provider: 'unsplash'
    });
  } catch (error) {
    console.error('Image search error:', error);
    return res.status(500).json({ 
      error: error.message || 'Image search failed' 
    });
  }
}

/**
 * Fallback to AI image generation
 */
// eslint-disable-next-line no-unused-vars
async function generateImageFallback(_service, _apiKey, _prompt) {
  // Simple fallback - just return null for now
  // In production, you would call the actual image generation service
  return {
    imageUrl: null
  };
}

