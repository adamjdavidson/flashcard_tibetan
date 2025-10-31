# Supabase Quick Start - Copy & Paste Ready

You've created your Supabase project. Here's everything ready to copy:

## ✅ Step 1: Set Environment Variables

Create `.env.local` file in project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get these from: **Supabase Dashboard → Settings → API**

## ✅ Step 2: Run Database Schema

1. Open the file `supabase-schema.sql` in this project
2. **Select ALL** (Ctrl/Cmd + A)
3. **Copy** (Ctrl/Cmd + C)
4. Go to **Supabase Dashboard → SQL Editor**
5. Click **"New query"**
6. **Paste** (Ctrl/Cmd + V)
7. Click **"Run"** button (or press Ctrl/Cmd + Enter)

The file is located at: `./supabase-schema.sql` (169 lines)

## ✅ Step 3: Create Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. **Name:** `card-images`
4. ✅ Check **"Public bucket"**
5. Click **"Create bucket"**

## ✅ Step 4: Create Admin User & Set Role

1. Go to **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - Email: your email
   - Password: create a password
4. Click **"Create user"**
5. **Copy the UUID** shown (looks like: `abc123-def456-...`)
6. Go to **SQL Editor → New query**
7. Paste this (replace the UUID):

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('6e9fd3bf-b1c2-40b8-8621-4f1162932a6a', 'admin');
```

8. Click **"Run"**

## ✅ Step 5: Test It!

```bash
npm run dev
```

1. Open http://localhost:5173
2. Click **"Manage Cards"**
3. Log in with your admin credentials
4. You should see the card management interface!

## 🎉 Done!

Your Supabase setup is complete. The app will:
- ✅ Save cards to Supabase (shared/global)
- ✅ Save progress per user
- ✅ Sync in real-time across devices
- ✅ Store images in Supabase Storage

