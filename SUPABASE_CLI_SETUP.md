# Supabase CLI Setup Guide

This guide shows you how to use Supabase CLI to manage your database schema and storage policies automatically.

## Prerequisites

Install Supabase CLI:

```bash
npm install --save-dev supabase
```

Or use it via npx (no installation needed):

```bash
npx supabase --help
```

## Quick Setup

### 1. Initialize Supabase Project

If you haven't already:

```bash
npx supabase init
```

This creates a `supabase/` folder in your project.

### 2. Link to Remote Project

Link your local project to your remote Supabase project:

```bash
npx supabase link --project-ref your-project-ref
```

You can find your project ref in: **Supabase Dashboard → Settings → General → Reference ID**

You'll be prompted to enter your database password (the one you set when creating the project).

### 3. Create Storage Bucket (Dashboard)

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. Fill in:
   - **Name**: `card-images`
   - **Public bucket**: ✅ Check this
4. Click **"Create bucket"**

### 4. Apply Storage Policies (CLI)

Run the setup script:

```bash
npm run setup:storage
```

Or manually:

```bash
npx supabase db push
```

This will apply the migration in `supabase/migrations/20241201000000_storage_policies.sql` which sets up the RLS policies.

## How It Works

Supabase CLI uses **migrations** to manage your database schema. Migrations are SQL files in the `supabase/migrations/` folder that are applied in order.

### Migration Files

- `supabase/migrations/20241201000000_storage_policies.sql` - Sets up storage RLS policies

### Applying Migrations

**To remote (production):**
```bash
npx supabase db push
```

**To local (development):**
```bash
npx supabase start
npx supabase migration up
```

### Creating New Migrations

If you need to modify the database schema:

```bash
npx supabase migration new your_migration_name
```

This creates a new migration file in `supabase/migrations/`.

### Viewing Migration Status

```bash
npx supabase migration list
```

## Local Development

You can run Supabase locally for development:

```bash
# Start local Supabase stack
npx supabase start

# This gives you:
# - Local PostgreSQL database
# - Local API endpoint
# - Local Studio (database GUI)
# - Local Auth service
# - Local Storage service
```

Access local services:
- **Studio**: http://localhost:54323
- **API URL**: http://localhost:54321
- **DB URL**: postgresql://postgres:postgres@localhost:54322/postgres

When done:

```bash
npx supabase stop
```

## Benefits of Using CLI

✅ **Declarative**: Schema changes are version-controlled in git  
✅ **Repeatable**: Apply same migrations to multiple environments  
✅ **Safe**: Can review migrations before applying  
✅ **Automated**: Scripts can apply migrations in CI/CD  
✅ **Collaborative**: Team members can share schema changes via git  

## Troubleshooting

### "Project not linked"

Run:
```bash
npx supabase link --project-ref your-project-ref
```

### "Bucket not found"

Create the bucket in Supabase Dashboard first, then run migrations.

### "Migration already applied"

That's fine! Migrations are idempotent (can be run multiple times safely).

## Next Steps

- Learn more: https://supabase.com/docs/guides/cli
- CLI reference: https://supabase.com/docs/reference/cli/introduction

