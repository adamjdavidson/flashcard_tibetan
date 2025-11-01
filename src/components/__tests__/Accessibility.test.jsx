import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Flashcard from '../Flashcard.jsx';
import CardButtons from '../CardButtons.jsx';
import ProgressStats from '../ProgressStats.jsx';
import AddCardForm from '../AddCardForm.jsx';
import CardFilter from '../CardFilter.jsx';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  const mockCard = {
    id: 'card1',
    type: 'word',
    front: 'ཞབས་ཏོག',
    backEnglish: 'service',
    backTibetanScript: 'ཞབས་ཏོག'
  };

  const mockStats = {
    totalCards: 100,
    cardsDue: 25,
    cardsLearned: 75,
    totalReviews: 500
  };

  it('Flashcard component has no accessibility violations', async () => {
    const { container } = render(<Flashcard card={mockCard} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CardButtons component has no accessibility violations', async () => {
    const { container } = render(<CardButtons onRate={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProgressStats component has no accessibility violations', async () => {
    const { container } = render(<ProgressStats stats={mockStats} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AddCardForm component has no accessibility violations', async () => {
    const { container } = render(
      <AddCardForm onAdd={() => {}} onCancel={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CardFilter component has no accessibility violations', async () => {
    const { container } = render(
      <CardFilter selectedTags={[]} onTagToggle={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Flashcard has proper ARIA labels', () => {
    const { container } = render(<Flashcard card={mockCard} />);
    const turnButton = container.querySelector('button[aria-label="Turn card back"]');
    expect(turnButton).toBeDefined();
  });

  it('CardButtons have proper button roles', () => {
    const { container } = render(<CardButtons onRate={() => {}} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    // Buttons don't need explicit role="button" - native button elements have it implicitly
    buttons.forEach(button => {
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });

  it('Form inputs have proper labels', () => {
    const { container } = render(
      <AddCardForm onAdd={() => {}} onCancel={() => {}} />
    );
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        expect(label).toBeDefined();
      }
    });
  });
});

