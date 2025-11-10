# Component Contracts: Conditional Image Display on Cards

**Feature**: Conditional Image Display on Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Component Interface

### Flashcard Component - Enhanced

**Props** (unchanged):
- `card: Card` - Card object to display
- `onFlip: () => void` - Callback when card is flipped (optional)
- `isFlipped: boolean` - External flip state (optional, for controlled component)
- `onFlipChange: (flipped: boolean) => void` - Callback when flip state changes (optional)
- `studyDirection: 'tibetan_to_english' | 'english_to_tibetan'` - Study direction (default: 'tibetan_to_english')

**Internal State** (enhanced):
- `imageError: boolean` - **NEW** - Tracks if image failed to load (default: `false`)

**Behavior** (enhanced):
- Determines front text language based on study direction
- Applies conditional image display logic:
  - Always show image if English on front and `imageUrl` exists
  - Randomly show image if Tibetan on front and `imageUrl` exists
- Handles image load errors gracefully

**Changes from Existing Component**:
- Enhanced image display logic (replaces existing conditional)
- Added `imageError` state for error handling
- Language detection based on front text (not just study direction)

---

## Image Display Logic Contract

### shouldDisplayImage(frontText: string | null, imageUrl: string | null): boolean

Determines whether to display image based on front text language and image availability.

**Parameters**:
- `frontText: string | null` - Text displayed on card front
- `imageUrl: string | null` - Image URL from card

**Returns**: `boolean` - Whether image should be displayed

**Logic**:
1. If `imageUrl` is null → return `false`
2. If `frontText` is null or empty → return `false`
3. If `containsTibetan(frontText)` is false → return `true` (English, always show)
4. If `containsTibetan(frontText)` is true → return `Math.random() < 0.5` (Tibetan, random)

**Example**:
```javascript
// English text - always show
shouldDisplayImage('apple', 'https://example.com/apple.jpg') // true

// Tibetan text - random
shouldDisplayImage('ཀུ་ཤུ', 'https://example.com/apple.jpg') // true or false (random)

// No image URL
shouldDisplayImage('apple', null) // false

// No text
shouldDisplayImage(null, 'https://example.com/apple.jpg') // false
```

---

### detectFrontTextLanguage(card: Card, studyDirection: string): { text: string | null, isEnglish: boolean, isTibetan: boolean }

Determines the front text and its language based on card and study direction.

**Parameters**:
- `card: Card` - Card object
- `studyDirection: 'tibetan_to_english' | 'english_to_tibetan'` - Study direction

**Returns**: Object with:
- `text: string | null` - Front text
- `isEnglish: boolean` - True if text is English
- `isTibetan: boolean` - True if text is Tibetan

**Logic**:
1. Normalize card: `card = ensureBidirectionalFields(card)`
2. Determine front text:
   - Word/phrase cards: `text = studyDirection === 'tibetan_to_english' ? tibetanText : englishText`
   - Legacy cards: `text = card.front`
3. Detect language:
   - `isTibetan = containsTibetan(text)`
   - `isEnglish = !isTibetan && text && text.trim().length > 0`

---

## Component Rendering Contract

### Image Rendering Logic

**Condition**: Image should be displayed if:
- `card.imageUrl` exists
- `shouldDisplayImage(frontText, card.imageUrl)` returns `true`
- `imageError` is `false`

**Rendering**:
```jsx
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

**Error Handling**:
- If image fails to load, `onError` handler sets `imageError = true`
- Component re-renders without image (no broken placeholder)
- Error state resets when card changes (new card ID)

---

## Performance Guarantees

- Language detection: < 1ms (regex check)
- Randomization: < 0.1ms (Math.random() call)
- Image display decision: < 1ms total
- No performance impact on card rendering (< 5ms overhead)

---

## Contract Guarantees

1. **Language Detection**: Always correctly identifies English vs Tibetan text
2. **Image Display**: 100% of English-front cards with images show images
3. **Randomization**: Tibetan-front cards show images ~50% of the time (±10% variance acceptable)
4. **Error Handling**: Broken images never show broken placeholders
5. **Backward Compatibility**: Works with both bidirectional and legacy card formats
6. **Study Direction**: Correctly determines front text based on study direction

