import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadInstructionLevels, createInstructionLevel, updateInstructionLevel, deleteInstructionLevel, getCardsByInstructionLevel } from '../instructionLevelsService.js';

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

describe('instructionLevelsService', () => {
  let mockSupabase;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../supabase.js');
    mockSupabase = supabase;
  });

  describe('loadInstructionLevels', () => {
    it('loads instruction levels from Supabase when configured', async () => {
      const mockData = [
        { id: '1', name: 'Beginner', order: 1, description: 'Beginning level', is_default: true },
        { id: '2', name: 'Intermediate', order: 2, description: 'Intermediate level', is_default: true }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      });

      const result = await loadInstructionLevels();
      expect(mockSupabase.from).toHaveBeenCalledWith('instruction_levels');
      expect(result).toEqual(mockData);
    });

    it('returns empty array when Supabase not configured', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const result = await loadInstructionLevels();
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

      const result = await loadInstructionLevels();
      expect(result).toEqual([]);
    });
  });

  describe('createInstructionLevel', () => {
    it('creates instruction level in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const level = { name: 'Expert', order: 4, description: 'Expert level', is_default: false };
      const mockData = { id: '1', ...level };

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

      const result = await createInstructionLevel(level);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('instruction_levels');
    });

    it('returns error on failure', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const level = { name: 'Expert', order: 4 };
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

      const result = await createInstructionLevel(level);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate key');
    });
  });

  describe('updateInstructionLevel', () => {
    it('updates instruction level in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const updates = { name: 'Updated Expert', order: 5 };
      const mockData = { id: '1', name: 'Updated Expert', order: 5 };

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

      const result = await updateInstructionLevel('1', updates);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('deleteInstructionLevel', () => {
    it('deletes instruction level and returns card count', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: '1', name: 'Expert' },
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
              count: 10,
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

      const result = await deleteInstructionLevel('1', true);
      expect(result.success).toBe(true);
      expect(result.cardCount).toBe(10);
    });
  });

  describe('getCardsByInstructionLevel', () => {
    it('gets cards by instruction level', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockData = [
        { id: '1', front: 'test', type: 'word', instruction_level_id: 'level1' }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      });

      const result = await getCardsByInstructionLevel('level1');
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
    });
  });
});

