# Implementation Plan: Conditional Image Display on Cards

**Branch**: `001-conditional-image-display` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-conditional-image-display/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement conditional image display logic in Flashcard component: always show images when English text is on the front, randomly show images when Tibetan text is on the front. This fixes the issue where images exist but don't display, and adds variety to Tibetan study sessions.

**Technical Approach**: Modify Flashcard component to detect language of front text, implement conditional rendering logic (always for English, random for Tibetan), and ensure randomization is per-display not deterministic. Use existing `containsTibetan` utility for language detection.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.2.0, Node.js (Vercel serverless runtime)  
**Primary Dependencies**: React 19.2.0, React DOM 19.2.0, @supabase/supabase-js 2.78.0, Vite 7.1.12  
**Storage**: N/A (display logic only, images already stored)  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1  
**Target Platform**: Web (browser-based React application)  
**Project Type**: Single-page web application  
**Performance Goals**: Image display decision made in < 1ms, no performance impact on card rendering  
**Constraints**: Must work with existing Flashcard component, support both bidirectional and legacy card formats, maintain backward compatibility  
**Scale/Scope**: Affects all card displays in study mode, handles any number of cards per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - Tests will be written for image display logic (always for English, random for Tibetan), language detection, and randomization behavior
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - Both user stories are P1 priority, each independently testable (English always-show, Tibetan random-show)
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - Feature fixes existing bug (images not showing) and adds new behavior (random for Tibetan), maintains backward compatibility
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - Component tests for image display logic, unit tests for language detection and randomization, integration tests for study flow
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - Complete spec with 2 user stories, acceptance scenarios, and functional requirements
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - Uses existing image error handling patterns, graceful degradation for missing/broken images
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - Maintains existing image alt text, no new accessibility concerns
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - Modifies only Flashcard component, uses existing utilities (containsTibetan, getEnglishText, getTibetanText)
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - React 19.2.0, React DOM 19.2.0, @supabase/supabase-js 2.78.0, Vite 7.1.12 verified

All validations pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-conditional-image-display/
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
│   ├── Flashcard.jsx            # MODIFY: Add conditional image display logic
│   ├── Flashcard.test.jsx      # MODIFY: Add tests for image display logic
│   └── Flashcard.css            # EXISTING: No changes needed
├── utils/
│   ├── tibetanUtils.js          # EXISTING: Use containsTibetan() for language detection
│   └── cardUtils.js             # EXISTING: May use for language detection helpers
└── data/
    └── cardSchema.js            # EXISTING: Use getEnglishText(), getTibetanText() helpers
```

**Structure Decision**: Single-page web application structure. Feature modifies existing Flashcard component only. Uses existing utilities for language detection and card field access. No new components or services needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution checks pass.
