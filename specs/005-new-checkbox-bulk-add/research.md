# Research: New Checkbox for Bulk Add Cards

**Feature**: New Checkbox for Bulk Add Cards  
**Date**: 2025-11-09  
**Phase**: Phase 0 - Research

## Research Tasks

### Task 1: Checkbox State Management Pattern

**Question**: How should the "New" checkbox state be managed in the BulkAddForm component?

**Decision**: Use React `useState` hook for checkbox state, initialized to `true` (checked by default).

**Rationale**: 
- Consistent with existing form state management in BulkAddForm (uses useState for cardType, categoryIds, instructionLevelId)
- Simple boolean state is appropriate for checkbox
- Default `true` matches requirement FR-002 (checked by default)

**Alternatives Considered**:
- Controlled component with external state management: Rejected - unnecessary complexity for single form
- Uncontrolled component with ref: Rejected - need to read state on submit, controlled is simpler

---

### Task 2: Auto-Checking Behavior for Auto-Translated Words

**Question**: When should the checkbox be automatically checked for auto-translated words?

**Decision**: Checkbox should be automatically checked when words are entered into the form, since all words in bulk add will be auto-translated if they don't already exist.

**Rationale**:
- Bulk add feature always translates new words automatically (from 001-bulk-add-cards spec)
- Simpler to check on word entry rather than detecting translation state
- Matches user expectation: "when a new word is entered with Google Translate, I want it to have an automatic check"

**Alternatives Considered**:
- Check only when translation actually occurs: Rejected - adds complexity, translation happens during processing, not form entry
- Check on form submission: Rejected - user should see checkbox state before submitting

**Implementation Note**: Since bulk add always translates new words, we can check the checkbox whenever words are entered (or use `useEffect` to watch wordsText changes). However, respecting manual override (FR-004) means if user unchecks it, we should not auto-check again.

---

### Task 3: Conditional Category Assignment in Service

**Question**: How should bulkAddService handle conditional "new" category assignment?

**Decision**: Add `markAsNew` boolean parameter to `processBulkAdd` request. Only call `ensureNewCategory()` and add to `allCategoryIds` if `markAsNew` is true.

**Rationale**:
- Keeps service logic clean and explicit
- Matches existing pattern where categoryIds are passed in request
- Allows form to control category assignment without service needing to infer intent

**Alternatives Considered**:
- Always assign "new" category, remove in form: Rejected - inefficient, creates unnecessary database operations
- Service detects auto-translation and assigns automatically: Rejected - violates separation of concerns, form should control UI state

**Code Pattern**:
```javascript
// In bulkAddService.js
export async function processBulkAdd(request, options = {}) {
  const { words, cardType, categoryIds = [], instructionLevelId = null, markAsNew = true } = request;
  
  // Only ensure and add "new" category if markAsNew is true
  let allCategoryIds = [...categoryIds];
  if (markAsNew) {
    const newCategoryId = await ensureNewCategory();
    if (!allCategoryIds.includes(newCategoryId)) {
      allCategoryIds.push(newCategoryId);
    }
  }
  // ... rest of processing
}
```

---

### Task 4: Checkbox Label and Accessibility

**Question**: What label should the checkbox use for clarity and accessibility?

**Decision**: Use label "Mark as New (for review)" with helper text explaining that cards will be flagged for review.

**Rationale**:
- "Mark as New" is clear and matches the "new" category name
- "(for review)" clarifies the purpose
- Matches requirement FR-009 for clear labeling

**Accessibility Requirements**:
- Checkbox must have associated `<label>` element
- Label text must be descriptive (not just "New")
- Helper text should be linked via `aria-describedby`
- Keyboard navigation must work (Space/Enter to toggle)

**Alternatives Considered**:
- Just "New": Rejected - too vague, doesn't explain purpose
- "Flag for Review": Rejected - doesn't match category name, could be confusing

---

### Task 5: Form State Persistence

**Question**: Should checkbox state persist if form is reset or user navigates away?

**Decision**: Checkbox resets to checked (default) when form is reset. State does not persist across page reloads (uses default state).

**Rationale**:
- Matches requirement FR-010 (preserve state if form reset) - reset means back to defaults
- Default checked state is the safe choice (ensures review)
- No need for localStorage persistence - form is used infrequently by admins

**Alternatives Considered**:
- Persist checkbox state in localStorage: Rejected - unnecessary complexity, default checked is appropriate
- Remember last user choice: Rejected - could lead to forgetting to check, default checked is safer

---

### Task 6: Reviewer Workflow Integration

**Question**: How do reviewers remove the "new" category after review?

**Decision**: Use existing EditCardForm component. Reviewers filter cards by "new" category, open each card for editing, and uncheck/remove the "new" category.

**Rationale**:
- EditCardForm already supports category management (from 001-advanced-card-management)
- No new UI needed - leverages existing functionality
- Matches requirement FR-008 (reviewers can remove category)

**Alternatives Considered**:
- New bulk review interface: Rejected - out of scope, existing edit form is sufficient
- Bulk remove "new" category: Rejected - out of scope per spec, reviewers review individually

---

## Summary of Decisions

1. **Checkbox State**: React `useState` with default `true`
2. **Auto-Checking**: Check when words entered, respect manual override
3. **Service Integration**: Add `markAsNew` boolean parameter to `processBulkAdd`
4. **Label**: "Mark as New (for review)" with helper text
5. **State Persistence**: Reset to default (checked) on form reset
6. **Reviewer Workflow**: Use existing EditCardForm, no new UI needed

All research tasks complete. No NEEDS CLARIFICATION markers remain.

