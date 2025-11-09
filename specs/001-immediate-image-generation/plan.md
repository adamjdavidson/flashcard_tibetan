# Implementation Plan: Immediate Image Generation in Add Card Form

**Branch**: `001-immediate-image-generation` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-immediate-image-generation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add image generation capabilities (Generate AI Image, Search Unsplash, Upload Image) to the Add Card form so admins can add images immediately when creating cards, without needing to save and reopen. Additionally, add visible loading indicators (spinners/animations) during image operations to provide clear feedback that operations are in progress.

**Technical Approach**: Reuse existing image generation logic from EditCardForm, add image state management to AddCardForm, pass isAdmin prop from AdminCardModal, and implement loading spinner component similar to AudioRecorder's loading pattern.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.2.0  
**Primary Dependencies**: React 19.2.0, React DOM 19.2.0, Vite 7.1.12  
**Storage**: Supabase Storage (for uploaded images), existing image URLs  
**Testing**: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1  
**Target Platform**: Web browser (modern browsers supporting ES6+)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Image operations complete within 10 seconds (API-dependent), loading indicators appear within 0.5 seconds  
**Constraints**: Must maintain existing form functionality, no breaking changes to card creation flow, loading indicators must be accessible (WCAG 2.1 AA)  
**Scale/Scope**: Single component enhancement (AddCardForm), affects admin users only, reuses existing image utilities and APIs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - **Status**: ✅ PASS - Tests will be written before implementation (component tests for image features, loading states, admin prop handling)
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - **Status**: ✅ PASS - Both user stories are P1 priority, independently testable
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - **Status**: ✅ PASS - Feature adds new functionality without modifying existing card creation flow
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - **Status**: ✅ PASS - Component tests for AddCardForm image features, integration tests for admin workflow, E2E tests for complete flow planned
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - **Status**: ✅ PASS - Feature spec complete with user stories, design decisions documented in research.md, quickstart.md provides implementation guide
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - **Status**: ✅ PASS - Error handling patterns documented in research.md, reuse existing EditCardForm patterns
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - **Status**: ✅ PASS - Loading indicators include ARIA labels (`aria-busy`, `aria-label`), keyboard navigation support, sufficient contrast, respects `prefers-reduced-motion`
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - **Status**: ✅ PASS - Changes limited to AddCardForm component and AdminCardModal prop passing, reuses existing image utilities without modification
- ✅ **Dependency Management**: Installed versions verified? Library consistency checked? Versions match documentation?
  - **Status**: ✅ PASS - React 19.2.0, React DOM 19.2.0, Vitest 4.0.6 verified and consistent, no new dependencies added

**Post-Phase 1 Re-evaluation**: All validations pass. Design documents (research.md, data-model.md, contracts/, quickstart.md) complete. Ready for Phase 2 task planning.

If any validation fails, document justification in Complexity Tracking section below.

## Project Structure

### Documentation (this feature)

```text
specs/001-immediate-image-generation/
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
│   ├── AddCardForm.jsx          # MODIFY: Add image generation functionality
│   ├── AddCardForm.css          # MODIFY: Add image section and loading indicator styles
│   ├── AdminCardModal.jsx       # MODIFY: Pass isAdmin prop to AddCardForm
│   └── [existing components remain unchanged]
├── utils/
│   └── images.js                # REUSE: Existing image generation utilities
└── services/
    └── imagesService.js         # REUSE: Existing Supabase image upload service

tests/
├── components/
│   └── __tests__/
│       └── AddCardForm.test.jsx # MODIFY: Add tests for image generation features
└── integration/
    └── e2e/
        └── adminWorkflows.spec.js # MODIFY: Add E2E tests for image generation in Add Card form
```

**Structure Decision**: Single web application structure. Changes are isolated to AddCardForm component and AdminCardModal prop passing. Existing image utilities and services are reused without modification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All constitution requirements are met.
