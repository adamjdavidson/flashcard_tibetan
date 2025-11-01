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
    // Reset mock completely - each test will set up its own mock
    mockSupabase.from.mockReset();
  });

  describe('loadInstructionLevels', () => {
    it('loads instruction levels from Supabase when configured', async () => {
      const mockData = [
        { id: '1', name: 'Beginner', order: 1, description: 'Beginning level', is_default: true },
        { id: '2', name: 'Intermediate', order: 2, description: 'Intermediate level', is_default: true }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
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

      // Use mockReturnValue to avoid queue issues
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

      const result = await createInstructionLevel(level);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('instruction_levels');
    });
  });

  describe('updateInstructionLevel', () => {
    it('updates instruction level in Supabase', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const updates = { name: 'Updated Expert', order: 5 };
      const mockData = { id: '1', name: 'Updated Expert', order: 5 };

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
            single: vi.fn(() => Promise.resolve({
              data: { id: '1', name: 'Expert' },
              error: null
            }))
          }))
        }))
      }));

      // Mock card count check - first call to from('cards')
      // Then mock delete - second call to from('instruction_levels')
      // Need to chain mockReturnValueOnce for multiple calls
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              count: 10,
              error: null
            }))
          }))
        })
        .mockReturnValueOnce({
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

      // Use mockReturnValue to avoid queue issues
      const mockEq = vi.fn(() => Promise.resolve({
        data: mockData,
        error: null
      }));

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: mockEq
        }))
      });

      const result = await getCardsByInstructionLevel('level1');
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
      expect(mockEq).toHaveBeenCalledWith('instruction_level_id', 'level1');
    });
  });
});

