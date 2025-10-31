/**
 * Image utilities for generation, search, and upload
 */

/**
 * Generate AI image from prompt
 * @param {string} prompt - Image generation prompt
 * @param {string} style - Image style (optional)
 * @returns {Promise<{success: boolean, imageUrl?: string, provider?: string, error?: string}>}
 */
export async function generateAIImage(prompt, style = null) {
  if (!prompt || !prompt.trim()) {
    return { success: false, error: 'Prompt is required' };
  }

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        style: style
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Image generation failed' }));
      return { success: false, error: errorData.error || 'Image generation failed' };
    }

    const data = await response.json();
    return { 
      success: true, 
      imageUrl: data.imageUrl, 
      provider: data.provider 
    };
  } catch (error) {
    console.error('Error generating AI image:', error);
    return { success: false, error: error.message || 'Image generation request failed' };
  }
}

/**
 * Search for image on Unsplash
 * @param {string} query - Search query
 * @returns {Promise<{success: boolean, imageUrl?: string, attribution?: string, provider?: string, error?: string}>}
 */
export async function searchImage(query) {
  if (!query || !query.trim()) {
    return { success: false, error: 'Search query is required' };
  }

  try {
    const response = await fetch('/api/search-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Image search failed' }));
      return { success: false, error: errorData.error || 'Image search failed' };
    }

    const data = await response.json();
    return { 
      success: true, 
      imageUrl: data.imageUrl, 
      attribution: data.attribution,
      provider: data.provider || 'unsplash'
    };
  } catch (error) {
    console.error('Error searching image:', error);
    return { success: false, error: error.message || 'Image search request failed' };
  }
}

/**
 * Upload image file
 * @param {File|Blob} file - Image file to upload
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function uploadImage(file) {
  if (!file) {
    return { success: false, error: 'File is required' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'File must be an image' };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { success: false, error: 'Image size must be less than 5MB' };
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Image upload failed' }));
      return { success: false, error: errorData.error || 'Image upload failed' };
    }

    const data = await response.json();
    return { 
      success: true, 
      imageUrl: data.imageUrl 
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message || 'Image upload request failed' };
  }
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Must be JPEG, PNG, GIF, or WebP' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}

/**
 * Create image preview URL from file
 * @param {File|Blob} file - Image file
 * @returns {string} Object URL for preview
 */
export function createImagePreview(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke image preview URL
 * @param {string} url - Object URL to revoke
 */
export function revokeImagePreview(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

