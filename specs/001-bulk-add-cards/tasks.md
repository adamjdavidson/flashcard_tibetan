# Tasks: Bulk Add Cards

**Input**: Design documents from `/specs/001-bulk-add-cards/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are REQUIRED per Constitution Principle I (Test-First Development). All test tasks must be completed before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow single web application structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create directory structure for bulk add feature components in `src/components/`
- [ ] T002 Create directory structure for bulk add service in `src/services/`
- [ ] T003 [P] Create test directory structure in `tests/components/__tests__/` for BulkAddForm and BulkAddSummary
- [ ] T004 [P] Create test directory structure in `tests/services/__tests__/` for bulkAddService

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Verify existing translation service (`src/utils/translation.js`) is available and functional
- [ ] T006 Verify existing image generation service (`src/utils/images.js`) is available and functional
- [ ] T007 Verify existing card service (`src/services/cardsService.js`) batch operations are functional
- [ ] T008 Verify existing category service (`src/services/categoriesService.js`) is available and functional
- [ ] T009 Verify existing instruction level service (`src/services/instructionLevelsService.js`) is available and functional

**Checkpoint**: Foundation ready - all existing services verified, user story implementation can now begin

---

## Phase 3: User Story 1 - Bulk Add Words with Shared Characteristics (Priority: P1) 🎯 MVP

**Goal**: Enable admins to paste a list of words, select shared metadata (card type, categories, instruction level), and create cards for new words with duplicate detection.

**Independent Test**: Paste a list of 5-10 words, select card type and classification options, submit, and verify that new cards are created with correct shared characteristics. Duplicate words are skipped.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Write unit test for `checkDuplicates()` function in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T011 [P] [US1] Write unit test for `processBulkAdd()` basic flow (without translation/image) in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T012 [P] [US1] Write component test for BulkAddForm validation (word count, card type) in `tests/components/__tests__/BulkAddForm.test.jsx`
- [ ] T013 [P] [US1] Write component test for BulkAddForm form submission in `tests/components/__tests__/BulkAddForm.test.jsx`
- [ ] T014 [P] [US1] Write integration test for bulk add workflow (duplicate detection) in `tests/integration/__tests__/bulkAdd.test.js`

### Implementation for User Story 1

- [ ] T015 [US1] Implement `checkDuplicates(words)` function in `src/services/bulkAddService.js` (case-insensitive, trims whitespace)
- [ ] T016 [US1] Implement `processBulkAdd(request, options)` main function skeleton in `src/services/bulkAddService.js` (validation, duplicate check, card creation)
- [ ] T017 [US1] Implement word list parsing and validation (trim whitespace, skip empty lines) in `src/services/bulkAddService.js`
- [ ] T018 [US1] Implement batch card creation using existing `saveCards()` function in `src/services/bulkAddService.js`
- [ ] T019 [US1] Create BulkAddForm component with text area, card type selector, category selector, instruction level selector in `src/components/BulkAddForm.jsx`
- [ ] T020 [US1] Add word count display and validation (2-100 words) in `src/components/BulkAddForm.jsx`
- [ ] T021 [US1] Add form submission handler that calls `bulkAddService.processBulkAdd()` in `src/components/BulkAddForm.jsx`
- [ ] T022 [US1] Create BulkAddSummary component to display results (cards created, duplicates skipped) in `src/components/BulkAddSummary.jsx`
- [ ] T023 [US1] Add BulkAddForm CSS styling matching existing admin form styles in `src/components/BulkAddForm.css`
- [ ] T024 [US1] Add BulkAddSummary CSS styling in `src/components/BulkAddSummary.css`
- [ ] T025 [US1] Integrate BulkAddForm into AdminPage with "Bulk Add Cards" button and modal in `src/components/AdminPage.jsx`
- [ ] T026 [US1] Add state management for bulk add modal in `src/components/AdminPage.jsx`
- [ ] T027 [US1] Add card list refresh after bulk add completion in `src/components/AdminPage.jsx`

**Checkpoint**: At this point, User Story 1 should be fully functional - admins can bulk add words, duplicates are detected and skipped, cards are created with shared metadata. Test independently before proceeding.

---

## Phase 4: User Story 3 - Automatic Translation and Image Generation (Priority: P1)

**Goal**: Automatically translate English words to Tibetan and generate images for each card during bulk add, eliminating manual steps.

**Independent Test**: Submit bulk add with 5-10 new words and verify each created card has Tibetan translation populated and an image generated. Cards created even if translation/image fails.

### Tests for User Story 3 ⚠️

- [ ] T028 [P] [US3] Write unit test for `translateWords()` batch processing with delays in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T029 [P] [US3] Write unit test for `generateImages()` sequential processing with delays in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T030 [P] [US3] Write unit test for partial failure handling (translation fails, image succeeds) in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T031 [P] [US3] Write integration test for translation and image generation workflow in `tests/integration/__tests__/bulkAdd.test.js`

### Implementation for User Story 3

- [ ] T032 [US3] Implement `translateWords(words)` function with batch processing (batches of 5, 100ms delays) in `src/services/bulkAddService.js`
- [ ] T033 [US3] Implement `generateImages(words)` function with sequential processing (2 second delays) in `src/services/bulkAddService.js`
- [ ] T034 [US3] Integrate translation into `processBulkAdd()` workflow (after duplicate check, before card creation) in `src/services/bulkAddService.js`
- [ ] T035 [US3] Integrate image generation into `processBulkAdd()` workflow (after translation, before card creation) in `src/services/bulkAddService.js`
- [ ] T036 [US3] Update card creation to include translation results (tibetanText field) in `src/services/bulkAddService.js`
- [ ] T037 [US3] Update card creation to include image results (imageUrl field) in `src/services/bulkAddService.js`
- [ ] T038 [US3] Update BulkAddSummary to display translation failures in `src/components/BulkAddSummary.jsx`
- [ ] T039 [US3] Update BulkAddSummary to display image generation failures in `src/components/BulkAddSummary.jsx`
- [ ] T040 [US3] Add progress indication for translation stage in `src/components/BulkAddForm.jsx`
- [ ] T041 [US3] Add progress indication for image generation stage in `src/components/BulkAddForm.jsx`

**Checkpoint**: At this point, User Story 3 should be complete - automatic translation and image generation work during bulk add. Test independently.

---

## Phase 5: User Story 4 - New Category Flagging for Review (Priority: P1)

**Goal**: Automatically assign "new" category to all bulk-created cards, enabling admins to filter and review them.

**Independent Test**: Complete bulk add operation and verify all newly created cards have "new" category assigned. Filter cards by "new" category to see bulk-created cards.

### Tests for User Story 4 ⚠️

- [ ] T042 [P] [US4] Write unit test for `ensureNewCategory()` function (creates if missing) in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T043 [P] [US4] Write unit test for category assignment to bulk-created cards in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T044 [P] [US4] Write integration test for "new" category workflow in `tests/integration/__tests__/bulkAdd.test.js`

### Implementation for User Story 4

- [ ] T045 [US4] Implement `ensureNewCategory()` function (check existence, create if missing) in `src/services/bulkAddService.js`
- [ ] T046 [US4] Integrate `ensureNewCategory()` into `processBulkAdd()` workflow (before card creation) in `src/services/bulkAddService.js`
- [ ] T047 [US4] Update card creation to include "new" category in categoryIds array in `src/services/bulkAddService.js`
- [ ] T048 [US4] Verify existing card filtering supports "new" category filter (no changes needed if using existing filter)

**Checkpoint**: At this point, User Story 4 should be complete - all bulk-created cards have "new" category. Test independently.

---

## Phase 6: User Story 2 - Duplicate Detection and Reporting (Priority: P2)

**Goal**: Enhance duplicate detection reporting to show which words were skipped and why.

**Note**: Basic duplicate detection is already implemented in US1. This phase enhances reporting.

**Independent Test**: Submit bulk add with mix of new and duplicate words, verify summary clearly lists which words were skipped as duplicates.

### Tests for User Story 2 ⚠️

- [ ] T049 [P] [US2] Write unit test for duplicate word reporting in summary in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T050 [P] [US2] Write component test for duplicate words display in BulkAddSummary in `tests/components/__tests__/BulkAddSummary.test.jsx`

### Implementation for User Story 2

- [ ] T051 [US2] Enhance `checkDuplicates()` to return detailed duplicate information (word, existing card ID) in `src/services/bulkAddService.js`
- [ ] T052 [US2] Update BulkAddSummary to display list of duplicate words in `src/components/BulkAddSummary.jsx`
- [ ] T053 [US2] Add collapsible section for duplicate words in BulkAddSummary UI in `src/components/BulkAddSummary.jsx`

**Checkpoint**: At this point, User Story 2 should be complete - duplicate detection reporting is enhanced. Test independently.

---

## Phase 7: User Story 5 - Validation and Error Handling (Priority: P2)

**Goal**: Comprehensive validation and error handling throughout bulk add workflow.

**Independent Test**: Submit invalid inputs (empty list, too many words, invalid card type) and verify appropriate error messages shown, no invalid cards created.

### Tests for User Story 5 ⚠️

- [ ] T054 [P] [US5] Write unit test for validation (empty words, >100 words, invalid card type) in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T055 [P] [US5] Write unit test for network error handling in `tests/services/__tests__/bulkAddService.test.js`
- [ ] T056 [P] [US5] Write component test for validation error display in `tests/components/__tests__/BulkAddForm.test.jsx`
- [ ] T057 [P] [US5] Write integration test for error handling scenarios in `tests/integration/__tests__/bulkAdd.test.js`

### Implementation for User Story 5

- [ ] T058 [US5] Add comprehensive validation (word count, card type, category/instruction level existence) in `src/services/bulkAddService.js`
- [ ] T059 [US5] Add validation error messages for each validation failure in `src/components/BulkAddForm.jsx`
- [ ] T060 [US5] Add network error handling and retry logic in `src/services/bulkAddService.js`
- [ ] T061 [US5] Add error display in BulkAddForm for validation errors in `src/components/BulkAddForm.jsx`
- [ ] T062 [US5] Add error display in BulkAddSummary for processing errors in `src/components/BulkAddSummary.jsx`
- [ ] T063 [US5] Add cancel button functionality to stop processing in `src/components/BulkAddForm.jsx`
- [ ] T064 [US5] Ensure no partial cards created on critical errors in `src/services/bulkAddService.js`

**Checkpoint**: At this point, User Story 5 should be complete - comprehensive validation and error handling throughout. Test independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T065 [P] Add accessibility tests (keyboard navigation, screen reader) in `tests/components/__tests__/BulkAddForm.test.jsx`
- [ ] T066 [P] Add accessibility tests for BulkAddSummary in `tests/components/__tests__/BulkAddSummary.test.jsx`
- [ ] T067 [P] Add E2E test for complete bulk add workflow in `tests/integration/e2e/adminWorkflows.spec.js`
- [ ] T068 [P] Add E2E test for bulk add with duplicates in `tests/integration/e2e/adminWorkflows.spec.js`
- [ ] T069 [P] Add E2E test for bulk add error scenarios in `tests/integration/e2e/adminWorkflows.spec.js`
- [ ] T070 Add performance optimization (throttle progress updates) in `src/components/BulkAddForm.jsx`
- [ ] T071 Add loading states and disabled states during processing in `src/components/BulkAddForm.jsx`
- [ ] T072 Add success message after bulk add completion in `src/components/AdminPage.jsx`
- [ ] T073 Verify all error messages are user-friendly and actionable
- [ ] T074 Run quickstart.md validation to ensure implementation matches design
- [ ] T075 Code cleanup and refactoring (extract constants, improve naming)
- [ ] T076 Update documentation (README, API docs if applicable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - Core MVP
  - User Story 3 (Phase 4): Depends on User Story 1 completion - Adds translation/image
  - User Story 4 (Phase 5): Depends on User Story 1 completion - Adds category flagging
  - User Story 2 (Phase 6): Depends on User Story 1 completion - Enhances reporting
  - User Story 5 (Phase 7): Depends on all previous stories - Adds validation/error handling
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for all other stories - Must complete first
- **User Story 3 (P1)**: Depends on US1 - Adds automatic translation/image generation
- **User Story 4 (P1)**: Depends on US1 - Adds "new" category flagging
- **User Story 2 (P2)**: Depends on US1 - Enhances duplicate reporting (basic detection already in US1)
- **User Story 5 (P2)**: Depends on all stories - Adds comprehensive validation/error handling

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Service functions before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All test tasks for a user story marked [P] can run in parallel
- Service functions within a story marked [P] can run in parallel if they don't depend on each other
- Different user stories can be worked on sequentially (US1 → US3 → US4 → US2 → US5)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for checkDuplicates() function in tests/services/__tests__/bulkAddService.test.js"
Task: "Write unit test for processBulkAdd() basic flow in tests/services/__tests__/bulkAddService.test.js"
Task: "Write component test for BulkAddForm validation in tests/components/__tests__/BulkAddForm.test.jsx"
Task: "Write component test for BulkAddForm form submission in tests/components/__tests__/BulkAddForm.test.jsx"
Task: "Write integration test for bulk add workflow in tests/integration/__tests__/bulkAdd.test.js"

# After tests are written and failing, launch service implementation:
Task: "Implement checkDuplicates() function in src/services/bulkAddService.js"
Task: "Implement processBulkAdd() main function skeleton in src/services/bulkAddService.js"
Task: "Implement word list parsing and validation in src/services/bulkAddService.js"

# Then launch component implementation:
Task: "Create BulkAddForm component in src/components/BulkAddForm.jsx"
Task: "Add word count display and validation in src/components/BulkAddForm.jsx"
Task: "Create BulkAddSummary component in src/components/BulkAddSummary.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Core bulk add with duplicate detection)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 → Test independently → Deploy/Demo (Automatic translation/image)
4. Add User Story 4 → Test independently → Deploy/Demo (Category flagging)
5. Add User Story 2 → Test independently → Deploy/Demo (Enhanced reporting)
6. Add User Story 5 → Test independently → Deploy/Demo (Validation/error handling)
7. Polish phase → Final improvements

### Sequential Team Strategy

With a single developer or small team:

1. Complete Setup + Foundational together
2. Complete User Story 1 (MVP) → Test → Deploy
3. Complete User Story 3 → Test → Deploy
4. Complete User Story 4 → Test → Deploy
5. Complete User Story 2 → Test → Deploy
6. Complete User Story 5 → Test → Deploy
7. Complete Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow test-first development: write tests, verify they fail, then implement
- Reuse existing services (translation, images, cards, categories) without modification
- Follow existing component patterns (QuickTranslateForm, AddCardForm, AdminCardModal)

---

## Task Summary

**Total Tasks**: 76
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1): 18 tasks (8 tests + 10 implementation)
- Phase 4 (US3): 10 tasks (4 tests + 6 implementation)
- Phase 5 (US4): 7 tasks (3 tests + 4 implementation)
- Phase 6 (US2): 5 tasks (2 tests + 3 implementation)
- Phase 7 (US5): 11 tasks (4 tests + 7 implementation)
- Phase 8 (Polish): 12 tasks

**Parallel Opportunities**: 
- Setup phase: 2 tasks can run in parallel
- Foundational phase: All 5 tasks can run in parallel (verification tasks)
- Each user story: All test tasks can run in parallel
- Service functions within stories can often run in parallel

**Independent Test Criteria**:
- **US1**: Paste 5-10 words, select metadata, submit, verify cards created with correct characteristics, duplicates skipped
- **US3**: Submit bulk add with 5-10 new words, verify each card has Tibetan translation and image
- **US4**: Complete bulk add, verify all cards have "new" category, filter by "new" category
- **US2**: Submit bulk add with mix of new/duplicate words, verify summary lists duplicates
- **US5**: Submit invalid inputs, verify error messages, no invalid cards created

**Suggested MVP Scope**: User Story 1 only (Phase 3) - Core bulk add functionality with duplicate detection. This delivers immediate value and can be extended with US3, US4, US2, US5 incrementally.

