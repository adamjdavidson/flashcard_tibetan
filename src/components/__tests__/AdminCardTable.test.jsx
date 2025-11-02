import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminCardTable from '../AdminCardTable.jsx';

describe('AdminCardTable', () => {
  const mockCards = [
    {
      id: '1',
      type: 'word',
      front: 'བཀྲ་ཤིས་བདེ་ལེགས',
      backEnglish: 'Tashi Delek',
      backTibetanScript: 'བཀྲ་ཤིས་བདེ་ལེགས',
      createdAt: 1698873600000,
      instructionLevelId: 'level1',
      instructionLevel: { id: 'level1', name: 'Beginner', order: 1 },
      categories: [{ id: 'cat1', name: 'Greetings' }]
    },
    {
      id: '2',
      type: 'phrase',
      front: 'སྤྱི་ཚོགས',
      backEnglish: 'Society',
      backTibetanScript: 'སྤྱི་ཚོགས',
      createdAt: 1698873700000,
      instructionLevelId: 'level2',
      instructionLevel: { id: 'level2', name: 'Intermediate', order: 2 },
      categories: [{ id: 'cat2', name: 'Family' }, { id: 'cat3', name: 'Nature' }]
    },
    {
      id: '3',
      type: 'number',
      front: 'གཅིག',
      backArabic: '1',
      backTibetanScript: 'གཅིག',
      createdAt: 1698873800000,
      instructionLevelId: null,
      instructionLevel: null,
      categories: []
    }
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders table with all columns', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText(/sort by type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by front/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by back content/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by categories/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by instruction level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by created date/i)).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders all cards in table', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('word')).toBeInTheDocument();
      expect(screen.getByText('phrase')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getAllByText('Tashi Delek').length).toBeGreaterThan(0);
    });

    it('shows loading state when loading', () => {
      render(
        <AdminCardTable
          cards={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading cards...')).toBeInTheDocument();
    });

    it('shows empty state when no cards', () => {
      render(
        <AdminCardTable
          cards={[]}
          loading={false}
        />
      );

      expect(screen.getByText('No cards found.')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts by type when type header clicked', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const typeHeader = screen.getByLabelText(/sort by type/i);
      fireEvent.click(typeHeader);

      // Check that cards are sorted (first should be 'number' ascending)
      const typeCells = screen.getAllByText(/word|phrase|number/);
      expect(typeCells[0]).toHaveTextContent('number');
    });

    it('toggles sort direction on second click', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const typeHeader = screen.getByLabelText(/sort by type/i);
      fireEvent.click(typeHeader); // First click: ascending
      fireEvent.click(typeHeader); // Second click: descending

      const typeCells = screen.getAllByText(/word|phrase|number/);
      expect(typeCells[0]).toHaveTextContent('word');
    });

    it('shows sort indicators in headers', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const typeHeader = screen.getByLabelText(/sort by type/i);
      expect(typeHeader.textContent).toContain('↕');
    });
  });

  describe('pagination', () => {
    it('displays pagination controls when multiple pages', () => {
      const manyCards = Array.from({ length: 75 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        front: `Card ${i}`
      }));

      render(
        <AdminCardTable
          cards={manyCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('changes page when next/previous clicked', async () => {
      const manyCards = Array.from({ length: 75 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        front: `Card ${i}`
      }));

      render(
        <AdminCardTable
          cards={manyCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
      });
    });

    it('allows changing page size', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      fireEvent.change(pageSizeSelect, { target: { value: '25' } });

      expect(pageSizeSelect.value).toBe('25');
    });
  });

  describe('filtering', () => {
    it('filters by type when filterType provided', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          filterType="word"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('word')).toBeInTheDocument();
      expect(screen.queryByText('phrase')).not.toBeInTheDocument();
      expect(screen.queryByText('number')).not.toBeInTheDocument();
    });

    it('filters by instruction level when filterInstructionLevel provided', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          filterInstructionLevel="level1"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.queryByText('Intermediate')).not.toBeInTheDocument();
    });

    it('shows filtered count in header', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          filterType="word"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/filtered from 3 total/)).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('renders Add Card button when onAdd provided', () => {
      const mockOnAdd = vi.fn();
      render(
        <AdminCardTable
          cards={mockCards}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new card/i });
      expect(addButton).toBeInTheDocument();
    });

    it('does not render Add Card button when onAdd not provided', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addButton = screen.queryByRole('button', { name: /add new card/i });
      expect(addButton).not.toBeInTheDocument();
    });

    it('calls onAdd when Add Card button clicked', () => {
      const mockOnAdd = vi.fn();
      render(
        <AdminCardTable
          cards={mockCards}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new card/i });
      fireEvent.click(addButton);

      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it('calls onEdit when edit button clicked', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText(/edit card/i);
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockCards[0]);
    });

    it('calls onDelete when delete button clicked', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/delete card/i);
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockCards[0].id);
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for sortable headers', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText(/sort by type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by front/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by back content/i)).toBeInTheDocument();
    });

    it('has proper ARIA labels for action buttons', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByLabelText(/edit card/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/delete card/i).length).toBeGreaterThan(0);
    });

    it('has table role and aria-label', () => {
      render(
        <AdminCardTable
          cards={mockCards}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Card management table');
    });
  });
});

