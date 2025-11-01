import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressStats from '../ProgressStats.jsx';

describe('ProgressStats', () => {
  const mockStats = {
    totalCards: 100,
    cardsDue: 25,
    cardsLearned: 75,
    totalReviews: 500,
    totalProgress: 75
  };

  it('renders statistics correctly', () => {
    render(<ProgressStats stats={mockStats} />);

    expect(screen.getByText('100')).toBeInTheDocument(); // Total Cards
    expect(screen.getByText('25')).toBeInTheDocument(); // Cards Due
    expect(screen.getByText('75')).toBeInTheDocument(); // Cards Learned
    expect(screen.getByText('500')).toBeInTheDocument(); // Total Reviews
  });

  it('displays all stat labels', () => {
    render(<ProgressStats stats={mockStats} />);

    expect(screen.getByText('Total Cards')).toBeInTheDocument();
    expect(screen.getByText('Cards Due')).toBeInTheDocument();
    expect(screen.getByText('Cards Learned')).toBeInTheDocument();
    expect(screen.getByText('Total Reviews')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const zeroStats = {
      totalCards: 0,
      cardsDue: 0,
      cardsLearned: 0,
      totalReviews: 0,
      totalProgress: 0
    };

    render(<ProgressStats stats={zeroStats} />);

    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('handles missing stats gracefully', () => {
    render(<ProgressStats stats={null} />);
    // Should handle null stats without crashing
    expect(screen.queryByText('Total Cards')).not.toBeInTheDocument();
  });

  it('handles partial stats', () => {
    const partialStats = {
      totalCards: 50,
      cardsDue: 10
    };

    render(<ProgressStats stats={partialStats} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

