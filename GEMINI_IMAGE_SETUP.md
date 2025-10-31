# Gemini Image Generation Setup Guide

This guide walks you through setting up Google Gemini API for image generation in the flashcard app.

## Why Gemini?

- ✅ **Already using Google services** (Translate API)
- ✅ **Token-based pricing** - Very cost-effective (~$0.039 per image)
- ✅ **Good quality** for educational illustrations
- ✅ **Simple API** - REST endpoint
- ✅ **Fast generation** (typically 5-15 seconds)

## Step 1: Get Gemini API Key

**Important**: The API key from Google AI Studio (aistudio.google.com) **WILL work** for Gemini image generation! Both text and image generation use the same API key and the same Gemini API.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Get API key"**
4. Click **"Create API key in new project"** (or select existing project)
5. **Copy the API key** - you'll need this!

**Verification**: The same API key works for:
- ✅ Gemini text generation (if you use it later)
- ✅ Gemini image generation (gemini-2.5-flash-image model)
- ✅ All Gemini API features

They all use the same `generativelanguage.googleapis.com` endpoint, just different models.

## Step 2: Verify API Key Works (Recommended)

**Quick Test**: Before configuring the app, test if your API key works:

```bash
# Set your API key
export GEMINI_API_KEY=your-api-key-here

# Run the test script
npm run test:gemini
```

Or directly:
```bash
GEMINI_API_KEY=your-key-here node test-gemini-api.js
```

This will:
- ✅ Test if the API key is valid
- ✅ Verify image generation works
- ✅ Show you the response format
- ✅ Give you troubleshooting tips if it fails

## Step 3: Enable Gemini API (if needed)

If you get an error about API not enabled:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Generative Language API"**
5. Click **"Enable"**

**Note**: The API key from Google AI Studio usually works immediately - you only need to enable the API if you get specific errors about it not being enabled.

## Step 4: Configure Environment Variables

### For Local Development (.env.local)

Add to your `.env.local` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
IMAGE_GENERATION_API_KEY=your-gemini-api-key-here
IMAGE_GENERATION_SERVICE=gemini
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **"Settings"** → **"Environment Variables"**
3. Add these variables:

```
GEMINI_API_KEY=your-gemini-api-key-here
IMAGE_GENERATION_API_KEY=your-gemini-api-key-here
IMAGE_GENERATION_SERVICE=gemini
```

## Step 4: Verify API Key Works (Optional Test)

To verify your API key works before testing in the app:

You can test the API key manually using curl:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Create a simple illustration of an eye, educational style, clean background"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "1:1"
      }
    }
  }'
```

Replace `YOUR_API_KEY` with your actual key. If it works, you'll get a base64 encoded image back.

Or use the test script (easier):

```bash
GEMINI_API_KEY=your-key-here npm run test:gemini
```

## Step 5: Test the API in App

After setting up the environment variable:

1. Restart your dev server (use `npm run dev:vercel` for API routes)
2. Go to **"Manage Cards"** → **"Quick Translate & Add Cards"**
3. Enter an English word (e.g., "Eye")
4. Click **"Generate AI Image"**
5. Wait 5-15 seconds (Gemini is faster than DALL-E!)
6. You should see a generated image appear!

## Pricing

**Gemini Image Generation**:
- **Cost**: $30 per 1 million tokens
- **Per image**: 1,290 tokens (flat rate up to 1024x1024px)
- **Cost per image**: ~$0.039 (much cheaper than DALL-E!)

**Comparison**:
- Gemini: ~$0.039 per image
- DALL-E 3: $0.040 per image (standard) or $0.080 (HD)
- Stable Diffusion: ~$0.01-0.05 per image

## Troubleshooting

### "Image generation API key not configured"
- Check that `.env.local` exists and has the correct key
- Restart dev server after adding environment variable
- For Vercel, ensure environment variable is set in dashboard

### "Gemini API error: 403"
- API key might be invalid - check it in Google AI Studio
- Make sure Generative Language API is enabled
- Check API key restrictions in Google Cloud Console

### "Gemini API error: 400"
- Check that the API key is valid
- Verify the prompt isn't too long or empty
- Check API quota limits in Google Cloud Console

### "Gemini API error: 429"
- You've hit rate limits - wait a bit and try again
- Check your usage in Google Cloud Console
- Consider upgrading quota if needed

### Image generation takes too long
- Gemini typically takes 5-15 seconds (faster than DALL-E)
- This is normal - the image is being generated in real-time
- Consider showing a loading indicator

## Model Information

- **Model**: `gemini-2.0-flash-exp` (or `gemini-2.5-flash-image`)
- **Aspect Ratio**: 1:1 (1024x1024) - perfect for flashcards
- **Output Format**: Base64 encoded PNG
- **Quality**: Good for educational illustrations and simple graphics

## Alternative Services

If you want to switch services, change the environment variable:

**DALL-E 3**:
```env
IMAGE_GENERATION_API_KEY=sk-your-openai-key
IMAGE_GENERATION_SERVICE=dalle
```

**Stable Diffusion**:
```env
IMAGE_GENERATION_API_KEY=your-stability-key
IMAGE_GENERATION_SERVICE=stable-diffusion
```

## Security Best Practices

1. ✅ Never commit API key to git (already in .gitignore)
2. ✅ Restrict API key usage if possible in Google Cloud Console
3. ✅ Monitor usage in Google Cloud Console
4. ✅ Set up usage alerts
5. ✅ Rotate keys periodically

## Next Steps

Once image generation is working:
1. Test with various words to see quality
2. Optionally adjust prompts in QuickTranslateForm for better results
3. Set up Unsplash image search as fallback
4. Test image upload to Supabase Storage

