# Service Contracts: New Checkbox for Bulk Add Cards

**Feature**: New Checkbox for Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Service Interface

### bulkAddService.processBulkAdd(request) - Enhanced

Processes a bulk add operation with optional "new" category assignment based on checkbox state.

**Parameters**:
- `request: BulkAddRequest` - Bulk add request object (enhanced with `markAsNew` field)

**BulkAddRequest Structure**:
```javascript
{
  words: string[],              // Array of words (2-100, trimmed, non-empty)
  cardType: 'word' | 'phrase',  // Card type
  categoryIds: string[],        // Selected category IDs (optional)
  instructionLevelId: string | null,  // Instruction level ID (optional)
  markAsNew: boolean           // NEW: Whether to assign "new" category (default: true)
}
```

**Returns**: `Promise<BulkAddSummary>`

**Behavior**:
1. Validates request (including `markAsNew` boolean)
2. If `markAsNew: true`:
   - Ensures "new" category exists (creates if needed)
   - Adds "new" category ID to `allCategoryIds`
3. If `markAsNew: false`:
   - Skips "new" category assignment
   - Uses only `categoryIds` from request
4. Processes words (duplicate check, translation, image generation)
5. Creates cards with appropriate `categoryIds` (including/excluding "new" category)
6. Returns summary with results

**Changes from Existing API**:
- Added `markAsNew: boolean` parameter (optional, defaults to `true` for backward compatibility)
- Conditional "new" category assignment based on `markAsNew` value

**Backward Compatibility**:
- If `markAsNew` not provided, defaults to `true` (maintains existing behavior)
- Existing code calling `processBulkAdd` without `markAsNew` continues to work

**Example**:
```javascript
// With checkbox checked (markAsNew: true)
const request = {
  words: ['apple', 'banana'],
  cardType: 'word',
  categoryIds: ['cat_123'],
  instructionLevelId: 'level_789',
  markAsNew: true  // NEW
};
const summary = await bulkAddService.processBulkAdd(request);
// Cards created with "new" category assigned

// With checkbox unchecked (markAsNew: false)
const request2 = {
  words: ['apple', 'banana'],
  cardType: 'word',
  categoryIds: ['cat_123'],
  instructionLevelId: 'level_789',
  markAsNew: false  // NEW
};
const summary2 = await bulkAddService.processBulkAdd(request2);
// Cards created WITHOUT "new" category assigned
```

---

### BulkAddForm Component Interface

**Props**:
- `onComplete: (summary: BulkAddSummary) => void` - Callback when bulk add completes
- `onCancel: () => void` - Callback when form is cancelled
- `isAdmin: boolean` - Admin permission flag (existing)

**Internal State** (enhanced):
- `markAsNew: boolean` - **NEW** - Checkbox state (default: `true`)

**Methods** (enhanced):
- `handleSubmit()` - **MODIFIED** - Includes `markAsNew` in request object
- `handleCheckboxChange()` - **NEW** - Updates `markAsNew` state
- `handleWordsChange()` - **MODIFIED** - Auto-checks checkbox when words entered (if not manually overridden)

**UI Elements** (new):
- Checkbox input with label "Mark as New (for review)"
- Helper text explaining checkbox purpose

---

### EditCardForm Component Interface (Existing, Used by Reviewers)

**Props**: (unchanged)
- `card: Card` - Card to edit
- `onSave: (card: Card) => void` - Callback when card is saved
- `onCancel: () => void` - Callback when editing is cancelled

**Behavior**: (unchanged)
- Displays card categories including "new" category if present
- Allows adding/removing categories via checkbox or multi-select
- Saves card with updated `categoryIds`

**Usage for Reviewers**:
- Reviewer filters cards by "new" category
- Opens card in EditCardForm
- Removes "new" category from `categoryIds`
- Saves card

---

## Component Contracts

### BulkAddForm.checkbox Component

**Type**: Controlled checkbox input

**Props**:
- `checked: boolean` - Checkbox checked state (from `markAsNew` state)
- `onChange: (event: ChangeEvent<HTMLInputElement>) => void` - Change handler
- `id: string` - Unique ID for accessibility
- `name: string` - Form field name ("markAsNew")
- `aria-describedby: string` - ID of helper text element

**Accessibility Requirements**:
- Must have associated `<label>` element
- Label text: "Mark as New (for review)"
- Helper text linked via `aria-describedby`
- Keyboard accessible (Space/Enter to toggle)
- Focus visible on keyboard navigation

**Styling**:
- Consistent with existing form checkbox styles
- Uses CSS variables for theming
- Disabled state when form is processing

---

## Error Handling

### Validation Errors

- `markAsNew` must be boolean if provided
- If `markAsNew` is not provided, defaults to `true` (no error)

### Service Errors

- If `markAsNew: true` and "new" category creation fails:
  - Error logged, operation continues without "new" category
  - Summary includes error details
  - Cards still created (partial success)

---

## Performance Guarantees

- Checkbox state update: < 100ms (instantaneous)
- Auto-check on word entry: < 100ms
- Form submission with `markAsNew`: No additional overhead (same as existing bulk add)
- Category assignment: < 50ms per card (batch operation)

---

## Contract Guarantees

1. **Backward Compatibility**: Existing code calling `processBulkAdd` without `markAsNew` continues to work (defaults to `true`)
2. **State Consistency**: Checkbox state always reflects `markAsNew` value in request
3. **Category Assignment**: "new" category assigned only when `markAsNew: true`
4. **Manual Override**: User can override auto-checking behavior
5. **Accessibility**: Checkbox meets WCAG 2.1 AA standards

