# Implementation Plan: New Checkbox for Bulk Add Cards

**Branch**: `005-new-checkbox-bulk-add` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-new-checkbox-bulk-add/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a "New" checkbox to the bulk add cards form that allows admins to control whether bulk-created cards are flagged with the "new" category for review. The checkbox is checked by default and automatically checked when words will be auto-translated. This enables a review workflow where Tibetan reviewers can filter cards by the "new" category, review translations, and remove the category after approval.

**Technical Approach**: Add a checkbox state to BulkAddForm component, pass the checkbox value to bulkAddService, and conditionally assign the "new" category based on checkbox state. The reviewer workflow uses existing card editing functionality to remove the "new" category.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.2.0, Node.js (Vercel serverless runtime)  
**Primary Dependencies**: React 19.2.0, React DOM 19.2.0, @supabase/supabase-js 2.78.0, Vite 7.1.12  
**Storage**: Supabase (PostgreSQL with Row Level Security)  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1  
**Target Platform**: Web (browser-based React application)  
**Project Type**: Single-page web application  
**Performance Goals**: Form interactions respond within 100ms, checkbox state updates instantly  
**Constraints**: Must work with existing bulk add feature, no breaking changes to existing API  
**Scale/Scope**: Admin feature used by small team (< 10 admins), handles 2-100 words per operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - Tests will be written for BulkAddForm checkbox state, bulkAddService conditional category assignment, and reviewer workflow
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - All 3 user stories are P1 priority, each independently testable (checkbox display, auto-checking, reviewer unchecking)
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - Feature adds UI control without changing existing behavior (default checked maintains current behavior)
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - Component tests for checkbox UI, unit tests for service logic, integration tests for form submission flow
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - Complete spec with 3 user stories, acceptance scenarios, and functional requirements
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - Uses existing error handling patterns from bulk add feature
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - Checkbox will have proper label, keyboard navigation, ARIA attributes
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - Modifies only BulkAddForm component and bulkAddService, uses existing category management
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - React 19.2.0, React DOM 19.2.0, @supabase/supabase-js 2.78.0, Vite 7.1.12 verified

All validations pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-new-checkbox-bulk-add/
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
│   ├── BulkAddForm.jsx          # MODIFY: Add "New" checkbox state and UI
│   ├── BulkAddForm.css          # MODIFY: Add checkbox styling
│   ├── BulkAddForm.test.jsx     # MODIFY: Add checkbox tests
│   ├── EditCardForm.jsx         # EXISTING: Used by reviewers to remove "new" category
│   └── AdminCardModal.jsx       # EXISTING: Modal wrapper (no changes needed)
├── services/
│   ├── bulkAddService.js        # MODIFY: Conditionally assign "new" category based on checkbox
│   └── bulkAddService.test.js   # MODIFY: Add tests for conditional category assignment
└── data/
    └── cardSchema.js            # EXISTING: Card data structure (no changes needed)
```

**Structure Decision**: Single-page web application structure. Feature modifies existing BulkAddForm component and bulkAddService. No new components needed - checkbox is added to existing form. Reviewer workflow uses existing EditCardForm component.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution checks pass.
