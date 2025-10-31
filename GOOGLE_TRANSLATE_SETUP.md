# Google Translate API Setup Guide

This guide walks you through setting up Google Cloud Translation API for Tibetan translations.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `tibetan-flashcards` (or your choice)
5. Click **"Create"**

## Step 2: Enable Translation API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Cloud Translation API"**
3. Click on **"Cloud Translation API"**
4. Click **"Enable"**

## Step 3: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"**
3. Select **"API key"**
4. Copy the API key (you'll need this)
5. **(Important)** Click **"Restrict Key"** for security:
   - Under **"API restrictions"**, select **"Restrict key"**
   - Choose **"Cloud Translation API"** only
   - Under **"Application restrictions"**, you can optionally restrict to:
     - **"HTTP referrers"** → Add your Vercel domain (e.g., `https://your-app.vercel.app/*`)
   - Click **"Save"**

## Step 4: Set Up Billing (Required)

Google Cloud requires billing to be enabled, even for free tier:

1. Go to **"Billing"** in Google Cloud Console
2. Click **"Link a billing account"**
3. Follow the prompts to set up billing
4. **Note**: Google offers $300 free credits and Translation API has a generous free tier:
   - 500,000 characters/month free
   - Then $20 per million characters

## Step 5: Configure Environment Variables

### For Local Development (.env.local)

Add to your `.env.local` file:

```env
TRANSLATION_API_KEY=your-google-api-key-here
TRANSLATION_SERVICE=google
```

Or you can use:

```env
GOOGLE_TRANSLATE_API_KEY=your-google-api-key-here
TRANSLATION_SERVICE=google
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **"Settings"** → **"Environment Variables"**
3. Add these variables:

```
TRANSLATION_API_KEY=your-google-api-key-here
TRANSLATION_SERVICE=google
```

Or:

```
GOOGLE_TRANSLATE_API_KEY=your-google-api-key-here
TRANSLATION_SERVICE=google
```

## Step 6: Test the API

After setting up the environment variable:

1. Restart your dev server: `npm run dev`
2. Go to **"Manage Cards"** → **"Quick Translate & Add Cards"**
3. Enter an English word (e.g., "Eye")
4. Click **"Translate"**
5. You should see the Tibetan translation appear!

## Troubleshooting

### "Translation API key not configured"
- Check that `.env.local` exists and has the correct key
- Restart dev server after adding environment variable
- For Vercel, ensure environment variable is set in dashboard

### "Translation API error: 403"
- API key might be restricted - check restrictions in Google Cloud Console
- Make sure Cloud Translation API is enabled
- Verify billing is set up

### "Translation API error: 400"
- Check that the API key is valid
- Verify the language codes are correct (Tibetan = 'bo')

### API Not Working Locally (404 Error)
**IMPORTANT**: Vercel serverless functions (`/api/*`) **don't work** with `npm run dev`. You need Vercel CLI:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install --save-dev vercel
   ```

2. **Use Vercel dev server instead**:
   ```bash
   npm run dev:vercel
   ```
   
   Or directly:
   ```bash
   npx vercel dev
   ```

3. **This will start both**:
   - Vite dev server (frontend) 
   - Vercel API server (`/api/*` routes)

4. **Your app will be at**: `http://localhost:3000` (not 5174)

**Note**: You can still use `npm run dev` for frontend-only development, but API routes won't work.

### Running via SSH (DigitalOcean/Remote Server)
If you're running via SSH on a remote server:
- Use `npm run dev:vercel:remote` to listen on all interfaces (0.0.0.0)
- Or use SSH port forwarding: `ssh -L 3000:localhost:3000 user@your-server`
- See `SSH_DEV_SETUP.md` for detailed instructions

## Language Codes

- English: `en`
- Tibetan: `bo` (ISO 639-1 code)

## API Limits & Pricing

- **Free Tier**: 500,000 characters/month
- **After Free Tier**: $20 per million characters
- **Quota**: Default is 1 million characters/day (can be increased)

## Security Best Practices

1. ✅ Restrict API key to Cloud Translation API only
2. ✅ Restrict API key to your Vercel domain (for production)
3. ✅ Never commit API key to git (already in .gitignore)
4. ✅ Rotate keys periodically
5. ✅ Monitor usage in Google Cloud Console

## Next Steps

Once translation is working:
1. Set up image generation API
2. Set up Unsplash image search
3. Test end-to-end workflow

