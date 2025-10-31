# Local API Development Setup

The API routes (`/api/*`) are Vercel serverless functions and need special setup for local development.

## Option 1: Use Vercel CLI (Recommended)

This is the easiest way to test API routes locally:

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Run with API support**:
   ```bash
   npm run dev:vercel
   ```
   
   Or directly:
   ```bash
   vercel dev
   ```

This will:
- Start Vite dev server for frontend
- Start API server for `/api/*` routes
- Load environment variables from `.env.local`
- Make API routes accessible at `http://localhost:3000/api/*`

## Option 2: Deploy to Vercel (Easiest for Testing)

For quick testing of API functionality:

1. Push code to GitHub
2. Deploy to Vercel (it auto-detects the API routes)
3. Test on the deployed URL

## Option 3: Use Vite Proxy (Workaround)

If you don't want to use Vercel CLI, you can set up a proxy in `vite.config.js`, but this requires additional setup.

## Troubleshooting

### "API route not found" error
- You're running `npm run dev` instead of `vercel dev`
- Use `npm run dev:vercel` or `vercel dev` instead

### Environment variables not loading
- Make sure `.env.local` exists in project root
- Restart the dev server after changing `.env.local`
- For `vercel dev`, it automatically loads `.env.local`

### API returning 404
- Check that you're using `vercel dev` not `npm run dev`
- Verify the API file exists at `/api/translate.js`
- Check browser console for actual error message

