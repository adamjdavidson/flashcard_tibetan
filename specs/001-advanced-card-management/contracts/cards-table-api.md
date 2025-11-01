# API Contract: Cards Table View

**Created**: 2025-11-01  
**Feature**: [spec.md](../spec.md)  
**Plan**: [plan.md](../plan.md)

## Overview

Table view operations extend existing card operations with classification data. Uses Supabase client-side SDK for all operations.

**Base Path**: Supabase client (`supabase.from('cards')`)

## Enhanced Card Operations

### Load Cards with Classification

**Operation**: `SELECT` cards with instruction level and categories

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('cards')
  .select(`
    *,
    instruction_levels(id, name, order),
    card_categories(
      categories(id, name)
    )
  `)
  .order('created_at', { ascending: false });
```

**Response**:
```typescript
{
  data: Array<{
    id: string;
    type: 'number' | 'word' | 'phrase';
    front: string;
    back_arabic: string | null;
    back_english: string | null;
    back_tibetan_script: string | null;
    back_tibetan_numeral: string | null;
    back_tibetan_spelling: string | null;
    tags: string[];
    subcategory: string | null;
    notes: string | null;
    image_url: string | null;
    instruction_level_id: UUID | null;
    instruction_levels: {
      id: UUID;
      name: string;
      order: number;
    } | null;
    card_categories: Array<{
      categories: {
        id: UUID;
        name: string;
      };
    }>;
    user_id: UUID | null;
    is_master: boolean;
    created_at: string;
    updated_at: string;
  }> | null;
  error: PostgrestError | null;
}
```

**RLS Policy**: Users see master + own cards, admins see all cards

**Transformation**: Transform to app format:
- `instruction_level` object from `instruction_levels` relation
- `categories` array from `card_categories.categories` relation

---

### Create Card with Classification

**Operation**: `INSERT` card with instruction level and categories

**Supabase Query**:
```javascript
// 1. Insert card
const { data: card, error: cardError } = await supabase
  .from('cards')
  .insert({
    type: string,
    front: string,
    back_arabic: string | null,
    back_english: string | null,
    back_tibetan_script: string | null,
    back_tibetan_numeral: string | null,
    back_tibetan_spelling: string | null,
    tags: string[],
    subcategory: string | null,
    notes: string | null,
    image_url: string | null,
    instruction_level_id: UUID | null,
    user_id: UUID | null, // For user-owned cards
    is_master: boolean
  })
  .select()
  .single();

// 2. Insert category associations (if categories selected)
if (card && categoryIds.length > 0) {
  const { error: categoryError } = await supabase
    .from('card_categories')
    .insert(
      categoryIds.map(categoryId => ({
        card_id: card.id,
        category_id: categoryId
      }))
    );
}
```

**Request Validation**:
- All existing card validation rules apply
- `instruction_level_id`: Must exist in `instruction_levels` table if provided
- `categoryIds`: Array of UUIDs, each must exist in `categories` table

**Response**: Complete card with classification data (same format as Load Cards)

---

### Update Card with Classification

**Operation**: `UPDATE` card and category associations

**Supabase Query**:
```javascript
// 1. Update card
const { data: card, error: cardError } = await supabase
  .from('cards')
  .update({
    // ... card fields ...
    instruction_level_id: UUID | null
  })
  .eq('id', string)
  .select()
  .single();

// 2. Replace category associations
if (card) {
  // Delete existing associations
  await supabase
    .from('card_categories')
    .delete()
    .eq('card_id', card.id);

  // Insert new associations
  if (categoryIds.length > 0) {
    await supabase
      .from('card_categories')
      .insert(
        categoryIds.map(categoryId => ({
          card_id: card.id,
          category_id: categoryId
        }))
      );
  }
}
```

**Request Validation**:
- All existing card validation rules apply
- `instruction_level_id`: Must exist in `instruction_levels` table if provided
- `categoryIds`: Array of UUIDs, each must exist in `categories` table

**Response**: Complete card with classification data (same format as Load Cards)

---

### Delete Card

**Operation**: `DELETE` card (cascade deletes category associations)

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('cards')
  .delete()
  .eq('id', string)
  .select()
  .single();
```

**Response**:
```typescript
{
  data: {
    id: string;
    // ... deleted card fields
  } | null;
  error: PostgrestError | null;
}
```

**RLS Policy**: Admins can delete any card, users can delete own cards

**Cascade**: Deleting card automatically deletes `card_categories` associations (ON DELETE CASCADE)

---

## Filtering Operations

### Filter by Type + Category + Instruction Level

**Operation**: Client-side filtering (or Supabase query with filters)

**Supabase Query** (if server-side filtering preferred):
```javascript
let query = supabase.from('cards').select('*');

// Filter by type
if (filterType) {
  query = query.eq('type', filterType);
}

// Filter by instruction level
if (filterInstructionLevel) {
  query = query.eq('instruction_level_id', filterInstructionLevel);
}

// Filter by category (requires join)
if (filterCategory) {
  query = query
    .select(`
      *,
      card_categories!inner(category_id)
    `)
    .eq('card_categories.category_id', filterCategory);
}

const { data, error } = await query;
```

**Recommendation**: Use client-side filtering with React `useMemo` for simplicity and performance (target: <50ms per SC-003).

---

## Sorting Operations

**Operation**: Client-side sorting (React `useMemo`)

**Sortable Columns**:
- `type` (alphabetical)
- `front` (alphabetical)
- `back_english` (alphabetical)
- `instruction_level` (by order)
- `categories` (by first category name)
- `created_at` (chronological)
- `updated_at` (chronological)

**Implementation**: Use React `useMemo` to sort filtered cards array:
```javascript
const sortedCards = useMemo(() => {
  const sorted = [...filteredCards];
  sorted.sort((a, b) => {
    // Sort logic based on sortColumn and sortDirection
  });
  return sorted;
}, [filteredCards, sortColumn, sortDirection]);
```

**Performance Target**: <1 second per column sort (SC-006)

---

## Error Handling

All operations return Supabase error format:
```typescript
{
  message: string;
  details: string | null;
  hint: string | null;
  code: string; // PostgreSQL error code
}
```

**Common Error Codes**:
- `23503`: Foreign key violation (instruction_level_id or category_id doesn't exist)
- `42501`: Insufficient privilege (not admin or not card owner)
- `PGRST116`: No rows found (card doesn't exist)

