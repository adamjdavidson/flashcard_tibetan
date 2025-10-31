# DALL-E Image Generation Setup Guide

This guide walks you through setting up OpenAI DALL-E 3 for image generation in the flashcard app.

## Step 1: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to **"API Keys"** section

## Step 2: Create API Key

1. Go to **"API keys"** in your OpenAI dashboard
2. Click **"+ Create new secret key"**
3. Give it a name (e.g., "Tibetan Flashcards")
4. **Copy the key immediately** (you won't see it again!)
5. Store it securely

## Step 3: Set Up Billing

OpenAI requires billing to be enabled:

1. Go to **"Settings"** → **"Billing"**
2. Click **"Add payment method"**
3. Add a credit card
4. **Note**: DALL-E 3 pricing:
   - **Standard quality**: $0.040 per image
   - **HD quality**: $0.080 per image
   - **Size**: 1024x1024, 1792x1024, or 1024x1792

## Step 4: Configure Environment Variables

### For Local Development (.env.local)

Add to your `.env.local` file:

```env
IMAGE_GENERATION_API_KEY=sk-your-openai-api-key-here
IMAGE_GENERATION_SERVICE=dalle
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **"Settings"** → **"Environment Variables"**
3. Add these variables:

```
IMAGE_GENERATION_API_KEY=sk-your-openai-api-key-here
IMAGE_GENERATION_SERVICE=dalle
```

## Step 5: Test the API

After setting up the environment variable:

1. Restart your dev server (use `npm run dev:vercel` for API routes)
2. Go to **"Manage Cards"** → **"Quick Translate & Add Cards"**
3. Enter an English word (e.g., "Eye")
4. Click **"Generate AI Image"**
5. Wait a few seconds (DALL-E can take 10-30 seconds)
6. You should see a generated image appear!

## Troubleshooting

### "Image generation API key not configured"
- Check that `.env.local` exists and has the correct key
- Restart dev server after adding environment variable
- For Vercel, ensure environment variable is set in dashboard

### "Image generation error: 401"
- API key might be invalid - check it in OpenAI dashboard
- Make sure there's no extra spaces in the key

### "Image generation error: 429"
- You've hit rate limits - wait a bit and try again
- Check your usage in OpenAI dashboard

### "Image generation error: 402"
- Billing not set up or insufficient credits
- Check billing in OpenAI dashboard

### Image generation takes too long
- DALL-E 3 can take 10-30 seconds per image (this is normal)
- Standard quality is faster than HD
- Consider showing a loading indicator

## API Limits & Pricing

- **Standard quality**: $0.040 per image (1024x1024)
- **HD quality**: $0.080 per image (1024x1024)
- **Rate limits**: Varies by tier (check OpenAI dashboard)
- **Response time**: 10-30 seconds per image

## Alternative: Stability AI Stable Diffusion

If you prefer a cheaper alternative:

1. Sign up at [Stability AI](https://platform.stability.ai/)
2. Get API key
3. Set environment variables:
   ```
   IMAGE_GENERATION_API_KEY=your-stability-key
   IMAGE_GENERATION_SERVICE=stable-diffusion
   ```

**Stability AI Pricing**:
- Free tier: ~4 credits/day
- Pay-as-you-go: $0.01-0.05 per image
- Faster generation (3-10 seconds)

## Security Best Practices

1. ✅ Never commit API key to git (already in .gitignore)
2. ✅ Restrict API key usage if possible
3. ✅ Monitor usage in OpenAI dashboard
4. ✅ Set up usage alerts
5. ✅ Rotate keys periodically

## Next Steps

Once image generation is working:
1. Test with various words to see quality
2. Optionally adjust prompts in QuickTranslateForm for better results
3. Set up Unsplash image search as fallback
4. Test image upload to Supabase Storage

