# Research: Advanced Admin Card Management

**Created**: 2025-11-01  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Research Questions

### Table Component Library Selection

**Question**: Should we use a React table library (e.g., TanStack Table) or build a custom table component?

**Decision**: Use lightweight custom React table implementation with virtualization for large datasets.

**Rationale**:
- Existing codebase has minimal dependencies (React 19, Vite, Supabase only)
- Table requirements are straightforward (sort, filter, CRUD) without complex features like grouping, pivoting
- Custom implementation gives full control over styling (CSS Variables), accessibility, and bundle size
- TanStack Table v8 is powerful but adds ~50KB to bundle and may be overkill for this use case
- Custom implementation aligns with existing codebase patterns (no heavy library dependencies)

**Alternatives Considered**:
1. **TanStack Table (React Table)**: Powerful, feature-rich, well-maintained. Rejected due to bundle size and complexity for our needs.
2. **AG Grid / Material-UI Table**: Enterprise-grade but too heavy and potentially conflicting with existing styling.
3. **React Virtual (for virtualization)**: Could be used just for virtualization layer if needed, but native browser scrolling may suffice for 1000+ cards.

**Implementation Approach**: 
- Build custom `<table>` with React state for sorting/filtering
- Use CSS Grid/Flexbox for layout
- Implement pagination or windowed rendering for 1000+ items
- Use React's `useMemo` for efficient sorting/filtering

---

### Database Schema for Categories

**Question**: How should categories be stored? Separate table with many-to-many relationship or array column?

**Decision**: Separate `categories` table with many-to-many relationship via junction table `card_categories`.

**Rationale**:
- Categories are managed independently by admins (CRUD operations)
- Categories can be reused across many cards
- Need to track category metadata (created_by, created_at, description)
- Junction table enables efficient queries (find all cards in category, find all categories for card)
- Supports cardinality: one card can have multiple categories

**Alternatives Considered**:
1. **Array column (`TEXT[]`)**: Simpler schema, but no metadata, harder to query, no admin management
2. **JSONB column**: More flexible but harder to query and validate, no referential integrity

**Implementation Approach**:
```sql
-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for card-category many-to-many
CREATE TABLE card_categories (
  card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, category_id)
);
```

---

### Database Schema for Instruction Levels

**Question**: Should instruction levels be a separate table or enum/check constraint?

**Decision**: Separate `instruction_levels` table for flexibility and admin management.

**Rationale**:
- Admins need to manage levels (add/edit/delete) through UI
- System may need predefined levels (Beginner, Intermediate, Advanced) but also custom levels
- Levels need ordering for UI display (numeric `order` field)
- Metadata tracking (created_by, description) useful for curriculum planning
- Enables future features (level-specific content, progression tracking)

**Alternatives Considered**:
1. **ENUM type**: Simple but inflexible, requires database migrations for new levels
2. **Check constraint with hardcoded values**: Inflexible, no admin management
3. **JSONB column**: Too flexible, lacks structure

**Implementation Approach**:
```sql
-- Instruction levels table
CREATE TABLE instruction_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  order INTEGER NOT NULL, -- For sorting (1=Beginner, 2=Intermediate, etc.)
  description TEXT,
  is_default BOOLEAN DEFAULT false, -- System default levels
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Levels**: Seed with "Beginner" (order: 1), "Intermediate" (order: 2), "Advanced" (order: 3)

---

### Table View Performance Strategy

**Question**: How to handle 1000+ cards in table view without performance degradation?

**Decision**: Use pagination with client-side caching and efficient React rendering patterns.

**Rationale**:
- Target: 1000+ cards load in <2 seconds (SC-001)
- Pagination is simpler than virtualization and sufficient for admin use case
- Client-side sorting/filtering on loaded data (no server-side pagination needed initially)
- Use `useMemo` for expensive sorting/filtering operations
- React key optimization for list rendering

**Alternatives Considered**:
1. **Virtual scrolling/windowing**: More complex, requires library (react-window/react-virtual), better for infinite scroll
2. **Server-side pagination**: Adds API complexity, slower for filtering (requires round-trips)

**Implementation Approach**:
- Load all cards once (RLS filters automatically)
- Client-side pagination (50-100 rows per page)
- Client-side sorting (React `useMemo` with sorted array)
- Client-side filtering (React `useMemo` with filtered array)
- Optional: Virtualization if pagination insufficient (can add later)

---

### View Switching State Management

**Question**: How to preserve filters/state when switching between card view and table view?

**Decision**: Use React Context or lift state to parent component (AdminCardManagement).

**Rationale**:
- Both views need access to same filter state (type, category, instruction level)
- Parent component can maintain shared state and pass to both view components
- Simpler than global state management (no Redux/Zustand needed)
- Aligns with existing architecture (React Context used for Theme, Auth)

**Alternatives Considered**:
1. **URL state (query params)**: Persists across page refresh but adds complexity
2. **localStorage**: Persists across sessions but may be overkill
3. **Global state (Redux/Zustand)**: Unnecessary for component-level state

**Implementation Approach**:
- `AdminCardManagement` component manages filter state
- Passes filters to both `CardView` and `TableView` child components
- State persists while component is mounted
- View toggle is simple state change (`activeView: 'card' | 'table'`)

---

### CRUD Operations in Table View

**Question**: Inline editing vs modal for table CRUD operations?

**Decision**: Modal for Add/Edit, inline delete with confirmation.

**Rationale**:
- Card creation/editing has many fields (type, front, back_* fields, categories, instruction level) - too wide for inline editing
- Modal provides better UX for complex forms (validation, error messages, all fields visible)
- Inline editing works for simple text fields but cards have complex validation
- Delete can be inline with confirmation dialog (simple action)
- Aligns with existing EditCardForm pattern (modal-based)

**Alternatives Considered**:
1. **Full inline editing**: Too complex for multi-field cards, breaks table layout
2. **Expandable rows**: Could work but modal is clearer for forms
3. **Separate page**: Breaks context, worse UX than modal

**Implementation Approach**:
- "Add Card" button opens modal with `AddCardForm` (enhanced with categories, instruction level)
- "Edit" button opens modal with `EditCardForm` (enhanced with categories, instruction level)
- "Delete" button shows confirmation dialog inline
- Table updates immediately after successful CRUD operation

---

### Category Deletion Strategy

**Question**: What happens when an admin deletes a category that is assigned to cards?

**Decision**: Soft delete with warning - show card count and require confirmation. Keep junction table entries for data integrity.

**Rationale**:
- Hard delete would orphan junction table entries (data integrity issue)
- Soft delete preserves history but may confuse admins
- Best approach: Warn admin about card count, delete category but keep junction entries (cards still have category but category is "deleted")
- Alternative: Prevent deletion if cards use it (safer, but less flexible)

**Implementation Approach**:
- Before deletion, query `card_categories` for count of cards using category
- Show warning: "This category is assigned to {N} cards. Deleting will remove the category, but cards will retain the association. You can reassign cards later."
- On confirmation, delete category (junction entries remain but category lookup fails - cards can be migrated later)
- Future enhancement: Bulk reassignment tool

**Edge Case**: If admin tries to filter by deleted category, show message "Category deleted" and offer to reassign cards.

---

### Instruction Level Defaults

**Question**: Should instruction levels have predefined defaults or start empty?

**Decision**: Seed with default levels (Beginner, Intermediate, Advanced) but allow admins to customize.

**Rationale**:
- Provides immediate value - admins can start using levels without setup
- Common levels for language learning (beginner/intermediate/advanced)
- Admins can add custom levels if needed (e.g., "Novice", "Expert")
- Default levels marked `is_default: true` but can be edited/deleted if needed

**Implementation Approach**:
- Migration seeds 3 default levels
- UI shows defaults prominently but allows customization
- Admins can create additional levels beyond defaults

---

### Multi-Criteria Filtering

**Question**: How to implement filtering by type + category + instruction level simultaneously?

**Decision**: Client-side filtering with React `useMemo` combining all filter criteria.

**Rationale**:
- Performance acceptable for 1000+ cards with client-side filtering (<50ms per SC-003)
- Simpler than server-side filtering (no API changes)
- Works with existing RLS-filtered card list
- Can optimize with indexed filtering if needed

**Implementation Approach**:
```javascript
const filteredCards = useMemo(() => {
  return cards.filter(card => {
    if (filterType && card.type !== filterType) return false;
    if (filterCategory && !card.categories.includes(filterCategory)) return false;
    if (filterInstructionLevel && card.instruction_level !== filterInstructionLevel) return false;
    return true;
  });
}, [cards, filterType, filterCategory, filterInstructionLevel]);
```

---

### Table Column Selection

**Question**: Which columns should be visible in table view by default?

**Decision**: Default columns: Type, Front, Back Content (summary), Categories, Instruction Level, Created Date, Actions.

**Rationale**:
- Essential information for card identification and classification
- Back content shown as summary (first 50 chars) with full content in tooltip or detail view
- Created date useful for sorting by recent additions
- Actions (Edit, Delete) always visible
- Optional: Column visibility toggle for future enhancement

**Future Enhancement**: User preferences for column visibility (store in `table_view_config` entity if needed)

---

## Technology Decisions Summary

| Decision | Technology/Approach | Rationale |
|----------|-------------------|-----------|
| Table Component | Custom React table | Minimal dependencies, full control, aligns with codebase |
| Category Storage | Separate table + junction | Metadata, admin management, many-to-many relationships |
| Instruction Levels | Separate table | Admin management, flexibility, ordering support |
| Performance | Client-side pagination | Simpler than virtualization, sufficient for 1000+ cards |
| View State | Parent component state | Simple, no global state needed |
| CRUD UI | Modal for Add/Edit | Complex forms, aligns with existing patterns |
| Category Deletion | Delete with warning | Data integrity, admin awareness |
| Filtering | Client-side `useMemo` | Fast enough, simpler than server-side |
| Default Levels | Seed Beginner/Intermediate/Advanced | Immediate value, common for language learning |

## Unresolved Items

None - all research questions resolved.

