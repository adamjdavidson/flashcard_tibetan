# Implementation Plan: Advanced Admin Card Management

**Branch**: `001-advanced-card-management` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-advanced-card-management/spec.md`

## Summary

Advanced card management system for admins providing table/spreadsheet view with full CRUD operations, enhanced classification with instruction levels and manageable categories, and seamless view switching. This feature enables efficient bulk card management, rich categorization, and curriculum organization by student proficiency levels.

**Technical Approach**: Build on existing React/AdminPage infrastructure. Add new database tables for categories and instruction levels. Create new admin card management component with table view capability using React table patterns or lightweight library. Extend existing CardManager with view toggle and enhanced filtering.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.2.0, Node.js 20.x  
**Primary Dependencies**: 
- Frontend: React 19.2.0, Vite 7.1.12, @supabase/supabase-js ^2.49.2
- Table Component: Consider TanStack Table (React Table) v8 or custom React table implementation
- Testing: Vitest 4.0.6, React Testing Library 16.3.0, Playwright 1.56.1
- Existing: Theme system, authentication hooks, card services

**Storage**: Supabase (PostgreSQL) with Row Level Security  
**Testing**: Vitest for unit/component tests, Playwright for E2E, React Testing Library for component tests  
**Target Platform**: Web (browser-based), deployed on Vercel  
**Project Type**: Single web application (React SPA)  
**Performance Goals**: 
- Table view: Load 1000+ cards in <2 seconds
- Sorting: <1 second per column sort
- Filtering: <50ms for multi-criteria filters
- CRUD operations: <500ms feedback time

**Constraints**: 
- Must maintain backward compatibility with existing card structure
- Must not break existing CardManager functionality for regular users
- Must work with existing RLS policies
- Must support Tibetan Unicode text in category names
- Must be accessible (WCAG 2.1 AA)

**Scale/Scope**: 
- Target: 1000+ cards in table view
- Multiple admins managing cards concurrently
- 10-50 categories, 3-10 instruction levels expected
- Feature scope: Admin-only card management UI enhancement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Required Validations**:
- ✅ **Test-First**: Tests written before implementation? Test failures verified?
  - **Status**: Yes - Component tests for table view, unit tests for classification services, integration tests for CRUD flows, E2E tests for admin workflows. All tests will follow Red-Green-Refactor.
- ✅ **User-Centric**: User stories prioritized (P1, P2, P3)? Each story independently testable?
  - **Status**: Yes - 5 user stories with clear priorities (P1: Table view + CRUD, P2: Classification, P3: View switching). Each story is independently testable and deployable.
- ✅ **Progressive Enhancement**: Feature incrementally deliverable? Won't break existing functionality?
  - **Status**: Yes - Can be delivered incrementally: Phase 1 (Table view), Phase 2 (CRUD in table), Phase 3 (Classification), Phase 4 (View switching). Extends existing AdminPage without breaking CardManager for regular users.
- ✅ **Comprehensive Testing**: Unit, component, integration, E2E tests planned? Performance benchmarks defined?
  - **Status**: Yes - Unit tests for category/instruction level services, component tests for AdminCardTable, integration tests for CRUD flows, E2E tests for admin card management. Performance benchmarks defined (SC-001 to SC-010).
- ✅ **Documentation**: Feature spec with user stories? Design decisions documented?
  - **Status**: Yes - Specification complete with user stories, requirements, success criteria. This plan documents design decisions.
- ✅ **Error Handling**: Error messages defined? Error handling strategy documented?
  - **Status**: Yes - FR-024 requires clear feedback for all CRUD operations. Error handling follows existing admin API patterns (detailed Supabase errors).
- ✅ **Accessibility**: WCAG 2.1 AA compliance verified? Accessibility tests included?
  - **Status**: Yes - Table view must support keyboard navigation, screen readers, ARIA labels. Accessibility tests included in test plan (Constitution Principle VII).
- ✅ **Modular Design**: Feature boundaries defined? Will not modify shared code unnecessarily? Dependencies explicit?
  - **Status**: Yes - New components (AdminCardTable, AdminCategoryManager, AdminInstructionLevelManager) will be admin-specific. Extends AdminPage without modifying CardManager for regular users. Uses existing services/utils with clear interfaces.

**Constitution Compliance**: ✅ All validations pass. Feature respects all 8 principles.

---

## Phase 0: Research & Decisions

**Status**: ✅ Complete - See [research.md](./research.md)

**Key Decisions**:
- **Table Component**: Custom React table (lightweight, aligns with codebase patterns)
- **Category Storage**: Separate `categories` table with many-to-many relationship via `card_categories` junction table
- **Instruction Levels**: Separate `instruction_levels` table for flexibility and admin management
- **Performance Strategy**: Client-side pagination (50-100 rows per page) with React `useMemo` for sorting/filtering
- **View State**: Parent component (`AdminCardManagement`) manages shared filter state
- **CRUD UI**: Modal for Add/Edit (complex forms), inline delete with confirmation
- **Category Deletion**: Hard delete with warning showing card count
- **Default Levels**: Seed with Beginner, Intermediate, Advanced (order: 1, 2, 3)

**Resolved Clarifications**: All technical decisions made with informed choices. No NEEDS CLARIFICATION items remaining.

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions:

- **Enhanced Card Entity**: Added `instruction_level_id` (UUID, FK), many-to-many with categories via junction table
- **Category Entity**: New table with name, description, created_by metadata
- **Instruction Level Entity**: New table with name, order, description, is_default
- **Card Categories Junction**: Many-to-many relationship table
- **Table View Configuration** (optional): User preferences for column visibility, sorting, pagination

**Database Migration**:
- New tables: `categories`, `instruction_levels`, `card_categories`
- Modified: `cards` table (add `instruction_level_id` column)
- Default instruction levels seeded: Beginner (order: 1), Intermediate (order: 2), Advanced (order: 3)
- RLS policies: Admin-only management for categories and instruction levels

### API Contracts

See [contracts/](./contracts/) for complete API specifications:

1. **Categories API** ([categories-api.md](./contracts/categories-api.md)): CRUD operations via Supabase client
   - List, Create, Update, Delete categories
   - Get cards in category
   - Error handling with Supabase error codes

2. **Instruction Levels API** ([instruction-levels-api.md](./contracts/instruction-levels-api.md)): CRUD operations via Supabase client
   - List, Create, Update, Delete instruction levels
   - Get cards by instruction level
   - Error handling with Supabase error codes

3. **Cards Table API** ([cards-table-api.md](./contracts/cards-table-api.md)): Enhanced card operations with classification
   - Load cards with instruction level and categories (JOIN queries)
   - Create/Update cards with classification data
   - Delete cards (cascade deletes category associations)
   - Filtering by type + category + instruction level
   - Client-side sorting operations

### Quickstart Guide

See [quickstart.md](./quickstart.md) for user guide:
- Getting started instructions
- Core features explanation
- Workflows and best practices
- Troubleshooting guide

### Agent Context Update

✅ Updated Cursor IDE context file (`.cursor/rules/specify-rules.mdc`) with:
- Language: JavaScript (ES6+), React 19.1.1, Node.js 20.x
- Database: Supabase (PostgreSQL) with Row Level Security
- Project type: Single web application (React SPA)

**Post-Design Constitution Check**: ✅ All principles still respected after Phase 1 design. No violations introduced. Feature maintains clear boundaries, respects existing code, and follows all architectural patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-advanced-card-management/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── categories-api.md
│   ├── instruction-levels-api.md
│   └── cards-table-api.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AdminCardTable.jsx        # NEW: Table/spreadsheet view component
│   ├── AdminCardTable.css        # NEW: Table styling
│   ├── AdminCategoryManager.jsx  # NEW: Category CRUD management
│   ├── AdminCategoryManager.css  # NEW: Category manager styling
│   ├── AdminInstructionLevelManager.jsx  # NEW: Instruction level management
│   ├── AdminInstructionLevelManager.css  # NEW: Instruction level styling
│   ├── AdminCardManagement.jsx   # NEW: Main admin card management component (replaces/extends CardManager for admin)
│   ├── AdminCardManagement.css   # NEW: Main component styling
│   ├── AdminPage.jsx             # MODIFIED: Add "Advanced Card Management" tab
│   └── [existing components remain unchanged]
├── services/
│   ├── categoriesService.js      # NEW: Category CRUD operations
│   ├── instructionLevelsService.js  # NEW: Instruction level CRUD operations
│   ├── cardsService.js          # MODIFIED: Add classification fields to card operations
│   └── [existing services remain unchanged]
├── contexts/
│   └── [existing contexts unchanged]
├── data/
│   ├── cardSchema.js             # MODIFIED: Add instruction_level and categories validation
│   └── [existing data files unchanged]
├── utils/
│   └── [existing utils unchanged]
└── [existing structure unchanged]

api/
└── [existing serverless functions unchanged - no new API needed, using Supabase directly]

supabase/
└── migrations/
    └── 20251101000001_advanced_card_classification.sql  # NEW: Categories and instruction levels tables
```

**Structure Decision**: Single web application structure. New admin-specific components maintain clear boundaries (Principle VIII). Feature does not modify shared CardManager for regular users. Database migrations are additive (new tables, new columns) maintaining backward compatibility.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All principles respected.
