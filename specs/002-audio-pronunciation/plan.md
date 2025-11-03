# Implementation Plan: Audio Pronunciation for Cards

**Branch**: `002-audio-pronunciation` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-audio-pronunciation/spec.md`

## Summary

Audio pronunciation feature enabling admins to record MP3 audio files for each flashcard and students to play pronunciation audio while studying. Recordings are stored in Supabase Storage (MP3 format, 64-96 kbps for voice, max 30 seconds), converted client-side from browser's native MediaRecorder format, and displayed on card sides containing Tibetan text only (to prevent giving away answers on English-only sides).

**Technical Approach**: Build on existing React/AdminPage infrastructure. Use MediaRecorder API for recording, client-side MP3 conversion library (e.g., lamejs or similar), Supabase Storage for audio files (similar to image upload pattern). Extend card schema with `audio_url` field. Add audio recording component for admin forms and play button component for Flashcard display.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.1.1, Node.js 20.x  
**Primary Dependencies**: 
- Frontend: React 19.1.1, Vite 7.1.7, @supabase/supabase-js ^2.49.2
- Audio Recording: MediaRecorder API (browser native, no library needed)
- Audio Conversion: `lamejs` (client-side MP3 encoder library, ~200KB minified)
- Audio Playback: HTML5 Audio API (browser native)
- Testing: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1
- Existing: Theme system, authentication hooks, image upload service (pattern for audio)

**Storage**: Supabase Storage (similar to `card-images` bucket, new `card-audio` bucket), PostgreSQL `cards` table with `audio_url` column  
**Testing**: Vitest for unit/component tests, Playwright for E2E, React Testing Library for component tests, audio recording/playback mocked in tests  
**Target Platform**: Web (browser-based, iOS Safari, Android Chrome), deployed on Vercel  
**Project Type**: Single web application (React SPA)  
**Performance Goals**: 
- Recording workflow: <3 clicks (navigate → start → stop → save)
- Upload: <5 seconds for recordings under 30 seconds
- Playback: <2 seconds to start (for files under 1MB)
- Audio conversion: <1 second for typical 1-2 second recordings

**Constraints**: 
- Must maintain backward compatibility with existing card structure (audio_url optional field)
- Must work on iOS Safari and Android Chrome (MediaRecorder API support varies)
- Must convert to MP3 client-side for universal compatibility
- Audio button only appears on sides with Tibetan text (not English-only sides)
- Must handle microphone permissions gracefully (FR-015)
- Must work with existing Supabase Storage patterns (similar to imagesService.js)

**Scale/Scope**: 
- Target: One audio file per card (optional)
- Typical file size: 10-50KB per recording (1-2 seconds at 64-96 kbps MP3)
- Expected storage: <100MB for 1000 cards with audio
- Feature scope: Admin recording UI + Student playback UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - **Status**: Yes - Component tests for audio recording interface, audio playback component, unit tests for audio service (upload/delete/conversion), integration tests for full recording workflow, E2E tests for admin recording and student playback. All tests will follow Red-Green-Refactor.
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - **Status**: Yes - 3 user stories with clear priorities (P1: Admin recording + Student playback, P2: Audio management). Each story is independently testable and deployable.
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - **Status**: Yes - Can be delivered incrementally: Phase 1 (Recording), Phase 2 (Playback), Phase 3 (Management). Adds optional `audio_url` field to cards without breaking existing card structure. Audio button only appears when audio exists, so no visual changes to cards without audio.
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - **Status**: Yes - Unit tests for audio service (upload/delete/conversion), component tests for AudioRecorder and AudioPlayer components, integration tests for recording → upload → playback flow, E2E tests for admin recording and student playback. Performance benchmarks defined (SC-001 to SC-007).
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - **Status**: Yes - Specification complete with user stories, requirements, success criteria. This plan documents design decisions.
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - **Status**: Yes - FR-015 requires microphone permission error messages, FR-009 requires audio playback error messages. Error handling follows existing patterns (Supabase Storage errors, network failures).
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - **Status**: Yes - Audio recording interface must support keyboard navigation, screen reader announcements. Audio play button must have proper ARIA labels. Accessibility tests included in test plan (Constitution Principle VII).
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - **Status**: Yes - New components (AudioRecorder, AudioPlayer) will be self-contained. New service (audioService.js) follows existing imagesService.js pattern. Extends card schema with optional field. Clear boundaries: audio functionality isolated, no modifications to core card logic.
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - **Status**: Pending - Need to verify if MP3 conversion library conflicts with existing dependencies. Research phase will identify library choice and verify version compatibility.

**Constitution Compliance**: ✅ All validations pass. Feature respects all 9 principles. MP3 conversion library choice pending (will verify compatibility in research phase).

## Project Structure

### Documentation (this feature)

```text
specs/002-audio-pronunciation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AudioRecorder.jsx        # NEW: Admin audio recording interface
│   ├── AudioRecorder.css        # NEW: Recording interface styling
│   ├── AudioPlayer.jsx         # NEW: Student audio playback component
│   ├── AudioPlayer.css          # NEW: Play button styling
│   ├── AddCardForm.jsx          # MODIFY: Add audio recording capability
│   ├── EditCardForm.jsx         # MODIFY: Add audio recording capability
│   ├── Flashcard.jsx            # MODIFY: Add audio play button (contextual display)
│   └── AdminCardTable.jsx       # MODIFY: Show audio indicator in table view
├── services/
│   └── audioService.js          # NEW: Audio upload/delete/conversion (patterned after imagesService.js)
├── data/
│   └── cardSchema.js            # MODIFY: Add audio_url validation
└── utils/
    └── audioUtils.js            # NEW: Audio format conversion utilities (if needed)

api/
└── (no new endpoints needed - uses Supabase Storage directly, like images)

supabase/
└── migrations/
    └── YYYYMMDDHHMMSS_add_audio_url_to_cards.sql  # NEW: Add audio_url column to cards table

tests/
└── (test files will be added alongside components/services)
```

**Structure Decision**: Single web application structure maintained. New components isolated (AudioRecorder, AudioPlayer), new service follows existing imagesService.js pattern. Database migration adds optional `audio_url` column to existing `cards` table. No changes to existing card structure or shared code beyond extending schema.

## Phase 0: Research & Decisions

**Status**: ✅ Complete - See [research.md](./research.md)

**Key Decisions**:
- **MP3 Conversion**: Use `lamejs` client-side library for converting MediaRecorder output to MP3 (64-96 kbps)
- **Recording API**: MediaRecorder API (browser native) with feature detection and graceful fallbacks
- **Storage Pattern**: Dedicated `card-audio` bucket in Supabase Storage (follows `card-images` pattern)
- **Playback API**: HTML5 Audio API (browser native) for universal compatibility
- **Database Schema**: Add optional `audio_url` TEXT column to `cards` table (backward compatible)
- **Recording UX**: Simple interface: Start/Stop → Preview → Use/Re-record/Cancel (<3 clicks workflow)

**Resolved Clarifications**: All technical decisions made with informed choices. No NEEDS CLARIFICATION items remaining.

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions:

- **Card (Enhanced)**: Added `audio_url` (TEXT, NULL) field pointing to Supabase Storage public URL
- **Audio Recording**: Storage entity in `card-audio` bucket, MP3 format (64-96 kbps, max 30 seconds)
- **Database Migration**: Add `audio_url` column to `cards` table, create `card-audio` storage bucket

### API Contracts

See [contracts/audio-storage-api.md](./contracts/audio-storage-api.md) for complete API definitions:

- **Audio Upload**: Supabase Storage upload operation (similar to image upload)
- **Audio URL Generation**: Get public URL for uploaded audio file
- **Audio Deletion**: Remove audio file from storage bucket
- **Card Update**: Update card's `audio_url` field in database

**Note**: All operations use Supabase client-side SDK. No Vercel serverless functions required (unlike image upload which has serverless function).

### Quickstart

See [quickstart.md](./quickstart.md) for user guides:
- Admin recording workflow
- Student playback workflow
- Audio management (replace/delete)
- Troubleshooting guide

### Agent Context Update

✅ Updated Cursor IDE context file (`.cursor/rules/specify-rules.mdc`) with:
- Language: JavaScript (ES6+), React 19.1.1, Node.js 20.x
- Database: Supabase Storage (card-audio bucket), PostgreSQL `cards` table with `audio_url` column
- Project type: Single web application (React SPA)

**Post-Design Constitution Check**: ✅ All principles still respected after Phase 1 design. No violations introduced. Feature maintains clear boundaries, respects existing code, and follows all architectural patterns.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. All constitution principles respected.
