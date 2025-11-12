# Tasks: New Checkbox for Bulk Add Cards

**Input**: Design documents from `/specs/005-new-checkbox-bulk-add/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as this feature requires test-first development per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure (`src/components/`, `src/services/`)

---

## Phase 1: User Story 1 - Display New Checkbox in Bulk Add Form (Priority: P1) 🎯 MVP

**Goal**: Add a "New" checkbox to the bulk add form that is visible, clearly labeled, and checked by default. This provides admins with control over whether bulk-created cards are flagged for review.

**Independent Test**: Open the bulk add form and verify that a "New" checkbox appears alongside other card characteristics (card type, categories, instruction level), is clearly labeled "Mark as New (for review)", and is checked by default. Admin can check/uncheck the checkbox before submitting.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T001 [P] [US1] Write test for checkbox rendering in `src/components/__tests__/BulkAddForm.test.jsx` - verify checkbox appears with label "Mark as New (for review)"
- [ ] T002 [P] [US1] Write test for checkbox default state in `src/components/__tests__/BulkAddForm.test.jsx` - verify checkbox is checked by default
- [ ] T003 [P] [US1] Write test for checkbox interaction in `src/components/__tests__/BulkAddForm.test.jsx` - verify admin can check/uncheck checkbox
- [ ] T004 [P] [US1] Write test for checkbox accessibility in `src/components/__tests__/BulkAddForm.test.jsx` - verify label association, ARIA attributes, keyboard navigation

### Implementation for User Story 1

- [ ] T005 [US1] Add `markAsNew` state to BulkAddForm component in `src/components/BulkAddForm.jsx` - initialize with `useState(true)`
- [ ] T006 [US1] Add `handleCheckboxChange` handler in `src/components/BulkAddForm.jsx` - update `markAsNew` state on checkbox change
- [ ] T007 [US1] Add checkbox UI element to BulkAddForm JSX in `src/components/BulkAddForm.jsx` - include label "Mark as New (for review)", helper text, proper accessibility attributes
- [ ] T008 [US1] Add checkbox styling to `src/components/BulkAddForm.css` - ensure consistent spacing, theming support, disabled state styling
- [ ] T009 [US1] Modify `handleSubmit` in `src/components/BulkAddForm.jsx` - include `markAsNew` in request object passed to `processBulkAdd`

**Checkpoint**: At this point, User Story 1 should be fully functional - checkbox displays, is checked by default, can be toggled, and value is included in form submission.

---

## Phase 2: User Story 2 - Automatic New Checkbox Selection for Auto-Translated Words (Priority: P1)

**Goal**: Automatically check the "New" checkbox when words are entered that will be auto-translated, ensuring all auto-translated content is flagged for review. Respect manual override if admin has unchecked the checkbox.

**Independent Test**: Enter words into the bulk add form and verify the checkbox automatically becomes checked. Manually uncheck the checkbox, then enter more words - verify checkbox remains unchecked (respects manual override). Submit form and verify cards created with auto-translation have "new" category assigned only if checkbox was checked.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US2] Write test for auto-check on word entry in `src/components/__tests__/BulkAddForm.test.jsx` - verify checkbox auto-checks when words are entered
- [ ] T011 [P] [US2] Write test for manual override in `src/components/__tests__/BulkAddForm.test.jsx` - verify manual uncheck prevents auto-checking
- [ ] T012 [P] [US2] Write test for conditional category assignment in `src/services/__tests__/bulkAddService.test.js` - verify `markAsNew: true` assigns "new" category
- [ ] T013 [P] [US2] Write test for conditional category skip in `src/services/__tests__/bulkAddService.test.js` - verify `markAsNew: false` does not assign "new" category

### Implementation for User Story 2

- [ ] T014 [US2] Add `manualOverride` state tracking in `src/components/BulkAddForm.jsx` - track if user has manually set checkbox state
- [ ] T015 [US2] Add `useEffect` hook in `src/components/BulkAddForm.jsx` - watch `wordsText` changes and auto-check checkbox if words entered and not manually overridden
- [ ] T016 [US2] Update `handleCheckboxChange` in `src/components/BulkAddForm.jsx` - set `manualOverride` to `true` when user manually changes checkbox
- [ ] T017 [US2] Update `processBulkAdd` function signature in `src/services/bulkAddService.js` - add `markAsNew` parameter with default value `true` for backward compatibility
- [ ] T018 [US2] Add conditional "new" category logic in `src/services/bulkAddService.js` - only call `ensureNewCategory()` and add to `allCategoryIds` if `markAsNew: true`
- [ ] T019 [US2] Update form reset logic in `src/components/BulkAddForm.jsx` - reset `markAsNew` to `true` and `manualOverride` to `false` when form is reset

**Checkpoint**: At this point, User Story 2 should be fully functional - checkbox auto-checks on word entry, respects manual override, and service conditionally assigns "new" category based on checkbox state.

---

## Phase 3: User Story 3 - Tibetan Reviewer Can Uncheck New Category (Priority: P1)

**Goal**: Verify that reviewers can filter cards by "new" category, review card content, and remove the "new" category via existing EditCardForm to mark cards as reviewed.

**Independent Test**: Filter cards by "new" category, open a card in EditCardForm, verify "new" category is displayed, remove "new" category, save card, verify card no longer appears in "new" category filter.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US3] Write integration test for reviewer workflow in `src/integration/__tests__/bulkAddReviewWorkflow.test.js` - verify filtering by "new" category shows bulk-created cards
- [ ] T021 [P] [US3] Write integration test for category removal in `src/integration/__tests__/bulkAddReviewWorkflow.test.js` - verify reviewer can remove "new" category via EditCardForm
- [ ] T022 [P] [US3] Write E2E test for complete reviewer workflow in `src/integration/e2e/bulkAddReviewWorkflow.spec.js` - verify filter → review → remove category → verify removed flow

### Implementation for User Story 3

- [ ] T023 [US3] Verify EditCardForm displays "new" category in `src/components/EditCardForm.jsx` - ensure existing category management works with "new" category (no changes needed if already working)
- [ ] T024 [US3] Verify card filtering by "new" category works in existing card list components - ensure filter functionality includes "new" category option (no changes needed if already working)
- [ ] T025 [US3] Document reviewer workflow in feature documentation - add notes about using existing EditCardForm for review process

**Checkpoint**: At this point, User Story 3 should be verified - reviewers can filter by "new" category, review cards, and remove the category using existing functionality.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure feature completeness

- [ ] T026 [P] Add backward compatibility test in `src/services/__tests__/bulkAddService.test.js` - verify `processBulkAdd` without `markAsNew` parameter defaults to `true`
- [ ] T027 [P] Add error handling test in `src/services/__tests__/bulkAddService.test.js` - verify graceful handling if "new" category creation fails
- [ ] T028 [P] Update component documentation in `src/components/BulkAddForm.jsx` - add JSDoc comments for new checkbox functionality
- [ ] T029 [P] Update service documentation in `src/services/bulkAddService.js` - add JSDoc comments for `markAsNew` parameter
- [ ] T030 Verify accessibility compliance - run accessibility tests, ensure WCAG 2.1 AA standards met for checkbox
- [ ] T031 Run quickstart.md validation - verify all implementation steps from quickstart.md are complete
- [ ] T032 Code cleanup and refactoring - review code for consistency, remove any unused code, ensure proper error handling

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies - can start immediately (modifies existing BulkAddForm)
- **User Story 2 (Phase 2)**: Depends on User Story 1 completion - builds on checkbox UI from US1
- **User Story 3 (Phase 3)**: Can start in parallel with US1/US2 - uses existing EditCardForm (verification only)
- **Polish (Phase 4)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - adds checkbox UI and state management
- **User Story 2 (P1)**: Depends on US1 - adds auto-checking behavior and service integration
- **User Story 3 (P1)**: Independent - verification of existing functionality (no new code needed)

### Within Each User Story

- Tests (T001-T004, T010-T013, T020-T022) MUST be written and FAIL before implementation
- Component changes before service changes (US1: T005-T009, US2: T014-T016 before T017-T018)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (US1)**: Tests T001-T004 can run in parallel (all test different aspects)
- **Phase 2 (US2)**: Tests T010-T013 can run in parallel
- **Phase 3 (US3)**: Tests T020-T022 can run in parallel
- **Phase 4**: Tasks T026-T029 can run in parallel
- **Cross-phase**: US3 verification (T023-T025) can start in parallel with US1/US2 since it uses existing code

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write test for checkbox rendering in src/components/__tests__/BulkAddForm.test.jsx"
Task: "Write test for checkbox default state in src/components/__tests__/BulkAddForm.test.jsx"
Task: "Write test for checkbox interaction in src/components/__tests__/BulkAddForm.test.jsx"
Task: "Write test for checkbox accessibility in src/components/__tests__/BulkAddForm.test.jsx"

# Then implement checkbox functionality:
Task: "Add markAsNew state to BulkAddForm component in src/components/BulkAddForm.jsx"
Task: "Add handleCheckboxChange handler in src/components/BulkAddForm.jsx"
Task: "Add checkbox UI element to BulkAddForm JSX in src/components/BulkAddForm.jsx"
Task: "Add checkbox styling to src/components/BulkAddForm.css"
Task: "Modify handleSubmit in src/components/BulkAddForm.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (checkbox display and basic interaction)
2. **STOP and VALIDATE**: Test User Story 1 independently
3. Deploy/demo if ready

### Incremental Delivery

1. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
2. Add User Story 2 → Test independently → Deploy/Demo (auto-checking + service integration)
3. Verify User Story 3 → Test independently → Deploy/Demo (reviewer workflow)
4. Polish → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Developer A: User Story 1 (checkbox UI)
2. Developer B: User Story 2 (auto-checking + service) - starts after US1 checkbox state is added
3. Developer C: User Story 3 (reviewer workflow verification) - can start immediately (uses existing code)
4. All developers: Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Test-First**: All test tasks (T001-T004, T010-T013, T020-T022) must be written and fail before implementation tasks
- **Backward Compatibility**: Service changes (T017-T018) must maintain backward compatibility (default `markAsNew: true`)
- **Accessibility**: Checkbox must meet WCAG 2.1 AA standards (proper labels, ARIA, keyboard navigation)

