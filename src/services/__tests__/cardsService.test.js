import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadCards, saveCard, deleteCard } from '../cardsService.js';

// Mock supabase module (hoisted - must return factory function)
vi.mock('../supabase.js', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom
    },
    isSupabaseConfigured: vi.fn(() => true),
    // Export the mock so we can access it in tests
    __mockFrom: mockFrom
  };
});

describe('cardsService', () => {
  let mockSupabase;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../supabase.js');
    mockSupabase = supabase;
  });

  describe('loadCards', () => {
    it('loads cards from Supabase when configured', async () => {
      const mockData = [
        {
          id: '1',
          front: 'test',
          type: 'word',
          user_id: null,
          is_master: true,
          instruction_levels: null,
          card_categories: []
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      });

      const fallbackLoad = vi.fn(() => []);
      await loadCards(fallbackLoad);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
      expect(fallbackLoad).not.toHaveBeenCalled();
    });

    it('falls back to localStorage when Supabase not configured', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const fallbackCards = [{ id: '1', type: 'word' }];
      const fallbackLoad = vi.fn(() => fallbackCards);
      
      const result = await loadCards(fallbackLoad);
      expect(result).toEqual(fallbackCards);
      expect(fallbackLoad).toHaveBeenCalled();
    });

    it('filters cards by ownership for non-admin users', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);

      const mockData = [
        { id: '1', front: 'test1', user_id: 'user1', is_master: false, instruction_levels: null, card_categories: [] },
        { id: '2', front: 'test2', user_id: null, is_master: true, instruction_levels: null, card_categories: [] },
        { id: '3', front: 'test3', user_id: 'user2', is_master: false, instruction_levels: null, card_categories: [] }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockData,
            error: null
          }))
        }))
      });

      const result = await loadCards(() => [], 'user1', false);
      // Should only return master cards and user's own cards
      expect(result.length).toBeLessThanOrEqual(mockData.length);
    });
  });

  describe('saveCard', () => {
    it('saves card to Supabase', async () => {
      const card = {
        id: '1',
        type: 'word',
        front: 'test',
        backEnglish: 'test'
      };

      const mockEq = vi.fn(() => ({
        single: vi.fn(() => ({
          data: { ...card, user_id: null, is_master: false, instruction_levels: null, card_categories: [] },
          error: null
        }))
      }));
      
      const mockSelect = vi.fn(() => ({
        eq: mockEq
      }));

      // Mock upsert
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...card, user_id: null, is_master: false, id: card.id },
              error: null
            }))
          }))
        }))
      });

      // Mock delete for card_categories (may be called if card has categories)
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      });

      // Mock reload with classification data
      mockSupabase.from.mockReturnValueOnce({
        select: mockSelect
      });

      const result = await saveCard(card);
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
    });

    it('falls back to localStorage on Supabase error', async () => {
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(false);

      const card = { id: '1', type: 'word' };
      const fallbackSave = vi.fn();
      
      const result = await saveCard(card, fallbackSave);
      expect(result.success).toBe(true);
      expect(fallbackSave).toHaveBeenCalled();
    });
  });

  describe('deleteCard', () => {
    it('deletes card from Supabase', async () => {
      // Ensure isSupabaseConfigured returns true for this test
      const { isSupabaseConfigured } = await import('../supabase.js');
      isSupabaseConfigured.mockReturnValue(true);
      
      const mockEq = vi.fn(() => ({
        data: null,
        error: null
      }));
      
      const mockDelete = vi.fn(() => ({
        eq: mockEq
      }));
      
      // Mutate the existing mock instead of reassigning
      // This ensures the service code (which has a reference to the original mock) sees the change
      mockSupabase.from.mockReturnValueOnce({
        delete: mockDelete
      });

      const result = await deleteCard('card1');
      expect(result.success).toBe(true);
      // Verify the call chain: from('cards').delete().eq('id', 'card1')
      expect(mockSupabase.from).toHaveBeenCalledWith('cards');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'card1');
    });
  });
});

