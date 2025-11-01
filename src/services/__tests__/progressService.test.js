import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProgress, saveCardProgress } from '../progressService.js';

// Mock supabase module (hoisted - must return factory function)
vi.mock('../supabase.js', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom
    },
    isSupabaseConfigured: vi.fn(() => true)
  };
});

describe('progressService', () => {
  let mockSupabase;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../supabase.js');
    mockSupabase = supabase;
  });

  describe('loadProgress', () => {
    it('loads progress from Supabase for user', async () => {
      const mockProgress = [
        {
          card_id: 'card1',
          user_id: 'user1',
          interval: 5,
          ease_factor: 2.3,
          repetitions: 3
        }
      ];

      // Mutate the existing mock instead of reassigning
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockProgress,
            error: null
          }))
        }))
      });

      const result = await loadProgress('user1');
      expect(mockSupabase.from).toHaveBeenCalledWith('card_progress');
      expect(Object.keys(result)).toContain('card1');
    });

    it('falls back to localStorage when Supabase not configured', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const fallbackProgress = { card1: { interval: 5 } };
      const fallbackLoad = vi.fn(() => fallbackProgress);
      
      const result = await loadProgress('user1', fallbackLoad);
      expect(result).toEqual(fallbackProgress);
      expect(fallbackLoad).toHaveBeenCalled();
    });
  });

  describe('saveCardProgress', () => {
    it('saves progress to Supabase', async () => {
      // Ensure isSupabaseConfigured returns true for this test
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);
      
      const progress = {
        interval: 5,
        easeFactor: 2.3,
        repetitions: 3
      };

      const mockUpsert = vi.fn(() => ({
        data: null,
        error: null
      }));

      // Mutate the existing mock instead of reassigning
      // This ensures the service code (which has a reference to the original mock) sees the change
      mockSupabase.from.mockReturnValueOnce({
        upsert: mockUpsert
      });

      const result = await saveCardProgress('user1', 'card1', progress);
      expect(result.success).toBe(true);
      // Verify the call chain: from('card_progress').upsert(...)
      expect(mockSupabase.from).toHaveBeenCalledWith('card_progress');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('falls back to localStorage on error', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const progress = { interval: 5 };
      const fallbackSave = vi.fn();
      
      const result = await saveCardProgress('user1', 'card1', progress, fallbackSave);
      expect(result.success).toBe(true);
      expect(fallbackSave).toHaveBeenCalled();
    });
  });
});

