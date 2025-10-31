# Supabase Setup Guide

This guide walks you through setting up Supabase for the Tibetan Flashcard app.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Organization**: Select or create one
   - **Project Name**: `tibetan-flashcards` (or your choice)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine to start
4. Click "Create new project"
5. Wait 2-3 minutes for project to be created

## Step 2: Get API Keys

1. Once project is ready, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

3. Copy these values - you'll need them for environment variables

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the SQL from `supabase-schema.sql` (see below)
4. Click "Run" to execute

The schema creates:
- `user_roles` table for admin/user role management
- `cards` table for flashcard data (shared/global)
- `card_progress` table for per-user progress tracking

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. **Email** provider should already be enabled
3. Optionally configure email templates if needed

## Step 5: Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click "New bucket"
3. Fill in:
   - **Name**: `card-images`
   - **Public bucket**: ✅ Check this (images need to be publicly accessible)
4. Click "Create bucket"
5. Set up policies (done automatically via SQL schema)

## Step 6: Configure Row Level Security (RLS)

The SQL script automatically sets up RLS policies:
- **Cards**: Public read, admin-only write
- **Progress**: Users can only access their own progress
- **Storage**: Public read for card-images bucket

## Step 7: Create First Admin User

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: Your admin email
   - **Password**: Create a password
4. Click "Create user"
5. Copy the user's UUID (you'll need this)

Then in **SQL Editor**, run:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin');
```

Replace `YOUR_USER_UUID_HERE` with the actual UUID from the user you just created.

## Step 8: Set Environment Variables

### Local Development (.env.local)

Create a file `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
TRANSLATION_API_KEY=your_translation_api_key (if using translation)
IMAGE_GENERATION_API_KEY=your_image_api_key (if using image generation)
IMAGE_GENERATION_SERVICE=dalle (or stable-diffusion)
UNSPLASH_ACCESS_KEY=your_unsplash_key (if using Unsplash)
```

## Step 9: Test Connection

After setting up environment variables:

1. Start your dev server: `npm run dev`
2. Open the app in browser
3. Navigate to "Manage Cards"
4. You should see the login screen
5. Log in with your admin credentials
6. The app should connect to Supabase and load cards

## Troubleshooting

### "Supabase not configured" warning
- Check that `.env.local` exists and has correct values
- Restart dev server after adding environment variables

### Authentication errors
- Verify user exists in Authentication → Users
- Check that user_roles table has your user with 'admin' role
- Try signing out and back in

### Database errors
- Verify all SQL scripts ran successfully
- Check RLS policies in **Authentication** → **Policies**

### Image upload errors
- Verify `card-images` bucket exists and is public
- Check bucket policies allow uploads

## Next Steps

1. **Test card creation** - Create a card as admin
2. **Test progress tracking** - Study some cards and verify progress saves
3. **Test image upload** - Upload an image and verify it displays
4. **Test real-time sync** - Open app in two browsers, make changes, see them sync

## Security Notes

- Never commit `.env.local` or `.env` files to git
- Never expose `service_role` key in client-side code
- The `anon` key is safe for client-side use (RLS protects data)
- Always use `service_role` key only in serverless functions

