# Contract: Multi-Select Instruction Level Filter API

**Components**: `App.jsx` (state), `CardFilter.jsx` (UI)  
**User Story**: P2 - Multi-Filter Study Card Selection  
**Version**: 1.0  
**Date**: 2025-11-12

## Purpose

Define the state management and component interface contract for multi-select instruction level filtering in the study card selection menu. Filters must support AND logic across Type + Category + Instruction Level dimensions.

---

## Component Interfaces

### App.jsx (State Owner)

**New State**:
```typescript
interface AppState {
  // ... existing state ...
  
  // NEW: Instruction level support
  instructionLevels: InstructionLevel[];      // All available levels (loaded from DB)
  selectedInstructionLevels: string[];        // Selected level IDs (multi-select)
}

interface InstructionLevel {
  id: string;                // UUID
  name: string;              // Display name (e.g., "Arpatsa", "Intermediate")
  order: number;             // Sort order (ascending)
  description?: string;      // Optional description
}
```

**New Callbacks**:
```typescript
const handleInstructionLevelToggle = (levelId: string) => void;
// Toggles selection: adds if not present, removes if present
```

### CardFilter.jsx (UI Component)

**New Props**:
```typescript
interface CardFilterProps {
  // ... existing props ...
  
  // NEW: Instruction level filtering
  instructionLevels: InstructionLevel[];               // Available levels
  selectedInstructionLevels: string[];                 // Selected level IDs
  onInstructionLevelToggle: (levelId: string) => void; // Toggle callback
}
```

---

## Behavior Contract

### Selection Logic

**Multi-Select Behavior**:
- User can select 0, 1, or multiple instruction levels
- Each checkbox click toggles selection independently
- No mutual exclusivity (unlike card type filter which is single-select)
- Selection state persists during session (not across page reloads)

**Toggle Algorithm**:
```javascript
const handleInstructionLevelToggle = (levelId) => {
  setSelectedInstructionLevels(prev => {
    if (prev.includes(levelId)) {
      // Already selected → Remove it
      return prev.filter(id => id !== levelId);
    } else {
      // Not selected → Add it
      return [...prev, levelId];
    }
  });
};
```

### Filter Application (AND Logic)

**Filter Chain**:
```javascript
const filteredCards = useMemo(() => {
  let filtered = cards;
  
  // Step 1: Filter by card type (existing)
  if (!selectedTags.includes('all') && selectedTags.length > 0) {
    filtered = filtered.filter(card => 
      selectedTags.includes(cardTypeMapping[card.type])
    );
  }
  
  // Step 2: Filter by category (existing, if applicable)
  if (selectedCategory) {
    filtered = filtered.filter(card => 
      card.categories?.some(cat => cat.id === selectedCategory)
    );
  }
  
  // Step 3: Filter by instruction level (NEW)
  if (selectedInstructionLevels.length > 0) {
    filtered = filtered.filter(card => 
      selectedInstructionLevels.includes(card.instruction_level_id)
    );
  }
  
  return filtered;
}, [cards, selectedTags, selectedCategory, selectedInstructionLevels]);
```

**AND Logic Semantics**:
- Card must match ALL active filters to be included
- Example: If "words" type AND "Arpatsa" level selected → Only word cards at Arpatsa level included
- Empty filter (no selection) → All cards included for that dimension

---

## UI Contract

### Filter Section Rendering

**HTML Structure**:
```html
<div class="filter-dropdown-menu">
  <!-- Existing sections: Card Types, Study Direction -->
  
  <!-- NEW: Instruction Level section -->
  <div class="filter-section">
    <div class="filter-section-title">Instruction Level</div>
    
    <!-- Checkbox for each instruction level -->
    <label class="filter-checkbox-item">
      <input 
        type="checkbox" 
        checked={selectedInstructionLevels.includes(level.id)}
        onChange={() => onInstructionLevelToggle(level.id)}
        aria-label="Filter by {level.name}"
      />
      <span>{level.name}</span>
    </label>
    <!-- ... repeat for each level ... -->
  </div>
</div>
```

**Ordering**:
- Instruction levels displayed in ascending order by `level.order` field
- Sort applied before rendering: `instructionLevels.sort((a, b) => a.order - b.order)`

### Visual States

**Checkbox States**:
- ☐ Unchecked: Level not selected
- ☑ Checked: Level selected
- Hover: Background highlight
- Focus: Keyboard focus ring

**Empty State**:
```html
<!-- When instructionLevels.length === 0 -->
<div class="filter-section">
  <div class="filter-section-title">Instruction Level</div>
  <div class="filter-empty-state">No levels available</div>
</div>
```

---

## Data Loading Contract

### Initialization

**Load Timing**: On `App` component mount

**Load Logic**:
```javascript
useEffect(() => {
  const loadData = async () => {
    try {
      const levels = await loadInstructionLevels(); // from instructionLevelsService
      setInstructionLevels(levels);
    } catch (error) {
      console.error('Failed to load instruction levels:', error);
      setInstructionLevels([]); // Fallback to empty array
    }
  };
  loadData();
}, []); // Run once on mount
```

**Error Handling**:
- Network failure → Log error, set `instructionLevels = []`
- Empty result → Set `instructionLevels = []` (not an error, valid state)
- Supabase not configured → Return empty array (graceful degradation for local dev)

### Cache Strategy

**No caching**: Load fresh on every app mount
**Rationale**: Instruction levels are reference data, changes are rare, load time is negligible (~50ms)

---

## Filter State Persistence

### Session Persistence

**Selected instruction levels persist**:
- ✅ During navigation within the app (global App state)
- ✅ When switching between study/manage views
- ✅ When applying other filters

**Selected instruction levels DO NOT persist**:
- ❌ On page refresh (browser reload)
- ❌ On tab close/reopen
- ❌ Across devices

**Future Enhancement**: Could add localStorage persistence if requested by users

---

## Performance Contract

### Optimization Requirements

**Success Criterion SC-004**: Filter selection updates available card count in < 1 second

**Optimizations**:
1. **useMemo for filteredCards**: Recompute only when dependencies change
   ```javascript
   const filteredCards = useMemo(() => {
     // ... filter logic ...
   }, [cards, selectedTags, selectedCategory, selectedInstructionLevels]);
   ```

2. **Efficient array operations**: Use `Array.includes()` for ID lookups (O(n) acceptable for small arrays)

3. **No unnecessary re-renders**: CardFilter is pure component, only re-renders when props change

**Performance Measurement**:
- Measure time from checkbox click to `filteredCards` recompute
- Target: < 100ms for 1000 cards
- Monitor via performance tests

---

## Accessibility Contract

### Keyboard Navigation

**Tab order**:
1. Filter dropdown button
2. Card type options (if open)
3. Study direction options (if open)
4. Instruction level checkboxes (if open)

**Keyboard shortcuts**:
- `Space` / `Enter`: Toggle checkbox focus
- `Tab`: Move to next checkbox
- `Shift+Tab`: Move to previous checkbox
- `Esc`: Close dropdown menu

### Screen Reader Support

**ARIA Labels**:
```html
<input 
  type="checkbox"
  aria-label="Filter by Arpatsa level"
  aria-checked={isSelected}
/>
```

**Announcements**:
- On checkbox toggle: "Arpatsa level filter {enabled|disabled}"
- On filter result: "Showing {count} cards" (aria-live region)

**Focus Management**:
- Focus remains on toggled checkbox after selection
- No focus trap (user can exit dropdown with Tab/Esc)

---

## Edge Cases

### Cards Without Instruction Level

**Scenario**: Card has `instruction_level_id = null`

**Behavior**:
- If ANY instruction level filter is active → Card is EXCLUDED
- If NO instruction level filter is active → Card is INCLUDED (backward compatible)

**Rationale**: When user filters by level, they want cards AT that level. Cards without level don't match filter criteria.

**Future Enhancement**: Could add "No level assigned" pseudo-filter option

### All Instruction Levels Selected

**Scenario**: User checks all available instruction level checkboxes

**Behavior**:
- Equivalent to no filter active (all cards from all levels included)
- Optimization: Could short-circuit filter logic if `selectedInstructionLevels.length === instructionLevels.length`

### Instruction Levels Deleted

**Scenario**: Admin deletes an instruction level that was previously selected in filter

**Behavior**:
- Filter state still contains deleted level ID
- No cards match deleted level (expected behavior)
- User sees empty result set until they deselect the deleted level
- No error thrown (graceful degradation)

**Future Enhancement**: Could validate `selectedInstructionLevels` against loaded `instructionLevels` on mount

### No Cards Match Combined Filters

**Scenario**: User selects Type="words" + Level="Arpatsa" but no Arpatsa-level word cards exist

**Behavior**:
- `filteredCards.length === 0`
- Display "No cards match selected filters" message
- Provide option to clear filters or adjust selection

---

## Testing Contract

### Unit Tests

**Required test cases**:
1. ✅ `handleInstructionLevelToggle` adds level when not selected
2. ✅ `handleInstructionLevelToggle` removes level when already selected
3. ✅ `filteredCards` includes only cards matching selected levels
4. ✅ `filteredCards` applies AND logic across all filter dimensions
5. ✅ Empty `selectedInstructionLevels` includes all cards (backward compatible)
6. ✅ Cards without `instruction_level_id` excluded when filter active
7. ✅ Multiple levels selected → Cards from any selected level included

### Component Tests

**Required test scenarios**:
1. CardFilter renders instruction level checkboxes
2. Clicking checkbox updates selection state
3. Selected checkboxes display checked state
4. Instruction levels sorted by `order` field
5. Empty state renders when `instructionLevels.length === 0`

### Integration Tests

**Required test flows**:
1. User selects instruction level → Card count updates
2. User selects multiple levels → Cards from both levels included
3. User combines Type + Level filters → Only cards matching both included
4. User deselects all levels → All cards visible again

### Accessibility Tests

**Required validations**:
1. Checkboxes have descriptive `aria-label`
2. Keyboard navigation works (Tab, Space, Enter)
3. Focus visible on all interactive elements
4. Screen reader announces filter changes

---

## Backward Compatibility

### Breaking Changes

**None**. This is an additive feature.

### Migration

**Existing filter behavior**:
- Card type filter continues to work as before
- Study direction filter continues to work as before
- No data migration required

**Existing cards**:
- Cards with `instruction_level_id = null` behave as before (included when no level filter active)
- Cards with assigned levels work with new filter

---

## Examples

### Example 1: Single Level Selection

```javascript
// User selects "Arpatsa" level
handleInstructionLevelToggle("uuid-arpatsa");

// State after toggle:
selectedInstructionLevels: ["uuid-arpatsa"]

// Filtered result:
filteredCards = cards.filter(card => 
  card.instruction_level_id === "uuid-arpatsa"
);
// → Only Arpatsa-level cards
```

### Example 2: Multiple Level Selection

```javascript
// User selects "Arpatsa" and "Intermediate"
handleInstructionLevelToggle("uuid-arpatsa");
handleInstructionLevelToggle("uuid-intermediate");

// State after toggles:
selectedInstructionLevels: ["uuid-arpatsa", "uuid-intermediate"]

// Filtered result:
filteredCards = cards.filter(card => 
  ["uuid-arpatsa", "uuid-intermediate"].includes(card.instruction_level_id)
);
// → Cards from either Arpatsa OR Intermediate level
```

### Example 3: Combined Filters (AND Logic)

```javascript
// User selects Type="words" AND Level="Arpatsa"
selectedTags: ["Word"]
selectedInstructionLevels: ["uuid-arpatsa"]

// Filtered result:
filteredCards = cards
  .filter(card => card.type === "word")           // Type filter
  .filter(card => card.instruction_level_id === "uuid-arpatsa"); // Level filter
// → Only word cards at Arpatsa level
```

---

## Contract Version History

- **v1.0** (2025-11-12): Initial contract for multi-select instruction level filtering

