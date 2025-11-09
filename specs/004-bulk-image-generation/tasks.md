# Tasks: Bulk Image Generation

**Input**: Design documents from `/specs/004-bulk-image-generation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following Test-First principle (NON-NEGOTIABLE per constitution), tests are included and MUST be written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/components/`, `src/utils/`, `src/services/` at repository root
- **Tests**: `src/components/__tests__/`, `src/utils/__tests__/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create CSS file for BulkImageGenerator component in `src/components/BulkImageGenerator.css`
- [x] T002 [P] Create test directory structure for bulk image generation tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Write unit tests for `filterCardsNeedingImages` function in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T004 [P] Write unit tests for `getImagePrompt` helper function in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T005 [P] Write unit tests for `processBulkImageGeneration` function in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T006 Implement `getImagePrompt` helper function in `src/utils/bulkImageService.js` (priority: englishText > backEnglish > front)
- [x] T007 Implement `filterCardsNeedingImages` function in `src/utils/bulkImageService.js` (filters word/phrase cards without imageUrl, respects filters, excludes cards without text fields)
- [x] T008 Implement `processBulkImageGeneration` function in `src/utils/bulkImageService.js` (sequential processing, error handling, progress callbacks, cancellation support)

**Checkpoint**: Foundation ready - bulk image service utility complete and tested. User story implementation can now begin.

---

## Phase 3: User Story 1 - Bulk Generate Images for Word Cards Without Images (Priority: P1) 🎯 MVP

**Goal**: Admin users can click a button to automatically identify all word cards missing images and generate images for them in bulk.

**Independent Test**: Click the bulk generate button and verify that images are generated for cards that previously lacked them. Can be tested independently without progress tracking or filtering.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Write component test for BulkImageGenerator rendering in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T010 [P] [US1] Write component test for bulk generate button click in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T011 [P] [US1] Write component test for empty state message in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T012 [P] [US1] Write integration test for bulk generation flow in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)

### Implementation for User Story 1

- [x] T013 [US1] Create BulkImageGenerator component in `src/components/BulkImageGenerator.jsx` (basic structure with button and empty state)
- [x] T014 [US1] Implement bulk generate button handler in `src/components/BulkImageGenerator.jsx` (calls filterCardsNeedingImages, confirms with user, calls processBulkImageGeneration)
- [x] T015 [US1] Add empty state messaging in `src/components/BulkImageGenerator.jsx` (shows message when no cards need images)
- [x] T016 [US1] Add basic CSS styles for BulkImageGenerator in `src/components/BulkImageGenerator.css` (layout, button styles, message styles)
- [x] T017 [US1] Integrate BulkImageGenerator into AdminPage in `src/components/AdminPage.jsx` (add component in Card Management tab, pass cards prop)
- [x] T018 [US1] Add completion callback handler in `src/components/AdminPage.jsx` (reload cards, show success message)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Admin can click button and generate images for all word cards without images.

---

## Phase 4: User Story 2 - Progress Tracking and Cancellation (Priority: P2)

**Goal**: Admin users can see real-time progress of the bulk image generation process and cancel it if needed.

**Independent Test**: Start bulk generation, observe progress updates, and cancel the operation. Can be tested independently by adding progress UI to existing bulk generation.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T019 [P] [US2] Write component test for progress indicator display in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T020 [P] [US2] Write component test for progress updates during generation in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T021 [P] [US2] Write component test for cancel button functionality in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [x] T022 [P] [US2] Write integration test for cancellation flow in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)

### Implementation for User Story 2

- [x] T023 [US2] Add progress state management in `src/components/BulkImageGenerator.jsx` (useState for progress object: current, total, completed, failed, currentCard)
- [x] T024 [US2] Implement progress callback in `src/components/BulkImageGenerator.jsx` (updates progress state from processBulkImageGeneration)
- [x] T025 [US2] Add progress bar UI component in `src/components/BulkImageGenerator.jsx` (shows percentage, completed/total counts, current card being processed)
- [x] T026 [US2] Add cancel button in `src/components/BulkImageGenerator.jsx` (creates AbortController, calls abort on click)
- [x] T027 [US2] Implement cancellation handling in `src/components/BulkImageGenerator.jsx` (stops processing loop, updates state, shows cancellation message)
- [x] T028 [US2] Add progress bar CSS styles in `src/components/BulkImageGenerator.css` (progress bar, progress fill animation, progress info layout)
- [x] T029 [US2] Update processBulkImageGeneration to support AbortSignal in `src/utils/bulkImageService.js` (checks signal.aborted, breaks loop on cancellation)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Admin can see progress and cancel operations.

---

## Phase 5: User Story 3 - Filtered Bulk Generation (Priority: P3)

**Goal**: Admin users can generate images only for word cards matching specific filters (category, instruction level, etc.).

**Independent Test**: Apply filters, click bulk generate, and verify only filtered cards are processed. Can be tested independently by passing filters to existing bulk generation.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T030 [P] [US3] Write unit test for filterCardsNeedingImages with type filter in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T031 [P] [US3] Write unit test for filterCardsNeedingImages with category filter in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T032 [P] [US3] Write unit test for filterCardsNeedingImages with instruction level filter in `src/utils/__tests__/bulkImageService.test.js` (should fail initially)
- [x] T033 [P] [US3] Write component test for filtered bulk generation in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)

### Implementation for User Story 3

- [x] T034 [US3] Update filterCardsNeedingImages to support type filter in `src/utils/bulkImageService.js` (filters by card.type if filterType provided)
- [x] T035 [US3] Update filterCardsNeedingImages to support category filter in `src/utils/bulkImageService.js` (filters by card.categories if filterCategory provided)
- [x] T036 [US3] Update filterCardsNeedingImages to support instruction level filter in `src/utils/bulkImageService.js` (filters by card.instructionLevelId if filterInstructionLevel provided)
- [x] T037 [US3] Add filters prop to BulkImageGenerator component in `src/components/BulkImageGenerator.jsx` (accepts filters object: type, category, instructionLevel)
- [x] T038 [US3] Pass filters to filterCardsNeedingImages in `src/components/BulkImageGenerator.jsx` (use filters prop when calling filter function)
- [x] T039 [US3] Update AdminPage to pass active filters to BulkImageGenerator in `src/components/AdminPage.jsx` (pass filterType, filterCategory, filterInstructionLevel as filters prop)

**Checkpoint**: All user stories should now be independently functional. Admin can generate images for filtered subsets of cards.

---

## Phase 6: Completion Summary & Error Reporting

**Purpose**: Add completion summary modal showing success/failure counts (FR-008)

- [ ] T040 [P] Write component test for completion summary modal in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [ ] T041 [P] Write component test for failure list display in `src/components/__tests__/BulkImageGenerator.test.jsx` (should fail initially)
- [ ] T042 Implement completion summary state in `src/components/BulkImageGenerator.jsx` (useState for result object with completed, failed, failures array)
- [ ] T043 Implement completion callback handler in `src/components/BulkImageGenerator.jsx` (receives completion data, sets result state, shows modal)
- [ ] T044 Add completion summary modal component in `src/components/BulkImageGenerator.jsx` (displays success count, failure count, failures list, close button)
- [ ] T045 Add completion summary modal CSS styles in `src/components/BulkImageGenerator.css` (modal overlay, modal content, result summary, failures list styles)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T046 [P] Add accessibility attributes to progress bar in `src/components/BulkImageGenerator.jsx` (aria-label, aria-valuenow, aria-valuemin, aria-valuemax)
- [ ] T047 [P] Add keyboard navigation support for cancel button in `src/components/BulkImageGenerator.jsx` (keyboard event handlers)
- [ ] T048 [P] Add error boundary around BulkImageGenerator in `src/components/AdminPage.jsx` (wrap component in ErrorBoundary)
- [ ] T049 [P] Add loading state management in `src/components/BulkImageGenerator.jsx` (disable button while running, show loading indicator)
- [ ] T050 [P] Add E2E test for bulk image generation workflow in `tests/e2e/admin-bulk-image-generation.spec.js` (full admin workflow: login, navigate, bulk generate, verify results)
- [ ] T051 [P] Add performance test for bulk generation in `src/utils/__tests__/bulkImageService.test.js` (verify processing rate meets 10 cards/minute requirement)
- [ ] T052 [P] Update documentation in `specs/004-bulk-image-generation/quickstart.md` (verify all steps match implementation)
- [ ] T053 Add error logging for bulk generation failures in `src/utils/bulkImageService.js` (console.error for failures with context)
- [ ] T054 Add rate limiting handling in `src/utils/bulkImageService.js` (detect rate limit errors, implement retry with backoff)
- [ ] T055 Code cleanup and refactoring (review all files, ensure consistent patterns, remove unused code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - Or in parallel if team capacity allows (stories are independent)
- **Completion Summary (Phase 6)**: Depends on User Story 1 (core generation) and User Story 2 (progress tracking)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (adds progress UI to existing bulk generation)
- **User Story 3 (P3)**: Depends on User Story 1 (adds filtering to existing bulk generation)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Test-First principle)
- Service utilities before components
- Component structure before UI details
- Core functionality before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All setup tasks marked [P] can run in parallel
- **Phase 2**: All test tasks marked [P] can run in parallel (write all tests first)
- **Phase 3 (US1)**: All test tasks marked [P] can run in parallel
- **Phase 4 (US2)**: All test tasks marked [P] can run in parallel
- **Phase 5 (US3)**: All test tasks marked [P] can run in parallel
- **Phase 6**: Test tasks marked [P] can run in parallel
- **Phase 7**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write component test for BulkImageGenerator rendering in src/components/__tests__/BulkImageGenerator.test.jsx"
Task: "Write component test for bulk generate button click in src/components/__tests__/BulkImageGenerator.test.jsx"
Task: "Write component test for empty state message in src/components/__tests__/BulkImageGenerator.test.jsx"
Task: "Write integration test for bulk generation flow in src/components/__tests__/BulkImageGenerator.test.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (tests first, then implementation)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Completion Summary → Test independently → Deploy/Demo
6. Add Polish → Final release
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (can start after US1 structure exists)
   - Developer C: User Story 3 (can start after US1 structure exists)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Test-First principle)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow strict format: `- [ ] TXXX [P?] [Story?] Description with file path`

