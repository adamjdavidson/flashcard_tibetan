import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock bulkAddService
const { mockProcessBulkAdd } = vi.hoisted(() => ({
  mockProcessBulkAdd: vi.fn(),
}));

vi.mock('../../services/bulkAddService.js', () => ({
  processBulkAdd: mockProcessBulkAdd,
}));

// Mock useAuth hook
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock category and instruction level services
vi.mock('../../services/categoriesService.js', () => ({
  loadCategories: vi.fn(() => Promise.resolve([
    { id: 'cat_1', name: 'Category 1' },
    { id: 'cat_2', name: 'Category 2' }
  ])),
}));

vi.mock('../../services/instructionLevelsService.js', () => ({
  loadInstructionLevels: vi.fn(() => Promise.resolve([
    { id: 'level_1', name: 'Beginner', order: 1 },
    { id: 'level_2', name: 'Intermediate', order: 2 }
  ])),
}));

import BulkAddForm from '../BulkAddForm.jsx';

describe('BulkAddForm', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      isAdmin: true,
      loading: false,
      error: null,
    });
  });

  it('renders form fields', async () => {
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/words/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/card type/i)).toBeInTheDocument();
    });
  });

  it('displays word count as user types', async () => {
    const user = userEvent.setup();
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const textarea = await screen.findByLabelText(/words/i);
    await user.type(textarea, 'apple\nbanana\ncherry');

    expect(screen.getByText(/3 words/i)).toBeInTheDocument();
  });

  it('validates minimum word count (2 words)', async () => {
    const user = userEvent.setup();
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const textarea = await screen.findByLabelText(/words/i);
    await user.type(textarea, 'apple');
    
    const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
    expect(submitButton).toBeDisabled();
  });

  it('validates maximum word count (100 words)', async () => {
    const user = userEvent.setup();
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const textarea = await screen.findByLabelText(/words/i);
    const words = Array(101).fill('word').join('\n');
    await user.type(textarea, words);

    expect(screen.getByText(/maximum.*100/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockProcessBulkAdd.mockResolvedValue({
      totalWords: 2,
      cardsCreated: 2,
      duplicatesSkipped: 0,
      translationFailures: [],
      imageFailures: [],
      errors: [],
      createdCards: [],
      duplicateWords: []
    });

    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const textarea = await screen.findByLabelText(/words/i);
    await user.type(textarea, 'apple\nbanana');

    const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProcessBulkAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          words: ['apple', 'banana'],
          cardType: 'word'
        }),
        expect.any(Object)
      );
    });
  });

  it('displays error message on validation failure', async () => {
    const user = userEvent.setup();
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const textarea = await screen.findByLabelText(/words/i);
    await user.type(textarea, 'apple'); // Only 1 word

    const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

    it('trims whitespace from words before submission', async () => {
      const user = userEvent.setup();
      mockProcessBulkAdd.mockResolvedValue({
        totalWords: 2,
        cardsCreated: 2,
        duplicatesSkipped: 0,
        translationFailures: [],
        imageFailures: [],
        errors: [],
        createdCards: [],
        duplicateWords: []
      });

      render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

      const textarea = await screen.findByLabelText(/words/i);
      await user.type(textarea, '  apple  \n  banana  ');

      const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProcessBulkAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            words: ['apple', 'banana'] // Words are trimmed before submission
          }),
          expect.any(Object)
        );
      });
    });

    // User Story 1: Display New Checkbox in Bulk Add Form
    describe('New Checkbox (User Story 1)', () => {
      it('renders checkbox with label "Mark as New (for review)"', async () => {
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        await waitFor(() => {
          const checkbox = screen.getByLabelText(/mark as new.*for review/i);
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toHaveAttribute('type', 'checkbox');
        });
      });

      it('checkbox is checked by default', async () => {
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        await waitFor(() => {
          const checkbox = screen.getByLabelText(/mark as new.*for review/i);
          expect(checkbox).toBeChecked();
        });
      });

      it('allows admin to check and uncheck the checkbox', async () => {
        const user = userEvent.setup();
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        const checkbox = await screen.findByLabelText(/mark as new.*for review/i);
        expect(checkbox).toBeChecked();

        // Uncheck
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();

        // Check again
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
      });

      it('has proper accessibility attributes', async () => {
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        await waitFor(() => {
          const checkbox = screen.getByLabelText(/mark as new.*for review/i);
          expect(checkbox).toHaveAttribute('id', 'markAsNew');
          expect(checkbox).toHaveAttribute('name', 'markAsNew');
          expect(checkbox).toHaveAttribute('aria-describedby', 'markAsNewHelp');
          
          // Verify helper text exists and is linked
          const helperText = screen.getByText(/cards will be flagged.*for review/i);
          expect(helperText).toBeInTheDocument();
          expect(helperText).toHaveAttribute('id', 'markAsNewHelp');
        });
      });
    });

    // User Story 2: Automatic New Checkbox Selection for Auto-Translated Words
    describe('Auto-Check Behavior (User Story 2)', () => {
      it('checkbox remains checked when words are entered (default behavior)', async () => {
        const user = userEvent.setup();
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        // Initially checkbox should be checked
        const checkbox = await screen.findByLabelText(/mark as new.*for review/i);
        expect(checkbox).toBeChecked();

        // Enter words - checkbox should remain checked (auto-checked by default)
        const textarea = screen.getByLabelText(/words/i);
        await user.type(textarea, 'apple\nbanana');
        
        // Checkbox should still be checked
        expect(checkbox).toBeChecked();
      });

      it('respects manual override when user unchecks checkbox', async () => {
        const user = userEvent.setup();
        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        const checkbox = await screen.findByLabelText(/mark as new.*for review/i);
        const textarea = screen.getByLabelText(/words/i);

        // Enter words first (checkbox should be checked)
        await user.type(textarea, 'apple\nbanana');
        expect(checkbox).toBeChecked();

        // Manually uncheck
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();

        // Enter more words - checkbox should remain unchecked (manual override)
        await user.type(textarea, '\ncherry');
        await waitFor(() => {
          expect(checkbox).not.toBeChecked();
        });
      });

      it('includes markAsNew in request when submitting form', async () => {
        const user = userEvent.setup();
        mockProcessBulkAdd.mockResolvedValue({
          totalWords: 2,
          cardsCreated: 2,
          duplicatesSkipped: 0,
          translationFailures: [],
          imageFailures: [],
          errors: [],
          createdCards: [],
          duplicateWords: []
        });

        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        const textarea = await screen.findByLabelText(/words/i);
        await user.type(textarea, 'apple\nbanana');

        const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockProcessBulkAdd).toHaveBeenCalledWith(
            expect.objectContaining({
              words: ['apple', 'banana'],
              markAsNew: true
            }),
            expect.any(Object)
          );
        });
      });

      it('includes markAsNew: false when checkbox is unchecked', async () => {
        const user = userEvent.setup();
        mockProcessBulkAdd.mockResolvedValue({
          totalWords: 2,
          cardsCreated: 2,
          duplicatesSkipped: 0,
          translationFailures: [],
          imageFailures: [],
          errors: [],
          createdCards: [],
          duplicateWords: []
        });

        render(<BulkAddForm onComplete={mockOnComplete} onCancel={mockOnCancel} />);

        const checkbox = await screen.findByLabelText(/mark as new.*for review/i);
        const textarea = screen.getByLabelText(/words/i);

        // Uncheck checkbox
        await user.click(checkbox);
        await user.type(textarea, 'apple\nbanana');

        const submitButton = screen.getByRole('button', { name: /submit|add|create/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockProcessBulkAdd).toHaveBeenCalledWith(
            expect.objectContaining({
              words: ['apple', 'banana'],
              markAsNew: false
            }),
            expect.any(Object)
          );
        });
      });
    });
});

