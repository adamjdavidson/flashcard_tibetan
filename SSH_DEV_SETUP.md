# SSH/Remote Development Setup

This guide helps you run the app via SSH on DigitalOcean (or any remote server).

## Running on Remote Server via SSH

### Step 1: Install Vercel CLI

SSH into your DigitalOcean droplet:
```bash
ssh user@your-droplet-ip
cd /home/adamd/projects/flashcards
npm install --save-dev vercel
```

### Step 2: Run Vercel Dev Server

Start the dev server:
```bash
npm run dev:vercel
```

This will start both:
- Frontend server (usually port 3000)
- API routes (`/api/*`)

### Step 3: Access from Your Local Machine

You have **two options**:

#### Option A: SSH Port Forwarding (Recommended)

On your **local machine**, set up port forwarding:
```bash
ssh -L 3000:localhost:3000 user@your-droplet-ip
```

Then access the app at `http://localhost:3000` in your local browser.

#### Option B: Access via Droplet IP

1. **Allow firewall access** (if using UFW):
   ```bash
   sudo ufw allow 3000/tcp
   ```

2. **Access directly**:
   - `http://your-droplet-ip:3000`

3. **Make vercel dev listen on all interfaces**:
   - Run: `vercel dev --listen 0.0.0.0:3000`
   - Or update the script in `package.json`

### Step 4: Keep Server Running

To keep the server running after you disconnect SSH:

**Option 1: Use `screen`**:
```bash
screen -S flashcards
npm run dev:vercel
# Press Ctrl+A then D to detach
# To reattach: screen -r flashcards
```

**Option 2: Use `tmux`**:
```bash
tmux new -s flashcards
npm run dev:vercel
# Press Ctrl+B then D to detach
# To reattach: tmux attach -t flashcards
```

**Option 3: Use `nohup`**:
```bash
nohup npm run dev:vercel > dev.log 2>&1 &
```

## Environment Variables

Make sure `.env.local` is set up on the remote server:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
TRANSLATION_API_KEY=your-google-api-key
TRANSLATION_SERVICE=google
```

## Troubleshooting

### Can't access on port 3000
- Check firewall: `sudo ufw status`
- Allow port: `sudo ufw allow 3000/tcp`
- Check if port is in use: `netstat -tuln | grep 3000`

### Vercel dev only listening on localhost
- Run: `vercel dev --listen 0.0.0.0:3000`
- Or update package.json script to include `--listen 0.0.0.0:3000`

### API routes still 404
- Make sure you're using `npm run dev:vercel` not `npm run dev`
- Check that vercel CLI is installed: `npx vercel --version`

## Production Alternative

Instead of running dev server on DigitalOcean, consider:
1. **Deploy to Vercel** (easiest) - API routes work automatically
2. **Use DigitalOcean App Platform** - similar to Vercel
3. **Build and serve static files** - Use nginx + Node.js API server

