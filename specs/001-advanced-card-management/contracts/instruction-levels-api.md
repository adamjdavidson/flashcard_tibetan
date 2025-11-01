# API Contract: Instruction Levels

**Created**: 2025-11-01  
**Feature**: [spec.md](../spec.md)  
**Plan**: [plan.md](../plan.md)

## Overview

Instruction levels are managed directly through Supabase client-side SDK. No serverless functions needed.

**Base Path**: Supabase client (`supabase.from('instruction_levels')`)

## Endpoints

### List Instruction Levels

**Operation**: `SELECT` all instruction levels

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('instruction_levels')
  .select('*')
  .order('order', { ascending: true });
```

**Response**:
```typescript
{
  data: Array<{
    id: UUID;
    name: string;
    order: number;
    description: string | null;
    is_default: boolean;
    created_at: string; // ISO timestamp
  }> | null;
  error: PostgrestError | null;
}
```

**RLS Policy**: Anyone can read instruction levels

---

### Create Instruction Level

**Operation**: `INSERT` new instruction level

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('instruction_levels')
  .insert({
    name: string, // Required, unique
    order: number, // Required, positive integer
    description: string | null, // Optional
    is_default: boolean // Optional, default: false
  })
  .select()
  .single();
```

**Request Validation**:
- `name`: Required, non-empty, unique (enforced by database)
- `order`: Required, positive integer (used for sorting)
- `description`: Optional
- `is_default`: Optional, defaults to false

**Response**:
```typescript
{
  data: {
    id: UUID;
    name: string;
    order: number;
    description: string | null;
    is_default: boolean;
    created_at: string;
  } | null;
  error: PostgrestError | null;
}
```

**Error Cases**:
- `23505` (unique_violation): Instruction level name already exists
- `42501` (insufficient_privilege): User is not admin

**RLS Policy**: Only admins can insert instruction levels

---

### Update Instruction Level

**Operation**: `UPDATE` existing instruction level

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('instruction_levels')
  .update({
    name: string, // Optional if unchanged
    order: number, // Optional if unchanged
    description: string | null // Optional
  })
  .eq('id', UUID)
  .select()
  .single();
```

**Request Validation**:
- `id`: Required, must exist
- `name`: If provided, must be unique (enforced by database)
- `order`: If provided, must be positive integer
- `description`: Optional

**Response**:
```typescript
{
  data: {
    id: UUID;
    name: string;
    order: number;
    description: string | null;
    is_default: boolean;
    created_at: string;
  } | null;
  error: PostgrestError | null;
}
```

**Error Cases**:
- `23505` (unique_violation): New instruction level name already exists
- `42501` (insufficient_privilege): User is not admin
- `PGRST116` (no rows found): Instruction level ID does not exist

**RLS Policy**: Only admins can update instruction levels

---

### Delete Instruction Level

**Operation**: `DELETE` instruction level

**Prerequisites**: Check if instruction level is used by cards

**Supabase Query**:
```javascript
// First: Check card count
const { count, error: countError } = await supabase
  .from('cards')
  .select('*', { count: 'exact', head: true })
  .eq('instruction_level_id', UUID);

// Then: Delete instruction level (if confirmed)
const { data, error } = await supabase
  .from('instruction_levels')
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
- `PGRST116` (no rows found): Instruction level ID does not exist

**RLS Policy**: Only admins can delete instruction levels

**Note**: Cards with this instruction level will have `instruction_level_id = NULL` after deletion (cascade or manual update).

---

### Get Cards by Instruction Level

**Operation**: Query cards with specific instruction level

**Supabase Query**:
```javascript
const { data, error } = await supabase
  .from('cards')
  .select('*')
  .eq('instruction_level_id', UUID);
```

**Response**: Array of cards with specified instruction level

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
- `23505`: Unique constraint violation (duplicate instruction level name)
- `42501`: Insufficient privilege (not admin)
- `PGRST116`: No rows found (instruction level doesn't exist)

---

## Default Levels

System seeds three default levels during migration:

1. **Beginner** (order: 1, is_default: true)
2. **Intermediate** (order: 2, is_default: true)
3. **Advanced** (order: 3, is_default: true)

Default levels can be edited or deleted by admins if needed.

