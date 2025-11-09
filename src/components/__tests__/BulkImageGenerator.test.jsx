import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock bulk image service
const { mockFilterCardsNeedingImages, mockProcessBulkImageGeneration } = vi.hoisted(() => ({
  mockFilterCardsNeedingImages: vi.fn(),
  mockProcessBulkImageGeneration: vi.fn(),
}));

vi.mock('../../utils/bulkImageService.js', () => ({
  filterCardsNeedingImages: mockFilterCardsNeedingImages,
  processBulkImageGeneration: mockProcessBulkImageGeneration,
}));

import BulkImageGenerator from '../BulkImageGenerator.jsx';

describe('BulkImageGenerator', () => {
  const mockCards = [
    { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
    { id: '2', type: 'word', imageUrl: 'https://example.com/img.jpg', englishText: 'banana' },
    { id: '3', type: 'word', imageUrl: null, englishText: 'cherry' },
  ];

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  describe('Rendering', () => {
    it('T009: renders bulk image generator component', () => {
      mockFilterCardsNeedingImages.mockReturnValue([mockCards[0], mockCards[2]]);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      expect(screen.getByText(/bulk image generation/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bulk generate images/i })).toBeInTheDocument();
    });

    it('T009: renders header with title and button', () => {
      mockFilterCardsNeedingImages.mockReturnValue([mockCards[0]]);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const header = screen.getByText(/bulk image generation/i).closest('.bulk-image-header');
      expect(header).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bulk generate images/i })).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('T011: shows message when no cards need images', () => {
      mockFilterCardsNeedingImages.mockReturnValue([]);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      expect(screen.getByText(/all word cards already have images/i)).toBeInTheDocument();
    });

    it('T011: disables button when no cards need images', () => {
      mockFilterCardsNeedingImages.mockReturnValue([]);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Bulk Generate Button', () => {
    it('T010: calls filterCardsNeedingImages with cards and filters', () => {
      const filters = { type: 'word', category: 'cat1' };
      mockFilterCardsNeedingImages.mockReturnValue([mockCards[0]]);
      
      render(<BulkImageGenerator cards={mockCards} filters={filters} onComplete={mockOnComplete} />);

      expect(mockFilterCardsNeedingImages).toHaveBeenCalledWith(mockCards, filters);
    });

    it('T010: shows confirmation dialog before starting', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      mockProcessBulkImageGeneration.mockResolvedValue(undefined);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('2')
      );
    });

    it('T010: does not start if user cancels confirmation', async () => {
      const user = userEvent.setup();
      global.confirm.mockReturnValue(false);
      mockFilterCardsNeedingImages.mockReturnValue([mockCards[0]]);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      expect(mockProcessBulkImageGeneration).not.toHaveBeenCalled();
    });

    it('T010: starts bulk generation when user confirms', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      mockProcessBulkImageGeneration.mockResolvedValue(undefined);
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          cardsNeedingImages,
          expect.any(Function), // onProgress callback
          expect.any(Function), // onComplete callback
          expect.any(Object) // AbortSignal
        );
      });
    });
  });

  describe('Integration - Bulk Generation Flow', () => {
    it('T012: completes bulk generation and calls onComplete callback', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      let onCompleteCallback;
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        onCompleteCallback = onComplete;
        // Simulate progress updates
        if (onProgress) {
          onProgress({ current: 0, total: 1, completed: 0, failed: 0, currentCard: cards[0] });
          onProgress({ current: 1, total: 1, completed: 1, failed: 0, currentCard: null });
        }
        // Call completion
        if (onComplete) {
          onComplete({
            completed: 1,
            failed: 0,
            total: 1,
            failures: [],
            cancelled: false
          });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          completed: 1,
          failed: 0,
          total: 1,
          failures: [],
          cancelled: false
        });
      });
    });

    it('T012: handles bulk generation with failures', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete) => {
        if (onComplete) {
          onComplete({
            completed: 1,
            failed: 1,
            total: 2,
            failures: [
              { cardId: '3', cardText: 'cherry', error: 'Generation failed', timestamp: new Date() }
            ],
            cancelled: false
          });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            completed: 1,
            failed: 1,
            total: 2
          })
        );
      });
    });
  });

  describe('Progress Tracking (User Story 2)', () => {
    it('T019: displays progress indicator when generation is running', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        // Simulate progress update immediately
        if (onProgress) {
          onProgress({ current: 0, total: 2, completed: 0, failed: 0, currentCard: cards[0] });
        }
        // Don't call onComplete - keep it running
        await new Promise(() => {}); // Never resolves
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/0 of 2 completed/i)).toBeInTheDocument();
        expect(screen.getByText(/processing:/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('T020: updates progress during generation', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        // Simulate multiple progress updates
        if (onProgress) {
          onProgress({ current: 0, total: 2, completed: 0, failed: 0, currentCard: cards[0] });
          await new Promise(resolve => setTimeout(resolve, 100));
          onProgress({ current: 1, total: 2, completed: 1, failed: 0, currentCard: cards[1] });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (onComplete) {
          onComplete({ completed: 2, failed: 0, total: 2, failures: [], cancelled: false });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/1 of 2 completed/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('T020: displays current card being processed', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        if (onProgress) {
          onProgress({ current: 0, total: 1, completed: 0, failed: 0, currentCard: cards[0] });
          // Keep running - don't complete immediately
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (onComplete) {
          onComplete({ completed: 1, failed: 0, total: 1, failures: [], cancelled: false });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/processing: apple/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('T020: displays failed count in progress', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        if (onProgress) {
          onProgress({ current: 1, total: 2, completed: 0, failed: 1, currentCard: cards[1] });
          // Keep running - don't complete immediately
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (onComplete) {
          onComplete({ completed: 0, failed: 2, total: 2, failures: [], cancelled: false });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/\(1 failed\)/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('T021: displays cancel button when generation is running', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        // Keep running - don't complete
        if (onProgress) {
          onProgress({ current: 0, total: 1, completed: 0, failed: 0, currentCard: cards[0] });
        }
        // Never resolve - keep it running
        await new Promise(() => {}); // Never resolves
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('T021: cancel button calls abort on AbortController', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      let abortSignal;
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        abortSignal = signal;
        // Keep running - don't complete
        if (onProgress) {
          onProgress({ current: 0, total: 1, completed: 0, failed: 0, currentCard: cards[0] });
        }
        // Never resolve - keep it running
        await new Promise(() => {}); // Never resolves
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const startButton = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      }, { timeout: 2000 });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(abortSignal.aborted).toBe(true);
      }, { timeout: 1000 });
    });

    it('T022: cancellation stops generation and shows cancelled status', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0], mockCards[2]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      let onCompleteCallback;
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        onCompleteCallback = onComplete;
        // Simulate processing
        if (onProgress) {
          onProgress({ current: 0, total: 2, completed: 0, failed: 0, currentCard: cards[0] });
        }
        // Wait for cancellation
        await new Promise(resolve => setTimeout(resolve, 100));
        // Check if cancelled
        if (signal?.aborted && onComplete) {
          onComplete({
            completed: 0,
            failed: 0,
            total: 2,
            failures: [],
            cancelled: true
          });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const startButton = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            cancelled: true
          })
        );
      });
    });

    it('T022: hides progress UI after cancellation', async () => {
      const user = userEvent.setup();
      const cardsNeedingImages = [mockCards[0]];
      mockFilterCardsNeedingImages.mockReturnValue(cardsNeedingImages);
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete, signal) => {
        if (onProgress) {
          onProgress({ current: 0, total: 1, completed: 0, failed: 0, currentCard: cards[0] });
        }
        // Wait a bit to allow cancellation
        await new Promise(resolve => setTimeout(resolve, 100));
        // Complete after cancellation
        if (onComplete && signal?.aborted) {
          onComplete({
            completed: 0,
            failed: 0,
            total: 1,
            failures: [],
            cancelled: true
          });
        }
      });
      
      render(<BulkImageGenerator cards={mockCards} filters={{}} onComplete={mockOnComplete} />);

      const startButton = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      }, { timeout: 2000 });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // After cancellation, progress UI should be hidden (isRunning becomes false)
      await waitFor(() => {
        expect(screen.queryByText(/processing:/i)).not.toBeInTheDocument();
      }, { timeout: 2000       });
    });
  });

  describe('Filtered Bulk Generation (User Story 3)', () => {
    it('T033: processes only cards matching type filter', async () => {
      const user = userEvent.setup();
      const allCards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple' },
        { id: '2', type: 'phrase', imageUrl: null, englishText: 'hello world' },
        { id: '3', type: 'word', imageUrl: null, englishText: 'banana' },
      ];
      
      // Mock filterCardsNeedingImages to return only word cards when type filter is applied
      mockFilterCardsNeedingImages.mockImplementation((cards, filters) => {
        if (filters?.type === 'word') {
          return cards.filter(c => c.type === 'word' && !c.imageUrl);
        }
        return cards.filter(c => !c.imageUrl);
      });
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete) => {
        if (onComplete) {
          onComplete({
            completed: cards.length,
            failed: 0,
            total: cards.length,
            failures: [],
            cancelled: false
          });
        }
      });
      
      render(
        <BulkImageGenerator 
          cards={allCards} 
          filters={{ type: 'word' }} 
          onComplete={mockOnComplete} 
        />
      );

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        // Should only process word cards (2 cards: apple and banana)
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '1' }),
            expect.objectContaining({ id: '3' })
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.not.arrayContaining([
            expect.objectContaining({ id: '2' }) // phrase card should not be included
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
      });
    });

    it('T033: processes only cards matching category filter', async () => {
      const user = userEvent.setup();
      const allCards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', categories: [{ id: 'cat1' }] },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana', categories: [{ id: 'cat2' }] },
        { id: '3', type: 'word', imageUrl: null, englishText: 'cherry', categories: [{ id: 'cat1' }] },
      ];
      
      mockFilterCardsNeedingImages.mockImplementation((cards, filters) => {
        if (filters?.category === 'cat1') {
          return cards.filter(c => 
            c.categories?.some(cat => (cat.id || cat.categoryId) === 'cat1') && !c.imageUrl
          );
        }
        return cards.filter(c => !c.imageUrl);
      });
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete) => {
        if (onComplete) {
          onComplete({
            completed: cards.length,
            failed: 0,
            total: cards.length,
            failures: [],
            cancelled: false
          });
        }
      });
      
      render(
        <BulkImageGenerator 
          cards={allCards} 
          filters={{ category: 'cat1' }} 
          onComplete={mockOnComplete} 
        />
      );

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        // Should only process cards with cat1 category (apple and cherry)
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '1' }),
            expect.objectContaining({ id: '3' })
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.not.arrayContaining([
            expect.objectContaining({ id: '2' }) // cat2 card should not be included
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
      });
    });

    it('T033: processes only cards matching instruction level filter', async () => {
      const user = userEvent.setup();
      const allCards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', instructionLevelId: 'level1' },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana', instructionLevelId: 'level2' },
        { id: '3', type: 'word', imageUrl: null, englishText: 'cherry', instructionLevelId: 'level1' },
      ];
      
      mockFilterCardsNeedingImages.mockImplementation((cards, filters) => {
        if (filters?.instructionLevel === 'level1') {
          return cards.filter(c => 
            (c.instructionLevelId === 'level1' || c.instruction_level_id === 'level1') && !c.imageUrl
          );
        }
        return cards.filter(c => !c.imageUrl);
      });
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete) => {
        if (onComplete) {
          onComplete({
            completed: cards.length,
            failed: 0,
            total: cards.length,
            failures: [],
            cancelled: false
          });
        }
      });
      
      render(
        <BulkImageGenerator 
          cards={allCards} 
          filters={{ instructionLevel: 'level1' }} 
          onComplete={mockOnComplete} 
        />
      );

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        // Should only process cards with level1 instruction level (apple and cherry)
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '1' }),
            expect.objectContaining({ id: '3' })
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.not.arrayContaining([
            expect.objectContaining({ id: '2' }) // level2 card should not be included
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
      });
    });

    it('T033: processes cards matching multiple filters', async () => {
      const user = userEvent.setup();
      const allCards = [
        { id: '1', type: 'word', imageUrl: null, englishText: 'apple', categories: [{ id: 'cat1' }], instructionLevelId: 'level1' },
        { id: '2', type: 'word', imageUrl: null, englishText: 'banana', categories: [{ id: 'cat1' }], instructionLevelId: 'level2' },
        { id: '3', type: 'phrase', imageUrl: null, englishText: 'hello', categories: [{ id: 'cat1' }], instructionLevelId: 'level1' },
      ];
      
      mockFilterCardsNeedingImages.mockImplementation((cards, filters) => {
        let filtered = cards.filter(c => !c.imageUrl);
        if (filters?.type) {
          filtered = filtered.filter(c => c.type === filters.type);
        }
        if (filters?.category) {
          filtered = filtered.filter(c => 
            c.categories?.some(cat => (cat.id || cat.categoryId) === filters.category)
          );
        }
        if (filters?.instructionLevel) {
          filtered = filtered.filter(c => 
            c.instructionLevelId === filters.instructionLevel || 
            c.instruction_level_id === filters.instructionLevel
          );
        }
        return filtered;
      });
      
      mockProcessBulkImageGeneration.mockImplementation(async (cards, onProgress, onComplete) => {
        if (onComplete) {
          onComplete({
            completed: cards.length,
            failed: 0,
            total: cards.length,
            failures: [],
            cancelled: false
          });
        }
      });
      
      render(
        <BulkImageGenerator 
          cards={allCards} 
          filters={{ type: 'word', category: 'cat1', instructionLevel: 'level1' }} 
          onComplete={mockOnComplete} 
        />
      );

      const button = screen.getByRole('button', { name: /bulk generate images/i });
      await user.click(button);

      await waitFor(() => {
        // Should only process card matching all filters (apple: word + cat1 + level1)
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '1' })
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
        expect(mockProcessBulkImageGeneration).toHaveBeenCalledWith(
          expect.not.arrayContaining([
            expect.objectContaining({ id: '2' }), // Wrong instruction level
            expect.objectContaining({ id: '3' })  // Wrong type
          ]),
          expect.any(Function),
          expect.any(Function),
          expect.any(Object)
        );
      });
    });
  });
});

