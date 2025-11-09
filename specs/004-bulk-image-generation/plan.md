# Implementation Plan: Bulk Image Generation

**Branch**: `004-bulk-image-generation` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-bulk-image-generation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add bulk image generation functionality to the admin card management panel. Admin users can click a button to automatically identify all word cards without images and generate images for them in bulk, with real-time progress tracking and cancellation support. The feature integrates with existing image generation service and respects active filters.

## Technical Context

**Language/Version**: JavaScript (ES2020+), Node.js 18+ (Vercel serverless functions)  
**Primary Dependencies**: React 19.1.1, React DOM 19.1.1, @supabase/supabase-js 2.49.2, Vite 7.1.7  
**Storage**: Supabase (PostgreSQL) with Row Level Security  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1  
**Target Platform**: Web (Vercel serverless functions + React SPA)  
**Project Type**: Web application (frontend React + backend serverless API)  
**Performance Goals**: Process 10+ cards per minute, progress updates within 2 seconds, completion summary within 5 seconds  
**Constraints**: Must handle sequential API calls (rate limiting), UI must remain responsive during bulk operations, must gracefully handle individual failures without stopping entire process  
**Scale/Scope**: Admin-only feature, expected to process 10-1000 cards per bulk operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - **Status**: Will write tests first following Red-Green-Refactor cycle
  - **Plan**: Unit tests for bulk generation logic, component tests for UI, integration tests for full flow, E2E tests for admin workflow
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - **Status**: ✅ Spec has 3 prioritized user stories (P1: core bulk generation, P2: progress/cancellation, P3: filtered generation)
  - **Verification**: Each story can be tested independently and delivers standalone value
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - **Status**: ✅ Feature adds new button/functionality without modifying existing code paths
  - **Plan**: Can deliver P1 first (basic bulk generation), then add P2 (progress/cancellation), then P3 (filtering)
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - **Status**: ✅ Success criteria define performance benchmarks (10 cards/min, 2s progress updates, 5s completion summary)
  - **Plan**: Unit tests for bulk generation service, component tests for progress UI, integration tests for API flow, E2E tests for admin workflow
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - **Status**: ✅ Complete spec with user stories, acceptance criteria, and success criteria
  - **Plan**: Will document design decisions in research.md and implementation details in code comments
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - **Status**: ✅ Spec defines error handling requirements (FR-009: continue on individual failures, FR-008: completion summary with failures)
  - **Plan**: Will implement graceful error handling with user-friendly messages and failure reporting
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - **Status**: ✅ Will ensure progress indicators and buttons meet WCAG 2.1 AA standards
  - **Plan**: Will include accessibility tests using jest-axe and manual keyboard navigation testing
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - **Status**: ✅ Feature adds new component/service without modifying existing image generation or card management code
  - **Plan**: New `BulkImageGenerator` component, new `bulkImageService` utility, integrates via AdminPage props
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - **Status**: ✅ Verified React 19.1.1, React DOM 19.1.1, Vitest 4.0.6, React Testing Library 16.3.0
  - **Verification**: All versions match package.json and are compatible

**All validations pass** - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-bulk-image-generation/
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
│   ├── AdminPage.jsx                    # Add bulk generate button here
│   ├── BulkImageGenerator.jsx           # NEW: Bulk generation UI component
│   └── BulkImageProgress.jsx            # NEW: Progress indicator component
├── services/
│   └── cardsService.js                  # Existing: Query/update cards
├── utils/
│   ├── images.js                        # Existing: generateAIImage function
│   └── bulkImageService.js              # NEW: Bulk generation logic
└── __tests__/
    ├── components/
    │   └── BulkImageGenerator.test.jsx  # NEW: Component tests
    └── utils/
        └── bulkImageService.test.js     # NEW: Unit tests

api/
└── (no new API endpoints needed - uses existing /api/generate-image)

tests/
└── e2e/
    └── admin-bulk-image-generation.spec.js  # NEW: E2E tests
```

**Structure Decision**: Web application structure. Feature adds new components and utilities without modifying existing shared code. Bulk generation runs client-side using existing image generation API, with progress tracking managed in React state.

## Complexity Tracking

> **No violations** - All constitution checks pass. Feature maintains clear boundaries and follows established patterns.

## Phase 0: Research & Design Decisions ✅

See [research.md](./research.md) for detailed research findings.

**Key Research Areas**:
1. ✅ Progress tracking patterns for long-running operations in React
2. ✅ Cancellation patterns for async operations
3. ✅ Rate limiting strategies for sequential API calls
4. ✅ Error handling patterns for bulk operations
5. ✅ UI/UX patterns for progress indicators

**All research complete** - No NEEDS CLARIFICATION markers remain.

## Phase 1: Data Model & Contracts ✅

See [data-model.md](./data-model.md), [contracts/](./contracts/), and [quickstart.md](./quickstart.md) for detailed design artifacts.

**Key Design Artifacts**:
- ✅ Data model for BulkGenerationJob state and Failure entities
- ✅ API contracts (reusing existing /api/generate-image, no new endpoints needed)
- ✅ Quickstart guide with step-by-step implementation instructions

**Constitution Check Post-Design**:
- ✅ All validations still pass
- ✅ Design maintains clear feature boundaries
- ✅ No shared code modifications required
- ✅ Dependencies explicit and documented
