import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateAIImage, searchImage, uploadImage, validateImageFile } from '../images.js';

describe('images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('generateAIImage', () => {
    it('returns error when prompt is empty', async () => {
      const result = await generateAIImage('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Prompt is required');
    });

    it('returns error when prompt is only whitespace', async () => {
      const result = await generateAIImage('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Prompt is required');
    });

    it('fetches AI image from API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://example.com/image.jpg',
          provider: 'gemini'
        })
      });

      const result = await generateAIImage('a dog');
      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.provider).toBe('gemini');
      expect(global.fetch).toHaveBeenCalledWith('/api/generate-image', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'a dog',
          style: null
        })
      }));
    });

    it('handles API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Generation failed' })
      });

      const result = await generateAIImage('a dog');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Generation failed');
    });
  });

  describe('searchImage', () => {
    it('returns error when query is empty', async () => {
      const result = await searchImage('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Search query is required');
    });

    it('fetches image from Unsplash API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://images.unsplash.com/photo.jpg',
          attribution: 'Photo by John Doe',
          provider: 'unsplash'
        })
      });

      const result = await searchImage('dog');
      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe('https://images.unsplash.com/photo.jpg');
      expect(result.attribution).toBe('Photo by John Doe');
      expect(result.provider).toBe('unsplash');
    });
  });

  describe('validateImageFile', () => {
    it('validates image file types', () => {
      const jpgFile = { name: 'test.jpg', type: 'image/jpeg', size: 1024 * 1024 };
      const pngFile = { name: 'test.png', type: 'image/png', size: 1024 * 1024 };
      const webpFile = { name: 'test.webp', type: 'image/webp', size: 1024 * 1024 };

      expect(validateImageFile(jpgFile)).toEqual({ valid: true });
      expect(validateImageFile(pngFile)).toEqual({ valid: true });
      expect(validateImageFile(webpFile)).toEqual({ valid: true });
    });

    it('rejects invalid file types', () => {
      const pdfFile = { name: 'test.pdf', type: 'application/pdf', size: 1024 };
      const result = validateImageFile(pdfFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects files that are too large', () => {
      const largeFile = { name: 'test.jpg', type: 'image/jpeg', size: 10 * 1024 * 1024 };
      const result = validateImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('accepts valid image files', () => {
      const validFile = { name: 'test.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
      expect(validateImageFile(validFile)).toEqual({ valid: true });
    });

    it('rejects null/undefined files', () => {
      expect(validateImageFile(null)).toEqual({ valid: false, error: 'No file provided' });
      expect(validateImageFile(undefined)).toEqual({ valid: false, error: 'No file provided' });
    });
  });

  describe('uploadImage', () => {
    it('returns error when file is invalid', async () => {
      const invalidFile = { name: 'test.pdf', type: 'application/pdf' };
      const result = await uploadImage(invalidFile);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('uploads valid image file', async () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://example.com/uploaded.jpg'
        })
      });

      const result = await uploadImage(validFile);
      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe('https://example.com/uploaded.jpg');
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

