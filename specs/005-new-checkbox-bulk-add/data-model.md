# Data Model: New Checkbox for Bulk Add Cards

**Feature**: New Checkbox for Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Entities

### BulkAddRequest (Enhanced)

**Description**: Request object for bulk add operation, enhanced with `markAsNew` field.

**Fields**:
- `words: string[]` - Array of words to process (2-100 words, trimmed, non-empty)
- `cardType: 'word' | 'phrase'` - Type of cards to create
- `categoryIds: string[]` - Array of category IDs selected by admin (optional)
- `instructionLevelId: string | null` - Instruction level ID (optional)
- `markAsNew: boolean` - Whether to assign "new" category to created cards (default: true)

**Validation Rules**:
- `words`: Must contain 2-100 non-empty strings after trimming
- `cardType`: Must be exactly 'word' or 'phrase'
- `categoryIds`: Array of valid category IDs (validated against database)
- `instructionLevelId`: Valid instruction level ID or null (validated against database)
- `markAsNew`: Boolean (no validation needed)

**State Transitions**:
- Initial state: `markAsNew: true` (checkbox checked by default)
- User can toggle: `markAsNew: false` (checkbox unchecked)
- Auto-check on word entry: `markAsNew: true` (if words entered and will be translated)
- Form reset: `markAsNew: true` (back to default)

---

### BulkAddFormState

**Description**: Internal component state for BulkAddForm, including new checkbox state.

**Fields**:
- `wordsText: string` - Raw text from textarea (newline-separated words)
- `cardType: 'word' | 'phrase'` - Selected card type
- `categoryIds: string[]` - Selected category IDs
- `instructionLevelId: string` - Selected instruction level ID
- `markAsNew: boolean` - **NEW** - Checkbox state for "New" category assignment (default: true)
- `loading: boolean` - Processing state
- `error: string` - Error message
- `summary: BulkAddSummary | null` - Operation result summary
- `progress: ProgressState` - Progress tracking state

**State Management**:
- `markAsNew` initialized to `true` in `useState`
- Updated via checkbox `onChange` handler
- Auto-checked via `useEffect` when words are entered (respects manual override)
- Reset to `true` when form is reset

---

### Card (Existing, Enhanced Usage)

**Description**: Card entity already exists. This feature uses the existing `categoryIds` field to store the "new" category.

**Fields** (relevant to this feature):
- `id: string` - Card unique identifier
- `categoryIds: string[]` - Array of category IDs, may include "new" category ID
- `englishText: string` - English word/phrase
- `tibetanText: string | null` - Tibetan translation (may be auto-generated)
- `imageUrl: string | null` - Card image URL (may be auto-generated)

**Category Assignment Logic**:
- If `markAsNew: true` in BulkAddRequest → "new" category ID added to `categoryIds`
- If `markAsNew: false` in BulkAddRequest → "new" category ID NOT added to `categoryIds`
- Reviewer can remove "new" category ID from `categoryIds` via EditCardForm

---

### Category (Existing)

**Description**: Category entity already exists. The "new" category is managed by existing category system.

**Fields** (relevant to this feature):
- `id: string` - Category unique identifier
- `name: string` - Category name (e.g., "new")
- `description: string | null` - Category description

**Special Category**:
- **"new" category**: Special category used to flag cards for review
- Created automatically by `ensureNewCategory()` if it doesn't exist
- Can be assigned/removed like any other category

---

## Data Flow

### Bulk Add Flow (with New Checkbox)

1. **Form Initialization**:
   - `markAsNew` state initialized to `true`
   - Checkbox rendered as checked

2. **User Interaction**:
   - User enters words → `wordsText` updated
   - If words entered and will be auto-translated → `markAsNew` set to `true` (if not manually overridden)
   - User can manually check/uncheck → `markAsNew` updated

3. **Form Submission**:
   - `markAsNew` value included in `BulkAddRequest`
   - Passed to `processBulkAdd(request)`

4. **Service Processing**:
   - If `markAsNew: true` → ensure "new" category exists, add to `allCategoryIds`
   - If `markAsNew: false` → skip "new" category assignment
   - Create cards with appropriate `categoryIds`

5. **Card Creation**:
   - Cards created with `categoryIds` including/excluding "new" category based on `markAsNew`

### Reviewer Workflow Flow

1. **Filtering**:
   - Reviewer filters cards by "new" category
   - System queries cards where `categoryIds` includes "new" category ID

2. **Review**:
   - Reviewer opens card in EditCardForm
   - Card's `categoryIds` includes "new" category ID

3. **Approval**:
   - Reviewer removes "new" category ID from `categoryIds`
   - Card saved with updated `categoryIds`
   - Card no longer appears in "new" category filter

---

## Validation Rules

### BulkAddRequest Validation

- `markAsNew`: Must be boolean (no other validation needed)
- Other fields validated as per existing bulk add feature

### Checkbox State Validation

- Checkbox state must be boolean (`true` or `false`)
- Default state must be `true` (checked)
- State must update immediately on user interaction (< 100ms)

---

## Relationships

- **BulkAddRequest** → **Card**: Creates multiple cards with shared characteristics
- **Card** → **Category**: Many-to-many relationship via `categoryIds` array
- **Category ("new")** → **Card**: Flags cards for review

---

## State Transitions

### Checkbox State Machine

```
[Initial] --(form loads)--> [Checked (markAsNew: true)]
[Checked] --(user unchecks)--> [Unchecked (markAsNew: false)]
[Unchecked] --(user checks)--> [Checked (markAsNew: true)]
[Checked] --(words entered, auto-check)--> [Checked (markAsNew: true)]
[Unchecked] --(words entered, auto-check)--> [Unchecked (markAsNew: false)] // Respects manual override
[Any] --(form reset)--> [Checked (markAsNew: true)]
```

### Card Category State Machine

```
[Card Created] --(markAsNew: true)--> [Has "new" category]
[Card Created] --(markAsNew: false)--> [No "new" category]
[Has "new" category] --(reviewer removes)--> [No "new" category]
[No "new" category] --(reviewer adds)--> [Has "new" category] // Manual addition possible
```

