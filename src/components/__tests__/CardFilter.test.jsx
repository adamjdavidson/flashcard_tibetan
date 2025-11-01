import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardFilter from '../CardFilter.jsx';

describe('CardFilter', () => {
  const mockOnTagToggle = vi.fn();

  it('renders filter checkboxes', () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    expect(screen.getByLabelText(/all cards/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/numerals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/numbers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/words/i)).toBeInTheDocument();
  });

  it('calls onTagToggle when tag is selected', () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    const wordCheckbox = screen.getByLabelText(/words/i);
    fireEvent.click(wordCheckbox);

    expect(mockOnTagToggle).toHaveBeenCalled();
  });

  it('displays selected tags', () => {
    render(<CardFilter selectedTags={['Word']} onTagToggle={mockOnTagToggle} />);

    const wordCheckbox = screen.getByLabelText(/words/i);
    expect(wordCheckbox).toBeChecked();
  });

  it('handles "All cards" selection', () => {
    render(<CardFilter selectedTags={['all']} onTagToggle={mockOnTagToggle} />);

    const allCheckbox = screen.getByLabelText(/all cards/i);
    expect(allCheckbox).toBeChecked();
  });

  it('toggles "All cards" correctly', () => {
    render(<CardFilter selectedTags={[]} onTagToggle={mockOnTagToggle} />);

    const allCheckbox = screen.getByLabelText(/all cards/i);
    fireEvent.click(allCheckbox);

    expect(mockOnTagToggle).toHaveBeenCalledWith(['all']);
  });
});
