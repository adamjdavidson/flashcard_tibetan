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
  });

  describe('loadCategories', () => {
    it('loads categories from Supabase when configured', async () => {
      const mockData = [
        { id: '1', name: 'Family', description: 'Family terms', created_by: null },
        { id: '2', name: 'Food', description: 'Food terms', created_by: null }
      ];

      mockSupabase.from.mockReturnValueOnce({
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
      mockSupabase.from.mockReturnValueOnce({
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

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
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

    it('returns error on failure', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const category = { name: 'Travel' };
      const error = { message: 'Duplicate key', code: '23505' };

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error
            }))
          }))
        }))
      });

      const result = await createCategory(category);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate key');
    });
  });

  describe('updateCategory', () => {
    it('updates category in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const updates = { name: 'Updated Travel', description: 'Updated description' };
      const mockData = { id: '1', name: 'Updated Travel', description: 'Updated description' };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
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

      const mockEq = vi.fn(() => ({
        data: null,
        error: null
      }));
      
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: '1', name: 'Travel' },
              error: null
            }))
          }))
        }))
      }));

      // Mock card count check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          count: vi.fn(() => ({
            head: vi.fn(() => ({
              count: 5,
              error: null
            }))
          })),
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      });

      // Mock delete
      mockSupabase.from.mockReturnValueOnce({
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
            single: vi.fn(() => ({
              data: { id: '1', name: 'Travel' },
              error: null
            }))
          }))
        }))
      }));

      mockSupabase.from.mockReturnValueOnce({
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

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
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

