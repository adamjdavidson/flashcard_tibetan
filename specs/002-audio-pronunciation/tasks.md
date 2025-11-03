# Tasks: Audio Pronunciation for Cards

**Input**: Design documents from `/specs/002-audio-pronunciation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install lamejs package for client-side MP3 conversion: `npm install lamejs`
- [ ] T002 [P] Create AudioRecorder component structure: `src/components/AudioRecorder.jsx`
- [ ] T003 [P] Create AudioRecorder styles: `src/components/AudioRecorder.css`
- [ ] T004 [P] Create AudioPlayer component structure: `src/components/AudioPlayer.jsx`
- [ ] T005 [P] Create AudioPlayer styles: `src/components/AudioPlayer.css`
- [ ] T006 [P] Create audio service structure: `src/services/audioService.js`
- [ ] T007 [P] Create audio utilities structure: `src/utils/audioUtils.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create database migration to add audio_url column to cards table: `supabase/migrations/YYYYMMDDHHMMSS_add_audio_url_to_cards.sql`
- [ ] T009 Create Supabase Storage bucket `card-audio` with public read access (via Supabase dashboard or migration)
- [ ] T010 [P] Configure Supabase Storage bucket policies for `card-audio` (public read, admin-only write)
- [ ] T011 [P] Update cardSchema.js to add audioUrl field validation: `src/data/cardSchema.js`
- [ ] T012 [P] Implement audioService.js with upload, delete, and URL generation functions (patterned after imagesService.js): `src/services/audioService.js`
- [ ] T013 [P] Update cardsService.js to handle audio_url field in database transformations (snake_case ↔ camelCase): `src/services/cardsService.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Records Pronunciation Audio for Cards (Priority: P1) 🎯 MVP

**Goal**: Admins can record pronunciation audio for each card using their device microphone, preview the recording, and save it to Supabase Storage.

**Independent Test**: Navigate to Admin → Card Management → Edit Card, click "Record Audio", record pronunciation, preview recording, click "Use This Recording", verify audio file is saved and associated with the card.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement audioUtils.js with MediaRecorder setup, recording controls, and MP3 conversion functions: `src/utils/audioUtils.js`
- [ ] T015 [US1] Implement AudioRecorder component with recording interface (start/stop buttons, duration timer, preview playback): `src/components/AudioRecorder.jsx`
- [ ] T016 [US1] Style AudioRecorder component with recording indicator, preview controls, and "Use/Re-record/Cancel" buttons: `src/components/AudioRecorder.css`
- [ ] T017 [US1] Implement audio recording workflow in AudioRecorder: request microphone permission, start/stop recording, convert to MP3, handle 30-second limit: `src/components/AudioRecorder.jsx`
- [ ] T018 [US1] Implement preview playback functionality in AudioRecorder with "Use This Recording", "Re-record", and "Cancel" options: `src/components/AudioRecorder.jsx`
- [ ] T019 [US1] Integrate AudioRecorder component into AddCardForm to allow recording audio when creating new cards: `src/components/AddCardForm.jsx`
- [ ] T020 [US1] Integrate AudioRecorder component into EditCardForm to allow recording audio when editing existing cards: `src/components/EditCardForm.jsx`
- [ ] T021 [US1] Implement audio upload functionality in audioService.js: upload MP3 to Supabase Storage `card-audio` bucket and return public URL: `src/services/audioService.js`
- [ ] T022 [US1] Update AddCardForm to save audioUrl field when card is saved: `src/components/AddCardForm.jsx`
- [ ] T023 [US1] Update EditCardForm to save audioUrl field when card is saved: `src/components/EditCardForm.jsx`
- [ ] T024 [US1] Add error handling for microphone permission denial with user-friendly error messages (FR-015): `src/components/AudioRecorder.jsx`
- [ ] T025 [US1] Add error handling for audio upload failures with retry logic (similar to imagesService pattern): `src/services/audioService.js`

**Checkpoint**: At this point, User Story 1 should be fully functional - admins can record, preview, and save audio for cards.

---

## Phase 4: User Story 2 - Student Plays Pronunciation Audio While Studying (Priority: P1) 🎯 MVP

**Goal**: Students can play pronunciation audio while studying flashcards, with audio button appearing only on card sides containing Tibetan text.

**Independent Test**: Navigate to Study Mode, view a card that has audio, verify play button appears on Tibetan text side (not English-only side), click play button, verify audio plays correctly and auto-stops on completion.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement AudioPlayer component with HTML5 Audio API, play button, loading indicator, and error handling: `src/components/AudioPlayer.jsx`
- [ ] T027 [US2] Style AudioPlayer component with play button icon, loading spinner, and error message styling: `src/components/AudioPlayer.css`
- [ ] T028 [US2] Implement audio playback functionality in AudioPlayer: play audio on click, auto-stop on completion, return to play state: `src/components/AudioPlayer.jsx`
- [ ] T029 [US2] Implement loading indicator in AudioPlayer when audio is loading (FR-008): `src/components/AudioPlayer.jsx`
- [ ] T030 [US2] Implement error handling in AudioPlayer with user-friendly error messages when audio fails to load or play (FR-009): `src/components/AudioPlayer.jsx`
- [ ] T031 [US2] Create utility function to detect if card side contains Tibetan text (for contextual button display): `src/utils/cardUtils.js` (or new utility)
- [ ] T032 [US2] Integrate AudioPlayer into Flashcard component with contextual display logic: show audio button only on sides with Tibetan text (not English-only sides): `src/components/Flashcard.jsx`
- [ ] T033 [US2] Update Flashcard component to conditionally render AudioPlayer based on audioUrl existence and Tibetan text presence (FR-006): `src/components/Flashcard.jsx`
- [ ] T034 [US2] Handle edge case: card without audio should not display audio button (FR-006): `src/components/Flashcard.jsx`
- [ ] T035 [US2] Handle edge case: card with audio but English-only side should not display audio button on that side (FR-006): `src/components/Flashcard.jsx`

**Checkpoint**: At this point, User Story 2 should be fully functional - students can play audio on cards with Tibetan text.

---

## Phase 5: User Story 3 - Admin Manages Audio Recordings (Priority: P2)

**Goal**: Admins can replace existing audio recordings with new recordings and delete audio recordings from cards.

**Independent Test**: Navigate to Admin → Card Management → Edit Card with existing audio, view audio section, click "Replace Audio", record new audio, save card, verify old audio file is deleted and new audio is associated. Then delete audio, verify audio file is removed from storage and card audioUrl is NULL.

### Implementation for User Story 3

- [ ] T036 [P] [US3] Update AudioRecorder component to handle existing audio display: show current audio with "Play", "Replace", and "Delete" options: `src/components/AudioRecorder.jsx`
- [ ] T037 [US3] Implement "Replace Audio" functionality in AudioRecorder: delete old audio file from storage, record new audio, upload new file: `src/components/AudioRecorder.jsx`
- [ ] T038 [US3] Implement "Delete Audio" functionality in AudioRecorder: show confirmation dialog, delete audio file from storage, set card audioUrl to NULL: `src/components/AudioRecorder.jsx`
- [ ] T039 [US3] Update audioService.js deleteAudio function to extract filename from URL and delete from `card-audio` bucket: `src/services/audioService.js`
- [ ] T040 [US3] Implement audio file cleanup on replacement: delete old file before uploading new file (FR-012): `src/services/audioService.js`
- [ ] T041 [US3] Update EditCardForm to handle audio replacement and deletion workflows: `src/components/EditCardForm.jsx`
- [ ] T042 [US3] Add error handling for audio deletion failures (network errors, permission errors): `src/services/audioService.js`
- [ ] T043 [US3] Verify orphaned file cleanup: ensure old audio files are deleted when card audio is replaced or deleted (FR-012): `src/services/audioService.js`

**Checkpoint**: At this point, User Story 3 should be fully functional - admins can replace and delete audio recordings.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add audio indicator column/icon to AdminCardTable to show which cards have audio: `src/components/AdminCardTable.jsx`
- [ ] T045 [P] Update AdminCardTable styles to include audio indicator column: `src/components/AdminCardTable.css`
- [ ] T046 [P] Add keyboard navigation support to AudioRecorder component (accessibility - FR-006): `src/components/AudioRecorder.jsx`
- [ ] T047 [P] Add ARIA labels and screen reader announcements to AudioRecorder component (accessibility - FR-006): `src/components/AudioRecorder.jsx`
- [ ] T048 [P] Add keyboard navigation support to AudioPlayer component (accessibility - FR-007): `src/components/AudioPlayer.jsx`
- [ ] T049 [P] Add ARIA labels and screen reader announcements to AudioPlayer component (accessibility - FR-007): `src/components/AudioPlayer.jsx`
- [ ] T050 [P] Add performance monitoring for audio upload times (SC-002: <5 seconds): `src/services/audioService.js`
- [ ] T051 [P] Add performance monitoring for audio playback load times (SC-004: <2 seconds): `src/components/AudioPlayer.jsx`
- [ ] T052 [P] Verify audio conversion performance (SC-002: <1 second for 1-2 second recordings): `src/utils/audioUtils.js`
- [ ] T053 [P] Test audio recording workflow on iOS Safari and Android Chrome (browser compatibility): Manual testing
- [ ] T054 [P] Test audio playback on iOS Safari and Android Chrome (browser compatibility): Manual testing
- [ ] T055 [P] Verify audio file cleanup: run integration test to ensure no orphaned files remain after replacement/deletion (SC-007): Manual testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on audioUrl field being stored (from US1), but AudioPlayer component can be built independently
- **User Story 3 (P2)**: Can start after User Story 1 completion - Requires existing audio to manage

### Within Each User Story

- Audio utilities before AudioRecorder component (US1)
- AudioRecorder component before form integration (US1)
- AudioService upload before form save (US1)
- AudioPlayer component before Flashcard integration (US2)
- AudioRecorder existing audio display before replace/delete (US3)

### Parallel Opportunities

- **Setup (Phase 1)**: All tasks marked [P] can run in parallel (T002-T007)
- **Foundational (Phase 2)**: All tasks marked [P] can run in parallel (T010-T013)
- **User Story 1**: T014 can run in parallel with T015-T016 preparation
- **User Story 2**: T026-T027 can run in parallel (AudioPlayer component and styles)
- **User Story 3**: T036 can run independently once US1 is complete
- **Polish (Phase 6)**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks in parallel:
Task: "Update cardSchema.js to add audioUrl field validation in src/data/cardSchema.js"
Task: "Implement audioService.js with upload, delete, and URL generation functions in src/services/audioService.js"
Task: "Update cardsService.js to handle audio_url field in database transformations in src/services/cardsService.js"

# Launch component preparation in parallel:
Task: "Implement audioUtils.js with MediaRecorder setup in src/utils/audioUtils.js"
Task: "Implement AudioRecorder component with recording interface in src/components/AudioRecorder.jsx"
Task: "Style AudioRecorder component in src/components/AudioRecorder.css"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 - Admin Recording (T014-T025)
4. Complete Phase 4: User Story 2 - Student Playback (T026-T035)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP recording!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test independently → Deploy/Demo (Management complete)
5. Add Polish phase → Finalize feature

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Admin Recording)
   - **Developer B**: User Story 2 (Student Playback) - can start after audioUrl field is in database
3. Once User Story 1 is complete:
   - **Developer C**: User Story 3 (Audio Management)
4. All developers: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify all tasks follow checklist format (checkbox, ID, labels, file paths)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Audio conversion (lamejs) happens client-side before upload
- Audio button only appears on sides with Tibetan text (contextual display)
- Old audio files must be cleaned up when replaced or deleted (FR-012)

