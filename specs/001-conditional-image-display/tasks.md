# Tasks: Conditional Image Display on Cards

**Input**: Design documents from `/specs/001-conditional-image-display/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED - test-first development is enforced per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure per plan.md

---

## Phase 1: User Story 1 - Always Show Image When English Text is on Front (Priority: P1) 🎯 MVP

**Goal**: Fix the bug where images don't display when English text is on the card front. Ensure that whenever English text appears on the front of a card, the image is always displayed if an imageUrl exists.

**Independent Test**: View a card with English text on the front and imageUrl. Verify the image is visible on the card front. Test with both study directions (english_to_tibetan and tibetan_to_english) to ensure images show when English is on front.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T001 [P] [US1] Write test for image display when English text is on front in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T002 [P] [US1] Write test for image display with english_to_tibetan study direction in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T003 [P] [US1] Write test for no image when imageUrl is null in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T004 [P] [US1] Write test for image error handling (broken image) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T005 [P] [US1] Write test for bidirectional card format support in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T006 [P] [US1] Write test for legacy card format support in `src/components/__tests__/Flashcard.test.jsx`

### Implementation for User Story 1

- [ ] T007 [US1] Add imageError state to Flashcard component in `src/components/Flashcard.jsx`
- [ ] T008 [US1] Add useEffect to reset imageError when card ID changes in `src/components/Flashcard.jsx`
- [ ] T009 [US1] Create shouldDisplayImage helper function for English text detection in `src/components/Flashcard.jsx`
- [ ] T010 [US1] Determine front text language using containsTibetan utility in `src/components/Flashcard.jsx`
- [ ] T011 [US1] Replace existing image display logic with conditional logic for English text in `src/components/Flashcard.jsx`
- [ ] T012 [US1] Add onError handler to img tag for graceful error handling in `src/components/Flashcard.jsx`

**Checkpoint**: At this point, User Story 1 should be fully functional - images always display when English text is on front, with proper error handling and support for both card formats.

---

## Phase 2: User Story 2 - Randomly Show Image When Tibetan Text is on Front (Priority: P1)

**Goal**: Implement random image display for Tibetan text on card front. When Tibetan text appears on the front, images should be randomly shown (approximately 50% of the time) to create variety in study sessions and prevent over-reliance on visual cues.

**Independent Test**: View multiple cards with Tibetan text on the front and imageUrl. Verify that images appear randomly - some cards show images, some don't. Verify that the same card can show/hide images on different views (not deterministic per card ID).

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US2] Write test for random image display when Tibetan text is on front in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T014 [P] [US2] Write test for randomization distribution (approximately 50%) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T015 [P] [US2] Write test for non-deterministic randomization (same card shows/hides on different views) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T016 [P] [US2] Write test for no image when Tibetan text on front but imageUrl is null in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T017 [P] [US2] Write test for Tibetan text with tibetan_to_english study direction in `src/components/__tests__/Flashcard.test.jsx`

### Implementation for User Story 2

- [ ] T018 [US2] Enhance shouldDisplayImage function to add randomization for Tibetan text in `src/components/Flashcard.jsx`
- [ ] T019 [US2] Update image display logic to use randomization for Tibetan text in `src/components/Flashcard.jsx`
- [ ] T020 [US2] Verify randomization happens on each render (not cached per card) in `src/components/Flashcard.jsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - English always shows images, Tibetan randomly shows images, with proper error handling and support for all card formats and study directions.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect both user stories and ensure production readiness

- [ ] T021 [P] Verify all tests pass for both user stories in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T022 [P] Test image display with mixed language cards (both English and Tibetan characters) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T023 [P] Test image display with number cards (legacy format) in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T024 [P] Verify backward compatibility with existing card displays in `src/components/__tests__/Flashcard.test.jsx`
- [ ] T025 Code cleanup and refactoring in `src/components/Flashcard.jsx`
- [ ] T026 Performance verification - ensure image display decision is < 1ms in `src/components/Flashcard.jsx`
- [ ] T027 Run quickstart.md validation to verify implementation matches design
- [ ] T028 Verify accessibility - ensure image alt text is properly set in `src/components/Flashcard.jsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies - can start immediately (modifies existing component)
- **User Story 2 (Phase 2)**: Can start after User Story 1 completes OR in parallel (enhances same component)
  - Recommended: Complete US1 first to establish foundation, then add US2
- **Polish (Phase 3)**: Depends on both User Stories 1 and 2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - fixes existing bug, can be delivered as MVP
- **User Story 2 (P1)**: Enhances User Story 1 - adds randomization for Tibetan text
  - Can be implemented immediately after US1
  - Both stories modify the same component but are independently testable

### Within Each User Story

- Tests (T001-T006 for US1, T013-T017 for US2) MUST be written and FAIL before implementation
- Implementation tasks (T007-T012 for US1, T018-T020 for US2) follow test-first approach
- Story complete before moving to next priority

### Parallel Opportunities

- All test tasks marked [P] can run in parallel (T001-T006, T013-T017)
- Test tasks for US1 and US2 can be written in parallel if desired
- Polish phase test tasks (T021-T024) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write test for image display when English text is on front"
Task: "Write test for image display with english_to_tibetan study direction"
Task: "Write test for no image when imageUrl is null"
Task: "Write test for image error handling (broken image)"
Task: "Write test for bidirectional card format support"
Task: "Write test for legacy card format support"

# After tests are written and failing, implement:
Task: "Add imageError state to Flashcard component"
Task: "Add useEffect to reset imageError when card ID changes"
Task: "Create shouldDisplayImage helper function for English text detection"
# ... (sequential implementation tasks)
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Write test for random image display when Tibetan text is on front"
Task: "Write test for randomization distribution (approximately 50%)"
Task: "Write test for non-deterministic randomization"
Task: "Write test for no image when Tibetan text on front but imageUrl is null"
Task: "Write test for Tibetan text with tibetan_to_english study direction"

# After tests are written and failing, implement:
Task: "Enhance shouldDisplayImage function to add randomization for Tibetan text"
Task: "Update image display logic to use randomization for Tibetan text"
Task: "Verify randomization happens on each render (not cached per card)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1
   - Write tests T001-T006 (ensure they fail)
   - Implement T007-T012
   - Verify tests pass
2. **STOP and VALIDATE**: Test User Story 1 independently
   - Verify images always show for English text
   - Test with both study directions
   - Test with both card formats
   - Verify error handling works
3. Deploy/demo if ready

### Incremental Delivery

1. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Fixes existing bug where images don't display
   - Delivers immediate value to learners
2. Add User Story 2 → Test independently → Deploy/Demo
   - Adds variety to Tibetan study sessions
   - Enhances learning experience
3. Polish phase → Final validation → Deploy/Demo
   - Ensures production readiness
   - Verifies all edge cases

### Parallel Team Strategy

With multiple developers:

1. Developer A: Write all tests for US1 (T001-T006)
2. Developer B: Write all tests for US2 (T013-T017) - can start after US1 tests are written
3. Once tests are written and failing:
   - Developer A: Implement US1 (T007-T012)
   - Developer B: Implement US2 (T018-T020) - can start after US1 implementation
4. Both developers: Polish phase together (T021-T028)

---

## Notes

- [P] tasks = different test cases, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (test-first development)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Both stories modify the same component (`Flashcard.jsx`) but are independently testable
- Randomization uses `Math.random() < 0.5` for 50% chance (per research.md)
- Language detection uses existing `containsTibetan()` utility (per research.md)
- Image error handling uses `onError` handler on `<img>` tag (per research.md)

