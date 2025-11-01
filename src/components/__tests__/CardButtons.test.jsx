import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardButtons from '../CardButtons.jsx';

describe('CardButtons', () => {
  const mockOnRate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all quality buttons', () => {
    render(<CardButtons onRate={mockOnRate} />);

    expect(screen.getByText('Forgot')).toBeInTheDocument();
    expect(screen.getByText('Partial Recall')).toBeInTheDocument();
    expect(screen.getByText('Hard Recall')).toBeInTheDocument();
    expect(screen.getByText('Easy Recall')).toBeInTheDocument();
  });

  it('calls onRate with forgot type when Forgot button is clicked', () => {
    render(<CardButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Forgot'));
    expect(mockOnRate).toHaveBeenCalledWith('forgot');
  });

  it('calls onRate with partial type when Partial Recall button is clicked', () => {
    render(<CardButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Partial Recall'));
    expect(mockOnRate).toHaveBeenCalledWith('partial');
  });

  it('calls onRate with hard type when Hard Recall button is clicked', () => {
    render(<CardButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Hard Recall'));
    expect(mockOnRate).toHaveBeenCalledWith('hard');
  });

  it('calls onRate with easy type when Easy Recall button is clicked', () => {
    render(<CardButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Easy Recall'));
    expect(mockOnRate).toHaveBeenCalledWith('easy');
  });

  it('handles disabled state', () => {
    render(<CardButtons onRate={mockOnRate} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
