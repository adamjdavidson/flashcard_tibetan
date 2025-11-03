import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardFilter from '../CardFilter.jsx';

describe('CardFilter', () => {
  const mockOnTagToggle = vi.fn();

  it('renders filter dropdown', () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    expect(screen.getByText(/study:/i)).toBeInTheDocument();
    expect(screen.getByText(/all cards/i)).toBeInTheDocument();
  });

  it('calls onTagToggle when tag is selected', async () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    // Open dropdown
    const button = screen.getByRole('button', { name: /study:/i });
    fireEvent.click(button);

    // Wait for dropdown menu to appear, then find and click Words menu item
    await waitFor(() => {
      const menu = document.querySelector('.filter-dropdown-menu');
      expect(menu).toBeInTheDocument();
      
      // Find button in menu with "Words" text
      const menuButtons = menu.querySelectorAll('button');
      const wordsButton = Array.from(menuButtons).find(btn => 
        btn.textContent.trim() === 'Words'
      );
      expect(wordsButton).toBeDefined();
      fireEvent.click(wordsButton);
    });

    expect(mockOnTagToggle).toHaveBeenCalledWith(['Word']);
  });

  it('displays selected tags', () => {
    render(<CardFilter selectedTags={['Word']} onTagToggle={mockOnTagToggle} />);

    expect(screen.getByText(/words/i)).toBeInTheDocument();
  });

  it('handles "All cards" selection', () => {
    render(<CardFilter selectedTags={['all']} onTagToggle={mockOnTagToggle} />);

    expect(screen.getByText(/all cards/i)).toBeInTheDocument();
  });

  it('toggles "All cards" correctly', async () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    // Open dropdown
    const button = screen.getByRole('button', { name: /study:/i });
    fireEvent.click(button);

    // Wait for dropdown menu to appear, then find and click All Cards menu item
    await waitFor(() => {
      const menu = document.querySelector('.filter-dropdown-menu');
      expect(menu).toBeInTheDocument();
      
      // Find button in menu with "All Cards" text
      const menuButtons = menu.querySelectorAll('button');
      const allCardsButton = Array.from(menuButtons).find(btn => 
        btn.textContent.trim() === 'All Cards'
      );
      expect(allCardsButton).toBeDefined();
      fireEvent.click(allCardsButton);
    });

    expect(mockOnTagToggle).toHaveBeenCalledWith(['all']);
  });
});
