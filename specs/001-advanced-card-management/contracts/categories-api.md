# API Contract: Categories

**Created**: 2025-11-01  
**Feature**: [spec.md](../spec.md)  
**Plan**: [plan.md](../plan.md)

## Overview

Categories are managed directly through Supabase client-side SDK. No serverless functions needed.

**Base Path**: Supabase client (`supabase.from('categories')`)

## Endpoints

### List Categories

**Operation**: `SELECT` all categories

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('name', { ascending: true });
```

**Response**:
```typescript
{
  data: Array<{
    id: UUID;
    name: string;
    description: string | null;
    created_by: UUID | null;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
  }> | null;
  error: PostgrestError | null;
}
```

**RLS Policy**: Anyone can read categories

---

### Create Category

**Operation**: `INSERT` new category

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('categories')
  .insert({
    name: string, // Required, unique
    description: string | null, // Optional
    created_by: UUID // Current admin user ID
  })
  .select()
  .single();
```

**Request Validation**:
- `name`: Required, non-empty, unique (enforced by database)
- `description`: Optional
- `created_by`: Current admin user ID

**Response**:
```typescript
{
  data: {
    id: UUID;
    name: string;
    description: string | null;
    created_by: UUID;
    created_at: string;
    updated_at: string;
  } | null;
  error: PostgrestError | null;
}
```

**Error Cases**:
- `23505` (unique_violation): Category name already exists
- `42501` (insufficient_privilege): User is not admin

**RLS Policy**: Only admins can insert categories

---

### Update Category

**Operation**: `UPDATE` existing category

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('categories')
  .update({
    name: string, // Optional if unchanged
    description: string | null // Optional
  })
  .eq('id', UUID)
  .select()
  .single();
```

**Request Validation**:
- `id`: Required, must exist
- `name`: If provided, must be unique (enforced by database)
- `description`: Optional

**Response**:
```typescript
{
  data: {
    id: UUID;
    name: string;
    description: string | null;
    created_by: UUID;
    created_at: string;
    updated_at: string; // Updated automatically
  } | null;
  error: PostgrestError | null;
}
```

**Error Cases**:
- `23505` (unique_violation): New category name already exists
- `42501` (insufficient_privilege): User is not admin
- `PGRST116` (no rows found): Category ID does not exist

**RLS Policy**: Only admins can update categories

---

### Delete Category

**Operation**: `DELETE` category

**Prerequisites**: Check if category is used by cards

**Supabase Query**:
```javascript
// First: Check card count
const { count, error: countError } = await supabase
  .from('card_categories')
  .select('*', { count: 'exact', head: true })
  .eq('category_id', UUID);

// Then: Delete category (if confirmed)
const { data, error } = await supabase
  .from('categories')
  .delete()
  .eq('id', UUID)
  .select()
  .single();
```

**Request Validation**:
- `id`: Required, must exist

**Response**:
```typescript
{
  data: {
    id: UUID;
    name: string;
    // ... other fields
  } | null;
  error: PostgrestError | null;
}
```

**Error Cases**:
- `42501` (insufficient_privilege): User is not admin
- `PGRST116` (no rows found): Category ID does not exist

**RLS Policy**: Only admins can delete categories

**Note**: Junction table entries (`card_categories`) remain after category deletion. Cards retain associations but category lookup fails. Consider bulk reassignment tool for future enhancement.

---

### Get Cards in Category

**Operation**: Query cards associated with a category

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('cards')
  .select(`
    *,
    card_categories!inner(category_id),
    categories!inner(name)
  `)
  .eq('card_categories.category_id', UUID);
```

**Response**: Array of cards with category associations

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
- `23505`: Unique constraint violation (duplicate category name)
- `42501`: Insufficient privilege (not admin)
- `PGRST116`: No rows found (category doesn't exist)

