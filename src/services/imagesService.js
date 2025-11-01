/**
 * Images Service
 * Handles image upload, optimization, and CDN URL generation
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Upload image to Supabase Storage
 * @param {File|Blob} file - Image file to upload
 * @param {string} path - Storage path (optional, defaults to timestamped filename)
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function uploadImage(file, path = null) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Generate filename if not provided
    const fileName = path || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
    // Don't duplicate the bucket name in the path - just use the filename
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('card-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath);

    return { success: true, imageUrl: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteImage(imageUrl) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const pathIndex = pathParts.findIndex(part => part === 'card-images');
    
    if (pathIndex === -1) {
      return { success: false, error: 'Invalid image URL' };
    }

    const filePath = pathParts.slice(pathIndex).join('/');

    const { error } = await supabase.storage
      .from('card-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Optimize image before upload (client-side resize/compress)
 * This is a placeholder - actual optimization would use a library like browser-image-compression
 * @param {File} file - Image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<File>}
 */
export async function optimizeImage(file, options = {}) {
  // Placeholder function - optimization parameters not yet used
  // const maxWidth = options.maxWidth || 800;
  // const maxHeight = options.maxHeight || 800;
  // const quality = options.quality || 0.8;
  const maxSizeMB = options.maxSizeMB || 1;

  // If file is already small enough, return as-is
  if (file.size / (1024 * 1024) < maxSizeMB && file.type === 'image/jpeg') {
    return file;
  }

  // For now, return file as-is
  // In production, you'd use a library like browser-image-compression
  // or do the optimization in the serverless function
  return file;
}

