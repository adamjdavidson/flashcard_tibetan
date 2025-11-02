/* eslint-env node */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const authFile = 'playwright/.auth/admin.json';

test('authenticate', async ({ page }) => {
  // Load .env.local into process.env if present (Playwright doesn't auto-load Vite env files)
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...rest] = trimmed.split('=');
        if (!key || !rest.length) return;
        const value = rest.join('=').replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = value;
      });
    }
  } catch (err) {
    // Non-fatal: env file may not exist in CI.
    console.warn('auth.setup: could not load .env.local:', err?.message || err);
  }

  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD');

  // Prefer fast/auth via Supabase API to avoid UI brittle flows in CI
  // Sanitize env (secrets may include accidental quotes/whitespace)
  const sanitize = (v) => (v || '').trim().replace(/^['"]|['"]$/g, '');
  const supabaseUrl = sanitize(process.env.VITE_SUPABASE_URL);
  const supabaseKey = sanitize(process.env.VITE_SUPABASE_ANON_KEY);
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.signInWithPassword({ email: sanitize(email), password: sanitize(password) });
    if (error) {
      throw new Error(`Supabase auth failed: ${error.message}`);
    }
    if (!data?.session) {
      throw new Error('Supabase auth returned no session');
    }

    // Open app and inject session in the expected browser storage format
    await page.goto('/');
    const projectRef = new URL(supabaseUrl).host.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    await page.evaluate(({ key, session }) => {
      const value = {
        currentSession: session,
        expiresAt: Math.floor(Date.now() / 1000) + (session?.expires_in ?? 3600),
      };
      localStorage.setItem(key, JSON.stringify(value));
    }, { key: storageKey, session: data.session });
    // Ensure app reads the injected session
    await page.reload();
  } else {
    // Fallback UI login only if Supabase env is not provided (should not happen in CI)
    page.on('console', (msg) => console.log('BROWSER:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER pageerror:', err.message));
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('input#email', { timeout: 20000 });
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.getByRole('button', { name: /sign in/i }).click();
  }

  // Verify UI shows logged-in user
  await expect(page.locator('.user-email')).toBeVisible({ timeout: 20000 });

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});


