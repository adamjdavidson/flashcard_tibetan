# Quickstart: New Checkbox for Bulk Add Cards

**Feature**: New Checkbox for Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 1 - Design

## Architecture Overview

This feature adds a "New" checkbox to the bulk add cards form, allowing admins to control whether bulk-created cards are flagged with the "new" category for review. The checkbox is checked by default and automatically checked when words will be auto-translated.

**Key Components**:
1. **BulkAddForm** - Adds checkbox UI and state management
2. **bulkAddService** - Conditionally assigns "new" category based on checkbox value
3. **EditCardForm** - Used by reviewers to remove "new" category (existing component)

## Implementation Steps

### Step 1: Add Checkbox State to BulkAddForm

**File**: `src/components/BulkAddForm.jsx`

**Changes**:
- Add `markAsNew` state: `const [markAsNew, setMarkAsNew] = useState(true);`
- Add checkbox UI element in form JSX
- Add `handleCheckboxChange` handler
- Modify `handleSubmit` to include `markAsNew` in request

**Key Code**:
```javascript
// State
const [markAsNew, setMarkAsNew] = useState(true);

// Handler
const handleCheckboxChange = (e) => {
  setMarkAsNew(e.target.checked);
};

// In submit handler
const request = {
  words,
  cardType,
  categoryIds,
  instructionLevelId: instructionLevelId || null,
  markAsNew  // NEW
};
```

---

### Step 2: Add Checkbox UI to Form

**File**: `src/components/BulkAddForm.jsx`

**Changes**:
- Add checkbox input with label "Mark as New (for review)"
- Add helper text explaining purpose
- Position checkbox alongside other form fields (card type, categories, instruction level)

**Key Code**:
```jsx
<div className="form-group">
  <label htmlFor="markAsNew">
    <input
      type="checkbox"
      id="markAsNew"
      name="markAsNew"
      checked={markAsNew}
      onChange={handleCheckboxChange}
      disabled={loading}
      aria-describedby="markAsNewHelp"
    />
    Mark as New (for review)
  </label>
  <small id="markAsNewHelp" className="help-text">
    Cards will be flagged with the "new" category for review by Tibetan speakers.
  </small>
</div>
```

---

### Step 3: Add Auto-Check Behavior

**File**: `src/components/BulkAddForm.jsx`

**Changes**:
- Add `useEffect` to watch `wordsText` changes
- Auto-check checkbox when words are entered (if not manually overridden)
- Respect manual override (don't auto-check if user has unchecked)

**Key Code**:
```javascript
// Track if user has manually overridden
const [manualOverride, setManualOverride] = useState(false);

useEffect(() => {
  // Auto-check when words entered (if not manually overridden)
  if (wordsText.trim().length > 0 && !manualOverride) {
    setMarkAsNew(true);
  }
}, [wordsText, manualOverride]);

const handleCheckboxChange = (e) => {
  setMarkAsNew(e.target.checked);
  setManualOverride(true); // User has manually set state
};
```

---

### Step 4: Update bulkAddService to Handle markAsNew

**File**: `src/services/bulkAddService.js`

**Changes**:
- Add `markAsNew` parameter to `processBulkAdd` function signature (default: `true`)
- Conditionally call `ensureNewCategory()` only if `markAsNew: true`
- Conditionally add "new" category to `allCategoryIds` only if `markAsNew: true`

**Key Code**:
```javascript
export async function processBulkAdd(request, options = {}) {
  const { 
    words, 
    cardType, 
    categoryIds = [], 
    instructionLevelId = null,
    markAsNew = true  // NEW: default true for backward compatibility
  } = request;

  // ... existing validation ...

  // Conditionally ensure "new" category
  let allCategoryIds = [...categoryIds];
  if (markAsNew) {
    const newCategoryId = await ensureNewCategory();
    if (!allCategoryIds.includes(newCategoryId)) {
      allCategoryIds.push(newCategoryId);
    }
  }

  // ... rest of processing uses allCategoryIds ...
}
```

---

### Step 5: Add Checkbox Styling

**File**: `src/components/BulkAddForm.css`

**Changes**:
- Add styles for checkbox input
- Add styles for checkbox label
- Add styles for helper text
- Ensure consistent spacing with other form fields

**Key CSS**:
```css
.bulk-add-form input[type="checkbox"] {
  margin-right: 0.5rem;
  width: auto;
}

.bulk-add-form .help-text {
  display: block;
  margin-top: 0.25rem;
  color: var(--theme-text-secondary, #666);
  font-size: 0.875rem;
}
```

---

### Step 6: Write Tests

**Files**: 
- `src/components/__tests__/BulkAddForm.test.jsx` (modify existing)
- `src/services/__tests__/bulkAddService.test.js` (modify existing)

**Test Cases**:
1. Checkbox renders and is checked by default
2. Checkbox can be checked/unchecked by user
3. Checkbox auto-checks when words are entered
4. Manual override prevents auto-checking
5. `markAsNew: true` assigns "new" category
6. `markAsNew: false` does not assign "new" category
7. Backward compatibility: missing `markAsNew` defaults to `true`

---

## Dependencies

### Existing Dependencies (No Changes)
- React 19.2.0
- React DOM 19.2.0
- @supabase/supabase-js 2.78.0
- Existing bulk add feature (001-bulk-add-cards)
- Existing category management system

### New Dependencies
- None (uses existing React hooks and form patterns)

---

## State Management

### Component State Flow

```
Initial Load:
  markAsNew: true (checked)

User Enters Words:
  wordsText changes → useEffect → markAsNew: true (if not overridden)

User Unchecks Checkbox:
  handleCheckboxChange → markAsNew: false, manualOverride: true

User Checks Checkbox:
  handleCheckboxChange → markAsNew: true, manualOverride: true

Form Submit:
  markAsNew value → included in request → passed to bulkAddService
```

### Service State Flow

```
processBulkAdd called with markAsNew:
  markAsNew: true → ensureNewCategory() → add to allCategoryIds
  markAsNew: false → skip "new" category → use only categoryIds

Cards Created:
  categoryIds includes/excludes "new" category based on markAsNew
```

---

## Integration Points

### With Existing Bulk Add Feature
- Modifies `BulkAddForm` component (adds checkbox)
- Modifies `bulkAddService.processBulkAdd` (adds conditional logic)
- No breaking changes (backward compatible)

### With Category System
- Uses existing `ensureNewCategory()` function
- Uses existing category assignment logic
- No changes to category management system

### With Card Editing
- Reviewers use existing `EditCardForm` component
- No changes needed to card editing functionality
- Existing category removal works as-is

---

## Testing Strategy

### Unit Tests
- Checkbox state management
- Auto-checking logic
- Manual override behavior
- Service conditional category assignment

### Component Tests
- Checkbox renders correctly
- Checkbox accessibility (label, ARIA)
- Form submission includes `markAsNew`
- Checkbox disabled during processing

### Integration Tests
- End-to-end bulk add with checkbox checked
- End-to-end bulk add with checkbox unchecked
- Reviewer workflow (filter → edit → remove category)

### Accessibility Tests
- Keyboard navigation (Tab, Space, Enter)
- Screen reader announcements
- Focus management
- ARIA attributes

---

## Rollout Plan

1. **Phase 1**: Add checkbox UI and state (no service changes)
2. **Phase 2**: Update service to handle `markAsNew` parameter
3. **Phase 3**: Add auto-checking behavior
4. **Phase 4**: Add tests and verify reviewer workflow

**Backward Compatibility**: Service defaults `markAsNew` to `true`, so existing code continues to work.

