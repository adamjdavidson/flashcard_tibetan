# Research: Bulk Add Cards Feature

**Feature**: Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 0 - Research

## Research Objectives

1. Efficient duplicate detection strategy for checking 100 words against database
2. Batch processing patterns for translation and image generation APIs
3. Progress indication patterns for long-running operations
4. Error handling strategies for partial failures
5. Database query optimization for bulk operations

## Research Findings

### 1. Duplicate Detection Strategy

**Decision**: Use single database query with `IN` clause to check all words at once, then filter client-side.

**Rationale**: 
- Existing codebase uses `loadCards()` which loads all cards, but for bulk add we only need to check specific words
- Supabase PostgreSQL supports efficient `IN` queries with indexed columns
- Checking `englishText` field case-insensitively requires PostgreSQL `LOWER()` function or client-side normalization
- Single query is more efficient than 100 individual queries

**Implementation Approach**:
```javascript
// Query existing cards with matching englishText (case-insensitive)
const normalizedWords = words.map(w => w.toLowerCase().trim());
const { data: existingCards } = await supabase
  .from('cards')
  .select('english_text, id')
  .in('english_text', normalizedWords)
  .or(`english_text.ilike.${normalizedWords.map(w => `%${w}%`).join(',')}`);

// Better: Use PostgreSQL array and ANY operator for case-insensitive matching
// Or: Load all cards and filter client-side (acceptable for admin-only feature)
```

**Alternatives Considered**:
- **Individual queries per word**: Rejected - too slow, 100 queries would be inefficient
- **Full table scan**: Rejected - inefficient for large card databases
- **Client-side filtering after loading all cards**: Acceptable fallback - existing `loadCards()` pattern can be reused, but less efficient for large datasets

**Final Decision**: Use Supabase query with case-insensitive matching (`ilike` operator) or load all cards and filter client-side. For admin-only feature with expected card count in thousands, client-side filtering is acceptable and simpler.

### 2. Batch Processing for Translation API

**Decision**: Process translations sequentially with Promise.all() for parallel requests, but implement rate limiting and error handling per word.

**Rationale**:
- Google Translate API has rate limits (500k chars/month free tier, then $20 per million)
- Translation API endpoint (`/api/translate`) accepts single word at a time
- Parallel requests can hit rate limits quickly
- Sequential processing with small batches (5-10 words) balances speed and reliability

**Implementation Approach**:
```javascript
// Process in batches to avoid rate limiting
const BATCH_SIZE = 5;
const translationResults = [];

for (let i = 0; i < words.length; i += BATCH_SIZE) {
  const batch = words.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(
    batch.map(word => translateText(word, 'en', 'bo'))
  );
  translationResults.push(...batchResults);
  
  // Small delay between batches to respect rate limits
  if (i + BATCH_SIZE < words.length) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

**Alternatives Considered**:
- **Fully parallel**: Rejected - risks hitting rate limits, may cause API errors
- **Fully sequential**: Rejected - too slow for 100 words (would take minutes)
- **Batch with delays**: Chosen - balances speed and reliability

**Rate Limiting Considerations**:
- Google Translate free tier: 500k characters/month
- Average English word: ~5 characters
- 100 words ≈ 500 characters (well within free tier)
- For paid tier, rate limits are higher but still need batching

### 3. Batch Processing for Image Generation API

**Decision**: Process images sequentially in batches with delays, similar to translation pattern.

**Rationale**:
- Image generation APIs (Gemini, DALL-E) have rate limits and cost per image
- Gemini API: varies by plan, typically 15-60 requests/minute
- Image generation is slower than translation (2-5 seconds per image)
- Sequential batching prevents overwhelming the API

**Implementation Approach**:
```javascript
// Process images one at a time with delays
const imageResults = [];

for (const word of words) {
  try {
    const result = await generateAIImage(word);
    imageResults.push({ word, ...result });
    
    // Delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  } catch (error) {
    imageResults.push({ word, success: false, error: error.message });
  }
}
```

**Alternatives Considered**:
- **Parallel image generation**: Rejected - would hit rate limits, expensive
- **Skip images on failure**: Chosen - cards created without images, failures reported

**Cost Considerations**:
- Gemini Image Generation: varies by plan
- DALL-E 3: $0.04 per image
- For 100 words: $4.00 if using DALL-E (Gemini may be cheaper)
- Admin should be aware of costs for large batches

### 4. Progress Indication Pattern

**Decision**: Use React state to track progress through stages (duplicate check → translation → image generation → card creation), update UI incrementally.

**Rationale**:
- Long-running operations (10 minutes for 100 words) require user feedback
- React state updates trigger re-renders, showing progress
- Incremental updates prevent UI freezing
- Pattern matches existing codebase (no external progress libraries needed)

**Implementation Approach**:
```javascript
const [progress, setProgress] = useState({
  stage: 'idle', // 'checking', 'translating', 'generating', 'creating', 'complete'
  current: 0,
  total: words.length,
  details: {}
});

// Update progress during processing
setProgress(prev => ({
  ...prev,
  stage: 'translating',
  current: i + 1,
  details: { ...prev.details, [`word_${i}`]: 'translating...' }
}));
```

**Alternatives Considered**:
- **Progress bar library**: Rejected - adds dependency, React state sufficient
- **Web Workers**: Rejected - unnecessary complexity, main thread acceptable for admin feature
- **Server-side processing**: Rejected - would require new API endpoint, client-side simpler

### 5. Error Handling for Partial Failures

**Decision**: Continue processing even if individual words fail translation/image generation. Create cards with available data, report all failures in summary.

**Rationale**:
- FR-022 requires cards created even if translation/image fails
- Partial success is better than total failure
- Admin can manually fix failed items later
- Matches existing pattern in QuickTranslateForm (handles errors gracefully)

**Implementation Approach**:
```javascript
const results = {
  created: [],
  skipped: [],
  translationFailures: [],
  imageFailures: [],
  errors: []
};

for (const word of newWords) {
  let tibetanText = null;
  let imageUrl = null;
  
  // Try translation
  const translationResult = await translateText(word);
  if (translationResult.success) {
    tibetanText = translationResult.translated;
  } else {
    results.translationFailures.push({ word, error: translationResult.error });
  }
  
  // Try image generation
  const imageResult = await generateAIImage(word);
  if (imageResult.success) {
    imageUrl = imageResult.imageUrl;
  } else {
    results.imageFailures.push({ word, error: imageResult.error });
  }
  
  // Create card regardless of translation/image success
  const card = createCard({
    type: cardType,
    englishText: word,
    tibetanText: tibetanText,
    imageUrl: imageUrl,
    categoryIds: [...selectedCategories, 'new'],
    instructionLevelId: selectedInstructionLevel
  });
  
  results.created.push(card);
}
```

**Alternatives Considered**:
- **Fail fast**: Rejected - violates FR-022, poor user experience
- **Retry failed items**: Considered but rejected - adds complexity, admin can retry manually
- **Continue with partial data**: Chosen - matches spec requirements

### 6. Database Query Optimization

**Decision**: Use existing `saveCards()` batch function for card creation, but enhance with category associations in single transaction.

**Rationale**:
- Existing `saveCards()` function handles batch upserts efficiently
- Category associations need separate handling (many-to-many relationship)
- Single transaction ensures data consistency
- Matches existing pattern in `saveCard()` function

**Implementation Approach**:
```javascript
// Use existing saveCards for batch card creation
const { success, data: createdCards } = await saveCards(cardsToCreate, fallbackSave);

// Then handle category associations in batch
if (success && createdCards.length > 0) {
  const associations = [];
  createdCards.forEach(card => {
    card.categoryIds.forEach(categoryId => {
      associations.push({
        card_id: card.id,
        category_id: categoryId
      });
    });
  });
  
  // Batch insert associations
  await supabase
    .from('card_categories')
    .insert(associations);
}
```

**Alternatives Considered**:
- **Individual card saves**: Rejected - too slow, 100 individual saves inefficient
- **Custom batch endpoint**: Rejected - unnecessary, existing pattern sufficient
- **Reuse existing saveCards**: Chosen - leverages existing code, maintains consistency

### 7. "New" Category Management

**Decision**: Check if "new" category exists, create if missing, then include in all bulk-created cards.

**Rationale**:
- FR-014 requires auto-creating "new" category if it doesn't exist
- Category service (`categoriesService.js`) has `createCategory()` function
- Need to check existence before creating to avoid duplicates
- Category ID needed for card associations

**Implementation Approach**:
```javascript
// Check if "new" category exists
const categories = await loadCategories();
let newCategory = categories.find(cat => cat.name.toLowerCase() === 'new');

// Create if doesn't exist
if (!newCategory) {
  const result = await createCategory({
    name: 'new',
    description: 'Cards created via bulk add, pending review',
    created_by: user?.id || null
  });
  if (result.success) {
    newCategory = result.data;
  }
}

// Include in card categoryIds
const categoryIds = [...selectedCategories, newCategory.id];
```

**Alternatives Considered**:
- **Hardcode category ID**: Rejected - category may not exist, violates FR-014
- **Always create**: Rejected - would create duplicates if category exists
- **Check then create**: Chosen - ensures category exists, avoids duplicates

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Duplicate Detection | Single query or client-side filter | Efficient, matches existing patterns |
| Translation Batching | Batches of 5 with delays | Balances speed and rate limits |
| Image Generation | Sequential with 2s delays | Respects API rate limits, prevents errors |
| Progress Indication | React state updates | Simple, no external dependencies |
| Error Handling | Continue on failure | Matches spec requirements, better UX |
| Card Creation | Reuse `saveCards()` batch | Leverages existing code, efficient |
| Category Management | Check then create | Ensures category exists, avoids duplicates |

## Open Questions Resolved

- ✅ How to efficiently check 100 words for duplicates? → Single query or client-side filter
- ✅ How to handle API rate limits? → Batch processing with delays
- ✅ How to show progress? → React state updates
- ✅ How to handle partial failures? → Continue processing, report failures
- ✅ How to optimize database operations? → Reuse existing batch functions

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create data-model.md with bulk add operation entities
- Define API contracts for bulk add service
- Create quickstart.md with implementation guide

