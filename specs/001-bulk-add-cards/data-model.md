# Data Model: Bulk Add Cards

**Feature**: Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Entities

### BulkAddRequest

Represents a single bulk add operation request from the admin.

**Fields**:
- `words: string[]` - Array of English words to process (2-100 words)
- `cardType: 'word' | 'phrase'` - Card type to apply to all words
- `categoryIds: string[]` - Array of category IDs to apply to all cards (optional)
- `instructionLevelId: string | null` - Instruction level ID to apply to all cards (optional)

**Validation Rules**:
- `words.length >= 2` (FR-006)
- `words.length <= 100` (FR-007)
- Each word trimmed and non-empty (FR-016, FR-017)
- `cardType` must be 'word' or 'phrase'
- `categoryIds` must reference existing categories (FR-019)
- `instructionLevelId` must reference existing instruction level if provided (FR-020)

**Example**:
```javascript
{
  words: ['apple', 'banana', 'cherry'],
  cardType: 'word',
  categoryIds: ['cat_123', 'cat_456'],
  instructionLevelId: 'level_789'
}
```

### WordProcessingResult

Represents the processing result for a single word.

**Fields**:
- `word: string` - Original word (trimmed, lowercase normalized)
- `isDuplicate: boolean` - Whether word already exists in database
- `translationResult: TranslationResult | null` - Translation outcome
- `imageResult: ImageResult | null` - Image generation outcome
- `card: Card | null` - Created card object (null if duplicate or error)
- `error: string | null` - Error message if processing failed

**State Transitions**:
1. `word` → duplicate check → `isDuplicate: true` → skip
2. `word` → duplicate check → `isDuplicate: false` → translate → generate image → create card
3. `word` → duplicate check → `isDuplicate: false` → translate (fail) → generate image → create card (partial)
4. `word` → duplicate check → `isDuplicate: false` → translate → generate image (fail) → create card (partial)

**Example**:
```javascript
{
  word: 'apple',
  isDuplicate: false,
  translationResult: {
    success: true,
    translated: 'ཤིང་ཏོག'
  },
  imageResult: {
    success: true,
    imageUrl: 'https://...'
  },
  card: {
    id: 'card_123',
    type: 'word',
    englishText: 'apple',
    tibetanText: 'ཤིང་ཏོག',
    imageUrl: 'https://...',
    categoryIds: ['cat_123', 'new_category_id']
  },
  error: null
}
```

### TranslationResult

Represents the outcome of translating an English word to Tibetan.

**Fields**:
- `success: boolean` - Whether translation succeeded
- `translated: string | null` - Translated Tibetan text (null if failed)
- `error: string | null` - Error message if translation failed

**Example**:
```javascript
{
  success: true,
  translated: 'ཤིང་ཏོག',
  error: null
}
```

### ImageResult

Represents the outcome of generating an image for a card.

**Fields**:
- `success: boolean` - Whether image generation succeeded
- `imageUrl: string | null` - Generated image URL (null if failed)
- `error: string | null` - Error message if generation failed

**Example**:
```javascript
{
  success: true,
  imageUrl: 'https://storage.supabase.co/...',
  error: null
}
```

### BulkAddSummary

Represents the final summary report of a bulk add operation.

**Fields**:
- `totalWords: number` - Total words processed
- `cardsCreated: number` - Number of cards successfully created
- `duplicatesSkipped: number` - Number of words skipped as duplicates
- `translationFailures: Array<{word: string, error: string}>` - Words that failed translation
- `imageFailures: Array<{word: string, error: string}>` - Words that failed image generation
- `errors: Array<{word: string, error: string}>` - Other errors encountered
- `createdCards: Card[]` - Array of successfully created cards
- `duplicateWords: string[]` - Array of words that were duplicates

**Validation Rules**:
- `cardsCreated + duplicatesSkipped <= totalWords`
- `translationFailures.length + imageFailures.length + errors.length <= totalWords`

**Example**:
```javascript
{
  totalWords: 10,
  cardsCreated: 8,
  duplicatesSkipped: 2,
  translationFailures: [
    { word: 'xyzzy', error: 'Translation API unavailable' }
  ],
  imageFailures: [
    { word: 'quux', error: 'Image generation rate limit exceeded' }
  ],
  errors: [],
  createdCards: [/* 8 card objects */],
  duplicateWords: ['apple', 'banana']
}
```

## Relationships

```
BulkAddRequest
  ├─→ processes → WordProcessingResult[] (1-to-many)
  │     ├─→ checks → TranslationResult (1-to-1, optional)
  │     ├─→ generates → ImageResult (1-to-1, optional)
  │     └─→ creates → Card (1-to-1, optional)
  └─→ produces → BulkAddSummary (1-to-1)
```

## Data Flow

1. **Input**: Admin submits `BulkAddRequest` with words and metadata
2. **Duplicate Check**: System queries database for existing cards matching words
3. **Translation**: For each new word, call translation API (batched)
4. **Image Generation**: For each new word, call image generation API (sequential)
5. **Card Creation**: Create cards with available data (translation/image may be null)
6. **Category Assignment**: Assign selected categories + "new" category to all cards
7. **Output**: Return `BulkAddSummary` with results

## Database Schema Impact

**No new tables required**. Uses existing tables:
- `cards` - Stores created cards
- `categories` - Stores categories (including "new" category)
- `card_categories` - Many-to-many relationship between cards and categories
- `instruction_levels` - Stores instruction levels

**Queries**:
- Duplicate check: `SELECT english_text FROM cards WHERE english_text IN (...) OR english_text ILIKE ANY(...)`
- Card creation: `INSERT INTO cards (...) VALUES (...) ON CONFLICT (id) DO UPDATE ...`
- Category association: `INSERT INTO card_categories (card_id, category_id) VALUES (...)`

## Validation Rules Summary

| Field | Rule | Source |
|-------|------|--------|
| `words.length` | >= 2, <= 100 | FR-006, FR-007 |
| `words[]` | Trimmed, non-empty | FR-016, FR-017 |
| `cardType` | 'word' or 'phrase' | FR-003 |
| `categoryIds[]` | Must exist in database | FR-019 |
| `instructionLevelId` | Must exist in database if provided | FR-020 |
| `englishText` | Case-insensitive duplicate check | FR-018 |
| `tibetanText` | Optional (can be null if translation fails) | FR-022 |
| `imageUrl` | Optional (can be null if generation fails) | FR-022 |
| `categoryIds` | Must include "new" category | FR-013 |

## Error States

1. **Validation Error**: Request invalid (empty words, too many words, invalid card type)
2. **Duplicate**: Word already exists (not an error, reported in summary)
3. **Translation Failure**: Translation API error (card still created, failure reported)
4. **Image Generation Failure**: Image API error (card still created, failure reported)
5. **Database Error**: Card creation fails (reported in errors array)
6. **Category Error**: "new" category creation fails (operation continues, error reported)

