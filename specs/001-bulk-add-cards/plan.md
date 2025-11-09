# Implementation Plan: Bulk Add Cards

**Branch**: `001-bulk-add-cards` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bulk-add-cards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable admins to bulk add cards by pasting a list of English words (2-100 words), automatically translating them to Tibetan, generating images, and flagging them with a "new" category for review. The system will check for duplicates, apply shared metadata (card type, categories, instruction level), and provide a comprehensive summary report. This feature automates the most time-consuming aspects of card creation (translation and image generation) while maintaining data quality through duplicate detection and review workflows.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.2.0, Node.js (Vercel serverless runtime)  
**Primary Dependencies**: React 19.2.0, React DOM 19.2.0, @supabase/supabase-js 2.49.2, Vite 7.1.7  
**Storage**: Supabase (PostgreSQL with Row Level Security)  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1  
**Target Platform**: Web browser (modern browsers), Vercel serverless functions  
**Project Type**: Single-page web application  
**Performance Goals**: Process 100 words with translation and image generation within 10 minutes; UI remains responsive during bulk operations  
**Constraints**: Translation API rate limits (Google Translate: 500k chars/month free tier); Image generation API rate limits (Gemini: varies by plan); Network reliability for API calls; Browser memory for large word lists  
**Scale/Scope**: Admin-only feature; Handles 2-100 words per operation; Expected usage: initial card population (not frequent updates)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - **Status**: ✅ PASS - Test plan includes unit tests for bulk add service, component tests for BulkAddForm, integration tests for duplicate detection, E2E tests for complete workflow. Tests will be written before implementation per Constitution Principle I.
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - **Status**: ✅ PASS - 3 P1 stories (bulk add with shared characteristics, automatic translation/image generation, new category flagging) and 2 P2 stories (duplicate detection, validation/error handling). Each story independently testable per spec.
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - **Status**: ✅ PASS - New component (BulkAddForm) integrates into existing AdminPage without modifying core card management. Can be developed and tested independently. No breaking changes to existing card creation flows.
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - **Status**: ✅ PASS - Unit tests for bulk processing logic, component tests for BulkAddForm UI, integration tests for API interactions, E2E tests for admin workflow. Performance benchmarks: 100 words in 10 minutes, 95% translation success, 90% image generation success.
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - **Status**: ✅ PASS - Complete feature spec with 5 user stories, 25 functional requirements, 10 success criteria. Design decisions will be documented in research.md and data-model.md.
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - **Status**: ✅ PASS - Error handling requirements defined in FR-021, FR-022. Strategy: graceful degradation (cards created even if translation/image fails), comprehensive error reporting in summary. Edge cases documented in spec.
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - **Status**: ✅ PASS - Bulk add form must support keyboard navigation, screen reader announcements, proper ARIA labels. Accessibility tests included in test plan per Constitution Principle VII.
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - **Status**: ✅ PASS - New BulkAddForm component isolated. Reuses existing services (cardsService, categoriesService, translation utils, image utils) without modification. Clear boundaries: bulk add feature self-contained, integrates via AdminPage. Dependencies explicit: translation service, image generation service, card service, category service.
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - **Status**: ✅ PASS - React 19.2.0, React DOM 19.2.0, Vitest 4.0.6 verified. No new dependencies required (reuses existing translation and image generation utilities). Version consistency confirmed.

**Constitution Compliance**: ✅ All validations pass. Feature respects all 9 principles. Ready for Phase 0 research.

**Post-Phase 1 Re-evaluation**: All validations pass. Design documents (research.md, data-model.md, contracts/, quickstart.md) complete. Ready for Phase 2 task planning.

## Project Structure

### Documentation (this feature)

```text
specs/001-bulk-add-cards/
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
│   ├── BulkAddForm.jsx          # NEW: Bulk add cards interface component
│   ├── BulkAddForm.css          # NEW: Bulk add form styling
│   ├── BulkAddSummary.jsx       # NEW: Summary report display component
│   ├── BulkAddSummary.css       # NEW: Summary report styling
│   ├── AdminPage.jsx            # MODIFY: Add bulk add button and modal integration
│   └── [existing components remain unchanged]
├── services/
│   ├── bulkAddService.js        # NEW: Bulk add processing logic (duplicate detection, batch operations)
│   └── [existing services remain unchanged]
├── utils/
│   └── [existing utils remain unchanged - reuse translation.js and images.js]
└── data/
    └── [existing data schemas remain unchanged]

api/
└── [existing API routes remain unchanged - reuse /api/translate and /api/generate-image]

tests/
├── components/
│   └── __tests__/
│       ├── BulkAddForm.test.jsx      # NEW: Component tests for bulk add form
│       └── BulkAddSummary.test.jsx   # NEW: Component tests for summary report
├── services/
│   └── __tests__/
│       └── bulkAddService.test.js   # NEW: Unit tests for bulk processing logic
└── integration/
    └── e2e/
        └── adminWorkflows.spec.js   # MODIFY: Add E2E tests for bulk add workflow
```

**Structure Decision**: Single web application structure. New components (BulkAddForm, BulkAddSummary) and service (bulkAddService) are isolated. Minimal modifications to AdminPage for integration. Reuses existing translation and image generation utilities without modification. Follows established patterns from QuickTranslateForm and AddCardForm components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all Constitution checks pass.
