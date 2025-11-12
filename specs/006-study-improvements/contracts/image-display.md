# Contract: Image Display on Flashcard Back

**Component**: `Flashcard.jsx`  
**User Story**: P1 - Image Display on Card Backs  
**Version**: 1.0  
**Date**: 2025-11-12

## Purpose

Define the behavior contract for displaying images on the back (answer side) of flashcards after flipping. Images must appear for all cards containing English text, regardless of study direction or card type.

---

## Component Interface

### Props (Additions)

```typescript
interface FlashcardProps {
  // ... existing props ...
  card: Card;                    // Card data with optional imageUrl
  isFlipped: boolean;            // External flip state (controlled)
  studyDirection: string;        // "tibetan_to_english" | "english_to_tibetan"
  onFlip: () => void;           // Callback when card is flipped
  onFlipChange: (flipped: boolean) => void; // Callback for flip state changes
  
  // NO NEW PROPS REQUIRED - uses existing card.imageUrl
}

interface Card {
  id: string;
  type: "word" | "phrase" | "number";
  imageUrl?: string;            // Optional image URL
  englishText?: string;         // English text (word/phrase cards)
  tibetanText?: string;         // Tibetan text (word/phrase cards)
  backEnglish?: string;         // English back content (number cards)
  backArabic?: string;          // Arabic numeral (number cards)
  // ... other fields ...
}
```

---

## Behavior Contract

### Image Display Rules

**MUST display image when ALL conditions are true**:
1. `card.imageUrl` exists and is a valid string
2. `isFlipped === true` (card is showing back side)
3. Card contains English text (any of: `englishText`, `backEnglish`, or `backArabic` fields)
4. Image has not failed to load (`imageError === false`)

**MUST NOT display image when ANY condition is true**:
1. `card.imageUrl` is null, undefined, or empty string
2. `isFlipped === false` (card is showing front side)
3. Card contains only Tibetan/non-English text
4. Image failed to load (`imageError === true`)

### English Text Detection

**Algorithm**:
```javascript
const hasEnglishText = (card) => {
  // Word/phrase cards: check englishText field
  if (card.type === 'word' || card.type === 'phrase') {
    return Boolean(card.englishText);
  }
  
  // Number cards: check backEnglish or backArabic
  if (card.type === 'number') {
    return Boolean(card.backEnglish || card.backArabic);
  }
  
  // Fallback: check if any back content exists
  return Boolean(card.englishText || card.backEnglish || card.backArabic);
};
```

**Edge Cases**:
- Empty string `""` → Treated as NO English text
- Whitespace-only `"   "` → Treated as NO English text
- Mixed Tibetan/English → Treated as HAS English text
- Null/undefined → Treated as NO English text

---

## State Management

### Internal State

```javascript
const [imageError, setImageError] = useState(false);
```

**Purpose**: Track image load failures for graceful degradation

**Updates**:
- Set to `false` when card changes (reset on card ID change)
- Set to `true` when `<img>` fires `onError` event
- Never set to `false` after error (prevents retry loops)

### Reset Behavior

**On card change**:
```javascript
useEffect(() => {
  setImageError(false); // Reset error state for new card
}, [card?.id]);
```

---

## Rendering Contract

### DOM Structure

**When image should display**:
```html
<div class="flashcard-back">
  <div class="card-image">
    <img 
      src="{card.imageUrl}" 
      alt="{englishText || tibetanText || card.front || 'Card'}"
      onError={() => setImageError(true)}
    />
  </div>
  <div class="card-text-wrapper">
    <!-- Back content -->
  </div>
</div>
```

**When image should NOT display**:
```html
<div class="flashcard-back">
  <!-- NO card-image div -->
  <div class="card-text-wrapper">
    <!-- Back content -->
  </div>
</div>
```

### CSS Requirements

**Image Container**:
- `.card-image`: Display above text content
- `max-width`: 100% (responsive)
- `max-height`: 200px (prevent oversized images)
- `margin-bottom`: 16px (spacing from text)
- `object-fit`: contain (preserve aspect ratio)

**No Layout Shift**:
- Reserve min-height for image container: `min-height: 100px`
- Use CSS transitions for smooth appearance
- No jump when image loads

---

## Error Handling

### Image Load Failure

**Behavior**:
1. `<img onError>` handler sets `imageError = true`
2. Component re-renders without image
3. No broken image icon displayed
4. Text content remains visible and readable
5. Error state persists until card changes

**No retry logic**: Prevents infinite loops and performance issues

**Logging** (optional):
```javascript
onError={() => {
  console.warn(`Failed to load image: ${card.imageUrl}`);
  setImageError(true);
}}
```

### Missing Image URL

**Behavior**:
- Image container NOT rendered
- No error state set
- Text content displays normally
- Silent failure (expected case for cards without images)

---

## Testing Contract

### Unit Tests

**Required test cases**:
1. ✅ Image displays when `isFlipped=true` and English text exists
2. ✅ Image does NOT display when `isFlipped=false`
3. ✅ Image does NOT display when `imageUrl` is null/undefined
4. ✅ Image does NOT display when only Tibetan text exists
5. ✅ `imageError` state resets when card changes
6. ✅ `onError` handler sets `imageError=true`
7. ✅ Image has descriptive alt text
8. ✅ Works for all card types (word, phrase, number)
9. ✅ Works for both study directions (tibetan_to_english, english_to_tibetan)

### Integration Tests

**Required test scenarios**:
1. User flips card → Image appears on back
2. User flips card back to front → Image disappears
3. User advances to next card → New image loads (if available)
4. Image fails to load → No broken icon, text remains readable

### Accessibility Tests

**Required validations**:
1. Image has `alt` attribute with meaningful text
2. Image does not prevent text content from being readable
3. Keyboard navigation works (flip card with Space/Enter)
4. Screen reader announces image presence (via alt text)

---

## Performance Contract

### Load Time Targets

**Success Criterion SC-006**: Card flip transition must NOT increase by >200ms due to image loading

**Optimization strategies**:
1. **Lazy loading**: Images load only when card is flipped (not preloaded)
2. **Async loading**: Image loading does NOT block flip animation
3. **CSS optimization**: Use `will-change: transform` on `.flashcard-inner`
4. **No sequential loading**: Image loads in parallel with flip animation

### Measurement

**Metric**: Time from `onFlip()` call to flip animation completion
**Target**: < 500ms total (< 300ms baseline + < 200ms image load)
**Measurement**: Use `performance.mark()` and `performance.measure()` in tests

---

## Backward Compatibility

### Breaking Changes

**None**. This is an enhancement, not a breaking change.

### Migration

**Existing cards without images**:
- Continue to work without modification
- No image container rendered (expected behavior)

**Existing cards with images**:
- Images move from front to back automatically
- No data migration required
- Works on next render after code deployment

---

## Examples

### Example 1: Word Card (Tibetan → English)

```javascript
const card = {
  id: "word-1",
  type: "word",
  tibetanText: "སྤྱང་ཀི",
  englishText: "wolf",
  imageUrl: "https://example.com/wolf.jpg"
};

// Front side (isFlipped=false)
// → Shows: "སྤྱང་ཀི" (Tibetan text)
// → Image: NOT displayed

// Back side (isFlipped=true)
// → Shows: "wolf" (English text)
// → Image: DISPLAYED above text
```

### Example 2: Number Card

```javascript
const card = {
  id: "number-5",
  type: "number",
  front: "༥",
  backArabic: "5",
  backEnglish: "five",
  imageUrl: "https://example.com/five.jpg"
};

// Front side (isFlipped=false)
// → Shows: "༥" (Tibetan numeral)
// → Image: NOT displayed

// Back side (isFlipped=true)
// → Shows: "5" and "five"
// → Image: DISPLAYED (backEnglish exists)
```

### Example 3: Card Without Image

```javascript
const card = {
  id: "word-2",
  type: "word",
  tibetanText: "གནམ",
  englishText: "sky",
  imageUrl: null
};

// Back side (isFlipped=true)
// → Shows: "sky" (English text)
// → Image: NOT displayed (no imageUrl)
// → No error, graceful degradation
```

---

## Contract Version History

- **v1.0** (2025-11-12): Initial contract for image display on back

