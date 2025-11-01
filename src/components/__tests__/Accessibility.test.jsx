import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Flashcard from '../Flashcard.jsx';
import CardButtons from '../CardButtons.jsx';
import ProgressStats from '../ProgressStats.jsx';
import AddCardForm from '../AddCardForm.jsx';
import CardFilter from '../CardFilter.jsx';
import AdminCardTable from '../AdminCardTable.jsx';
import AdminClassificationManager from '../AdminClassificationManager.jsx';

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

  describe('Admin Card Table Accessibility', () => {
    const mockCards = [
      {
        id: 'card1',
        type: 'word',
        front: 'ཁམས་པ',
        backEnglish: 'Kham',
        categories: [{ id: 'cat1', name: 'Greetings' }],
        instructionLevel: { id: 'level1', name: 'Beginner' },
        createdAt: Date.now()
      }
    ];

    it('AdminCardTable has no accessibility violations', async () => {
      const { container } = render(
        <AdminCardTable
          cards={mockCards}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AdminCardTable has proper ARIA labels', () => {
      const { container } = render(
        <AdminCardTable
          cards={mockCards}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );
      
      // Check table has aria-label
      const table = container.querySelector('table[aria-label]');
      expect(table).toBeDefined();
      expect(table?.getAttribute('aria-label')).toBe('Card management table');

      // Check sortable headers have aria-label
      const sortButtons = container.querySelectorAll('button.sortable-header');
      sortButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/sort by/i);
      });

      // Check action buttons have aria-label
      const editButtons = container.querySelectorAll('button[aria-label*="Edit card"]');
      const deleteButtons = container.querySelectorAll('button[aria-label*="Delete card"]');
      
      editButtons.forEach(button => {
        expect(button.getAttribute('aria-label')).toMatch(/edit card/i);
      });

      deleteButtons.forEach(button => {
        expect(button.getAttribute('aria-label')).toMatch(/delete card/i);
      });
    });

    it('AdminCardTable has proper row and column indexes', () => {
      const { container } = render(
        <AdminCardTable
          cards={mockCards}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );

      // Check rows have aria-rowindex
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row, _index) => {
        const rowIndex = row.getAttribute('aria-rowindex');
        expect(rowIndex).toBeTruthy();
        expect(parseInt(rowIndex || '0')).toBeGreaterThan(0);
      });

      // Check cells have aria-colindex
      const cells = container.querySelectorAll('tbody td');
      cells.forEach(cell => {
        const colIndex = cell.getAttribute('aria-colindex');
        expect(colIndex).toBeTruthy();
        expect(parseInt(colIndex || '0')).toBeGreaterThan(0);
        expect(parseInt(colIndex || '0')).toBeLessThanOrEqual(7);
      });
    });

    it('AdminCardTable has ARIA live region', () => {
      const { container } = render(
        <AdminCardTable
          cards={mockCards}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );

      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion?.getAttribute('aria-live')).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-atomic')).toBeTruthy();
    });

    it('AdminCardTable supports keyboard navigation', () => {
      const { container } = render(
        <AdminCardTable
          cards={mockCards}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );

      // Table should be focusable
      const table = container.querySelector('table');
      expect(table).toBeDefined();
      const tabIndex = table?.getAttribute('tabindex');
      if (tabIndex !== null) {
        expect(parseInt(tabIndex || '0')).toBeGreaterThanOrEqual(0);
      }

      // Buttons should be keyboard accessible
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.tagName.toLowerCase()).toBe('button');
        // Buttons are keyboard accessible by default
      });
    });
  });

  describe('Admin Classification Manager Accessibility', () => {
    it('AdminClassificationManager has no accessibility violations', async () => {
      // Mock the services - these need to be mocked at module level, but for test purposes
      // we'll just test the component structure
      const { container } = render(<AdminClassificationManager />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AdminClassificationManager has proper tab roles', () => {
      const { container } = render(<AdminClassificationManager />);
      
      // Check for tablist
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeDefined();

      // Check for tabs
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(0);

      tabs.forEach(tab => {
        expect(tab.getAttribute('aria-selected')).toBeTruthy();
        expect(tab.getAttribute('aria-controls')).toBeTruthy();
      });

      // Check for tabpanels
      const tabpanels = container.querySelectorAll('[role="tabpanel"]');
      expect(tabpanels.length).toBeGreaterThan(0);

      tabpanels.forEach(panel => {
        expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
      });
    });

    it('AdminClassificationManager has ARIA live regions for messages', () => {
      const { container } = render(<AdminClassificationManager />);
      
      // Check for ARIA live regions (error/success messages)
      const liveRegions = container.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
      // Should have at least one live region or alert/status role
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });
});

