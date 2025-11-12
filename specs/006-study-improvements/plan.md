# Implementation Plan: Study Experience Improvements

**Branch**: `006-study-improvements` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-study-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enhance the flashcard study experience with three independent improvements: (1) Move image display from front to back of all cards with English text for consistent visual reinforcement, (2) Add multi-select Instruction Level filtering to study card selection menu alongside existing Type and Category filters, (3) Add admin-only Edit button during study sessions for on-the-fly card corrections. Each improvement delivers standalone value and maintains existing functionality.

## Technical Context

**Language/Version**: JavaScript ES6+, Node.js 20.x (Vercel runtime)  
**Primary Dependencies**: React 19.2.0, React-DOM 19.2.0, Vite 7.1.12, Supabase JS Client 2.49.2  
**Storage**: Supabase (PostgreSQL) - instruction_levels table exists, cards.instruction_level_id FK exists  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1, jest-axe 10.0.0  
**Target Platform**: Web (modern browsers: Chrome/Firefox/Safari), responsive design  
**Project Type**: Single-page web application (SPA) with backend API functions  
**Performance Goals**: Card flip transition < 200ms, filter updates < 1s, image load < 500ms  
**Constraints**: Maintain WCAG 2.1 AA accessibility, preserve existing study session state, no breaking changes to card data model  
**Scale/Scope**: ~200 LOC changes across 5-7 components, 30+ new tests, support for 10+ instruction levels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - Will follow TDD: write failing tests for each user story before implementation
  - Test plan includes unit tests (Flashcard, CardFilter, EditCardForm), integration tests (study flow with filters), E2E tests (full user journeys)
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - P1: Image display (core learning experience)
  - P2: Multi-filter selection (improves study targeting)
  - P3: Admin edit (admin convenience)
  - Each story delivers standalone value and can be tested independently
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - Each user story is independent and can be deployed separately
  - Image display change enhances existing functionality (no breaking changes)
  - Filter addition is additive (backward compatible)
  - Admin edit is opt-in feature (no impact on regular users)
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - Unit: Flashcard image logic, CardFilter multi-select, EditCardForm modal
  - Component: Flashcard rendering with images, CardFilter with instruction levels, study page with edit button
  - Integration: Complete study flow with all filters, admin edit workflow
  - E2E: User studies cards with images, user filters by instruction level, admin edits during study
  - Performance: Image load time, filter update time, flip transition time (defined in spec SC-004, SC-006)
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - Feature spec complete with 3 prioritized user stories, 23 functional requirements, 8 success criteria
  - Implementation plan (this document) includes technical context and design decisions
  - Will create research.md, data-model.md, contracts/, quickstart.md
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - Image load errors: graceful degradation (no broken icons), onError handlers
  - Filter errors: fallback to "All instruction levels" if data unavailable
  - Edit errors: inline validation messages, prevent save with invalid data
  - Network errors: retry logic for Supabase queries (existing retry utility)
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - Edit button: keyboard accessible, proper ARIA labels, focus management
  - Filter controls: keyboard navigable, screen reader announcements, sufficient contrast
  - Image alt text: descriptive alt attributes based on card content
  - Tests: jest-axe integration for component accessibility validation
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - Feature changes isolated to specific components:
    - Flashcard.jsx (image display logic)
    - CardFilter.jsx (add instruction level section)
    - App.jsx (add edit button, load instruction levels)
  - Shared services used (instructionLevelsService.js already exists)
  - No modifications to core data schemas or shared utilities
  - Clear component boundaries maintained (Flashcard, CardFilter, EditCardForm remain independent)
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - React 19.2.0 and React-DOM 19.2.0 (versions match, both 19.x)
  - React Testing Library 16.3.0 (compatible with React 19)
  - Vitest 4.0.6, Vite 7.1.12 (latest stable)
  - Supabase JS Client 2.49.2 (latest stable)
  - Playwright 1.56.1 (latest stable)
  - No new dependencies required for this feature
  - All versions verified via `npm list` (actual installed versions documented)

## Project Structure

### Documentation (this feature)

```text
specs/006-study-improvements/
├── spec.md              # Feature specification (created by /speckit.specify)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (created below)
├── data-model.md        # Phase 1 output (created below)
├── quickstart.md        # Phase 1 output (created below)
├── contracts/           # Phase 1 output (created below)
│   ├── image-display.md # Image display behavior contract
│   └── filter-api.md    # Filter selection state contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (created by /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Flashcard.jsx           # MODIFY: Move image display to back, add conditional logic
│   ├── Flashcard.css           # MODIFY: Style image on back instead of front
│   ├── CardFilter.jsx          # MODIFY: Add Instruction Level filter section with multi-select
│   ├── CardFilter.css          # MODIFY: Style instruction level filter section
│   ├── EditCardForm.jsx        # REUSE: Existing form (no changes needed)
│   ├── __tests__/
│   │   ├── Flashcard.test.jsx  # MODIFY: Add image display tests (front→back)
│   │   └── CardFilter.test.jsx # MODIFY: Add instruction level filter tests
├── App.jsx                     # MODIFY: Add edit button (admin only), load instruction levels, pass to CardFilter
├── App.css                     # MODIFY: Style edit button during study
├── services/
│   └── instructionLevelsService.js # REUSE: Already exists (loadInstructionLevels)
├── utils/
│   └── tibetanUtils.js         # REUSE: containsTibetan helper (already exists)
└── data/
    └── cardSchema.js           # REUSE: getTibetanText, getEnglishText helpers

tests/
├── integration/
│   └── __tests__/
│       └── studyFlowWithFilters.test.jsx # NEW: Integration test for multi-filter study flow
└── e2e/
    ├── study-images.spec.js    # NEW: E2E test for image display on back
    ├── study-filters.spec.js   # NEW: E2E test for instruction level filtering
    └── admin-edit-study.spec.js # NEW: E2E test for admin edit during study

api/
└── (no changes needed - all filtering is client-side)
```

**Structure Decision**: Single-page web application structure. All study experience improvements are frontend-only changes using existing backend services. The Flashcard, CardFilter, and App components will be modified to add new functionality while maintaining clear boundaries. No new API endpoints needed (instruction levels already loaded via existing service).

## Complexity Tracking

> **No Constitution violations - this section intentionally left empty.**

All Constitution checks passed. Feature maintains modular design, follows test-first development, preserves accessibility standards, and uses existing dependencies without introducing complexity.
