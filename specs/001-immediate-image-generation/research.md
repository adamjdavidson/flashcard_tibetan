# Research: Immediate Image Generation in Add Card Form

**Feature**: 001-immediate-image-generation  
**Date**: 2025-11-09  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Image Generation Implementation Pattern

**Task**: Research existing image generation implementation in EditCardForm to understand patterns for reuse

**Findings**:
- EditCardForm uses `generateAIImage()`, `searchImage()`, and `uploadImage()` from `src/utils/images.js`
- State management: `imageUrl`, `imagePreview`, `generating`, `searching`, `uploading` boolean states
- Image preview uses `createImagePreview()` and `revokeImagePreview()` utilities
- Supabase upload handled via `uploadImage as uploadToSupabase` from `src/services/imagesService.js`
- Button text changes to "Generating...", "Searching...", "Uploading..." but no visual spinner currently

**Decision**: Reuse exact same pattern from EditCardForm in AddCardForm

**Rationale**: Consistency with existing codebase, proven implementation, no need to reinvent

**Alternatives Considered**:
- Creating new image utilities: Rejected - would duplicate code and create maintenance burden
- Extracting shared image form component: Rejected - premature abstraction, AddCardForm and EditCardForm have different contexts

---

### 2. Loading Indicator Implementation

**Task**: Research best practices for loading indicators in React forms, especially for async operations

**Findings**:
- AudioRecorder component uses `.loading-spinner` CSS class with spinning animation
- Pattern: CSS spinner with `@keyframes spin` animation
- Accessibility: Spinners should have `aria-label` or `aria-busy` attributes
- Best practice: Show spinner immediately (< 100ms) to prevent perceived lag
- Button state: Disable buttons during loading to prevent duplicate requests

**Decision**: Create reusable loading spinner component or CSS class following AudioRecorder pattern

**Rationale**: Consistent with existing codebase patterns, accessible, performant

**Alternatives Considered**:
- Third-party spinner library: Rejected - adds dependency, existing pattern works well
- Progress bars: Rejected - image generation APIs don't provide progress updates
- Skeleton loaders: Rejected - not appropriate for button operations

---

### 3. Admin Prop Passing Pattern

**Task**: Research how isAdmin prop flows through component hierarchy

**Findings**:
- AdminPage uses `useAuth()` hook: `const { user, isAdmin: isAdminUser } = useAuth()`
- AdminPage passes `isAdmin={isAdminUser}` to AdminCardModal
- AdminCardModal currently only passes `isAdmin` to EditCardForm, not AddCardForm
- AddCardForm doesn't currently receive isAdmin prop

**Decision**: Pass `isAdmin` prop from AdminCardModal to AddCardForm, matching EditCardForm pattern

**Rationale**: Consistent with existing pattern, minimal changes required

**Alternatives Considered**:
- Using useAuth hook directly in AddCardForm: Rejected - breaks component encapsulation, AdminCardModal already has the prop
- Checking admin status via card data: Rejected - AddCardForm doesn't have card data, admin status is user-level

---

### 4. Image State Management in Form Submission

**Task**: Research how image URL is included in card creation

**Findings**:
- EditCardForm includes `imageUrl` in card data when saving
- `createCard()` function accepts `imageUrl` as optional field
- Card schema supports `imageUrl: string | null`
- Form submission includes imageUrl in card object passed to `onAdd()` callback

**Decision**: Include `imageUrl` state in AddCardForm and pass it to `createCard()` in handleSubmit

**Rationale**: Matches existing pattern, schema already supports it

**Alternatives Considered**:
- Separate image save step: Rejected - violates requirement to save image with card in single workflow
- Storing image separately: Rejected - adds complexity, card schema already supports imageUrl

---

### 5. Loading Indicator Visibility Requirements

**Task**: Research accessibility and UX best practices for loading indicators

**Findings**:
- WCAG 2.1 AA: Loading states must be announced to screen readers via `aria-live` or `aria-busy`
- Visual indicators should be at least 24x24px for visibility
- Color contrast: Loading indicators must meet 3:1 contrast ratio minimum
- Animation: Should respect `prefers-reduced-motion` media query
- Timing: Indicators should appear within 0.5 seconds (per spec SC-006)

**Decision**: 
- Use CSS spinner with sufficient size (40x40px like AudioRecorder)
- Add `aria-label="Generating image..."` to spinner container
- Add `aria-busy="true"` to button during loading
- Respect `prefers-reduced-motion` in CSS animation

**Rationale**: Meets accessibility standards, provides clear feedback, consistent with existing patterns

**Alternatives Considered**:
- Text-only loading state: Rejected - doesn't meet visibility requirements (FR-019)
- Progress percentage: Rejected - APIs don't provide progress updates

---

## Summary of Decisions

1. **Reuse EditCardForm image generation pattern** - Consistency and proven implementation
2. **Create loading spinner following AudioRecorder pattern** - Accessible and performant
3. **Pass isAdmin prop from AdminCardModal to AddCardForm** - Minimal changes, consistent pattern
4. **Include imageUrl in card creation** - Schema already supports it
5. **Implement accessible loading indicators** - WCAG 2.1 AA compliance

## Unresolved Questions

None - all research tasks completed, no NEEDS CLARIFICATION markers remain.

