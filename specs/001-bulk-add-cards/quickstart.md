# Quickstart: Bulk Add Cards Implementation

**Feature**: Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Overview

This guide provides a high-level implementation roadmap for the bulk add cards feature. The feature enables admins to paste a list of words, automatically translate them to Tibetan, generate images, and create cards with a "new" category flag for review.

## Architecture

```
AdminPage
  └─→ BulkAddForm (NEW)
       ├─→ User Input (words, card type, categories, instruction level)
       ├─→ Validation
       └─→ bulkAddService.processBulkAdd()
            ├─→ checkDuplicates()
            ├─→ ensureNewCategory()
            ├─→ translateWords() (batched)
            ├─→ generateImages() (sequential)
            ├─→ createCards() (batch)
            └─→ assignCategories()
       └─→ BulkAddSummary (NEW)
            └─→ Display results
```

## Implementation Steps

### Step 1: Create Bulk Add Service

**File**: `src/services/bulkAddService.js`

**Key Functions**:
1. `processBulkAdd(request, options)` - Main processing function
2. `checkDuplicates(words)` - Check for existing cards
3. `ensureNewCategory()` - Ensure "new" category exists
4. `translateWords(words)` - Batch translation with delays
5. `generateImages(words)` - Sequential image generation with delays
6. `createCards(words, metadata, translations, images)` - Batch card creation

**Dependencies**:
- `cardsService.js` - Card CRUD operations
- `categoriesService.js` - Category management
- `utils/translation.js` - Translation API wrapper
- `utils/images.js` - Image generation API wrapper
- `data/cardSchema.js` - Card creation and validation

### Step 2: Create Bulk Add Form Component

**File**: `src/components/BulkAddForm.jsx`

**Features**:
- Text area for pasting words (one per line)
- Card type selector (word/phrase)
- Category multi-select
- Instruction level selector
- Word count display (FR-024)
- Validation (2-100 words, FR-006, FR-007)
- Progress indicator during processing (FR-025)
- Cancel button (FR-023)

**State Management**:
- Form inputs (words, cardType, categoryIds, instructionLevelId)
- Processing state (idle, processing, complete)
- Progress tracking (current, total, stage)
- Error messages

**Integration**:
- Uses `bulkAddService.processBulkAdd()`
- Displays `BulkAddSummary` on completion
- Integrates with `AdminPage` via modal (similar to `AdminCardModal`)

### Step 3: Create Summary Component

**File**: `src/components/BulkAddSummary.jsx`

**Features**:
- Display cards created count
- Display duplicates skipped count
- List translation failures (if any)
- List image generation failures (if any)
- List other errors (if any)
- Show created cards (optional, collapsible)
- Show duplicate words (optional, collapsible)

**Props**:
- `summary: BulkAddSummary` - Summary object from service
- `onClose: () => void` - Close callback
- `onViewCards: () => void` - Navigate to card list callback

### Step 4: Integrate with AdminPage

**File**: `src/components/AdminPage.jsx`

**Changes**:
1. Add "Bulk Add Cards" button in Card Management tab header
2. Add state for bulk add modal (`bulkAddModalOpen`)
3. Add `BulkAddForm` component (in modal, similar to `AdminCardModal`)
4. Handle bulk add completion:
   - Refresh card list
   - Show success message
   - Close modal

**Pattern**: Follow existing `AdminCardModal` integration pattern

### Step 5: Add Styling

**Files**:
- `src/components/BulkAddForm.css` - Form styling
- `src/components/BulkAddSummary.css` - Summary styling

**Requirements**:
- Match existing admin form styling
- Responsive design
- Accessible (WCAG 2.1 AA)
- Progress indicator styling
- Error message styling

### Step 6: Write Tests

**Unit Tests** (`src/services/__tests__/bulkAddService.test.js`):
- Duplicate detection logic
- Batch processing logic
- Error handling
- Category management

**Component Tests** (`src/components/__tests__/BulkAddForm.test.jsx`):
- Form validation
- User input handling
- Progress display
- Error display
- Accessibility

**Integration Tests** (`src/integration/__tests__/bulkAdd.test.js`):
- End-to-end bulk add workflow
- Duplicate detection
- Translation/image generation failures
- Category assignment

**E2E Tests** (`tests/integration/e2e/adminWorkflows.spec.js`):
- Complete admin workflow
- Bulk add with various scenarios
- Error handling scenarios

## Key Implementation Details

### Duplicate Detection

```javascript
// Option 1: Query database (more efficient for large datasets)
const { data: existingCards } = await supabase
  .from('cards')
  .select('english_text')
  .in('english_text', normalizedWords);

// Option 2: Load all cards and filter client-side (simpler, acceptable for admin feature)
const allCards = await loadCards();
const existingWords = new Set(
  allCards
    .filter(card => card.englishText)
    .map(card => card.englishText.toLowerCase().trim())
);
const duplicates = words.filter(word => existingWords.has(word.toLowerCase().trim()));
```

### Batch Translation

```javascript
const BATCH_SIZE = 5;
const translationResults = [];

for (let i = 0; i < words.length; i += BATCH_SIZE) {
  const batch = words.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(
    batch.map(word => translateText(word, 'en', 'bo'))
  );
  translationResults.push(...batchResults);
  
  if (i + BATCH_SIZE < words.length) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit delay
  }
}
```

### Sequential Image Generation

```javascript
const imageResults = [];

for (const word of words) {
  const result = await generateAIImage(word);
  imageResults.push(result);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
}
```

### Progress Tracking

```javascript
const [progress, setProgress] = useState({
  stage: 'idle',
  current: 0,
  total: words.length,
  details: {}
});

// Update during processing
setProgress(prev => ({
  stage: 'translating',
  current: i + 1,
  total: words.length,
  details: { ...prev.details, [word]: 'processing' }
}));
```

## Testing Strategy

1. **Unit Tests**: Test service functions in isolation with mocked dependencies
2. **Component Tests**: Test UI components with React Testing Library
3. **Integration Tests**: Test service + component interactions
4. **E2E Tests**: Test complete workflow with Playwright

## Performance Considerations

- **Duplicate Check**: Use single query or client-side filter (acceptable for admin feature)
- **Translation**: Batch processing with delays to respect rate limits
- **Image Generation**: Sequential processing with delays to respect rate limits
- **Card Creation**: Use existing `saveCards()` batch function
- **Progress Updates**: Throttle updates to prevent UI lag (update every 5-10 items)

## Error Handling

- **Validation Errors**: Show immediately, prevent submission
- **API Errors**: Continue processing, report in summary
- **Database Errors**: Report in summary, don't create partial cards
- **Network Errors**: Retry logic (use existing `retrySupabaseQuery` pattern)

## Accessibility

- **Keyboard Navigation**: All form controls keyboard accessible
- **Screen Reader**: ARIA labels for progress, errors, results
- **Focus Management**: Focus moves to summary on completion
- **Error Announcements**: Errors announced to screen readers

## Next Steps

1. Implement `bulkAddService.js` following service contracts
2. Implement `BulkAddForm.jsx` following component patterns
3. Implement `BulkAddSummary.jsx` for results display
4. Integrate with `AdminPage.jsx`
5. Write tests following test-first principle
6. Add styling matching existing admin UI
7. Test with real API keys (translation, image generation)

