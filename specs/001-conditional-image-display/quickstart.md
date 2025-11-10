# Quickstart: Conditional Image Display on Cards

**Feature**: Conditional Image Display on Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Architecture Overview

This feature modifies the Flashcard component to conditionally display images based on the language of text on the card front: always show images for English text, randomly show images for Tibetan text.

**Key Components**:
1. **Flashcard** - Enhanced image display logic based on front text language
2. **tibetanUtils** - Language detection utility (existing)
3. **cardSchema** - Card field helpers (existing)

## Implementation Steps

### Step 1: Add Image Error State

**File**: `src/components/Flashcard.jsx`

**Changes**:
- Add `imageError` state: `const [imageError, setImageError] = useState(false);`
- Reset `imageError` when card ID changes (in existing `useEffect`)

**Key Code**:
```javascript
const [imageError, setImageError] = useState(false);

// Reset image error when card changes
useEffect(() => {
  setImageError(false);
  // ... existing reset logic ...
}, [card?.id]);
```

---

### Step 2: Create Image Display Decision Function

**File**: `src/components/Flashcard.jsx`

**Changes**:
- Create helper function `shouldDisplayImage(frontText, imageUrl)` that:
  - Returns `false` if `imageUrl` is null
  - Returns `true` if English text (not Tibetan)
  - Returns random boolean if Tibetan text

**Key Code**:
```javascript
// Helper function to determine if image should be displayed
const shouldDisplayImage = (text, imageUrl) => {
  if (!imageUrl || !text) return false;
  
  const isTibetan = containsTibetan(text);
  if (!isTibetan) {
    return true; // Always show for English
  }
  
  // Random for Tibetan (50% chance)
  return Math.random() < 0.5;
};
```

---

### Step 3: Determine Front Text Language

**File**: `src/components/Flashcard.jsx`

**Changes**:
- Use existing `frontText` logic (already computed)
- Detect language: `const isEnglishOnFront = frontText && !containsTibetan(frontText);`
- Detect Tibetan: `const isTibetanOnFront = frontText && containsTibetan(frontText);`

**Key Code**:
```javascript
// frontText is already computed (lines 81-86)
// Detect language
const isEnglishOnFront = frontText && !containsTibetan(frontText);
const isTibetanOnFront = frontText && containsTibetan(frontText);
```

---

### Step 4: Replace Existing Image Display Logic

**File**: `src/components/Flashcard.jsx`

**Changes**:
- Replace existing conditional image display (lines 106-117)
- Use new `shouldDisplayImage()` function
- Add `onError` handler to `<img>` tag

**Key Code**:
```jsx
{/* Conditional image display based on front text language */}
{card.imageUrl && shouldDisplayImage(frontText, card.imageUrl) && !imageError && (
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

### Step 5: Write Tests

**Files**: 
- `src/components/__tests__/Flashcard.test.jsx` (modify existing)

**Test Cases**:
1. Image always displays when English text is on front
2. Image randomly displays when Tibetan text is on front
3. No image displayed when imageUrl is null
4. No image displayed when image load fails
5. Image display works for both study directions
6. Image display works for both bidirectional and legacy cards

---

## Dependencies

### Existing Dependencies (No Changes)
- React 19.2.0
- React DOM 19.2.0
- Existing Flashcard component
- Existing `containsTibetan()` utility
- Existing card schema helpers

### New Dependencies
- None (uses existing React hooks and utilities)

---

## State Management

### Component State Flow

```
Card Loaded:
  card prop → ensureBidirectionalFields() → normalized card

Front Text Determination:
  studyDirection + card → frontText (English or Tibetan)

Language Detection:
  frontText → containsTibetan() → isEnglishOnFront / isTibetanOnFront

Image Display Decision:
  imageUrl + language → shouldDisplayImage() → show/hide decision

Rendering:
  show decision + !imageError → render <img> tag
  imageError → hide image
```

---

## Integration Points

### With Existing Flashcard Component
- Modifies image display logic only
- Uses existing front text determination logic
- Uses existing language detection utility
- No breaking changes to component API

### With Card Data Structure
- Works with bidirectional fields (englishText, tibetanText)
- Works with legacy fields (front, backEnglish, backTibetanScript)
- Uses existing normalization helpers

### With Study Direction
- Respects study direction for front text determination
- Image display adapts to which language is on front

---

## Testing Strategy

### Unit Tests
- Language detection (English vs Tibetan)
- Image display decision logic
- Randomization distribution (over many calls)

### Component Tests
- Image displays for English text
- Image randomly displays for Tibetan text
- Image error handling
- Study direction variations
- Card format variations (bidirectional vs legacy)

### Integration Tests
- End-to-end study flow with image display
- Multiple cards with mixed languages
- Image display across study sessions

---

## Rollout Plan

1. **Phase 1**: Add image error state and helper function
2. **Phase 2**: Replace existing image display logic
3. **Phase 3**: Add tests and verify randomization
4. **Phase 4**: Verify backward compatibility

**Backward Compatibility**: Feature fixes existing bug (images not showing) and adds new behavior (random for Tibetan), maintaining compatibility with all card formats.

