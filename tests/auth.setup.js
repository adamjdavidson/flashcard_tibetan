import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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
  } catch {}

  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD');

  // Go straight to login route so App renders <Auth />
  page.on('console', (msg) => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('BROWSER pageerror:', err.message));
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  // Debug: log current URL and a snippet of HTML
  const debugUrl = page.url();
  const htmlSnippet = await page.content();
  console.log('Setup debug URL:', debugUrl);
  console.log('Setup debug HTML snippet:', htmlSnippet.slice(0, 500));
  try {
    await page.waitForSelector('.auth-container', { timeout: 20000 });
  } catch (e) {
    const bodyText = await page.evaluate(() => document.body && document.body.innerText ? document.body.innerText.slice(0, 2000) : 'no body text');
    console.log('Setup debug body text snippet:', bodyText);
    await page.screenshot({ path: 'playwright/auth-setup.png', fullPage: true }).catch(() => {});
    throw e;
  }

  await page.waitForSelector('input#email', { timeout: 10000 });

  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for logged-in UI (header shows .user-email)
  await expect(page.locator('.user-email')).toBeVisible({ timeout: 20000 });

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});


