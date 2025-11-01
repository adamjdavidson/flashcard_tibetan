# Vercel Environment Variables Setup

The admin API endpoints require environment variables to be set in Vercel.

## Required Environment Variables

Add these in your Vercel project settings:

1. **SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`
   - Find it in: Supabase Dashboard → Settings → API → Project URL

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (secret)
   - ⚠️ **IMPORTANT**: Never expose this in client-side code!
   - Find it in: Supabase Dashboard → Settings → API → service_role key
   - This key bypasses Row Level Security (RLS) - keep it secret!

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development (check all)
4. Click **Save**
5. Repeat for `SUPABASE_SERVICE_ROLE_KEY`

## After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **⋮** (three dots) on the latest deployment
   - Click **Redeploy**

Or trigger a new deployment by pushing to your main branch.

## Important Notes

- `VITE_` prefixed variables are **client-side only** and won't work in serverless functions
- Use `SUPABASE_URL` (without `VITE_` prefix) for serverless functions
- The service role key should **NEVER** be in client-side code
- After adding variables, you must redeploy for changes to take effect

## Troubleshooting

If you still see 500 errors after adding variables:

1. Check that variables are set for the correct environment (Production/Preview/Development)
2. Ensure variable names match exactly: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Check Vercel deployment logs for specific error messages
4. Verify your Supabase credentials are correct

