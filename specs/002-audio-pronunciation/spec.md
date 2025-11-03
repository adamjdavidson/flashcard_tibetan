# Feature Specification: Audio Pronunciation for Cards

**Feature Branch**: `002-audio-pronunciation`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "I want to add a major new functionality.I want to be able to record an audio file on each card in which someone can record the proper pronunciation of a word.This is so someone using the tool can press a button to hear how the word is spoken in Tibetan.So we'll need, on the admin side, the ability to record into a simple file. And then for the users in the study section, we'll need the ability to press an easy button to hear the words spoken.We'll also need to store the audio files in the Supabase.I love your help thinking this through and making it great.The user story is pretty simple: Someone is studying and wants to make sure they know precisely how to pronounce a word."

## Clarifications

### Session 2025-11-02

- Q: What audio format should be used for storage to ensure iOS and Android compatibility? → A: MP3 (Recommended Primary Choice) - Universal compatibility across all browsers and devices. Record in browser's native format via MediaRecorder API, convert client-side to MP3 at 64-96 kbps for voice, store single MP3 file per card. MP3 ensures universal playback compatibility and efficient file sizes for very short recordings (1-2 seconds).
- Q: What should be the maximum recording duration limit? → A: 30 seconds - Good balance for pronunciation of words/phrases, prevents excessively large files while allowing flexibility for longer pronunciations.
- Q: How should the recording workflow handle re-recording capability? → A: Preview with "Use", "Re-record", or "Cancel" - After stopping a recording, show preview with options to "Use This Recording", "Re-record", or "Cancel". Admin can re-record before saving, discard, or save. Reduces wasted uploads by allowing re-recording without saving if unsatisfied.
- Q: What playback behavior should students have when playing pronunciation audio? → A: Play button only (auto-stop on completion) - Click plays, stops when audio ends, no manual stop control. Simplest interface for short pronunciation clips (1-2 seconds).
- Q: Where should the audio button appear on flashcards? → A: Configurable per card (default: only where Tibetan writing exists) - Audio button appears on sides that contain Tibetan text (front and/or back). Audio button does NOT appear on sides with only English text to prevent giving away answers. Default behavior: audio visible only where Tibetan script is present.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Records Pronunciation Audio for Cards (Priority: P1)

As an admin, I want to record pronunciation audio for each card so that students can hear how Tibetan words are properly spoken.

**Why this priority**: Recording functionality is the foundation of this feature. Without the ability to record audio, students cannot hear pronunciations. This is essential for language learning.

**Independent Test**: Can be fully tested by navigating to Admin → Card Management → Edit Card, clicking "Record Audio", recording pronunciation, and verifying the audio file is saved and associated with the card. Admins can immediately see value through the ability to add pronunciation to cards.

**Acceptance Scenarios**:

1. **Given** an admin is editing or creating a card, **When** they click "Record Audio" or "Record Pronunciation", **Then** a recording interface appears with start/stop controls
2. **Given** an admin opens the recording interface, **When** they click "Start Recording", **Then** the system begins capturing audio from their microphone and shows recording status (duration, waveform, or indicator)
3. **Given** an admin is recording audio, **When** they click "Stop Recording", **Then** the system stops capturing audio and displays a preview/playback of the recorded audio with options: "Use This Recording", "Re-record", or "Cancel"
4. **Given** an admin has recorded audio and previewed it, **When** they click "Use This Recording", **Then** the audio file is uploaded to storage and associated with the card
5. **Given** an admin has recorded audio and previewed it, **When** they click "Re-record", **Then** the current recording is discarded and a new recording can be started without saving the previous attempt
6. **Given** an admin has recorded audio and previewed it, **When** they click "Cancel", **Then** the recording is discarded and the admin returns to the card form without audio associated
7. **Given** an admin saves a card with recorded audio, **When** they view the card later, **Then** the card displays a play button indicating audio is available
8. **Given** an admin has previously recorded audio for a card, **When** they edit the card and record new audio, **Then** the old audio file is replaced with the new recording

---

### User Story 2 - Student Plays Pronunciation Audio While Studying (Priority: P1)

As a student studying Tibetan flashcards, I want to hear the pronunciation of words so that I can learn correct pronunciation and verify my understanding.

**Why this priority**: Playing audio is the core value proposition for students. Without the ability to play audio, students cannot benefit from recorded pronunciations, making this feature incomplete.

**Independent Test**: Can be fully tested by navigating to Study Mode, viewing a card that has audio, clicking the play button, and verifying the pronunciation audio plays correctly. Students can immediately see value through hearing pronunciations.

**Acceptance Scenarios**:

1. **Given** a student is studying flashcards, **When** they view a card that has pronunciation audio, **Then** a prominent play button or audio icon is displayed on the side(s) of the card that contain Tibetan text (front and/or back, but not on sides with only English text to prevent giving away answers)
2. **Given** a student sees a card with audio available, **When** they click the play button, **Then** the pronunciation audio plays through their speakers/headphones
3. **Given** a student is playing audio, **When** the audio finishes, **Then** the play button returns to its initial state, ready to play again (audio auto-stops on completion, no manual stop control needed)
4. **Given** a student views a card without pronunciation audio, **When** they look for an audio button, **Then** no audio button is displayed (or a disabled/grayed-out indicator shows audio is not available)
5. **Given** a student views a card side that contains only English text (no Tibetan script), **When** they look for an audio button, **Then** no audio button is displayed on that side (even if the card has audio available on the Tibetan text side)
6. **Given** a student clicks play on audio, **When** the audio file is loading, **Then** a loading indicator is shown (spinner, progress bar, or "Loading..." message)
7. **Given** audio fails to load or play, **When** an error occurs, **Then** an error message is displayed to the student (e.g., "Unable to play audio" or "Audio not available")

---

### User Story 3 - Admin Manages Audio Recordings (Priority: P2)

As an admin, I want to manage audio recordings (edit, replace, delete) so that I can update pronunciations, fix mistakes, and remove outdated audio.

**Why this priority**: Audio management enables maintenance and quality control. While not critical for MVP, it's essential for long-term usability when admins need to update or fix recordings.

**Independent Test**: Can be fully tested by navigating to Admin → Card Management → Edit Card with existing audio, accessing audio management options (delete, replace), and verifying changes are saved correctly. Admins can see value through the ability to maintain audio quality.

**Acceptance Scenarios**:

1. **Given** an admin is editing a card with existing audio, **When** they view the audio section, **Then** they see the current audio with options to play, replace, or delete
2. **Given** an admin is viewing existing audio for a card, **When** they click "Replace Audio" or "Record New", **Then** the recording interface opens, allowing them to record new audio
3. **Given** an admin is viewing existing audio for a card, **When** they click "Delete Audio", **Then** a confirmation dialog appears, and upon confirmation, the audio file is removed from storage and the card no longer has audio
4. **Given** an admin replaces existing audio with new recording, **When** they save the card, **Then** the old audio file is deleted and the new audio is associated with the card

---

### Edge Cases

- What happens when microphone access is denied by the browser?
- How does the system handle network failures during audio upload?
- What happens if audio file upload exceeds storage limits?
- How does the system handle corrupted or invalid audio files?
- What happens if a student's device/browser doesn't support audio playback?
- How does the system handle concurrent audio recordings (multiple tabs)?
- What happens if audio storage quota is exceeded?
- How does the system handle recordings that exceed the 30-second maximum duration limit?
- What happens if audio file deletion fails but card update succeeds?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to record audio pronunciation for cards using the device microphone
- **FR-002**: System MUST provide visual feedback during recording (duration, recording indicator, or waveform visualization)
- **FR-003**: System MUST allow admins to preview recorded audio before saving and provide options to "Use This Recording", "Re-record", or "Cancel"
- **FR-004**: System MUST upload audio files to cloud storage (Supabase Storage) and associate them with cards
- **FR-005**: System MUST store audio file reference (URL or path) in the card data
- **FR-006**: System MUST display a play button on card sides that contain Tibetan text when audio is available (default behavior: audio button appears only where Tibetan script is present, not on sides with only English text to prevent giving away answers)
- **FR-007**: System MUST allow students to play audio pronunciations while studying cards using a simple play button (audio auto-stops on completion, no manual stop control needed)
- **FR-008**: System MUST provide loading indicators when audio is loading
- **FR-009**: System MUST handle audio playback errors gracefully (display error message to user)
- **FR-010**: System MUST allow admins to replace existing audio recordings with new recordings
- **FR-011**: System MUST allow admins to delete audio recordings from cards
- **FR-012**: System MUST delete old audio files from storage when replaced or when card audio is deleted
- **FR-013**: System MUST prevent unauthorized users from recording audio (only admins can record)
- **FR-014**: System MUST convert recorded audio to MP3 format (64-96 kbps for voice) and store as MP3 files for universal browser and device compatibility
- **FR-015**: System MUST handle microphone permission requests and display appropriate error messages if denied
- **FR-016**: System MUST enforce a maximum recording duration of 30 seconds to prevent excessively large audio files

### Key Entities *(include if feature involves data)*

- **Audio Recording**: Represents a pronunciation audio file associated with a card. Contains reference to storage location (URL or path), file format, duration (optional), and metadata (created date, file size).
- **Card (updated)**: Now includes optional audio reference (URL or file path) pointing to pronunciation audio file stored in cloud storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can record pronunciation audio in under 3 clicks (navigate to record → start recording → stop → save)
- **SC-002**: Audio recordings complete upload and association with cards within 5 seconds for recordings under 30 seconds
- **SC-003**: Students can play pronunciation audio with a single click
- **SC-004**: Audio playback starts within 2 seconds of clicking play button (for audio files under 1MB)
- **SC-005**: 95% of audio recordings successfully upload and associate with cards (error rate <5%)
- **SC-006**: Audio playback works on 95% of modern browsers (Chrome, Firefox, Safari, Edge)
- **SC-007**: System handles audio file management (replace/delete) without leaving orphaned files (100% cleanup of replaced/deleted audio)

## Assumptions

- Admins have access to a microphone for recording
- Students have speakers or headphones for playback
- Modern browsers support Web Audio API or MediaRecorder API for recording
- Modern browsers support HTML5 audio playback
- Supabase Storage can handle audio file uploads similar to image uploads
- Audio files are typically very short (1-2 seconds for single word pronunciation)
- Maximum recording duration is 30 seconds (enforced by system to prevent excessively large files)
- Audio files will be stored in a dedicated storage bucket or folder (e.g., `card-audio/` or `pronunciations/`)
- Audio recordings are converted from browser's native MediaRecorder format to MP3 (64-96 kbps for voice) client-side before storage
- MP3 format ensures universal playback compatibility across iOS, Android, and all browsers
- Recording interface should be simple and intuitive (start/stop controls, preview playback)
- Audio recording requires microphone permissions (browser will prompt user)
- Existing image upload functionality can serve as a pattern for audio file uploads
- Audio button placement is contextual: appears on card sides with Tibetan text (front and/or back), does not appear on sides with only English text to prevent giving away answers during study
