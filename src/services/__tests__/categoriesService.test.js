import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadCategories, createCategory, updateCategory, deleteCategory, getCardsInCategory } from '../categoriesService.js';

// Mock supabase module
vi.mock('../supabase.js', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom
    },
    isSupabaseConfigured: vi.fn(() => true)
  };
});

describe('categoriesService', () => {
  let mockSupabase;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../supabase.js');
    mockSupabase = supabase;
    // Reset mock completely - each test will set up its own mock
    mockSupabase.from.mockReset();
  });

  describe('loadCategories', () => {
    it('loads categories from Supabase when configured', async () => {
      const mockData = [
        { id: '1', name: 'Family', description: 'Family terms', created_by: null },
        { id: '2', name: 'Food', description: 'Food terms', created_by: null }
      ];

      // Use mockReturnValue to avoid queue issues
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      });

      const result = await loadCategories();
      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(result).toEqual(mockData);
    });

    it('returns empty array when Supabase not configured', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const result = await loadCategories();
      expect(result).toEqual([]);
    });

    it('returns empty array on error', async () => {
      // Use mockReturnValue to avoid queue issues
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      });

      const result = await loadCategories();
      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    it('creates category in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const category = { name: 'Travel', description: 'Travel terms', created_by: 'user1' };
      const mockData = { id: '1', ...category };

      // Use mockReturnValue instead of mockReturnValueOnce to avoid queue issues
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockData,
              error: null
            }))
          }))
        }))
      });

      const result = await createCategory(category);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    });
  });

  describe('updateCategory', () => {
    it('updates category in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const updates = { name: 'Updated Travel', description: 'Updated description' };
      const mockData = { id: '1', name: 'Updated Travel', description: 'Updated description' };

      // Use mockReturnValue to avoid queue issues
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: mockData,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await updateCategory('1', updates);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('deleteCategory', () => {
    it('deletes category and returns card count', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: '1', name: 'Travel' },
              error: null
            }))
          }))
        }))
      }));

      // Mock card count check - first call to from('card_categories')
      // Then mock delete - second call to from('categories')
      // Need to chain mockReturnValueOnce for multiple calls
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              count: 5,
              error: null
            }))
          }))
        })
        .mockReturnValueOnce({
          delete: mockDelete
        });

      const result = await deleteCategory('1', true);
      expect(result.success).toBe(true);
      expect(result.cardCount).toBe(5);
    });

    it('deletes category without checking usage', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: '1', name: 'Travel' },
              error: null
            }))
          }))
        }))
      }));

      // Use mockReturnValue to avoid queue issues
      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      const result = await deleteCategory('1', false);
      expect(result.success).toBe(true);
    });
  });

  describe('getCardsInCategory', () => {
    it('gets cards in a category', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockData = [
        { id: '1', front: 'test', type: 'word', card_categories: [{ category_id: 'cat1' }] }
      ];

      // Use mockReturnValue to avoid queue issues
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: mockData,
            error: null
          }))
        }))
      });

      const result = await getCardsInCategory('cat1');
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
    });
  });
});

