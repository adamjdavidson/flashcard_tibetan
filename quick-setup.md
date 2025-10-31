# Quick Supabase Setup

Since you've created your Supabase project, here's the fastest way to set it up:

## 1. Get Your Credentials (30 seconds)

Go to Supabase Dashboard → Settings → API and copy:
- **Project URL** 
- **anon public** key
- **service_role** key

## 2. Run This Command

```bash
./setup-supabase.sh
```

Or manually create `.env.local`:

```bash
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

## 3. Run Database Schema (Copy-Paste in Supabase Dashboard)

1. Open `supabase-schema.sql` in this project
2. Copy ALL the SQL (Cmd/Ctrl+A, Cmd/Ctrl+C)
3. Go to Supabase Dashboard → **SQL Editor** → **New query**
4. Paste (Cmd/Ctrl+V)
5. Click **Run** (or Cmd/Ctrl+Enter)

✅ That's it for the database!

## 4. Create Storage Bucket (Dashboard)

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `card-images`
4. Check ✅ **Public bucket**
5. Click **Create**

## 5. Create Admin User (Dashboard)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. **Copy the UUID** shown
5. Go to **SQL Editor** → **New query**
6. Run this (replace UUID):
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('paste-your-uuid-here', 'admin');
   ```

## Done! 

Now test:
```bash
npm run dev
```

Navigate to "Manage Cards" and log in!

