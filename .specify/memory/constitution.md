<!--
  Sync Impact Report:
  
  Version Change: 1.1.1 → 1.2.0 (Dependency Management principle added)
  
  Principles Added:
  - IX. Dependency Management & Version Consistency: New principle for version verification and library consistency

  Principles Modified:
  - None
  
  Sections Modified:
  - Development Standards: Added Dependency Management verification to Compliance Review
  
  Templates Status:
  ✅ plan-template.md - Constitution check section updated with modular design validation
  ✅ spec-template.md - User story format aligns with user-centric design
  ✅ tasks-template.md - Testing tasks align with test-first principle
  ⚠️ No command templates in .specify/templates/commands/ - will be validated if added
  
  Follow-up TODOs:
  - Update plan-template.md to include Dependency Management in Constitution Check section
  - Update README.md to reference constitution if desired
-->

# Tibetan Flashcard App Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**MUST**: Write tests before implementation for all new features and bug fixes. The Red-Green-Refactor cycle is strictly enforced:
1. Write test that fails (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while maintaining green tests (REFACTOR)

Tests MUST cover:
- Unit tests for all utility functions and services
- Component tests for all React components
- Integration tests for user flows
- E2E tests for critical user journeys
- Performance tests for operations with defined benchmarks
- Accessibility tests for UI components

**Rationale**: Test-first development ensures code correctness, prevents regressions, enables confident refactoring, and serves as living documentation. The project maintains 170+ tests demonstrating this commitment.

### II. User-Centric Design

**MUST**: All features prioritize user experience and deliver measurable value. Features MUST be:
- Independently testable by end users (each user story delivers standalone value)
- Accessible to users with disabilities (WCAG 2.1 AA minimum)
- Themeable and customizable (user preferences honored)
- Performant (operations complete within defined benchmarks)

User stories MUST be prioritized (P1, P2, P3) with P1 stories delivering MVP value independently.

**Rationale**: The app serves Tibetan language learners. Every feature must enhance their learning experience. User-owned cards, customizable themes, and comprehensive filtering demonstrate this commitment.

### III. Progressive Enhancement

**MUST**: Build features incrementally, starting with minimal viable functionality and enhancing iteratively. Each increment MUST:
- Work independently (can be tested and demonstrated standalone)
- Not break existing functionality
- Follow the established architecture patterns

**Rationale**: The app evolved from localStorage → Supabase → user-owned cards → theming. Each phase built on the previous without breaking changes, demonstrating incremental value delivery.

### IV. Comprehensive Testing

**MUST**: Maintain comprehensive test coverage across all layers:
- Unit tests: utilities, services, schema validation
- Component tests: React components with React Testing Library
- Integration tests: user flows and component interactions
- E2E tests: complete user journeys with Playwright
- Performance tests: critical operations benchmarked
- Accessibility tests: WCAG compliance verified

Tests MUST run automatically in CI/CD. Test failures block deployment.

**Rationale**: The project has 170+ tests covering unit, component, integration, E2E, performance, and accessibility. This prevents regressions and enables confident changes.

### V. Documentation Excellence

**MUST**: Document all significant decisions, features, and processes:
- Feature specifications with user stories and acceptance criteria
- Technical design documents for architectural decisions
- Testing guides and test coverage reports
- Setup and deployment instructions
- API documentation for serverless functions

Documentation MUST be kept current with code changes.

**Date Verification Requirement**: When creating or updating documents with dates (specs, plans, checklists), the current date MUST be obtained from the system using `date +"%Y-%m-%d"` or equivalent. Dates MUST NOT be hardcoded or inferred. This ensures accuracy and prevents date-related errors.

**Rationale**: Documents like THEME_DESIGN.md, TESTING.md, VERCEL_ENV_SETUP.md demonstrate commitment to knowledge preservation and onboarding. Accurate dates are essential for tracking feature development timelines and project history.

### VI. Error Handling & Observability

**MUST**: Implement robust error handling and observability:
- All API endpoints return detailed error messages (code, details, hint)
- Client-side errors are gracefully handled with user-friendly messages
- Serverless functions log errors with full context (stack traces, error objects)
- Environment variable validation with clear error messages

**Rationale**: Recent improvements to admin API error handling show the value of detailed error messages for debugging production issues. Proper error handling reduces support burden and improves user experience.

### VII. Accessibility Standards

**MUST**: Ensure all UI components meet WCAG 2.1 AA standards:
- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader compatibility
- Accessible form controls and buttons

Accessibility tests MUST be included in the test suite and run in CI/CD.

**Rationale**: The project includes accessibility tests demonstrating commitment to inclusive design. Language learning apps must be accessible to all learners.

### VIII. Modular Design & Feature Independence

**MUST**: New features MUST maintain clear boundaries and independence:
- Feature code SHOULD be grouped logically (components used together stay together)
- New features MUST NOT modify core/shared code except through defined extension points
- Module dependencies MUST be explicit and documented (no hidden coupling)
- Features MUST be testable in isolation (mock dependencies, no circular dependencies)
- Shared utilities MUST be truly shared (used by 3+ modules) or moved into feature scope
- Public APIs (components, services, functions) MUST be explicitly exported
- Private implementation details MUST NOT be imported by other modules

**Interface Boundaries**:
- Cross-feature communication MUST use defined protocols (props, context, events, API contracts)
- Feature-specific components MAY compose within their feature (e.g., AdminPage uses AdminCardReview)
- Shared infrastructure (services, utils, data) MUST remain independent of feature logic

**Gradual Compliance**: Existing code meets this through composition and clear services/utils separation. New specifications and features MUST follow this principle. Existing features SHOULD be refactored to comply when modified.

**Rationale**: Modular design prevents feature entanglement, enables independent development and testing, simplifies refactoring, and allows features to be added/removed without breaking existing functionality. Features like theming (ThemeContext, ThemeSelector), admin (AdminPage, AdminCardReview), and card management (CardManager, AddCardForm) demonstrate clear boundaries and composition patterns.

### IX. Dependency Management & Version Consistency

**MUST**: Maintain up-to-date dependencies and ensure version consistency across the project:

1. **Version Verification**: Before implementation planning and during code reviews, verify:
   - Current installed versions match `package.json` constraints
   - Installed versions are latest compatible versions (within semantic versioning constraints)
   - No security vulnerabilities in dependencies
   - Version consistency across related packages (e.g., React and React-DOM must match major versions)

2. **Library Consistency**: Ensure consistent use of libraries and tools:
   - Single source of truth for each dependency type (e.g., one testing framework, one build tool)
   - Avoid duplicate or conflicting libraries for the same purpose
   - Document rationale for library choices in specifications and plans
   - Verify consistency when adding new dependencies or updating existing ones

**Verification Process**:
- Check `package.json` against installed versions (`npm list`) before creating implementation plans
- Update specifications and plans to reflect actual installed versions, not just `package.json` constraints
- Verify version compatibility when upgrading dependencies (e.g., React 19.x requires compatible React Testing Library)
- Document version choices and any constraints in technical context sections

**When to Update**:
- Before starting new feature development (verify current state)
- During dependency updates (ensure compatibility)
- When adding new dependencies (verify no conflicts)
- During code reviews (verify versions match documentation)

**Rationale**: Version consistency prevents runtime errors, security vulnerabilities, and compatibility issues. Checking installed versions during planning (as demonstrated in the Advanced Card Management plan) ensures specifications accurately reflect the current codebase state. Consistent library usage reduces bundle size, prevents conflicts, and maintains codebase clarity.

## Development Standards

### Technology Stack

**Frontend**: React 19, Vite, CSS Variables for theming
**Backend**: Vercel Serverless Functions (Node.js)
**Database**: Supabase (PostgreSQL with Row Level Security)
**Testing**: Vitest, React Testing Library, Playwright
**Deployment**: Vercel with automated CI/CD

### Code Quality

- ESLint configured for code consistency
- React Hooks dependencies validated
- Node.js globals properly declared in API files
- Environment variables validated at runtime

### Architecture Patterns

- **Separation of Concerns**: Clear structure (components, services, utils, data)
- **Modular Design**: Features maintain clear boundaries with explicit interfaces (see Principle VIII)
- **CSS Variables**: Theme system uses CSS custom properties for dynamic styling
- **React Context**: Theme and authentication state managed via Context API
- **Row Level Security**: Database-level security policies for multi-user support

**Module Organization Guidelines**:
- Feature components compose within their feature (composition encouraged within boundaries)
- Shared code lives in services/, utils/, data/ and must remain feature-agnostic
- New features SHOULD consider feature-specific directories when complexity warrants (`src/components/[Feature]/`)

### Performance Benchmarks

Operations MUST complete within defined limits:
- Card operations: < 100ms for 1000 cards
- Filtering: < 50ms for 1000 cards
- Statistics: < 50ms for 500 cards
- SM-2 calculations: < 1ms per calculation

## Governance

**Amendment Procedure**: Constitution changes require:
1. Documentation of rationale
2. Update of affected templates (plan, spec, tasks)
3. Version increment per semantic versioning
4. Compliance verification across codebase

**Versioning Policy**: Semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principles added or existing principles materially expanded
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Compliance Review**: All PRs and code reviews MUST verify:
- Tests written before implementation (Test-First principle)
- User stories independently testable (User-Centric principle)
- Documentation updated for new features (Documentation Excellence)
- Error handling implemented (Error Handling & Observability)
- Accessibility requirements met (Accessibility Standards)
- Module boundaries respected (Modular Design principle) - new features don't entangle with existing code
- Dependency versions verified and consistent (Dependency Management principle) - installed versions match documentation, no conflicts

**Complexity Justification**: Any feature violating principles (e.g., skipping tests, breaking accessibility) MUST document:
- Why the violation is necessary
- Alternative approaches considered and rejected
- Migration plan to restore compliance

The constitution supersedes all other development practices. When practices conflict, the constitution takes precedence.

**Version**: 1.2.0 | **Ratified**: 2024-12-02 | **Last Amended**: 2025-11-01
