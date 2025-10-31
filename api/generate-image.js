/**
 * AI Image Generation API endpoint
 * Vercel serverless function
 * Generates images using configured AI image service
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get image generation service configuration
    const service = process.env.IMAGE_GENERATION_SERVICE || 'gemini';
    const apiKey = process.env.IMAGE_GENERATION_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Image generation API key not configured. Please set IMAGE_GENERATION_API_KEY or GEMINI_API_KEY environment variable.' 
      });
    }

    // Call appropriate image generation service
    let imageUrl = '';
    let provider = service;

    if (service === 'gemini' || service === 'google') {
      // Google Gemini Image Generation (default)
      const result = await generateWithGemini(apiKey, prompt, style);
      imageUrl = result.imageUrl;
    } else if (service === 'dalle' || service === 'openai') {
      // OpenAI DALL-E 3
      const result = await generateWithDALLE(apiKey, prompt, style);
      imageUrl = result.imageUrl;
      if (result.revisedPrompt) {
        // Optionally log the revised prompt for debugging
        console.log('DALL-E revised prompt:', result.revisedPrompt);
      }
    } else if (service === 'stable-diffusion') {
      // Stability AI Stable Diffusion
      const result = await generateWithStableDiffusion(apiKey, prompt, style);
      imageUrl = result.imageUrl;
    } else {
      // Default: Google Gemini
      const result = await generateWithGemini(apiKey, prompt, style);
      imageUrl = result.imageUrl;
    }

    return res.status(200).json({
      imageUrl,
      provider
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Image generation failed' 
    });
  }
}

/**
 * Generate image using Google Gemini 2.5 Flash Image
 * Recommended for educational flashcards - good balance of quality and cost
 */
async function generateWithGemini(apiKey, prompt, style) {
  try {
    // Enhance prompt for educational flashcards
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt = `${prompt}, ${style} style`;
    }
    // Add educational context - Gemini works best with descriptive prompts
    enhancedPrompt = `Create a simple illustration of ${enhancedPrompt}. The image should be educational and suitable for a flashcard, with a clean background and clear subject matter.`;

    // Gemini REST API endpoint for image generation
    // Using gemini-2.5-flash-image model (official image generation model)
    // Alternative: gemini-2.0-flash-exp also supports image generation
    const modelName = 'gemini-2.5-flash-image';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE'], // Return only images, no text
        imageConfig: {
          aspectRatio: '1:1' // Square format for flashcards (1024x1024)
        }
      }
    };

    const response = await fetch(apiUrl, {
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
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Gemini response format:
    // {
    //   "candidates": [{
    //     "content": {
    //       "parts": [{
    //         "inlineData": {
    //           "mimeType": "image/png",
    //           "data": "base64..."
    //         }
    //       }]
    //     }
    //   }]
    // }
    if (data.candidates && 
        data.candidates[0]?.content?.parts && 
        data.candidates[0].content.parts[0]?.inlineData?.data) {
      // Convert base64 to data URL
      const imageData = data.candidates[0].content.parts[0].inlineData.data;
      const mimeType = data.candidates[0].content.parts[0].inlineData.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${imageData}`;
      return { imageUrl };
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

/**
 * Generate image using OpenAI DALL-E 3
 * Supports style parameter for image customization
 */
async function generateWithDALLE(apiKey, prompt, style) {
  try {
    // Enhance prompt for educational flashcards
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt = `${prompt}, ${style} style`;
    }
    // Add educational context for better results
    enhancedPrompt += ', simple illustration, educational, clean background, suitable for flashcard';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024', // Options: 1024x1024, 1792x1024, 1024x1792
        quality: 'standard', // Options: standard or hd
        response_format: 'url' // Options: url or b64_json
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `DALL-E API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // DALL-E 3 response format:
    // {
    //   "created": 1234567890,
    //   "data": [{
    //     "url": "https://...",
    //     "revised_prompt": "..."
    //   }]
    // }
    if (data.data && data.data.length > 0 && data.data[0].url) {
      return {
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt // DALL-E may revise the prompt
      };
    } else {
      throw new Error('Unexpected response format from DALL-E API');
    }
  } catch (error) {
    console.error('DALL-E API error:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

/**
 * Generate image using Stability AI Stable Diffusion
 * Alternative to DALL-E (cheaper, faster, but may need prompt tuning)
 */
async function generateWithStableDiffusion(apiKey, prompt, style) {
  try {
    // Enhance prompt for educational flashcards
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt = `${prompt}, ${style} style`;
    }
    // Add educational context
    enhancedPrompt += ', simple illustration, educational, clean background';

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{ 
          text: enhancedPrompt,
          weight: 1.0
        }],
        cfg_scale: 7,
        width: 1024,
        height: 1024,
        steps: 30,
        samples: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Stable Diffusion API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Stability AI response format:
    // {
    //   "artifacts": [{
    //     "base64": "...",
    //     "finishReason": "SUCCESS",
    //     "seed": 12345
    //   }]
    // }
    if (data.artifacts && data.artifacts.length > 0 && data.artifacts[0].base64) {
      // Convert base64 to data URL
      const imageData = data.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${imageData}`;
      return { imageUrl };
    } else {
      throw new Error('Unexpected response format from Stable Diffusion API');
    }
  } catch (error) {
    console.error('Stable Diffusion API error:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

