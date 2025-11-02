# Implementation Tasks: Advanced Admin Card Management

**Branch**: `001-advanced-card-management` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

Task breakdown for Advanced Admin Card Management feature. Tasks are organized by user story priority to enable independent implementation and testing. Each user story phase is independently testable and deployable.

**Implementation Strategy**: MVP-first approach. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 - Table View) → Phase 4 (US2 - CRUD) → Phase 5 (US3 - Instruction Levels) → Phase 6 (US4 - Categories) → Phase 7 (US5 - View Switching) → Phase 8 (Polish)

## User Stories

- **US1** (P1): Admin Views Cards in Table View
- **US2** (P1): Admin Manages Cards in Table View
- **US3** (P2): Admin Manages Instruction Levels
- **US4** (P2): Admin Manages Categories
- **US5** (P3): Admin Switches Between Card and Table Views

## Dependency Graph

```
Phase 1: Setup (Database Migration)
  ↓
Phase 2: Foundational (Services)
  ↓
Phase 3: US1 - Table View
  ↓
Phase 4: US2 - CRUD in Table View
  ↓
Phase 5: US3 - Instruction Levels ──┐
  ↓                                   │
Phase 6: US4 - Categories ───────────┼──→ Phase 7: US5 - View Switching
                                       │
Phase 8: Polish ←─────────────────────┘
```

**Parallel Opportunities**:
- Phase 5 (US3) and Phase 6 (US4) can be implemented in parallel after Phase 2
- Service layer tasks within each phase are parallelizable (different files)

## Phase 1: Setup - Database Migration

**Goal**: Create database schema for categories and instruction levels, seed default instruction levels, set up RLS policies.

**Independent Test**: Migration can be verified by checking Supabase schema, querying instruction_levels table for default values, and verifying RLS policies.

- [x] T001 Create database migration file `supabase/migrations/20251101000001_advanced_card_classification.sql`
- [x] T002 Add `instruction_level_id` column to `cards` table (UUID, NULL, FK to instruction_levels)
- [x] T003 Create `categories` table with columns: id (UUID PK), name (TEXT UNIQUE), description (TEXT), created_by (UUID FK), created_at, updated_at
- [x] T004 Create `instruction_levels` table with columns: id (UUID PK), name (TEXT UNIQUE), order (INTEGER), description (TEXT), is_default (BOOLEAN), created_at
- [x] T005 Create `card_categories` junction table with columns: card_id (TEXT FK), category_id (UUID FK), PRIMARY KEY (card_id, category_id)
- [x] T006 Create indexes: idx_categories_name, idx_instruction_levels_order, idx_card_categories_card_id, idx_card_categories_category_id, idx_cards_instruction_level_id
- [x] T007 Seed default instruction levels: Beginner (order: 1, is_default: true), Intermediate (order: 2, is_default: true), Advanced (order: 3, is_default: true)
- [x] T008 Create RLS policy: "Anyone can read categories" on categories table
- [x] T009 Create RLS policy: "Admins can manage categories" (INSERT, UPDATE, DELETE) on categories table
- [x] T010 Create RLS policy: "Anyone can read instruction_levels" on instruction_levels table
- [x] T011 Create RLS policy: "Admins can manage instruction_levels" (INSERT, UPDATE, DELETE) on instruction_levels table
- [x] T012 Test migration: Verify tables exist, default levels seeded, RLS policies active

## Phase 2: Foundational - Services

**Goal**: Create service layer for categories and instruction levels. Modify cardsService to support classification data.

**Independent Test**: Services can be tested independently with unit tests. Each service's CRUD operations can be verified with mock Supabase calls.

- [x] T013 [P] Create `src/services/categoriesService.js` with loadCategories function (SELECT all categories, ordered by name)
- [x] T014 [P] Create `src/services/categoriesService.js` with createCategory function (INSERT category with created_by)
- [x] T015 [P] Create `src/services/categoriesService.js` with updateCategory function (UPDATE category by id)
- [x] T016 [P] Create `src/services/categoriesService.js` with deleteCategory function (DELETE category with card count check)
- [x] T017 [P] Create `src/services/categoriesService.js` with getCardsInCategory function (query cards with category filter)
- [x] T018 [P] Create `src/services/instructionLevelsService.js` with loadInstructionLevels function (SELECT all levels, ordered by order)
- [x] T019 [P] Create `src/services/instructionLevelsService.js` with createInstructionLevel function (INSERT level)
- [x] T020 [P] Create `src/services/instructionLevelsService.js` with updateInstructionLevel function (UPDATE level by id)
- [x] T021 [P] Create `src/services/instructionLevelsService.js` with deleteInstructionLevel function (DELETE level with card count check)
- [x] T022 [P] Create `src/services/instructionLevelsService.js` with getCardsByInstructionLevel function (query cards with instruction_level_id)
- [x] T023 [P] Modify `src/services/cardsService.js` loadCards function to JOIN with instruction_levels and card_categories/categories
- [x] T024 [P] Modify `src/services/cardsService.js` saveCard function to handle instruction_level_id and category associations (insert/update card_categories)
- [x] T025 [P] Modify `src/services/cardsService.js` transformCardFromDB to include instruction_level object and categories array
- [x] T026 [P] Modify `src/services/cardsService.js` transformCardToDB to handle instruction_level_id and category_ids array
- [x] T027 Create unit tests for `src/services/__tests__/categoriesService.test.js` (test all CRUD operations)
- [x] T028 Create unit tests for `src/services/__tests__/instructionLevelsService.test.js` (test all CRUD operations)
- [x] T029 Update `src/services/__tests__/cardsService.test.js` to test classification data loading and saving

## Phase 3: US1 - Admin Views Cards in Table View (P1)

**Goal**: Display all cards in a table/spreadsheet format with sortable columns (type, front, back content, categories, instruction level, created date, actions).

**Independent Test**: Navigate to Admin → Card Management → Table View and verify cards are displayed in table format with sortable headers. Verify sorting works for each column.

**Acceptance Criteria**:
1. Admin can view all cards in table format with required columns
2. Admin can click column headers to sort (ascending/descending toggle)
3. Table scrolls efficiently without performance degradation
4. Filters can be applied (type, category, instruction level)

- [x] T030 [US1] Create `src/components/AdminCardTable.jsx` component with table structure (thead, tbody)
- [x] T031 [US1] Implement table columns: Type, Front, Back Content (summary), Categories, Instruction Level, Created Date, Actions
- [x] T032 [US1] Add sorting state management (sortColumn, sortDirection) to AdminCardTable
- [x] T033 [US1] Implement column header click handlers for sorting (ascending/descending toggle)
- [x] T034 [US1] Implement useMemo hook for sorted cards array (sorted by sortColumn and sortDirection)
- [x] T035 [US1] Add visual indicators for sort direction (arrow up/down) in column headers
- [x] T036 [US1] Create `src/components/AdminCardTable.css` with table styling (responsive, accessible, uses CSS variables)
- [x] T037 [US1] Add pagination controls (page number, page size selector) to AdminCardTable
- [x] T038 [US1] Implement pagination state and logic (currentPage, pageSize, totalPages)
- [x] T039 [US1] Add loading state display (spinner/skeleton) while cards are loading
- [x] T040 [US1] Add empty state display when no cards are available
- [x] T041 [US1] Ensure table is keyboard accessible (tab navigation, Enter to sort, ARIA labels)
- [x] T042 [US1] Add component tests for `src/components/__tests__/AdminCardTable.test.jsx` (render, sorting, pagination)
- [x] T043 [US1] Test table displays all required columns with card data
- [x] T044 [US1] Test sorting works for each column (ascending/descending toggle)

## Phase 4: US2 - Admin Manages Cards in Table View (P1)

**Goal**: Add, edit, and delete cards directly from table view. Modal-based CRUD operations with clear feedback.

**Independent Test**: Use add/edit/delete actions within table view. Verify each operation works independently and table updates immediately after successful operations.

**Acceptance Criteria**:
1. Admin can add new cards from table view (modal opens with form)
2. Admin can edit existing cards from table view (modal opens with pre-filled form)
3. Admin can delete cards from table view (confirmation dialog, then delete)
4. All CRUD operations provide clear success/error feedback
5. Table updates immediately after successful operations

- [x] T045 [US2] Add "Add Card" button to AdminCardTable header
- [x] T046 [US2] Modify `src/components/AddCardForm.jsx` to include instruction_level_id and categories (multi-select) fields
- [x] T047 [US2] Update `src/data/cardSchema.js` to validate instruction_level_id (if provided, must exist) and categories array
- [x] T048 [US2] Implement add card handler in AdminCardTable (opens AddCardForm modal)
- [x] T049 [US2] Add "Edit" button to each table row Actions column
- [x] T050 [US2] Modify `src/components/EditCardForm.jsx` to include instruction_level_id and categories (multi-select) fields
- [x] T051 [US2] Implement edit card handler in AdminCardTable (opens EditCardForm modal with card data)
- [x] T052 [US2] Add "Delete" button to each table row Actions column
- [x] T053 [US2] Implement delete confirmation dialog (shows card front/back, confirms deletion)
- [x] T054 [US2] Implement delete card handler in AdminCardTable (calls cardsService.deleteCard, updates table)
- [x] T055 [US2] Add success notification toast/alert after successful add/edit/delete operations
- [x] T056 [US2] Add error notification toast/alert for failed operations (with error details)
- [x] T057 [US2] Implement table refresh after successful CRUD operations (reload cards from service)
- [x] T058 [US2] Add loading state during CRUD operations (disable buttons, show spinner)
- [x] T059 [US2] Update component tests for AdminCardTable to test add/edit/delete operations
- [x] T060 [US2] Test add card: modal opens, form submission creates card, table updates
- [x] T061 [US2] Test edit card: modal opens with pre-filled data, form submission updates card, table updates
- [x] T062 [US2] Test delete card: confirmation dialog appears, deletion removes card, table updates

## Phase 5: US3 - Admin Manages Instruction Levels (P2)

**Goal**: Admins can create, edit, delete instruction levels. Cards can be assigned instruction levels and filtered by level.

**Independent Test**: Create instruction level, assign to card, filter cards by level. Verify level appears in card edit form and table view.

**Acceptance Criteria**:
1. Admin can create new instruction levels through admin interface
2. Admin can edit existing instruction level names/descriptions
3. Admin can delete instruction levels (with warning if cards use it)
4. Admin can assign instruction level to cards (in add/edit forms)
5. Admin can filter cards by instruction level
6. Instruction level displays clearly in table and card views

- [x] T063 [P] [US3] Create `src/components/AdminInstructionLevelManager.jsx` component for managing instruction levels (list, create, edit, delete)
- [x] T064 [P] [US3] Create `src/components/AdminInstructionLevelManager.css` with styling for level management UI
- [x] T065 [US3] Implement list instruction levels in AdminInstructionLevelManager (displays all levels sorted by order)
- [x] T066 [US3] Implement create instruction level form (name, order, description) in AdminInstructionLevelManager
- [x] T067 [US3] Implement edit instruction level form (pre-filled with existing data) in AdminInstructionLevelManager
- [x] T068 [US3] Implement delete instruction level handler (check card count, show warning, confirm deletion) in AdminInstructionLevelManager
- [x] T069 [US3] Add instruction level selector dropdown to `src/components/AddCardForm.jsx` (loads levels from instructionLevelsService)
- [x] T070 [US3] Add instruction level selector dropdown to `src/components/EditCardForm.jsx` (pre-selects current level)
- [x] T071 [US3] Add instruction level filter dropdown to AdminCardTable filters section
- [x] T072 [US3] Implement instruction level filtering logic in AdminCardTable (filter cards by instruction_level_id)
- [x] T073 [US3] Display instruction level name in AdminCardTable Instruction Level column
- [x] T074 [US3] Update cardSchema validation to ensure instruction_level_id exists if provided (validate against instructionLevelsService)
- [x] T075 [US3] Add component tests for `src/components/__tests__/AdminInstructionLevelManager.test.jsx` (CRUD operations)
- [x] T076 [US3] Test instruction level creation: form submission creates level, appears in list
- [x] T077 [US3] Test instruction level assignment: select level in card form, save card, level appears in table
- [x] T078 [US3] Test instruction level filtering: select level in filter, table shows only cards with that level

## Phase 6: US4 - Admin Manages Categories (P2)

**Goal**: Admins can create, edit, delete categories. Cards can be assigned multiple categories and filtered by category.

**Independent Test**: Create category, assign to multiple cards, filter cards by category. Verify categories appear in card edit form and table view.

**Acceptance Criteria**:
1. Admin can view all existing categories
2. Admin can create new categories through admin interface
3. Admin can edit existing category names/descriptions
4. Admin can delete categories (with warning if cards use it)
5. Admin can assign one or more categories to cards (in add/edit forms)
6. Admin can filter cards by category
7. Categories display clearly in table and card views

- [x] T079 [P] [US4] Create `src/components/AdminCategoryManager.jsx` component for managing categories (list, create, edit, delete)
- [x] T080 [P] [US4] Create `src/components/AdminCategoryManager.css` with styling for category management UI
- [x] T081 [US4] Implement list categories in AdminCategoryManager (displays all categories sorted by name)
- [x] T082 [US4] Implement create category form (name, description) in AdminCategoryManager
- [x] T083 [US4] Implement edit category form (pre-filled with existing data) in AdminCategoryManager
- [x] T084 [US4] Implement delete category handler (check card count via card_categories, show warning, confirm deletion) in AdminCategoryManager
- [x] T085 [US4] Add category multi-select dropdown to `src/components/AddCardForm.jsx` (loads categories from categoriesService, allows multiple selection)
- [x] T086 [US4] Add category multi-select dropdown to `src/components/EditCardForm.jsx` (pre-selects current categories)
- [x] T087 [US4] Add category filter dropdown to AdminCardTable filters section
- [x] T088 [US4] Implement category filtering logic in AdminCardTable (filter cards by category_id via card_categories junction)
- [x] T089 [US4] Display category names (comma-separated or tags) in AdminCardTable Categories column
- [x] T090 [US4] Update cardSchema validation to ensure category_ids exist if provided (validate against categoriesService)
- [x] T091 [US4] Implement category assignment logic in cardsService.saveCard (delete old card_categories associations, insert new ones)
- [x] T092 [US4] Add component tests for `src/components/__tests__/AdminCategoryManager.test.jsx` (CRUD operations)
- [x] T093 [US4] Test category creation: form submission creates category, appears in list
- [x] T094 [US4] Test category assignment: select categories in card form, save card, categories appear in table
- [x] T095 [US4] Test category filtering: select category in filter, table shows only cards with that category

## Phase 7: US5 - Admin Switches Between Card and Table Views (P3)

**Goal**: Seamlessly switch between card view and table view while preserving filters and context.

**Independent Test**: Toggle between views, verify filters persist, verify same cards are displayed in both views.

**Acceptance Criteria**:
1. Admin can switch from card view to table view (preserves filters)
2. Admin can switch from table view to card view (preserves filters)
3. Filters remain active when switching views
4. Edit state is preserved or user is prompted to save/cancel when switching views

- [x] T096 [US5] Create `src/components/AdminCardManagement.jsx` main component that manages view state and shared filters
- [x] T097 [US5] Create `src/components/AdminCardManagement.css` with styling for main component
- [x] T098 [US5] Implement view toggle buttons (Card View / Table View) in AdminCardManagement
- [x] T099 [US5] Implement shared filter state (filterType, filterCategory, filterInstructionLevel) in AdminCardManagement
- [x] T100 [US5] Add AdminCardTable component rendering in AdminCardManagement (when table view active)
- [x] T101 [US5] Integrate existing CardManager component in AdminCardManagement (when card view active)
- [x] T102 [US5] Pass shared filters to both AdminCardTable and CardManager components
- [x] T103 [US5] Implement filter persistence when switching views (filters remain in AdminCardManagement state)
- [x] T104 [US5] Handle edit state when switching views (if editing, prompt to save/cancel or preserve edit state)
- [x] T105 [US5] Modify `src/components/AdminPage.jsx` to add "Advanced Card Management" tab
- [x] T106 [US5] Replace CardManager in AdminPage with AdminCardManagement component in Advanced Card Management tab
- [x] T107 [US5] Add component tests for `src/components/__tests__/AdminCardManagement.test.jsx` (view switching, filter persistence)
- [x] T108 [US5] Test view switching: card view → table view, filters preserved, same cards displayed
- [x] T109 [US5] Test view switching: table view → card view, filters preserved, same cards displayed
- [x] T110 [US5] Test edit state handling: editing card in one view, switching views prompts save/cancel

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Accessibility improvements, error handling refinement, performance optimization, integration testing.

**Independent Test**: Verify accessibility compliance, error handling, performance benchmarks met, full integration tests pass.

- [x] T111 Add ARIA labels to all table elements (table, th, td, buttons) for screen reader compatibility
- [x] T112 Implement keyboard navigation for table (Arrow keys, Tab, Enter, Escape)
- [x] T113 Add focus indicators for all interactive elements (buttons, inputs, links)
- [x] T114 Verify color contrast ratios meet WCAG 2.1 AA standards for all text elements
- [x] T115 Add error boundary handling for AdminCardTable component (graceful error display)
- [x] T116 Implement retry logic for failed API calls (categoriesService, instructionLevelsService, cardsService)
- [x] T117 Add performance monitoring for table rendering (measure render time for 1000+ cards)
- [x] T118 Optimize table rendering with React.memo for table rows if needed
- [x] T119 Add integration tests for `src/integration/__tests__/adminCardManagement.test.js` (full workflow: create card with classification, edit, delete)
- [x] T120 Add E2E tests for `src/integration/e2e/adminCardManagement.spec.js` (Playwright tests for table view, CRUD, filtering, view switching)
- [x] T121 Test performance: Table loads 1000+ cards in <2 seconds (SC-001)
- [x] T122 Test performance: Sorting completes in <1 second (SC-006)
- [x] T123 Test performance: Filtering completes in <50ms (SC-003)
- [x] T124 Test performance: CRUD operations provide feedback within 500ms (SC-007)
- [x] T125 Update accessibility tests in `src/components/__tests__/Accessibility.test.jsx` to include AdminCardTable, AdminCategoryManager, AdminInstructionLevelManager

## Task Summary

**Total Tasks**: 125

**By Phase**:
- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 17 tasks
- Phase 3 (US1 - Table View): 15 tasks
- Phase 4 (US2 - CRUD): 18 tasks
- Phase 5 (US3 - Instruction Levels): 16 tasks
- Phase 6 (US4 - Categories): 17 tasks
- Phase 7 (US5 - View Switching): 15 tasks
- Phase 8 (Polish): 15 tasks

**By User Story**:
- US1 (P1): 15 tasks
- US2 (P1): 18 tasks
- US3 (P2): 16 tasks
- US4 (P2): 17 tasks
- US5 (P3): 15 tasks
- Setup/Foundational/Polish: 44 tasks

**Parallel Opportunities**:
- Phase 5 (US3) and Phase 6 (US4) can be implemented in parallel
- Service layer tasks within Phase 2 are parallelizable (T013-T026)
- Component creation tasks within each phase are parallelizable (e.g., T063-T064, T079-T080)

**Independent Test Criteria**:
- **Phase 1**: Migration verified in Supabase, default levels seeded, RLS active
- **Phase 2**: All service functions unit tested, mock Supabase calls verified
- **US1**: Table view displays cards, sorting works, pagination works
- **US2**: Add/edit/delete operations work, table updates, feedback shown
- **US3**: Instruction levels can be created/edited/deleted, assigned to cards, filtered
- **US4**: Categories can be created/edited/deleted, assigned to cards, filtered
- **US5**: View switching preserves filters, same cards displayed in both views
- **Phase 8**: Accessibility compliance verified, performance benchmarks met, integration tests pass

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (Table view with CRUD operations, 59 tasks)

**Next Steps**: Start with Phase 1 (Setup), then Phase 2 (Foundational), then proceed through user stories in priority order.

