# Tasks: Immediate Image Generation in Add Card Form

**Input**: Design documents from `/specs/001-immediate-image-generation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are included per constitution requirement (Test-First principle). Tests must be written and fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and dependencies

- [x] T001 Verify feature branch `001-immediate-image-generation` is checked out ✅
- [x] T002 [P] Verify React 19.2.0 and React DOM 19.2.0 are installed ✅ (installed: react@19.2.0, react-dom@19.2.0)
- [x] T003 [P] Verify existing image utilities exist in `src/utils/images.js` ✅
- [x] T004 [P] Verify existing image service exists in `src/services/imagesService.js` ✅
- [x] T005 [P] Verify EditCardForm has image generation implementation to reference in `src/components/EditCardForm.jsx` ✅

---

## Phase 2: User Story 1 - Generate Image When Adding New Card (Priority: P1) 🎯 MVP

**Goal**: Add image generation capabilities (Generate AI Image, Search Unsplash, Upload Image) to Add Card form so admins can add images immediately when creating cards without saving and reopening.

**Independent Test**: Open Add Card form as admin user and verify all image generation buttons are visible and functional. Generate an image, verify preview displays, save card, and verify image URL is included in saved card.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Write test for image section visibility in admin mode in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T007 [P] [US1] Write test for Generate AI Image button functionality in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T008 [P] [US1] Write test for Search Unsplash button functionality in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T009 [P] [US1] Write test for Upload Image functionality in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T010 [P] [US1] Write test for image preview display in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T011 [P] [US1] Write test for Remove Image functionality in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T012 [P] [US1] Write test for image URL included in card submission in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T013 [P] [US1] Write test for admin-only button visibility in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)
- [x] T014 [P] [US1] Write test for button disabled state when no text entered in `src/components/__tests__/AddCardForm.test.jsx` ✅ (Test written, failing as expected)

### Implementation for User Story 1

- [ ] T015 [US1] Update AdminCardModal to pass isAdmin prop to AddCardForm in `src/components/AdminCardModal.jsx`
- [ ] T016 [US1] Add isAdmin prop to AddCardForm component signature in `src/components/AddCardForm.jsx`
- [ ] T017 [US1] Add image state management (imageUrl, imagePreview, generating, searching, uploading) in `src/components/AddCardForm.jsx`
- [ ] T018 [US1] Import image utilities (generateAIImage, searchImage, uploadImage, validateImageFile, createImagePreview, revokeImagePreview) in `src/components/AddCardForm.jsx`
- [ ] T019 [US1] Import uploadToSupabase service in `src/components/AddCardForm.jsx`
- [ ] T020 [US1] Implement handleGenerateAIImage handler function in `src/components/AddCardForm.jsx`
- [ ] T021 [US1] Implement handleSearchUnsplash handler function in `src/components/AddCardForm.jsx`
- [ ] T022 [US1] Implement handleImageUpload handler function in `src/components/AddCardForm.jsx`
- [ ] T023 [US1] Implement handleRemoveImage handler function in `src/components/AddCardForm.jsx`
- [ ] T024 [US1] Update handleSubmit to include imageUrl in card creation in `src/components/AddCardForm.jsx`
- [ ] T025 [US1] Update form reset to clear image state in `src/components/AddCardForm.jsx`
- [ ] T026 [US1] Add Image section JSX with Generate AI Image button (admin-only) in `src/components/AddCardForm.jsx`
- [ ] T027 [US1] Add Image section JSX with Search Unsplash button (admin-only) in `src/components/AddCardForm.jsx`
- [ ] T028 [US1] Add Image section JSX with Upload Image button (all users) in `src/components/AddCardForm.jsx`
- [ ] T029 [US1] Add Image section JSX with Remove Image button (conditional) in `src/components/AddCardForm.jsx`
- [ ] T030 [US1] Add Image section JSX with image preview display in `src/components/AddCardForm.jsx`
- [ ] T031 [US1] Add button disabled logic based on text field state in `src/components/AddCardForm.jsx`
- [ ] T032 [US1] Add image section CSS styles in `src/components/AddCardForm.css`
- [ ] T033 [US1] Add image preview CSS styles in `src/components/AddCardForm.css`
- [ ] T034 [US1] Add image actions container CSS styles in `src/components/AddCardForm.css`

**Checkpoint**: At this point, User Story 1 should be fully functional. Admin users can generate, search, or upload images in Add Card form, see previews, and save cards with images.

---

## Phase 3: User Story 2 - Visual Feedback During Image Generation (Priority: P1)

**Goal**: Add visible loading indicators (spinners/animations) during image operations to provide clear feedback that operations are in progress.

**Independent Test**: Click any image operation button and verify visible loading indicator appears immediately and persists until operation completes. Verify loading indicator disappears on success or failure.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T035 [P] [US2] Write test for loading spinner visibility on Generate AI Image click in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T036 [P] [US2] Write test for loading spinner visibility on Search Unsplash click in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T037 [P] [US2] Write test for loading spinner visibility on Upload Image in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T038 [P] [US2] Write test for loading spinner persistence during operation in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T039 [P] [US2] Write test for loading spinner removal on success in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T040 [P] [US2] Write test for loading spinner removal on failure in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T041 [P] [US2] Write test for button disabled state during loading in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T042 [P] [US2] Write test for aria-busy attribute during loading in `src/components/__tests__/AddCardForm.test.jsx`
- [ ] T043 [P] [US2] Write test for aria-label on loading spinner in `src/components/__tests__/AddCardForm.test.jsx`

### Implementation for User Story 2

- [ ] T044 [US2] Add loading spinner JSX element to Generate AI Image button in `src/components/AddCardForm.jsx`
- [ ] T045 [US2] Add loading spinner JSX element to Search Unsplash button in `src/components/AddCardForm.jsx`
- [ ] T046 [US2] Add loading spinner JSX element to Upload Image button in `src/components/AddCardForm.jsx`
- [ ] T047 [US2] Add aria-busy attribute to buttons during loading states in `src/components/AddCardForm.jsx`
- [ ] T048 [US2] Add aria-label to loading spinner elements in `src/components/AddCardForm.jsx`
- [ ] T049 [US2] Add loading spinner CSS class and styles in `src/components/AddCardForm.css`
- [ ] T050 [US2] Add loading spinner animation keyframes in `src/components/AddCardForm.css`
- [ ] T051 [US2] Add prefers-reduced-motion media query for spinner in `src/components/AddCardForm.css`
- [ ] T052 [US2] Add button disabled state styles during loading in `src/components/AddCardForm.css`
- [ ] T053 [US2] Ensure loading spinner appears immediately (< 0.5s) on button click in `src/components/AddCardForm.jsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Image operations show visible loading indicators immediately and persist until completion.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, accessibility verification, and final polish

- [ ] T054 [P] Write integration test for complete admin card creation with image flow in `src/integration/__tests__/adminCardCreation.test.jsx`
- [ ] T055 [P] Write E2E test for image generation in Add Card form in `src/integration/e2e/adminWorkflows.spec.js`
- [ ] T056 [P] Write accessibility test for loading indicators in `src/components/__tests__/Accessibility.test.jsx`
- [ ] T057 [P] Verify error handling displays user-friendly messages in `src/components/AddCardForm.jsx`
- [ ] T058 [P] Verify blob URL cleanup on form cancel in `src/components/AddCardForm.jsx`
- [ ] T059 [P] Verify concurrent operation prevention (only one operation at a time) in `src/components/AddCardForm.jsx`
- [ ] T060 [P] Verify image validation (file type, size) before upload in `src/components/AddCardForm.jsx`
- [ ] T061 [P] Run quickstart.md validation checklist
- [ ] T062 [P] Update component documentation comments if needed in `src/components/AddCardForm.jsx`
- [ ] T063 [P] Verify all tests pass (component, integration, E2E) in test suite

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - Can start after Phase 1
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion - Loading indicators enhance existing image operations
- **Polish (Phase 4)**: Depends on User Stories 1 and 2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 - Loading indicators enhance the image operations added in US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation (T006-T014 for US1, T035-T043 for US2)
- State management before handlers
- Handlers before JSX
- JSX before CSS
- Core implementation before integration

### Parallel Opportunities

- **Phase 1**: All setup tasks (T002-T005) can run in parallel
- **Phase 2 Tests**: All test tasks (T006-T014) can run in parallel
- **Phase 2 Implementation**: T015-T018 can run in parallel (different concerns), then sequential handlers (T020-T023), then sequential JSX updates (T026-T031), then CSS (T032-T034)
- **Phase 3 Tests**: All test tasks (T035-T043) can run in parallel
- **Phase 3 Implementation**: T044-T046 can run in parallel (different buttons), then sequential (T047-T053)
- **Phase 4**: All polish tasks (T054-T063) can run in parallel

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together:
Task: "Write test for image section visibility in admin mode in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for Generate AI Image button functionality in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for Search Unsplash button functionality in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for Upload Image functionality in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for image preview display in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for Remove Image functionality in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for image URL included in card submission in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for admin-only button visibility in src/components/__tests__/AddCardForm.test.jsx"
Task: "Write test for button disabled state when no text entered in src/components/__tests__/AddCardForm.test.jsx"
```

---

## Parallel Example: User Story 2 Implementation

```bash
# Launch spinner additions to all buttons together:
Task: "Add loading spinner JSX element to Generate AI Image button in src/components/AddCardForm.jsx"
Task: "Add loading spinner JSX element to Search Unsplash button in src/components/AddCardForm.jsx"
Task: "Add loading spinner JSX element to Upload Image button in src/components/AddCardForm.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (all tests + implementation)
3. **STOP and VALIDATE**: Test User Story 1 independently
   - Open Add Card form as admin
   - Verify buttons visible
   - Generate/search/upload image
   - Verify preview displays
   - Save card and verify image URL included
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Environment ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced UX)
4. Add Polish → Final validation → Deploy

### Recommended Approach

Since both stories are P1 priority and User Story 2 enhances User Story 1, implement sequentially:
1. Complete User Story 1 fully (tests + implementation)
2. Complete User Story 2 fully (tests + implementation)
3. Complete Polish phase
4. Each phase adds value and can be tested independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Critical**: User Story 2 depends on User Story 1 - loading indicators enhance existing image operations
- **Test-First**: All test tasks (T006-T014, T035-T043) must be written and fail before implementation begins

