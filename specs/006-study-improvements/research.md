# Research: Study Experience Improvements

**Feature**: Study Experience Improvements  
**Date**: 2025-11-12  
**Status**: Complete

## Overview

This document consolidates research findings for implementing three independent study experience improvements: image display on card backs, multi-select instruction level filtering, and admin edit during study. Research focused on existing codebase patterns, React best practices, and ensuring implementation aligns with project Constitution.

## Research Areas

### 1. Image Display Architecture (User Story 1)

**Decision**: Move image rendering from front to back of Flashcard component, display on back for all cards with English text

**Rationale**:
- Current implementation shows images on front of card (Flashcard.jsx lines 132-139)
- Spec requires images "always appear on the back, after the card is turned"
- Images should appear for ANY card with English text (words, phrases, numbers)
- Must work regardless of study direction (Tibetan→English or English→Tibetan)

**Implementation approach**:
- Modify `Flashcard.jsx` to check `isFlipped` state before rendering image
- Move `<div className="card-image">` from `.flashcard-front` to `.flashcard-back`
- Determine English text presence using existing helpers: `getEnglishText()`, `englishText` field
- Maintain existing `imageError` state and `onError` handler for graceful degradation
- Update `Flashcard.css` to style images within `.flashcard-back` instead of `.flashcard-front`

**Alternatives considered**:
- CSS-only solution using flip transform: Rejected because requires complex z-index management and doesn't support conditional logic
- Duplicate image on both sides: Rejected due to unnecessary DOM nodes and potential performance impact
- Server-side image processing: Rejected as unnecessary; client-side conditional rendering is sufficient

**Testing strategy**:
- Unit tests: Verify image appears on back when `isFlipped=true` and English text present
- Component tests: Verify image doesn't appear on front, graceful handling of missing images
- Visual regression tests: Verify image positioning and sizing on back

**Performance considerations**:
- Image load should not block card flip transition (existing async loading preserved)
- Success criterion SC-006: Card flip time must not increase by >200ms
- Use CSS `will-change: transform` on `.flashcard-inner` to optimize flip animation
- Lazy load images only when card is flipped (defer loading until back is visible)

---

### 2. Multi-Select Filter Implementation (User Story 2)

**Decision**: Add Instruction Level filter section to CardFilter component with multi-select checkbox UI pattern

**Rationale**:
- Current `CardFilter.jsx` supports single-select dropdown for card types and study direction
- Spec requires multi-select capability: "I should be able to select more than one filter, such as 'words' and 'Arpatsa' Instruction Level"
- Instruction levels already exist in database (`instruction_levels` table) and have service layer (`instructionLevelsService.js`)
- Need to combine Type + Category + Instruction Level filters with AND logic (FR-009)

**Implementation approach**:
- Load instruction levels in `App.jsx` using existing `loadInstructionLevels()` service
- Pass instruction levels and selection state down to `CardFilter` component
- Add new filter section in CardFilter dropdown menu (after "Card Types" and "Study Direction" sections)
- Use checkbox UI for multi-select (consistent with common filter patterns)
- Update `filteredCards` logic in `App.jsx` to apply instruction level filter with AND logic
- Store selected instruction level IDs in component state (array of IDs)

**Multi-select UI pattern**:
```jsx
// Inside CardFilter dropdown
<div className="filter-section">
  <div className="filter-section-title">Instruction Level</div>
  {instructionLevels.map(level => (
    <label key={level.id} className="filter-checkbox-item">
      <input 
        type="checkbox"
        checked={selectedInstructionLevels.includes(level.id)}
        onChange={() => onInstructionLevelToggle(level.id)}
      />
      <span>{level.name}</span>
    </label>
  ))}
</div>
```

**State management**:
- Add `selectedInstructionLevels` state (array of instruction level IDs) to `App.jsx`
- Add `instructionLevels` state (loaded from Supabase on mount) to `App.jsx`
- Pass down to `CardFilter` as props with `onInstructionLevelToggle` callback
- Update `filteredCards` useMemo to include instruction level filter:
  ```js
  if (selectedInstructionLevels.length > 0) {
    filtered = filtered.filter(card => 
      selectedInstructionLevels.includes(card.instruction_level_id)
    );
  }
  ```

**Alternatives considered**:
- Dropdown with checkboxes: Rejected due to poor mobile UX and complexity
- Radio buttons (single select): Rejected because spec explicitly requires multi-select
- Separate dropdown for each filter type: Rejected to maintain consistent UI (all filters in one dropdown menu)
- Tag-based filter UI: Rejected to maintain consistency with existing dropdown pattern

**Testing strategy**:
- Unit tests: CardFilter renders instruction level checkboxes, toggles selection correctly
- Integration tests: Verify multi-filter logic (Type + Category + Level) with AND operator
- E2E tests: User selects multiple instruction levels, card count updates, study session includes only matching cards

**Edge cases**:
- Empty instruction levels list: Hide section or show "No levels available"
- Cards without instruction level assigned: Excluded from results when any level filter active (FR-013)
- All checkboxes unchecked: Include cards from all levels (backward compatible, FR-013)

---

### 3. Admin Edit During Study (User Story 3)

**Decision**: Add floating "Edit" button on Flashcard during study mode, visible only to admin users, opens existing EditCardForm in modal

**Rationale**:
- Current admin editing workflow requires navigating to Admin > Card Management > find card > edit
- Spec requires "Edit button when studying cards if I am in Admin mode"
- Existing `EditCardForm.jsx` component is fully functional and handles all validation
- Need to preserve study session state (current card, progress, ratings) after edit

**Implementation approach**:
- Add `isAdmin` prop to `Flashcard` component (passed from `App.jsx` via user role check)
- Render edit button conditionally: `{isAdmin && <button className="edit-button">Edit</button>}`
- Position button as floating action button (FAB) in corner of card (CSS: `position: absolute`)
- Add `onEditCard` callback prop to `Flashcard`, passed from `App.jsx`
- Open `EditCardForm` in modal overlay when edit button clicked
- After save, update card in local state immediately (no need to refetch from database)
- Preserve `currentCard` state and `isFlipped` state after edit (FR-021)

**UI/UX considerations**:
- Button position: Bottom-right corner of card (not blocking card content)
- Button visibility: Only when admin user viewing card (FR-014, FR-015)
- Button accessibility: Keyboard accessible (Tab + Enter), ARIA label "Edit this card"
- Modal behavior: Click outside to cancel, Escape key to close, focus trap within modal
- Edit confirmation: Show success message after save, auto-close modal

**State preservation after edit**:
- Study session state includes:
  - `currentCard`: Update with edited data
  - `progressMap`: Preserve (no changes to SRS ratings)
  - `isFlipped`: Preserve (if user was viewing back, keep showing back)
  - `filteredCards`: Update if card now matches/doesn't match filters
- Implementation:
  ```js
  const handleEditCard = async (editedCard) => {
    // Update card via service
    await updateCard(editedCard);
    // Update local state
    setCurrentCard(editedCard);
    // Update cards list (will trigger filteredCards recompute)
    setCards(prevCards => 
      prevCards.map(c => c.id === editedCard.id ? editedCard : c)
    );
  };
  ```

**Alternatives considered**:
- Inline editing (edit mode toggle): Rejected due to complexity and poor mobile UX
- Side panel editor: Rejected to maintain focus on current card
- Navigate to admin page: Rejected because spec explicitly requires editing "during study"
- Create new edit form for study mode: Rejected to reuse existing `EditCardForm` and maintain DRY

**Testing strategy**:
- Unit tests: Edit button renders only for admin, not for regular users
- Component tests: Edit button opens EditCardForm modal, cancel closes without changes
- Integration tests: Edit workflow preserves study session state, updated card visible immediately
- E2E tests: Admin edits card during study, changes persist, study continues from same position

**Security considerations**:
- Client-side admin check: Only show button to admin users (checked via user role from auth context)
- Server-side validation: Supabase RLS policies enforce edit permissions (already in place)
- No additional API changes needed (reuse existing `updateCard` service)

---

## Technology Stack Verification

**Existing Dependencies** (no new dependencies required):
- React 19.2.0: Hooks (useState, useEffect, useMemo), Context API
- React-DOM 19.2.0: Matches React version
- Vite 7.1.12: Build tool (no config changes needed)
- Supabase JS Client 2.49.2: Database access (existing services sufficient)
- React Testing Library 16.3.0: Component testing (compatible with React 19)
- Vitest 4.0.6: Test runner (no config changes needed)
- Playwright 1.56.1: E2E testing (existing setup sufficient)
- jest-axe 10.0.0: Accessibility testing (existing integration)

**Verified compatibility**:
- React 19.x + React Testing Library 16.x: ✅ Compatible (React 19 requires RTL 16+)
- React 19.x + Vitest 4.x: ✅ Compatible
- No peer dependency warnings in current installation
- All tests passing with current dependency versions

---

## Best Practices Applied

### React Patterns
- **Controlled components**: All filter state managed in parent (`App.jsx`) with props drilled down
- **Composition over inheritance**: Reuse `EditCardForm` component via props, not duplication
- **Single responsibility**: Each component has one clear purpose (Flashcard displays, CardFilter filters, EditCardForm edits)
- **Prop validation**: Use PropTypes or TypeScript interfaces (current project uses PropTypes pattern)

### Performance Optimization
- **useMemo for expensive filters**: Existing pattern in App.jsx for filteredCards (will extend with instruction level filter)
- **Lazy image loading**: Only load images when card is flipped to back
- **Debounce filter updates**: Not needed (checkbox selection is discrete, not typing)
- **Avoid unnecessary re-renders**: Use React.memo for pure components if needed (measure first)

### Accessibility (WCAG 2.1 AA)
- **Keyboard navigation**: All interactive elements focusable and operable via keyboard
- **ARIA labels**: Descriptive labels for edit button, filter checkboxes, image alt text
- **Focus management**: Modal traps focus, returns focus to trigger on close
- **Color contrast**: Verify edit button and filter UI meet 4.5:1 contrast ratio
- **Screen reader announcements**: Use aria-live for filter count updates

### Testing Strategy
- **Test-first development**: Write failing tests before implementation (Constitution Principle I)
- **Test pyramid**: More unit tests (fast), fewer E2E tests (slow but comprehensive)
- **Accessibility tests**: jest-axe integration for automated WCAG checks
- **Coverage targets**: Aim for >80% coverage on modified components

---

## Risk Mitigation

### Technical Risks
1. **Image load performance**: Mitigated by lazy loading, existing onError handler, and SC-006 performance target
2. **Filter complexity**: Mitigated by clear AND logic, comprehensive tests, and progressive enhancement (each filter works independently)
3. **Study state preservation**: Mitigated by careful state management and integration tests covering edit workflow

### User Experience Risks
1. **Filter discoverability**: Mitigated by placing instruction level filter in existing dropdown (consistent with current UX)
2. **Edit button clutter**: Mitigated by showing only to admins, positioning in non-intrusive location
3. **Image layout shifts**: Mitigated by CSS min-height reservation for image container

### Maintenance Risks
1. **Component coupling**: Mitigated by clear props interfaces and modular design (Constitution Principle VIII)
2. **Test brittleness**: Mitigated by testing behavior (not implementation), using semantic queries (getByRole, getByLabelText)
3. **Accessibility regressions**: Mitigated by automated jest-axe tests in CI/CD pipeline

---

## Conclusion

All technical unknowns resolved. Implementation approach aligns with existing codebase patterns, React best practices, and project Constitution. Ready to proceed to Phase 1 (design and contracts).

**Next Steps**:
1. Create data-model.md (card and filter state structures)
2. Create contracts/ (image display behavior, filter API)
3. Create quickstart.md (developer setup guide)
4. Update agent context (run update-agent-context.sh)
5. Proceed to /speckit.tasks for detailed task breakdown

