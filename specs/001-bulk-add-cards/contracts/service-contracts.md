# Service Contracts: Bulk Add Cards

**Feature**: Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Service Interface

### bulkAddService.processBulkAdd(request)

Processes a bulk add operation, checking duplicates, translating words, generating images, and creating cards.

**Parameters**:
- `request: BulkAddRequest` - Bulk add request object

**Returns**: `Promise<BulkAddSummary>`

**Behavior**:
1. Validates request (word count, card type, categories, instruction level)
2. Checks for duplicates in database
3. Processes new words:
   - Translates each word to Tibetan (batched, with delays)
   - Generates image for each word (sequential, with delays)
   - Creates card with available data
4. Assigns categories (selected + "new") to all created cards
5. Returns summary with results

**Errors**:
- Throws `ValidationError` if request invalid
- Returns summary with error details for partial failures (does not throw)

**Example**:
```javascript
const request = {
  words: ['apple', 'banana', 'cherry'],
  cardType: 'word',
  categoryIds: ['cat_123'],
  instructionLevelId: 'level_789'
};

const summary = await bulkAddService.processBulkAdd(request);
// {
//   totalWords: 3,
//   cardsCreated: 2,
//   duplicatesSkipped: 1,
//   translationFailures: [],
//   imageFailures: [],
//   errors: [],
//   createdCards: [...],
//   duplicateWords: ['apple']
// }
```

### bulkAddService.checkDuplicates(words)

Checks which words already exist in the database.

**Parameters**:
- `words: string[]` - Array of words to check (normalized, trimmed)

**Returns**: `Promise<{duplicates: string[], newWords: string[]}>`

**Behavior**:
- Queries database for cards matching words (case-insensitive)
- Returns arrays of duplicate words and new words

**Errors**:
- Throws `DatabaseError` if query fails

**Example**:
```javascript
const words = ['apple', 'banana', 'cherry'];
const { duplicates, newWords } = await bulkAddService.checkDuplicates(words);
// { duplicates: ['apple'], newWords: ['banana', 'cherry'] }
```

### bulkAddService.ensureNewCategory()

Ensures the "new" category exists in the database, creating it if necessary.

**Parameters**: None

**Returns**: `Promise<Category>`

**Behavior**:
- Checks if "new" category exists
- Creates category if it doesn't exist
- Returns category object

**Errors**:
- Throws `DatabaseError` if category creation fails

**Example**:
```javascript
const newCategory = await bulkAddService.ensureNewCategory();
// { id: 'cat_new_123', name: 'new', description: '...' }
```

## Dependencies

### Translation Service

**Interface**: `translateText(text: string, fromLang: string, toLang: string)`

**Returns**: `Promise<{success: boolean, translated?: string, error?: string}>`

**Used By**: `bulkAddService.processBulkAdd()`

**Rate Limits**: Google Translate API - 500k chars/month free tier

**Error Handling**: Returns `{success: false, error: string}` on failure, does not throw

### Image Generation Service

**Interface**: `generateAIImage(prompt: string, style?: string)`

**Returns**: `Promise<{success: boolean, imageUrl?: string, error?: string}>`

**Used By**: `bulkAddService.processBulkAdd()`

**Rate Limits**: Gemini API - varies by plan (typically 15-60 requests/minute)

**Error Handling**: Returns `{success: false, error: string}` on failure, does not throw

### Card Service

**Interface**: `saveCards(cards: Card[], fallbackSave?: Function)`

**Returns**: `Promise<{success: boolean, data?: Card[], error?: string}>`

**Used By**: `bulkAddService.processBulkAdd()`

**Error Handling**: Returns `{success: false, error: string}` on failure

### Category Service

**Interface**: 
- `loadCategories()` - Returns `Promise<Category[]>`
- `createCategory(category: {name: string, description?: string, created_by?: string})` - Returns `Promise<{success: boolean, data?: Category, error?: string}>`

**Used By**: `bulkAddService.ensureNewCategory()`, `bulkAddService.processBulkAdd()`

**Error Handling**: Returns `{success: false, error: string}` on failure

## Progress Callback Interface

### onProgress(progress: ProgressUpdate)

Optional callback for progress updates during bulk processing.

**Parameters**:
- `progress: ProgressUpdate` - Progress update object

**ProgressUpdate Structure**:
```javascript
{
  stage: 'checking' | 'translating' | 'generating' | 'creating' | 'complete',
  current: number,        // Current item being processed
  total: number,         // Total items to process
  details: {             // Per-word status
    [word: string]: 'pending' | 'processing' | 'success' | 'failed' | 'skipped'
  }
}
```

**Example**:
```javascript
const summary = await bulkAddService.processBulkAdd(request, {
  onProgress: (progress) => {
    console.log(`Processing ${progress.current}/${progress.total}: ${progress.stage}`);
  }
});
```

## Error Types

### ValidationError

Thrown when request validation fails.

**Properties**:
- `message: string` - Error message
- `field?: string` - Field that failed validation
- `value?: any` - Invalid value

**Example**:
```javascript
throw new ValidationError('Word list must contain between 2 and 100 words', 'words', words);
```

### DatabaseError

Thrown when database operation fails.

**Properties**:
- `message: string` - Error message
- `operation: string` - Operation that failed (e.g., 'checkDuplicates', 'saveCards')

**Example**:
```javascript
throw new DatabaseError('Failed to query cards', 'checkDuplicates');
```

## Contract Guarantees

1. **Idempotency**: Multiple calls with same words will skip duplicates (no duplicate cards created)
2. **Partial Success**: Cards created even if translation/image generation fails
3. **Progress Reporting**: Progress updates provided if callback supplied
4. **Error Isolation**: Failure of one word does not stop processing of other words
5. **Transaction Safety**: Card creation uses batch operations for efficiency, but individual failures are tracked

## Performance Guarantees

- Duplicate check: < 1 second for 100 words
- Translation: ~5 words/second (with batching and delays)
- Image generation: ~1 image/2 seconds (with delays)
- Card creation: < 1 second for 100 cards (batch operation)
- Total time: < 10 minutes for 100 words (per SC-004)

