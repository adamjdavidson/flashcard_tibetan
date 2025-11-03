/**
 * Audio Service
 * Handles audio upload, delete, and URL generation for Supabase Storage
 * Patterned after imagesService.js
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Upload audio file to Supabase Storage
 * @param {File|Blob} file - MP3 audio file to upload
 * @param {string} path - Storage path (optional, defaults to timestamped filename)
 * @returns {Promise<{success: boolean, audioUrl?: string, error?: string}>}
 */
export async function uploadAudio(file, path = null) {
  if (!isSupabaseConfigured()) {
    console.error('[audioService] Supabase not configured');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Generate filename if not provided
    const fileName = path || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
    // Don't duplicate the bucket name in the path - just use the filename
    const filePath = fileName;

    console.log('[audioService] Uploading file:', filePath);
    console.log('[audioService] File size:', file.size, 'bytes');
    console.log('[audioService] File type:', file.type);
    console.log('[audioService] Bucket: card-audio');

    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('card-audio')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[audioService] Upload error:', error);
      console.error('[audioService] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Upload failed' };
    }

    console.log('[audioService] Upload successful. Upload data:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('card-audio')
      .getPublicUrl(filePath);

    console.log('[audioService] Public URL:', urlData.publicUrl);

    return { success: true, audioUrl: urlData.publicUrl };
  } catch (error) {
    console.error('[audioService] Exception during upload:', error);
    console.error('[audioService] Error stack:', error.stack);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Delete audio file from Supabase Storage
 * @param {string} audioUrl - Full URL of the audio file to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteAudio(audioUrl) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Extract path from URL
    const url = new URL(audioUrl);
    const pathParts = url.pathname.split('/');
    const pathIndex = pathParts.findIndex(part => part === 'card-audio');
    
    if (pathIndex === -1) {
      return { success: false, error: 'Invalid audio URL' };
    }

    // Extract filename from path (everything after card-audio)
    const filePath = pathParts.slice(pathIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('card-audio')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting audio:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting audio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get public URL for audio file
 * @param {string} fileName - Name of the audio file in storage
 * @returns {string} Public URL for the audio file
 */
export function getAudioUrl(fileName) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: urlData } = supabase.storage
      .from('card-audio')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
}

