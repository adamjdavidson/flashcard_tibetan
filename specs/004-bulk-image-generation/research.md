# Research: Bulk Image Generation

**Feature**: 004-bulk-image-generation  
**Date**: 2025-11-09  
**Purpose**: Research technical approaches and patterns for implementing bulk image generation with progress tracking

## Research Areas

### 1. Progress Tracking Patterns for Long-Running Operations in React

**Decision**: Use React state with `useState` and `useEffect` to manage progress state, updating UI reactively as operations complete.

**Rationale**: 
- React's reactive state management is well-suited for progress tracking
- Existing codebase uses React hooks extensively (AdminPage uses useState for loading states)
- No need for external state management libraries for this feature
- State updates trigger re-renders automatically, providing real-time UI updates

**Alternatives Considered**:
- **Web Workers**: Rejected - adds complexity, image generation API calls must happen in main thread
- **External state library (Redux/Zustand)**: Rejected - overkill for single-feature state, adds dependency
- **Server-side job queue**: Rejected - adds backend complexity, client-side sufficient for expected scale

**Implementation Pattern**:
```javascript
const [progress, setProgress] = useState({
  isRunning: false,
  current: 0,
  total: 0,
  completed: 0,
  failed: 0,
  currentCard: null
});
```

### 2. Cancellation Patterns for Async Operations

**Decision**: Use AbortController for API calls and a cancellation flag for the processing loop.

**Rationale**:
- AbortController is standard web API, well-supported in fetch
- Cancellation flag allows immediate stopping of processing loop
- Existing image generation uses fetch, compatible with AbortController
- Simple pattern that doesn't require complex state management

**Alternatives Considered**:
- **Promise cancellation libraries**: Rejected - AbortController is standard and sufficient
- **Server-side cancellation**: Rejected - client-side operation, no server state to cancel

**Implementation Pattern**:
```javascript
const abortController = useRef(new AbortController());
const [isCancelled, setIsCancelled] = useState(false);

// In processing loop:
if (isCancelled) break;

// For API calls:
fetch(url, { signal: abortController.current.signal })
```

### 3. Rate Limiting Strategies for Sequential API Calls

**Decision**: Process cards sequentially with a small delay between requests to avoid overwhelming the API.

**Rationale**:
- Sequential processing ensures predictable behavior and easier error handling
- Small delay (100-200ms) prevents rate limiting while maintaining reasonable speed
- Success criteria allows 10 cards/minute (6 seconds per card), so sequential is acceptable
- Simpler than batching or parallel processing with concurrency limits

**Alternatives Considered**:
- **Parallel processing with concurrency limit**: Rejected - adds complexity, risk of rate limiting, harder error handling
- **Batching API calls**: Rejected - image generation API doesn't support batch requests
- **Exponential backoff on rate limit errors**: Considered - will implement retry logic with backoff if rate limit detected

**Implementation Pattern**:
```javascript
for (const card of cards) {
  if (isCancelled) break;
  
  const result = await generateAIImage(prompt);
  await saveCard({ ...card, imageUrl: result.imageUrl });
  
  // Small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 200));
  
  updateProgress();
}
```

### 4. Error Handling Patterns for Bulk Operations

**Decision**: Continue processing on individual failures, collect error details, and report in completion summary.

**Rationale**:
- Matches requirement FR-009: "handle errors gracefully by continuing with remaining cards"
- User gets partial results even if some cards fail
- Error details help admin understand what went wrong
- Pattern matches existing error handling in cardsService (continues on individual failures)

**Alternatives Considered**:
- **Stop on first error**: Rejected - violates requirement, poor user experience
- **Retry failed cards automatically**: Considered - may add in future, but not required for MVP

**Implementation Pattern**:
```javascript
const failures = [];

for (const card of cards) {
  try {
    const result = await generateAIImage(prompt);
    if (!result.success) {
      failures.push({ cardId: card.id, error: result.error });
      continue;
    }
    await saveCard({ ...card, imageUrl: result.imageUrl });
  } catch (error) {
    failures.push({ cardId: card.id, error: error.message });
  }
}

// Report failures in completion summary
```

### 5. UI/UX Patterns for Progress Indicators

**Decision**: Use progress bar with percentage, current card info, and cancel button. Display completion summary modal.

**Rationale**:
- Progress bar is standard pattern users understand
- Shows current card being processed provides transparency
- Cancel button gives user control (requirement FR-005)
- Completion summary modal provides clear feedback (requirement FR-008)
- Matches existing UI patterns in AdminPage (loading states, success/error messages)

**Alternatives Considered**:
- **Toast notifications**: Rejected - not suitable for long-running operations, can be missed
- **Separate progress page**: Rejected - overkill, progress can be shown inline
- **Background processing with notification**: Considered - may add in future, but inline progress better for MVP

**Implementation Pattern**:
```jsx
{isRunning && (
  <div className="bulk-progress">
    <div className="progress-bar">
      <div style={{ width: `${(completed / total) * 100}%` }} />
    </div>
    <p>{completed} of {total} completed</p>
    <p>Processing: {currentCard?.englishText || currentCard?.front}</p>
    <button onClick={handleCancel}>Cancel</button>
  </div>
)}
```

### 6. Filter Integration with Existing Card Management

**Decision**: Use existing filter state from AdminPage (filterType, filterCategory, filterInstructionLevel) to filter cards before bulk generation.

**Rationale**:
- AdminPage already has filter state management
- Requirement FR-006: "respect active filters"
- Reuses existing filtering logic from CardManager/AdminCardTable
- No need to duplicate filtering logic

**Implementation Pattern**:
```javascript
// In AdminPage, pass filters to BulkImageGenerator
<BulkImageGenerator
  cards={cards}
  filters={{
    type: filterType,
    category: filterCategory,
    instructionLevel: filterInstructionLevel
  }}
  onComplete={handleBulkComplete}
/>
```

### 7. Card Identification Logic

**Decision**: Filter cards where: type is "word" or "phrase" AND imageUrl is null/undefined/empty.

**Rationale**:
- Matches requirement FR-002: "identify all word cards that do not have an imageUrl value"
- Uses existing card type system
- Simple filter logic, no complex queries needed

**Implementation Pattern**:
```javascript
const cardsNeedingImages = cards.filter(card => 
  (card.type === 'word' || card.type === 'phrase') &&
  !card.imageUrl
);
```

### 8. Text Field Selection for Image Generation

**Decision**: Use priority order: englishText > backEnglish > front, skipping cards with none of these.

**Rationale**:
- Requirement FR-011: "use card's primary text field (englishText, backEnglish, or front)"
- englishText is preferred for word/phrase cards (new bidirectional field)
- backEnglish is fallback for legacy cards
- front is last resort for number cards (though these shouldn't be processed)
- Requirement FR-012: "skip cards that lack any text fields suitable for image generation"

**Implementation Pattern**:
```javascript
function getImagePrompt(card) {
  return card.englishText || card.backEnglish || card.front || null;
}

const cardsWithPrompts = cardsNeedingImages
  .map(card => ({ card, prompt: getImagePrompt(card) }))
  .filter(({ prompt }) => prompt && prompt.trim());
```

## Summary of Decisions

1. **Progress Tracking**: React state with useState/useEffect
2. **Cancellation**: AbortController + cancellation flag
3. **Rate Limiting**: Sequential processing with 200ms delay
4. **Error Handling**: Continue on failures, collect and report errors
5. **UI Pattern**: Progress bar + current card info + cancel button + completion modal
6. **Filter Integration**: Reuse existing AdminPage filter state
7. **Card Identification**: Filter by type (word/phrase) and missing imageUrl
8. **Text Selection**: Priority order englishText > backEnglish > front

All decisions align with existing codebase patterns and constitutional requirements.

