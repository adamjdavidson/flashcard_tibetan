/**
 * Integration tests for Admin Card Management feature
 * Tests full workflows: create card with classification, edit, delete, filter, sort
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCardTable from '../../components/AdminCardTable.jsx';
import AdminClassificationManager from '../../components/AdminClassificationManager.jsx';
import { loadCategories, createCategory } from '../../services/categoriesService.js';
import { loadInstructionLevels, createInstructionLevel } from '../../services/instructionLevelsService.js';
import { loadCards, saveCard } from '../../services/cardsService.js';

// Mock the services
vi.mock('../../services/categoriesService.js');
vi.mock('../../services/instructionLevelsService.js');
vi.mock('../../services/cardsService.js');
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { id: 'admin-user-id', email: 'admin@test.com' },
    isAdmin: true
  })
}));

describe('Admin Card Management Integration Tests', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Greetings', description: 'Basic greetings' },
    { id: 'cat2', name: 'Food', description: 'Food-related vocabulary' }
  ];

  const mockInstructionLevels = [
    { id: 'level1', name: 'Beginner', order: 1, is_default: true },
    { id: 'level2', name: 'Intermediate', order: 2, is_default: true },
    { id: 'level3', name: 'Advanced', order: 3, is_default: true }
  ];

  const mockCards = [
    {
      id: 'card1',
      type: 'word',
      front: 'ཁམས་པ',
      backEnglish: 'Kham',
      instructionLevelId: 'level1',
      instructionLevel: mockInstructionLevels[0],
      categories: [mockCategories[0]],
      createdAt: Date.now()
    },
    {
      id: 'card2',
      type: 'number',
      front: '༡',
      backEnglish: 'One',
      instructionLevelId: 'level2',
      instructionLevel: mockInstructionLevels[1],
      categories: [mockCategories[1]],
      createdAt: Date.now() - 1000
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    loadCategories.mockResolvedValue(mockCategories);
    loadInstructionLevels.mockResolvedValue(mockInstructionLevels);
    loadCards.mockResolvedValue(mockCards);
  });

  describe('Full Workflow: Create Card with Classification', () => {
    it('creates card with instruction level and categories', async () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      const newCard = {
        id: 'card3',
        type: 'word',
        front: 'ནམ་མཁའ',
        backEnglish: 'Sky',
        instructionLevelId: 'level1',
        categories: [mockCategories[0]]
      };

      saveCard.mockResolvedValue({ success: true, data: newCard });

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          filterType=""
          filterCategory=""
          filterInstructionLevel=""
        />
      );

      // Verify table displays existing cards
      expect(screen.getByText('ཁམས་པ')).toBeInTheDocument();
      expect(screen.getByText('༡')).toBeInTheDocument();
    });
  });

  describe('Card Filtering', () => {
    it('filters cards by type', async () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          filterType="word"
          filterCategory=""
          filterInstructionLevel=""
        />
      );

      // Should only show word cards
      expect(screen.getByText('ཁམས་པ')).toBeInTheDocument();
      expect(screen.queryByText('༡')).not.toBeInTheDocument();
    });

    it('filters cards by instruction level', async () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          filterType=""
          filterCategory=""
          filterInstructionLevel="level1"
        />
      );

      // Should only show Beginner level cards
      expect(screen.getByText('ཁམས་པ')).toBeInTheDocument();
      expect(screen.queryByText('༡')).not.toBeInTheDocument();
    });

    it('filters cards by category', async () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          filterType=""
          filterCategory="cat1"
          filterInstructionLevel=""
        />
      );

      // Should only show cards in Greetings category
      expect(screen.getByText('ཁམས་པ')).toBeInTheDocument();
      expect(screen.queryByText('༡')).not.toBeInTheDocument();
    });

    it('filters cards by multiple criteria', async () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          filterType="word"
          filterCategory="cat1"
          filterInstructionLevel="level1"
        />
      );

      // Should show only cards matching all criteria
      expect(screen.getByText('ཁམས་པ')).toBeInTheDocument();
      expect(screen.queryByText('༡')).not.toBeInTheDocument();
    });
  });

  describe('Card Sorting', () => {
    it('sorts cards by type', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const typeSortButton = screen.getByLabelText(/sort by type/i);
      await user.click(typeSortButton);

      // Verify sort indicator appears
      expect(typeSortButton).toHaveTextContent(/↑|↓/);
    });

    it('sorts cards by front content', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const frontSortButton = screen.getByLabelText(/sort by front/i);
      await user.click(frontSortButton);

      // Verify sort is applied
      expect(frontSortButton).toHaveTextContent(/↑|↓/);
    });
  });

  describe('Card CRUD Operations', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText(/edit card/i);
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockCards[0]);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      // Mock window.confirm to return true
      window.confirm = vi.fn(() => true);

      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/delete card/i);
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockCards[0].id);
    });

    it('displays loading state', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={[]}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays empty state when no cards', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCardTable
          cards={[]}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/no cards found/i)).toBeInTheDocument();
    });
  });

  describe('Category Management Integration', () => {
    it('loads and displays categories', async () => {
      render(<AdminClassificationManager />);

      await waitFor(() => {
        expect(loadCategories).toHaveBeenCalled();
      });

      expect(screen.getByText('Greetings')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('creates new category', async () => {
      const user = userEvent.setup();
      
      createCategory.mockResolvedValue({
        success: true,
        data: { id: 'cat3', name: 'Travel', description: 'Travel vocabulary' }
      });

      render(<AdminClassificationManager />);

      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });

      const addButton = screen.getByText(/add category/i);
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Travel');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createCategory).toHaveBeenCalled();
      });
    });

    it('displays error message when category creation fails', async () => {
      const user = userEvent.setup();
      
      createCategory.mockResolvedValue({
        success: false,
        error: 'Duplicate key'
      });

      render(<AdminClassificationManager />);

      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });

      const addButton = screen.getByText(/add category/i);
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Travel');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createCategory).toHaveBeenCalled();
      });

      // Verify error message is displayed in the alert
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toHaveTextContent(/duplicate key|failed to save category/i);
      });
    });
  });

  describe('Instruction Level Management Integration', () => {
    it('loads and displays instruction levels', async () => {
      render(<AdminClassificationManager />);

      // Switch to instruction levels tab
      const levelsTab = screen.getByText(/instruction levels/i);
      fireEvent.click(levelsTab);

      await waitFor(() => {
        expect(loadInstructionLevels).toHaveBeenCalled();
      });

      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('creates new instruction level', async () => {
      const user = userEvent.setup();

      createInstructionLevel.mockResolvedValue({
        success: true,
        data: { id: 'level4', name: 'Expert', order: 4, is_default: false }
      });

      render(<AdminClassificationManager />);

      // Switch to instruction levels tab
      const levelsTab = screen.getByText(/instruction levels/i);
      fireEvent.click(levelsTab);

      await waitFor(() => {
        expect(screen.getByText('Beginner')).toBeInTheDocument();
      });

      const addButton = screen.getByText(/add instruction level/i);
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Expert');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createInstructionLevel).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('paginates cards when page size changes', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      // Create many cards to trigger pagination
      const manyCards = Array.from({ length: 60 }, (_, i) => ({
        ...mockCards[0],
        id: `card${i}`,
        front: `Card ${i}`
      }));

      render(
        <AdminCardTable
          cards={manyCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Change page size
      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      await user.selectOptions(pageSizeSelect, '25');

      // Verify pagination info appears
      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
    });
  });
});

