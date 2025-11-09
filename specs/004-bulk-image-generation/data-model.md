# Data Model: Bulk Image Generation

**Feature**: 004-bulk-image-generation  
**Date**: 2025-11-09

## Entities

### BulkGenerationJob

Represents the state of an ongoing bulk image generation operation.

**Attributes**:
- `isRunning` (boolean): Whether bulk generation is currently in progress
- `current` (number): Index of current card being processed (0-based)
- `total` (number): Total number of cards to process
- `completed` (number): Number of cards successfully processed
- `failed` (number): Number of cards that failed to generate images
- `currentCard` (Card | null): The card currently being processed
- `cards` (Card[]): Array of cards to process (filtered list)
- `failures` (Failure[]): Array of failure records with error details
- `startTime` (Date | null): Timestamp when generation started
- `endTime` (Date | null): Timestamp when generation completed or was cancelled

**State Transitions**:
1. **Idle** → **Running**: User clicks "Bulk Generate Images" button
   - `isRunning: false` → `true`
   - `current: 0`, `completed: 0`, `failed: 0`
   - `startTime` set to current time
   - `cards` populated with filtered cards needing images

2. **Running** → **Running** (progress update): Each card completes
   - `current` increments
   - `completed` or `failed` increments
   - `currentCard` updates to next card
   - `failures` array updated if card failed

3. **Running** → **Completed**: All cards processed successfully or with failures
   - `isRunning: true` → `false`
   - `endTime` set to current time
   - Final summary available

4. **Running** → **Cancelled**: User clicks cancel button
   - `isRunning: true` → `false`
   - `endTime` set to current time
   - Processing stops, partial results saved

**Validation Rules**:
- `total` must equal `cards.length`
- `completed + failed` must not exceed `total`
- `current` must be between 0 and `total` (inclusive)
- `isRunning` must be false when `endTime` is set

### Failure

Represents a failed image generation attempt for a specific card.

**Attributes**:
- `cardId` (string): ID of the card that failed
- `cardText` (string): Text that was used as prompt (for reference)
- `error` (string): Error message describing why generation failed
- `timestamp` (Date): When the failure occurred

**Validation Rules**:
- `cardId` must be non-empty
- `error` must be non-empty
- `timestamp` must be valid Date

### Card (Existing Entity)

**Relevant Attributes for Bulk Generation**:
- `id` (string): Unique identifier
- `type` (string): Card type - must be "word" or "phrase" for bulk generation
- `imageUrl` (string | null): Image URL - null/empty indicates card needs image
- `englishText` (string | null): Primary text field for word/phrase cards
- `backEnglish` (string | null): Legacy English text field
- `front` (string | null): Front text (primarily for number cards)

**Filtering Rules**:
- Cards eligible for bulk generation: `(type === 'word' || type === 'phrase') && !imageUrl`
- Cards skipped: Missing all text fields (englishText, backEnglish, front)

## Relationships

- **BulkGenerationJob** contains many **Card** entities (one-to-many)
- **BulkGenerationJob** contains many **Failure** entities (one-to-many)
- **Failure** references one **Card** by `cardId` (many-to-one)

## State Management

**Component State** (React):
- BulkGenerationJob state managed in `BulkImageGenerator` component using `useState`
- Progress updates trigger re-renders via state updates
- Cancellation handled via state flag (`isCancelled`)

**No Persistent Storage**:
- Bulk generation jobs are ephemeral (client-side only)
- No need to persist job state to database
- Results persist via card updates (imageUrl saved to cards table)

## Data Flow

1. **Initialization**:
   - AdminPage passes filtered cards to BulkImageGenerator
   - BulkImageGenerator filters cards needing images
   - Creates BulkGenerationJob state with filtered cards

2. **Processing**:
   - Loop through cards sequentially
   - For each card: generate image → save card → update progress
   - Collect failures in failures array
   - Update BulkGenerationJob state after each card

3. **Completion**:
   - Set `isRunning: false`
   - Set `endTime`
   - Display completion summary with success/failure counts
   - Cards with generated images already saved to database

4. **Cancellation**:
   - Set cancellation flag
   - Stop processing loop
   - Set `isRunning: false`
   - Set `endTime`
   - Display cancellation summary
   - Cards processed before cancellation already saved

## Performance Considerations

- **Memory**: BulkGenerationJob state held in memory (acceptable for expected scale: 10-1000 cards)
- **Database**: Individual card updates happen sequentially (no bulk update needed)
- **API Calls**: Sequential with delay to avoid rate limiting
- **UI Updates**: React state updates trigger re-renders (acceptable performance for progress updates)

