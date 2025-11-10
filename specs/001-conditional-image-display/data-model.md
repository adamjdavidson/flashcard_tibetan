# Data Model: Conditional Image Display on Cards

**Feature**: Conditional Image Display on Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Entities

### Card (Existing, Enhanced Usage)

**Description**: Card entity already exists. This feature uses existing fields to determine image display.

**Fields** (relevant to this feature):
- `id: string` - Card unique identifier
- `type: 'word' | 'phrase' | 'number'` - Card type
- `imageUrl: string | null` - Image URL (may be null)
- `englishText: string | null` - English text (bidirectional field)
- `tibetanText: string | null` - Tibetan text (bidirectional field)
- `front: string` - Legacy front text field
- `backEnglish: string | null` - Legacy English back field
- `backTibetanScript: string | null` - Legacy Tibetan back field
- `subcategory: string | null` - Legacy subcategory (e.g., 'english_to_tibetan', 'tibetan_to_english')

**Image Display Logic**:
- If `imageUrl` is null → No image displayed
- If `imageUrl` exists and English text on front → Image always displayed
- If `imageUrl` exists and Tibetan text on front → Image randomly displayed (50% chance)

---

### FrontTextState

**Description**: Determined text that appears on card front, based on study direction and card type.

**Fields**:
- `text: string | null` - The actual text displayed on front
- `language: 'english' | 'tibetan' | 'unknown'` - Detected language of front text
- `isEnglish: boolean` - True if text contains no Tibetan characters
- `isTibetan: boolean` - True if text contains Tibetan characters

**Determination Logic**:
- For word/phrase cards with bidirectional fields:
  - If `studyDirection === 'tibetan_to_english'` → `text = tibetanText`
  - If `studyDirection === 'english_to_tibetan'` → `text = englishText`
- For legacy cards:
  - `text = card.front`
- Language detection:
  - `isTibetan = containsTibetan(text)`
  - `isEnglish = !isTibetan && text && text.trim().length > 0`

---

### ImageDisplayDecision

**Description**: Decision state for whether to display image on card front.

**Fields**:
- `shouldDisplay: boolean` - Whether image should be displayed
- `reason: 'always_english' | 'random_tibetan' | 'no_image' | 'image_error'` - Reason for display decision
- `randomValue: number | null` - Random value used for Tibetan randomization (for testing/debugging)

**Decision Logic**:
1. If `imageUrl` is null → `shouldDisplay = false`, `reason = 'no_image'`
2. If `isEnglishOnFront` → `shouldDisplay = true`, `reason = 'always_english'`
3. If `isTibetanOnFront` → `shouldDisplay = Math.random() < 0.5`, `reason = 'random_tibetan'`
4. If image load error → `shouldDisplay = false`, `reason = 'image_error'`

---

## Data Flow

### Image Display Flow

1. **Card Rendering**:
   - Flashcard component receives `card` and `studyDirection` props
   - Component calls `ensureBidirectionalFields(card)` to normalize card

2. **Front Text Determination**:
   - Component determines `frontText` based on study direction:
     - Word/phrase cards: `frontText = studyDirection === 'tibetan_to_english' ? tibetanText : englishText`
     - Legacy cards: `frontText = card.front`

3. **Language Detection**:
   - Component calls `containsTibetan(frontText)` to detect language
   - Sets `isEnglishOnFront = !containsTibetan(frontText) && frontText`
   - Sets `isTibetanOnFront = containsTibetan(frontText)`

4. **Image Display Decision**:
   - If `!card.imageUrl` → Don't display image
   - Else if `isEnglishOnFront` → Always display image
   - Else if `isTibetanOnFront` → Randomly display image (`Math.random() < 0.5`)
   - Else → Don't display image

5. **Rendering**:
   - If decision is to display and no error → Render `<img>` tag
   - If error occurs → Hide image (set `imageError` state)

---

## State Transitions

### Image Display State Machine

```
[Card Loaded] --(has imageUrl)--> [Check Language]
[Check Language] --(English detected)--> [Always Show Image]
[Check Language] --(Tibetan detected)--> [Random Decision]
[Random Decision] --(random < 0.5)--> [Show Image]
[Random Decision] --(random >= 0.5)--> [Hide Image]
[Show Image] --(image loads)--> [Image Visible]
[Show Image] --(image error)--> [Hide Image]
```

### Language Detection State Machine

```
[Front Text] --(containsTibetan() = true)--> [Tibetan]
[Front Text] --(containsTibetan() = false && text exists)--> [English]
[Front Text] --(no text)--> [Unknown]
```

---

## Validation Rules

### Image Display Validation

- `imageUrl` must be valid URL string or null
- Language detection must work for both bidirectional and legacy cards
- Randomization must produce ~50% distribution over multiple displays
- Image error handling must not show broken image placeholders

### Front Text Validation

- `frontText` must be determined correctly based on study direction
- Language detection must use `containsTibetan()` utility
- Must handle null/empty text gracefully

---

## Relationships

- **Card** → **FrontTextState**: Card determines what text appears on front
- **FrontTextState** → **ImageDisplayDecision**: Language of front text determines image display logic
- **Card.imageUrl** → **ImageDisplayDecision**: Image URL existence determines if image can be displayed

---

## Edge Cases

### Mixed Language Text

- If `frontText` contains both English and Tibetan:
  - Use `containsTibetan()` - if any Tibetan characters exist, treat as Tibetan
  - Apply Tibetan randomization rules

### Missing Text

- If `frontText` is null or empty:
  - Don't display image (no language detected)
  - Log warning for debugging

### Study Direction Changes

- When `studyDirection` changes, `frontText` changes
- Image display decision recalculates based on new `frontText`
- Randomization happens fresh (not cached)

### Image URL Format

- Supports both absolute URLs (https://) and relative URLs (/images/...)
- Browser handles URL resolution
- No validation needed beyond existence check

