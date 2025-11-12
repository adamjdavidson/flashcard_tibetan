# Research: Conditional Image Display on Cards

**Feature**: Conditional Image Display on Cards  
**Date**: 2025-11-09  
**Phase**: Phase 0 - Research

## Research Tasks

### Task 1: Language Detection for Front Text

**Question**: How should we determine if the text on the card front is English or Tibetan?

**Decision**: Use existing `containsTibetan()` utility function from `src/utils/tibetanUtils.js` to detect Tibetan characters. For bidirectional cards, use `frontText` determined by study direction. For legacy cards, check `card.front` directly.

**Rationale**: 
- `containsTibetan()` already exists and is used throughout the codebase
- Checks for Tibetan Unicode range (U+0F00 to U+0FFF)
- Works with both bidirectional and legacy card formats
- Consistent with existing Flashcard component logic

**Alternatives Considered**:
- Create new language detection function: Rejected - existing utility is sufficient
- Use card type/subcategory to infer language: Rejected - unreliable, doesn't account for study direction
- Use regex pattern matching: Rejected - `containsTibetan()` already encapsulates this logic

**Implementation Pattern**:
```javascript
import { containsTibetan } from '../utils/tibetanUtils.js';

// In Flashcard component
const frontText = isWordPhraseCard 
  ? (studyDirection === 'tibetan_to_english' ? tibetanText : englishText)
  : card.front;

const isEnglishOnFront = frontText && !containsTibetan(frontText);
const isTibetanOnFront = frontText && containsTibetan(frontText);
```

---

### Task 2: Randomization Strategy for Tibetan Text

**Question**: How should randomization be implemented to show images randomly for Tibetan text?

**Decision**: Use `Math.random()` to generate a random value (0-1) and compare against a threshold (0.5) to determine whether to show the image. Randomization happens on each render, not cached per card.

**Rationale**:
- Simple and performant (no state management needed)
- True randomization per display (not deterministic per card ID)
- No need for seeded random or complex algorithms
- Meets requirement FR-006 (per-card-display randomization)

**Alternatives Considered**:
- Cache randomization result per card ID: Rejected - violates requirement FR-006 (should be random each time)
- Use card ID hash for deterministic "random": Rejected - violates requirement (not truly random)
- Store randomization state in component: Rejected - unnecessary complexity, Math.random() is sufficient

**Implementation Pattern**:
```javascript
// Randomly decide whether to show image for Tibetan text
const shouldShowImageForTibetan = () => {
  return Math.random() < 0.5; // 50% chance
};

// In render logic
const showImage = card.imageUrl && (
  isEnglishOnFront || // Always show for English
  (isTibetanOnFront && shouldShowImageForTibetan()) // Random for Tibetan
);
```

---

### Task 3: Image Display Logic Location

**Question**: Where should the conditional image display logic be implemented?

**Decision**: Implement directly in Flashcard component's render logic, replacing the existing conditional image display code.

**Rationale**:
- Flashcard component already handles image display
- Keeps logic co-located with rendering
- No need for separate utility or service
- Simplest approach for display-only logic

**Alternatives Considered**:
- Create separate utility function: Rejected - adds unnecessary abstraction for simple conditional rendering
- Move to card data transformation layer: Rejected - display logic belongs in component, not data layer
- Create wrapper component: Rejected - unnecessary complexity

**Code Location**: `src/components/Flashcard.jsx` lines 106-117 (existing image display logic)

---

### Task 4: Handling Missing or Broken Images

**Question**: How should we handle cases where imageUrl exists but image fails to load?

**Decision**: Rely on browser's native image error handling. Use `onError` handler on `<img>` tag to hide broken images gracefully. No broken image placeholders should appear.

**Rationale**:
- Browser handles image loading errors natively
- `onError` handler can hide broken images
- Matches requirement FR-005 (handle gracefully)
- No need for complex error state management

**Alternatives Considered**:
- Preload and validate images: Rejected - adds complexity and performance overhead
- Show placeholder image: Rejected - violates requirement FR-005 (no broken placeholders)
- Track image load state: Rejected - unnecessary complexity for display-only feature

**Implementation Pattern**:
```javascript
const [imageError, setImageError] = useState(false);

// In render
{showImage && !imageError && (
  <div className="card-image">
    <img 
      src={card.imageUrl} 
      alt={englishText || tibetanText || 'Card'}
      onError={() => setImageError(true)}
    />
  </div>
)}
```

---

### Task 5: Study Direction and Front Text Determination

**Question**: How do we determine what text appears on the front based on study direction?

**Decision**: Use existing logic in Flashcard component that determines `frontText` based on `studyDirection` and card bidirectional fields (`englishText`, `tibetanText`).

**Rationale**:
- Flashcard component already has this logic (lines 76-86)
- Handles both bidirectional and legacy cards
- Accounts for study direction correctly
- No need to duplicate logic

**Existing Logic**:
```javascript
const frontText = isWordPhraseCard 
  ? (studyDirection === 'tibetan_to_english' ? tibetanText : englishText)
  : card.front;
```

**Usage**: Use `frontText` to determine language, then apply image display rules based on language.

---

### Task 6: Backward Compatibility with Legacy Cards

**Question**: How should we handle legacy cards that don't have bidirectional fields?

**Decision**: Use existing `ensureBidirectionalFields()`, `getEnglishText()`, and `getTibetanText()` helpers from `cardSchema.js` to normalize cards. Then apply same image display logic.

**Rationale**:
- Helpers already exist and are used in Flashcard component
- Ensures consistent behavior across card formats
- Matches requirement FR-007 and FR-008
- No special handling needed for legacy cards

**Implementation**: Flashcard component already calls `ensureBidirectionalFields()` (line 66), so legacy cards are normalized before rendering.

---

## Summary of Decisions

1. **Language Detection**: Use `containsTibetan()` utility on `frontText` determined by study direction
2. **Randomization**: Use `Math.random() < 0.5` for Tibetan text (50% chance)
3. **Logic Location**: Implement in Flashcard component render logic
4. **Error Handling**: Use `onError` handler on `<img>` tag to hide broken images
5. **Front Text**: Use existing `frontText` logic based on study direction
6. **Legacy Support**: Use existing bidirectional field helpers for normalization

All research tasks complete. No NEEDS CLARIFICATION markers remain.

