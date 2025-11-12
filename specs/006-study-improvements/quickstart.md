# Quickstart: Study Experience Improvements

**Feature**: Study Experience Improvements  
**Branch**: `006-study-improvements`  
**Date**: 2025-11-12

## Overview

This quickstart guide helps developers implement the three study experience improvements: (1) Image display on card backs, (2) Multi-select instruction level filtering, (3) Admin edit during study. Each improvement is independent and can be implemented in any order.

---

## Prerequisites

**Development Environment**:
- Node.js 20.x
- npm 10.x
- Git

**Project Setup**:
```bash
# Clone repository
git clone https://github.com/adamjdavidson/flashcard_tibetan.git
cd flashcard_tibetan

# Checkout feature branch
git checkout 006-study-improvements

# Install dependencies
npm install

# Start development server
npm run dev
```

**Environment Variables** (`.env.local`):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Database Access**:
- Instruction levels must exist in `instruction_levels` table
- Cards table must have `instruction_level_id` foreign key column
- Run migrations if needed: `npm run setup:supabase`

---

## Feature Implementation Order

**Recommended sequence** (P1 → P2 → P3 following spec priorities):

1. **User Story 1 (P1)**: Image Display on Card Backs
   - Estimated time: 2-3 hours
   - Dependencies: None
   - Tests: 9 unit tests, 3 integration tests, 1 E2E test

2. **User Story 2 (P2)**: Multi-Select Instruction Level Filtering
   - Estimated time: 3-4 hours
   - Dependencies: None
   - Tests: 7 unit tests, 4 component tests, 4 integration tests, 1 E2E test

3. **User Story 3 (P3)**: Admin Edit During Study
   - Estimated time: 2-3 hours
   - Dependencies: None
   - Tests: 5 unit tests, 4 component tests, 3 integration tests, 1 E2E test

**Total estimated time**: 7-10 hours

---

## User Story 1: Image Display on Card Backs

### Files to Modify

```
src/components/Flashcard.jsx       # Move image rendering logic
src/components/Flashcard.css       # Update image styles
src/components/__tests__/Flashcard.test.jsx  # Add tests
tests/e2e/study-images.spec.js     # Create E2E tests (new file)
```

### Implementation Steps

**Step 1: Write Failing Tests** (TDD)
```bash
# Create test file
touch tests/e2e/study-images.spec.js

# Run tests (should fail)
npm run test:components -- Flashcard
```

```javascript
// src/components/__tests__/Flashcard.test.jsx
describe('Image Display - English Text on Back', () => {
  it('displays image on back when card is flipped and has English text', () => {
    const card = {
      id: 'test-1',
      type: 'word',
      englishText: 'wolf',
      tibetanText: 'སྤྱང་ཀི',
      imageUrl: 'https://example.com/wolf.jpg'
    };
    
    const { rerender } = render(
      <Flashcard card={card} isFlipped={false} studyDirection="tibetan_to_english" />
    );
    
    // Image should NOT be visible on front
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    
    // Flip card
    rerender(
      <Flashcard card={card} isFlipped={true} studyDirection="tibetan_to_english" />
    );
    
    // Image SHOULD be visible on back
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/wolf.jpg');
  });
});
```

**Step 2: Modify Flashcard Component**
```javascript
// src/components/Flashcard.jsx

// Determine if image should show (on BACK only)
const shouldShowImage = isFlipped && 
                         card.imageUrl && 
                         (card.englishText || card.backEnglish || card.backArabic) &&
                         !imageError;

return (
  <div className="flashcard-wrapper">
    <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
      <div className="flashcard-inner">
        
        {/* FRONT: No image */}
        <div className="flashcard-front">
          <div className="card-content">
            <div className="card-text-wrapper">
              {/* Front text content */}
            </div>
          </div>
        </div>
        
        {/* BACK: Image here */}
        <div className="flashcard-back">
          <div className="card-content">
            {shouldShowImage && (
              <div className="card-image">
                <img 
                  src={card.imageUrl} 
                  alt={card.englishText || card.tibetanText || 'Card'}
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <div className="card-text-wrapper">
              {/* Back text content */}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
);
```

**Step 3: Update Styles**
```css
/* src/components/Flashcard.css */

/* Image on back side */
.flashcard-back .card-image {
  width: 100%;
  max-width: 300px;
  margin: 0 auto 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px; /* Prevent layout shift */
}

.flashcard-back .card-image img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}
```

**Step 4: Run Tests**
```bash
# Unit tests
npm run test:components -- Flashcard

# E2E tests
npm run test:e2e -- study-images

# All tests
npm run test:all
```

### Verification Checklist

- [ ] Image displays on back when card flipped
- [ ] Image does NOT display on front
- [ ] Works for word, phrase, and number cards
- [ ] Works for both study directions
- [ ] Graceful handling of broken images (no broken icon)
- [ ] No layout shift when image loads
- [ ] Performance: flip time < 500ms

---

## User Story 2: Multi-Select Instruction Level Filtering

### Files to Modify

```
src/App.jsx                         # Add state and filter logic
src/components/CardFilter.jsx       # Add instruction level section
src/components/CardFilter.css       # Style checkboxes
src/components/__tests__/CardFilter.test.jsx  # Add tests
tests/integration/__tests__/studyFlowWithFilters.test.jsx  # Integration tests (new)
tests/e2e/study-filters.spec.js     # E2E tests (new)
```

### Implementation Steps

**Step 1: Load Instruction Levels in App**
```javascript
// src/App.jsx

import { loadInstructionLevels } from './services/instructionLevelsService.js';

function App() {
  // ... existing state ...
  
  // NEW: Instruction level state
  const [instructionLevels, setInstructionLevels] = useState([]);
  const [selectedInstructionLevels, setSelectedInstructionLevels] = useState([]);
  
  // Load instruction levels on mount
  useEffect(() => {
    const loadLevels = async () => {
      const levels = await loadInstructionLevels();
      setInstructionLevels(levels);
    };
    loadLevels();
  }, []);
  
  // Toggle instruction level selection
  const handleInstructionLevelToggle = (levelId) => {
    setSelectedInstructionLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };
  
  // ... rest of component ...
}
```

**Step 2: Update filteredCards Logic**
```javascript
// src/App.jsx

const filteredCards = useMemo(() => {
  let filtered = cards;
  
  // Existing: Filter by card type
  if (!selectedTags.includes('all') && selectedTags.length > 0) {
    filtered = filtered.filter(card => {
      // ... existing type filter logic ...
    });
  }
  
  // NEW: Filter by instruction level
  if (selectedInstructionLevels.length > 0) {
    filtered = filtered.filter(card =>
      selectedInstructionLevels.includes(card.instruction_level_id)
    );
  }
  
  return filtered;
}, [cards, selectedTags, selectedInstructionLevels]);
```

**Step 3: Update CardFilter Component**
```javascript
// src/components/CardFilter.jsx

export default function CardFilter({ 
  selectedTags, 
  onTagToggle, 
  studyDirection,
  onStudyDirectionChange,
  hasWordPhraseCards,
  // NEW props
  instructionLevels = [],
  selectedInstructionLevels = [],
  onInstructionLevelToggle
}) {
  // ... existing code ...
  
  return (
    <div className="card-filter-dropdown">
      {/* ... existing filter sections ... */}
      
      {/* NEW: Instruction Level section */}
      {instructionLevels.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-title">Instruction Level</div>
          {instructionLevels
            .sort((a, b) => a.order - b.order)
            .map(level => (
              <label key={level.id} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedInstructionLevels.includes(level.id)}
                  onChange={() => onInstructionLevelToggle(level.id)}
                  aria-label={`Filter by ${level.name}`}
                />
                <span>{level.name}</span>
              </label>
            ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Style Checkboxes**
```css
/* src/components/CardFilter.css */

.filter-checkbox-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.filter-checkbox-item:hover {
  background-color: var(--color-hover, #f0f0f0);
}

.filter-checkbox-item input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.filter-checkbox-item span {
  flex: 1;
}
```

**Step 5: Pass Props from App to CardFilter**
```javascript
// src/App.jsx (in study view)

<CardFilter 
  selectedTags={selectedTags}
  onTagToggle={setSelectedTags}
  studyDirection={studyDirection}
  onStudyDirectionChange={handleStudyDirectionChange}
  hasWordPhraseCards={hasWordPhraseCards}
  // NEW props
  instructionLevels={instructionLevels}
  selectedInstructionLevels={selectedInstructionLevels}
  onInstructionLevelToggle={handleInstructionLevelToggle}
/>
```

### Verification Checklist

- [ ] Instruction level section appears in filter dropdown
- [ ] Checkboxes are keyboard accessible
- [ ] Multiple levels can be selected
- [ ] Card count updates when filters change
- [ ] Filters apply AND logic (Type + Level)
- [ ] Cards without level excluded when filter active

---

## User Story 3: Admin Edit During Study

### Files to Modify

```
src/App.jsx                         # Add edit modal state and handlers
src/App.css                         # Style edit button
src/components/Flashcard.jsx        # Add edit button (conditional)
src/components/Flashcard.css        # Style edit button
tests/e2e/admin-edit-study.spec.js  # E2E tests (new)
```

### Implementation Steps

**Step 1: Add Edit State in App**
```javascript
// src/App.jsx

function App() {
  // ... existing state ...
  
  // NEW: Edit during study state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  
  // Open edit modal
  const handleEditClick = () => {
    setEditingCard(currentCard);
    setShowEditModal(true);
  };
  
  // Save edited card
  const handleEditSave = async (editedCard) => {
    try {
      // Update via service
      const result = await updateCard(editedCard);
      if (result.success) {
        // Update local state
        setCurrentCard(editedCard);
        setCards(prevCards => 
          prevCards.map(c => c.id === editedCard.id ? editedCard : c)
        );
        // Close modal
        setShowEditModal(false);
        setEditingCard(null);
      }
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };
  
  // Cancel edit
  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingCard(null);
  };
  
  // ... rest of component ...
}
```

**Step 2: Add Edit Button to Flashcard**
```javascript
// src/components/Flashcard.jsx

export default function Flashcard({ 
  card, 
  onFlip, 
  isFlipped, 
  onFlipChange, 
  studyDirection,
  // NEW props
  isAdmin = false,
  onEditClick
}) {
  // ... existing code ...
  
  return (
    <div className="flashcard-wrapper">
      {/* NEW: Edit button (admin only) */}
      {isAdmin && onEditClick && (
        <button 
          className="flashcard-edit-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card flip
            onEditClick();
          }}
          aria-label="Edit this card"
        >
          ✏️ Edit
        </button>
      )}
      
      {/* ... rest of flashcard ... */}
    </div>
  );
}
```

**Step 3: Render Edit Modal in App**
```javascript
// src/App.jsx (in study view)

{view === 'study' && (
  <div className="study-view">
    {/* ... card filter ... */}
    
    {currentCard && (
      <>
        <Flashcard 
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleCardFlip}
          onFlipChange={setIsFlipped}
          studyDirection={currentCardDirection}
          // NEW props
          isAdmin={isAdmin}
          onEditClick={handleEditClick}
        />
        
        {/* ... card buttons ... */}
      </>
    )}
    
    {/* NEW: Edit modal */}
    {showEditModal && editingCard && (
      <div className="modal-overlay" onClick={handleEditCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <EditCardForm
            card={editingCard}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    )}
  </div>
)}
```

**Step 4: Style Edit Button and Modal**
```css
/* src/components/Flashcard.css */

.flashcard-edit-button {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 12px;
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  z-index: 10;
  transition: background-color 0.2s;
}

.flashcard-edit-button:hover {
  background: var(--color-primary-dark, #0056b3);
}

.flashcard-edit-button:focus {
  outline: 2px solid var(--color-focus, #0056b3);
  outline-offset: 2px;
}
```

```css
/* src/App.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
```

### Verification Checklist

- [ ] Edit button visible only to admin users
- [ ] Edit button NOT visible to regular users
- [ ] Clicking edit opens EditCardForm modal
- [ ] Cancel closes modal without changes
- [ ] Save updates card and closes modal
- [ ] Study session state preserved (card position, flip state)
- [ ] Keyboard accessible (Tab, Enter, Esc)

---

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run specific component tests
npm run test:components -- Flashcard
npm run test:components -- CardFilter

# Watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- studyFlowWithFilters
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- study-images
npm run test:e2e -- study-filters
npm run test:e2e -- admin-edit-study

# Run with UI (debugging)
npm run test:e2e:ui
```

### Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

---

## Debugging Tips

### Images Not Displaying

**Check**:
1. Card has `imageUrl` field populated
2. Card has English text (`englishText`, `backEnglish`, or `backArabic`)
3. Card is flipped (`isFlipped === true`)
4. Image URL is valid and accessible
5. No CORS issues (check browser console)

**Debug log**:
```javascript
console.log('Image display check:', {
  hasImageUrl: Boolean(card.imageUrl),
  hasEnglishText: Boolean(card.englishText || card.backEnglish),
  isFlipped,
  imageError
});
```

### Filter Not Working

**Check**:
1. Instruction levels loaded (`instructionLevels.length > 0`)
2. Selected levels array updated (`selectedInstructionLevels`)
3. filteredCards recomputed (check `useMemo` dependencies)
4. Cards have `instruction_level_id` field

**Debug log**:
```javascript
console.log('Filter state:', {
  instructionLevels: instructionLevels.length,
  selected: selectedInstructionLevels,
  filteredCount: filteredCards.length
});
```

### Edit Button Not Showing

**Check**:
1. User has admin role (`isAdmin === true`)
2. `onEditClick` prop passed to Flashcard
3. In study view (not manage/admin view)

**Debug log**:
```javascript
console.log('Edit button check:', {
  isAdmin,
  hasEditCallback: Boolean(onEditClick),
  currentView: view
});
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (`npm run test:all`)
- [ ] No linting errors (`npm run lint`)
- [ ] Accessibility tests passing
- [ ] Performance tests passing
- [ ] Manual testing complete
- [ ] Documentation updated

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or push to main branch (CI/CD auto-deploys)
git push origin 006-study-improvements
```

### Post-Deployment Verification

1. Navigate to production URL
2. Test image display on card backs
3. Test instruction level filtering
4. Test admin edit during study (as admin user)
5. Verify accessibility with screen reader
6. Check performance metrics

---

## Troubleshooting

### Common Issues

**Issue**: Images not loading from Supabase Storage
**Solution**: Check Storage bucket policies, verify image URLs are public

**Issue**: Instruction levels not loading
**Solution**: Verify Supabase connection, check RLS policies on `instruction_levels` table

**Issue**: Edit button showing to non-admin users
**Solution**: Verify `isAdmin` check uses authenticated user role from Supabase

**Issue**: Tests failing in CI but passing locally
**Solution**: Check environment variables in CI, verify Playwright browsers installed

---

## Additional Resources

- [Feature Spec](./spec.md): Full requirements and acceptance criteria
- [Implementation Plan](./plan.md): Technical context and architecture
- [Research Document](./research.md): Technical decisions and alternatives
- [Data Model](./data-model.md): State management and data structures
- [Image Display Contract](./contracts/image-display.md): Detailed behavior specification
- [Filter API Contract](./contracts/filter-api.md): Filter state management specification

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review feature specification and contracts
3. Run tests with verbose output (`npm run test -- --reporter=verbose`)
4. Check browser console for errors
5. Open GitHub issue with reproduction steps

**Happy coding! 🚀**

