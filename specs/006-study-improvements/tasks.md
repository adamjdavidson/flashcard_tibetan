# Tasks: Study Experience Improvements

**Branch**: `006-study-improvements`  
**Input**: Design documents from `/specs/006-study-improvements/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included - Project follows Test-First Development (Constitution Principle I)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single-page web application (SPA)
- **Frontend**: `src/components/`, `src/App.jsx`, `src/App.css`
- **Services**: `src/services/` (existing, reused)
- **Tests**: `src/components/__tests__/`, `tests/integration/__tests__/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and dependencies (project already initialized)

- [ ] T001 Verify React 19.2.0 and React-DOM 19.2.0 installed and compatible
- [ ] T002 Verify Vite 7.1.12, Vitest 4.0.6, Playwright 1.56.1 installed
- [ ] T003 [P] Verify Supabase connection and `instruction_levels` table exists
- [ ] T004 [P] Create test data: Add sample instruction levels to database if needed
- [ ] T005 [P] Run existing test suite to establish baseline (`npm run test:all`)

**Checkpoint**: Development environment ready for feature implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Minimal foundational work (most infrastructure already exists)

**⚠️ CRITICAL**: Complete this phase before starting any user story

- [ ] T006 Review and understand existing Flashcard component structure in `src/components/Flashcard.jsx`
- [ ] T007 Review existing CardFilter component structure in `src/components/CardFilter.jsx`
- [ ] T008 Review existing App.jsx state management patterns for filteredCards
- [ ] T009 [P] Verify `instructionLevelsService.js` loads data correctly (run manual test)
- [ ] T010 [P] Create E2E test directories: `tests/e2e/study-images.spec.js`, `tests/e2e/study-filters.spec.js`, `tests/e2e/admin-edit-study.spec.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Image Display on Card Backs (Priority: P1) 🎯 MVP

**Goal**: Move image display from front to back of flashcards for all cards with English text, providing consistent visual reinforcement after flipping

**Independent Test**: View any flashcard with English text during study. Image should appear on back (answer side) after flipping, NOT on front (question side). Test with word, phrase, and number cards in both study directions.

### Tests for User Story 1 (Write FIRST - Ensure FAIL before implementation)

- [ ] T011 [P] [US1] Write unit test: Image displays on back when flipped with English text in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T012 [P] [US1] Write unit test: Image does NOT display on front in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T013 [P] [US1] Write unit test: Image does NOT display when imageUrl is null in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T014 [P] [US1] Write unit test: Image does NOT display when only Tibetan text exists in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T015 [P] [US1] Write unit test: imageError state resets when card changes in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T016 [P] [US1] Write unit test: onError handler sets imageError=true in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T017 [P] [US1] Write unit test: Image has descriptive alt text in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T018 [P] [US1] Write unit test: Works for word cards in both study directions in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T019 [P] [US1] Write unit test: Works for number cards with English back in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T020 [US1] Write E2E test: User flips card and sees image on back in `tests/e2e/study-images.spec.js`
- [ ] T021 [US1] Write E2E test: User flips back to front, image disappears in `tests/e2e/study-images.spec.js`
- [ ] T022 [US1] Write E2E test: Broken image fails gracefully in `tests/e2e/study-images.spec.js`
- [ ] T023 [US1] Run all User Story 1 tests - VERIFY THEY FAIL (`npm run test:components -- Flashcard`)

### Implementation for User Story 1

- [ ] T024 [US1] Modify Flashcard.jsx: Create `shouldShowImage` helper function (checks isFlipped && hasEnglishText && imageUrl && !imageError) in `src/components/Flashcard.jsx`
- [ ] T025 [US1] Modify Flashcard.jsx: Move image rendering logic from `.flashcard-front` to `.flashcard-back` in `src/components/Flashcard.jsx`
- [ ] T026 [US1] Modify Flashcard.jsx: Add conditional rendering based on `shouldShowImage` in `src/components/Flashcard.jsx`
- [ ] T027 [US1] Modify Flashcard.jsx: Ensure imageError reset on card ID change (already exists, verify) in `src/components/Flashcard.jsx`
- [ ] T028 [US1] Update Flashcard.css: Move `.card-image` styles from front to back in `src/components/Flashcard.css`
- [ ] T029 [US1] Update Flashcard.css: Add `min-height: 100px` to prevent layout shift in `src/components/Flashcard.css`
- [ ] T030 [US1] Update Flashcard.css: Style image container for back display (max-width, max-height, margin) in `src/components/Flashcard.css`
- [ ] T031 [US1] Run User Story 1 tests - VERIFY THEY PASS (`npm run test:components -- Flashcard`)
- [ ] T032 [US1] Run E2E tests for User Story 1 (`npm run test:e2e -- study-images`)
- [ ] T033 [US1] Manual test: Verify image display for word, phrase, number cards in both study directions
- [ ] T034 [US1] Manual test: Verify performance - card flip completes in < 500ms with image

**Checkpoint**: User Story 1 complete and independently functional. Images display on back for all cards with English text.

---

## Phase 4: User Story 2 - Multi-Filter Study Card Selection (Priority: P2)

**Goal**: Add multi-select Instruction Level filter to study card selection menu, allowing users to combine Type + Category + Instruction Level filters with AND logic

**Independent Test**: Access study card selection menu, select "words" type AND "Arpatsa" instruction level. Verify only word cards at Arpatsa level appear in study session. Deselect filter, verify all cards return.

### Tests for User Story 2 (Write FIRST - Ensure FAIL before implementation)

- [ ] T035 [P] [US2] Write unit test: handleInstructionLevelToggle adds level when not selected in `src/App.test.jsx` (create if needed)
- [ ] T036 [P] [US2] Write unit test: handleInstructionLevelToggle removes level when selected in `src/App.test.jsx`
- [ ] T037 [P] [US2] Write unit test: filteredCards includes only cards matching selected levels in `src/App.test.jsx`
- [ ] T038 [P] [US2] Write unit test: filteredCards applies AND logic (Type + Level) in `src/App.test.jsx`
- [ ] T039 [P] [US2] Write unit test: Empty selectedInstructionLevels includes all cards in `src/App.test.jsx`
- [ ] T040 [P] [US2] Write unit test: Cards without instruction_level_id excluded when filter active in `src/App.test.jsx`
- [ ] T041 [P] [US2] Write unit test: Multiple levels selected includes cards from any level in `src/App.test.jsx`
- [ ] T042 [P] [US2] Write component test: CardFilter renders instruction level checkboxes in `src/components/__tests__/CardFilter.test.jsx`
- [ ] T043 [P] [US2] Write component test: Clicking checkbox updates selection state in `src/components/__tests__/CardFilter.test.jsx`
- [ ] T044 [P] [US2] Write component test: Instruction levels sorted by order field in `src/components/__tests__/CardFilter.test.jsx`
- [ ] T045 [P] [US2] Write component test: Empty state renders when no levels available in `src/components/__tests__/CardFilter.test.jsx`
- [ ] T046 [US2] Write integration test: User selects instruction level, card count updates in `tests/integration/__tests__/studyFlowWithFilters.test.jsx` (create)
- [ ] T047 [US2] Write integration test: User combines Type + Level filters in `tests/integration/__tests__/studyFlowWithFilters.test.jsx`
- [ ] T048 [US2] Write E2E test: User filters by instruction level in `tests/e2e/study-filters.spec.js`
- [ ] T049 [US2] Write E2E test: User selects multiple instruction levels in `tests/e2e/study-filters.spec.js`
- [ ] T050 [US2] Run all User Story 2 tests - VERIFY THEY FAIL (`npm run test`)

### Implementation for User Story 2

- [ ] T051 [US2] Add state to App.jsx: instructionLevels array (empty initial) in `src/App.jsx`
- [ ] T052 [US2] Add state to App.jsx: selectedInstructionLevels array (empty initial) in `src/App.jsx`
- [ ] T053 [US2] Add useEffect to App.jsx: Load instruction levels on mount via loadInstructionLevels() in `src/App.jsx`
- [ ] T054 [US2] Add handler to App.jsx: handleInstructionLevelToggle function (toggle logic) in `src/App.jsx`
- [ ] T055 [US2] Modify filteredCards useMemo in App.jsx: Add instruction level filter with AND logic in `src/App.jsx`
- [ ] T056 [US2] Update filteredCards dependencies in App.jsx: Add selectedInstructionLevels to useMemo deps in `src/App.jsx`
- [ ] T057 [US2] Pass props to CardFilter in App.jsx: instructionLevels, selectedInstructionLevels, onInstructionLevelToggle in `src/App.jsx`
- [ ] T058 [US2] Update CardFilter.jsx: Add instructionLevels, selectedInstructionLevels, onInstructionLevelToggle props in `src/components/CardFilter.jsx`
- [ ] T059 [US2] Add Instruction Level section to CardFilter.jsx: Render filter section with title in `src/components/CardFilter.jsx`
- [ ] T060 [US2] Add checkboxes to CardFilter.jsx: Map over sorted instruction levels, render checkbox for each in `src/components/CardFilter.jsx`
- [ ] T061 [US2] Add checkbox logic to CardFilter.jsx: checked state and onChange handler in `src/components/CardFilter.jsx`
- [ ] T062 [US2] Add ARIA labels to CardFilter.jsx: aria-label for each checkbox in `src/components/CardFilter.jsx`
- [ ] T063 [US2] Update CardFilter.css: Style filter-checkbox-item class in `src/components/CardFilter.css`
- [ ] T064 [US2] Update CardFilter.css: Add hover and focus styles for checkboxes in `src/components/CardFilter.css`
- [ ] T065 [US2] Update CardFilter.css: Style filter section title and layout in `src/components/CardFilter.css`
- [ ] T066 [US2] Run User Story 2 unit tests - VERIFY THEY PASS (`npm run test -- App.test`)
- [ ] T067 [US2] Run User Story 2 component tests - VERIFY THEY PASS (`npm run test:components -- CardFilter`)
- [ ] T068 [US2] Run User Story 2 integration tests - VERIFY THEY PASS (`npm run test:integration`)
- [ ] T069 [US2] Run User Story 2 E2E tests - VERIFY THEY PASS (`npm run test:e2e -- study-filters`)
- [ ] T070 [US2] Manual test: Select single instruction level, verify card count updates
- [ ] T071 [US2] Manual test: Select multiple levels, verify cards from all selected levels appear
- [ ] T072 [US2] Manual test: Combine Type + Category + Level filters, verify AND logic
- [ ] T073 [US2] Manual test: Verify keyboard accessibility (Tab, Space, Enter)

**Checkpoint**: User Story 2 complete and independently functional. Multi-filter selection working with instruction levels.

---

## Phase 5: User Story 3 - Admin Edit During Study (Priority: P3)

**Goal**: Add Edit button during study sessions (admin users only) that opens EditCardForm modal, allowing on-the-fly card corrections without leaving study flow

**Independent Test**: Login as admin, start study session, click Edit button on card. Verify EditCardForm modal opens. Make changes and save. Verify card updates immediately and study session continues from same position.

### Tests for User Story 3 (Write FIRST - Ensure FAIL before implementation)

- [ ] T074 [P] [US3] Write unit test: Edit button renders only for admin users in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T075 [P] [US3] Write unit test: Edit button does NOT render for non-admin users in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T076 [P] [US3] Write unit test: Edit button has correct ARIA label in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T077 [P] [US3] Write unit test: Clicking edit button calls onEditClick callback in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T078 [P] [US3] Write unit test: Edit button click does not flip card (stopPropagation) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T079 [P] [US3] Write integration test: Admin opens edit modal, modal displays EditCardForm in `tests/integration/__tests__/adminEditDuringStudy.test.jsx` (create)
- [ ] T080 [P] [US3] Write integration test: Admin saves edit, card updates in local state in `tests/integration/__tests__/adminEditDuringStudy.test.jsx`
- [ ] T081 [P] [US3] Write integration test: Admin cancels edit, modal closes without changes in `tests/integration/__tests__/adminEditDuringStudy.test.jsx`
- [ ] T082 [P] [US3] Write integration test: Study session state preserved after edit (isFlipped, currentCard) in `tests/integration/__tests__/adminEditDuringStudy.test.jsx`
- [ ] T083 [US3] Write E2E test: Admin edits card during study in `tests/e2e/admin-edit-study.spec.js`
- [ ] T084 [US3] Write E2E test: Non-admin user does not see edit button in `tests/e2e/admin-edit-study.spec.js`
- [ ] T085 [US3] Write E2E test: Edited card changes persist and display immediately in `tests/e2e/admin-edit-study.spec.js`
- [ ] T086 [US3] Run all User Story 3 tests - VERIFY THEY FAIL (`npm run test`)

### Implementation for User Story 3

- [ ] T087 [US3] Add state to App.jsx: showEditModal boolean (false initial) in `src/App.jsx`
- [ ] T088 [US3] Add state to App.jsx: editingCard object (null initial) in `src/App.jsx`
- [ ] T089 [US3] Add handler to App.jsx: handleEditClick (sets editingCard and showEditModal) in `src/App.jsx`
- [ ] T090 [US3] Add handler to App.jsx: handleEditSave (updates card via service, updates local state) in `src/App.jsx`
- [ ] T091 [US3] Add handler to App.jsx: handleEditCancel (closes modal, resets editingCard) in `src/App.jsx`
- [ ] T092 [US3] Pass isAdmin prop to Flashcard in App.jsx: Check user role and pass as prop in `src/App.jsx`
- [ ] T093 [US3] Pass onEditClick prop to Flashcard in App.jsx: Pass handleEditClick callback in `src/App.jsx`
- [ ] T094 [US3] Update Flashcard.jsx: Add isAdmin and onEditClick props to component signature in `src/components/Flashcard.jsx`
- [ ] T095 [US3] Add edit button to Flashcard.jsx: Conditional render based on isAdmin && onEditClick in `src/components/Flashcard.jsx`
- [ ] T096 [US3] Add button click handler to Flashcard.jsx: stopPropagation and call onEditClick in `src/components/Flashcard.jsx`
- [ ] T097 [US3] Add button accessibility to Flashcard.jsx: aria-label="Edit this card" in `src/components/Flashcard.jsx`
- [ ] T098 [US3] Style edit button in Flashcard.css: Position absolute, top-right, z-index 10 in `src/components/Flashcard.css`
- [ ] T099 [US3] Style edit button states in Flashcard.css: hover, focus styles in `src/components/Flashcard.css`
- [ ] T100 [US3] Render edit modal in App.jsx: Conditional render based on showEditModal in `src/App.jsx`
- [ ] T101 [US3] Render modal overlay in App.jsx: Click outside to close (handleEditCancel) in `src/App.jsx`
- [ ] T102 [US3] Render EditCardForm in modal in App.jsx: Pass editingCard, handleEditSave, handleEditCancel in `src/App.jsx`
- [ ] T103 [US3] Style modal overlay in App.css: Fixed position, backdrop, center content in `src/App.css`
- [ ] T104 [US3] Style modal content in App.css: Background, border-radius, padding, max-height in `src/App.css`
- [ ] T105 [US3] Implement state preservation in App.jsx: Ensure currentCard, isFlipped preserved after edit in `src/App.jsx`
- [ ] T106 [US3] Update cards array in App.jsx: Replace edited card in cards state after save in `src/App.jsx`
- [ ] T107 [US3] Run User Story 3 unit tests - VERIFY THEY PASS (`npm run test:components -- Flashcard`)
- [ ] T108 [US3] Run User Story 3 integration tests - VERIFY THEY PASS (`npm run test:integration -- adminEditDuringStudy`)
- [ ] T109 [US3] Run User Story 3 E2E tests - VERIFY THEY PASS (`npm run test:e2e -- admin-edit-study`)
- [ ] T110 [US3] Manual test: Admin sees edit button, non-admin does not
- [ ] T111 [US3] Manual test: Edit workflow preserves study state (card position, flip state)
- [ ] T112 [US3] Manual test: Keyboard accessibility (Tab to button, Enter to open, Esc to close)
- [ ] T113 [US3] Manual test: Validation errors display correctly in modal

**Checkpoint**: User Story 3 complete and independently functional. Admin can edit cards during study.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation across all user stories

- [ ] T114 [P] Run full test suite across all user stories (`npm run test:all`)
- [ ] T115 [P] Run accessibility tests with jest-axe (`npm run test:accessibility`)
- [ ] T116 [P] Run performance tests to verify SC-004, SC-006 metrics (`npm run test:performance`)
- [ ] T117 [P] Verify linting passes for all modified files (`npm run lint`)
- [ ] T118 [P] Update README.md with feature documentation if needed
- [ ] T119 [P] Create demo data script: Populate instruction levels and cards with images for testing
- [ ] T120 Verify quickstart.md instructions are accurate (follow manual steps)
- [ ] T121 Cross-browser testing: Test in Chrome, Firefox, Safari (manual)
- [ ] T122 Mobile responsiveness testing: Verify on mobile viewport (manual)
- [ ] T123 Screen reader testing: Test with NVDA/VoiceOver (manual)
- [ ] T124 Code cleanup: Remove console.logs, commented code, unused imports
- [ ] T125 Performance profiling: Verify card flip time < 500ms, filter update < 1s
- [ ] T126 Final integration test: Complete user journey through all 3 features
- [ ] T127 Create pull request with comprehensive description and demo screenshots
- [ ] T128 Address code review feedback (placeholder for review process)

**Checkpoint**: All user stories polished, tested, and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) OR
  - Sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - **No dependencies on other stories** (independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - **No dependencies on other stories** (independently testable)

**KEY INSIGHT**: All three user stories are fully independent. After Foundational phase, all can proceed in parallel.

### Within Each User Story

**Strict TDD workflow**:
1. Write tests FIRST (T011-T023 for US1, T035-T050 for US2, T074-T086 for US3)
2. Run tests - VERIFY they FAIL (critical verification step)
3. Implement code (T024-T034 for US1, T051-T073 for US2, T087-T113 for US3)
4. Run tests - VERIFY they PASS
5. Manual testing and validation
6. Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**: T001, T002, T003, T004, T005 can all run in parallel

**Foundational Phase**: T009, T010 can run in parallel (after T006-T008 complete)

**User Story 1 Tests**: T011-T019 can all run in parallel (different test files/cases)

**User Story 2 Tests**: T035-T045 can all run in parallel (different test files/cases)

**User Story 3 Tests**: T074-T078, T079-T082 can run in parallel (different test files/cases)

**Polish Phase**: T114-T119 can all run in parallel

**BIGGEST PARALLEL OPPORTUNITY**: After Foundational phase completes, all three user stories (Phase 3, 4, 5) can be worked on simultaneously by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task T011: "Write unit test: Image displays on back when flipped with English text"
Task T012: "Write unit test: Image does NOT display on front"
Task T013: "Write unit test: Image does NOT display when imageUrl is null"
Task T014: "Write unit test: Image does NOT display when only Tibetan text exists"
Task T015: "Write unit test: imageError state resets when card changes"
Task T016: "Write unit test: onError handler sets imageError=true"
Task T017: "Write unit test: Image has descriptive alt text"
Task T018: "Write unit test: Works for word cards in both study directions"
Task T019: "Write unit test: Works for number cards with English back"
# All 9 unit tests can be written in parallel by different team members

# Implementation tasks that can run in parallel:
Task T028: "Update Flashcard.css: Move .card-image styles from front to back"
Task T029: "Update Flashcard.css: Add min-height: 100px to prevent layout shift"
Task T030: "Update Flashcard.css: Style image container for back display"
# All CSS changes can be done in parallel
```

---

## Parallel Example: All User Stories

```bash
# After Foundational phase completes, split team:

# Developer A works on User Story 1 (Phase 3):
# - T011-T034 (24 tasks)
# - Focus: Image display on flashcard backs

# Developer B works on User Story 2 (Phase 4):  
# - T035-T073 (39 tasks)
# - Focus: Multi-select instruction level filtering

# Developer C works on User Story 3 (Phase 5):
# - T074-T113 (40 tasks)
# - Focus: Admin edit during study

# All three developers work independently and merge when complete
# Total parallel time: Max(US1_time, US2_time, US3_time) instead of US1_time + US2_time + US3_time
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

**Fastest path to value**:

1. Complete Phase 1: Setup (T001-T005) → ~30 minutes
2. Complete Phase 2: Foundational (T006-T010) → ~1 hour
3. Complete Phase 3: User Story 1 (T011-T034) → ~2-3 hours
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready → **MVP delivered!**

**Time to MVP: ~4-5 hours** (Image display on backs for all cards with English text)

### Incremental Delivery

**Each story adds value independently**:

1. Complete Setup + Foundational → Foundation ready (~1.5 hours)
2. Add User Story 1 → Test independently → Deploy/Demo → **MVP!** (~2-3 hours)
3. Add User Story 2 → Test independently → Deploy/Demo (~3-4 hours)
4. Add User Story 3 → Test independently → Deploy/Demo (~2-3 hours)
5. Polish → Deploy final version (~1-2 hours)

**Total sequential time: ~10-14 hours** (all 3 user stories + polish)

### Parallel Team Strategy

**With 3 developers working simultaneously**:

1. **Together**: Complete Setup + Foundational (~1.5 hours)
2. **Parallel work**:
   - Developer A: User Story 1 (T011-T034) → ~2-3 hours
   - Developer B: User Story 2 (T035-T073) → ~3-4 hours
   - Developer C: User Story 3 (T074-T113) → ~2-3 hours
3. **Together**: Polish & integration (T114-T128) → ~1-2 hours

**Total parallel time: ~5-7 hours** (vs 10-14 hours sequential)

---

## Task Statistics

**Total Tasks**: 128

**Breakdown by Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Image Display): 24 tasks (13 tests + 11 implementation)
- Phase 4 (US2 - Multi-Filter): 39 tasks (16 tests + 23 implementation)
- Phase 5 (US3 - Admin Edit): 40 tasks (13 tests + 27 implementation)
- Phase 6 (Polish): 15 tasks

**Parallelizable Tasks**: 47 tasks marked with [P] (37% of total)

**Independent User Stories**: 3 (all can proceed in parallel after Foundational phase)

**Test Coverage**:
- Unit tests: 30 (US1: 9, US2: 11, US3: 10)
- Component tests: 4 (US2: 4)
- Integration tests: 8 (US2: 2, US3: 4, US1: 2 via E2E)
- E2E tests: 9 (US1: 3, US2: 2, US3: 3, Polish: 1)
- **Total test tasks: 51 (40% of all tasks)**

**MVP Scope**: User Story 1 only (24 tasks, ~4-5 hours to MVP)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Test-First Development**: Constitution requires tests before implementation
- **Each user story independently completable and testable**: No cross-story dependencies
- **Verify tests fail before implementing**: Critical TDD validation step
- **Commit after each task or logical group**: Enables rollback if needed
- **Stop at any checkpoint to validate story independently**: Incremental delivery
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence
- **Success criteria verification**: SC-001 through SC-008 validated in manual tests and E2E tests

