/* eslint-env node */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function logDiag(label, obj) {
  try { console.log(`[AUTH-SETUP] ${label}:`, obj); } catch (e) { void e; }
}

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
  // Pre-flight diagnostics (lengths only; no secrets)
  logDiag('ENV lengths', {
    urlHost: (() => { try { return new URL(supabaseUrl).host; } catch { return 'invalid-url'; } })(),
    anonKeyLen: supabaseKey.length,
    emailLen: sanitize(email).length,
    pwdLen: sanitize(password).length
  });
  const supaHost = (() => { try { return new URL(supabaseUrl).host; } catch { return ''; } })();
  page.on('response', (resp) => {
    try {
      const u = new URL(resp.url());
      if (supaHost && u.host.includes(supaHost)) {
        console.log(`[NET] ${resp.status()} ${resp.request().method()} ${resp.url()}`);
      }
    } catch (e) { void e; }
  });
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.signInWithPassword({ email: sanitize(email), password: sanitize(password) });
    if (error) {
      throw new Error(`Supabase auth failed: ${error.message}`);
    }
    if (!data?.session) {
      throw new Error('Supabase auth returned no session');
    }

    // Compute keys/values for pre-boot injection
    // Supabase SDK v2 storage format: session object directly (not wrapped)
    const projectRef = new URL(supabaseUrl).host.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const safeSession = JSON.parse(JSON.stringify(data.session));
    logDiag('Inject keys', { storageKey, sessionKeys: Object.keys(safeSession) });

    // Stamp BEFORE app boot - use the exact session format the SDK expects
    await page.addInitScript(({ storageKey, session }) => {
      try {
        // Store session in the format Supabase SDK v2 expects
        localStorage.setItem(storageKey, JSON.stringify(session));
        console.log('[AUTH-SETUP] addInitScript stamped:', storageKey);
      } catch (e) { console.error('[AUTH-SETUP] init inject failed:', e && (e.message || String(e))); }
    }, { storageKey, session: safeSession });

    // Load the app
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify storage immediately
    const keysPost = await page.evaluate(() => Object.keys(localStorage));
    logDiag('localStorage keys (post-boot)', keysPost);
    logDiag('auth storage present (post-boot)', keysPost.includes(storageKey) || keysPost.includes(legacyKey));

    // Ensure SDK knows about the session as well
    await page.evaluate(async ({ url, key, session }) => {
      try {
        const mod = await import('https://esm.sh/@supabase/supabase-js@2');
        const supa = mod.createClient(url, key);
        const res = await supa.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        console.log('[AUTH-SETUP] setSession result', res && res.data ? 'ok' : 'no-data');
      } catch (e) {
        console.error('[AUTH-SETUP] setSession error', e && (e.message || String(e)));
      }
    }, { url: supabaseUrl, key: supabaseKey, session: safeSession });

    // Give SDK time to persist, then reload fully
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // CRITICAL: Wait for auth state to fully initialize after reload
    // Poll until the session is restored by the Supabase SDK
    const authRestored = await page.evaluate(async ({ url, key, maxWait = 10000 }) => {
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        try {
          const mod = await import('https://esm.sh/@supabase/supabase-js@2');
          const client = mod.createClient(url, key);
          const { data: { user } } = await client.auth.getUser();
          if (user?.id) {
            return { success: true, userId: user.id, elapsed: Date.now() - start };
          }
        } catch (e) {
          // SDK might not be ready yet
        }
        await new Promise(r => setTimeout(r, 200));
      }
      return { success: false, elapsed: Date.now() - start };
    }, { url: supabaseUrl, key: supabaseKey });
    logDiag('auth restoration after reload', authRestored);

    if (!authRestored.success) {
      throw new Error('Session not restored after reload - auth state not persisting');
    }

    // Deep inspect storage values
    const storageAfter = await page.evaluate(() => Object.keys(localStorage));
    logDiag('localStorage keys after setSession', storageAfter);
    const preview = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        items[k] = (localStorage.getItem(k) || '').slice(0, 64) + '...';
      }
      return items;
    });
    logDiag('storage item preview', preview);

    // Promote CI user to admin using service role (if provided)
    const serviceRole = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const userId = authRestored.userId || safeSession.user?.id || data.session.user?.id;

    if (serviceRole) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRole);
        const { error: upsertErr } = await adminClient
          .from('user_roles')
          .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
        if (upsertErr) logDiag('Promote-admin upsert error', upsertErr.message);

        // Poll until row is visible to the anon client (what the app uses) with longer timeout
        const start = Date.now();
        let gotAdmin = false;
        while (Date.now() - start < 15000) {
          // Check via anon client (RLS-filtered, like the app)
          const roleCheck = await page.evaluate(async ({ url, key, uid }) => {
            try {
              const mod = await import('https://esm.sh/@supabase/supabase-js@2');
              const s = mod.createClient(url, key);
              const row = await s.from('user_roles').select('role').eq('user_id', uid).maybeSingle();
              return { role: row.data?.role || null, error: row.error?.message };
            } catch (err) {
              return { error: err && (err.message || String(err)) };
            }
          }, { url: supabaseUrl, key: supabaseKey, uid: userId });

          if (roleCheck.role === 'admin') {
            gotAdmin = true;
            break;
          }
          await new Promise(r => setTimeout(r, 500));
        }
        logDiag('Promote-admin result', { userId, gotAdmin });

        if (!gotAdmin) {
          console.warn('[AUTH-SETUP] WARNING: Admin role not confirmed via anon client - tests may fail');
        }
      } catch (e) {
        logDiag('Promote-admin exception', e && (e.message || String(e)));
      }
    } else {
      logDiag('Promote-admin skipped', 'SUPABASE_SERVICE_ROLE_KEY not set');
    }

    // Final verification: Check both user and role via anon client
    const finalCheck = await page.evaluate(async ({ url, key }) => {
      try {
        const mod = await import('https://esm.sh/@supabase/supabase-js@2');
        const s = mod.createClient(url, key);
        const me = await s.auth.getUser();
        const uid = me?.data?.user?.id || null;
        if (!uid) return { uid: null, role: null, authenticated: false };
        const row = await s.from('user_roles').select('role').eq('user_id', uid).maybeSingle();
        return { uid, role: row.data?.role || null, authenticated: true };
      } catch (err) {
        return { error: err && (err.message || String(err)), authenticated: false };
      }
    }, { url: supabaseUrl, key: supabaseKey });
    logDiag('Final auth check via anon client', finalCheck);

    if (!finalCheck.authenticated) {
      throw new Error('User not authenticated after setup - session not persisting properly');
    }
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

  // Verify UI shows logged-in user - poll until auth UI appears
  try {
    const headerText = await page.evaluate(() => {
      const h = document.querySelector('.app-header') || document.body;
      return (h && h.textContent ? h.textContent.slice(0, 500) : 'no header text');
    });
    logDiag('headerText snippet', headerText);
  } catch (e) { void e; }

  // Wait for the app's useAuth hook to initialize and update the UI
  // This is critical - the app needs time to call getSession() and update state
  logDiag('Waiting for app auth UI to render...', 'polling for user indicator');
  const uiReady = await page.evaluate(async () => {
    const start = Date.now();
    while (Date.now() - start < 15000) {
      // Check if any user indicator is visible
      const userEmail = document.querySelector('.user-email');
      const userMenu = document.querySelector('[data-testid="user-menu"]');
      if ((userEmail && userEmail.offsetParent !== null) ||
          (userMenu && userMenu.offsetParent !== null)) {
        return { success: true, elapsed: Date.now() - start, indicator: userEmail ? 'user-email' : 'user-menu' };
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return { success: false, elapsed: Date.now() - start };
  });
  logDiag('App UI auth state', uiReady);

  await page.screenshot({ path: 'playwright/setup-after-reload.png', fullPage: true }).catch(() => {});

  if (!uiReady.success) {
    const pageContent = await page.evaluate(() => document.body.textContent?.slice(0, 500) || '');
    logDiag('page content on UI failure', pageContent);
    await page.screenshot({ path: 'playwright/auth-ui-failed.png', fullPage: true }).catch(() => {});
    throw new Error('App UI did not reflect authenticated state - useAuth may not be initializing properly');
  }

  // Final sanity check: user indicator is visible
  try {
    await expect(page.locator('.user-email, [data-testid="user-menu"]').first()).toBeVisible({ timeout: 2000 });
  } catch (error) {
    throw new Error(`User indicator not visible even after polling: ${error.message}`);
  }

  logDiag('Auth setup complete', 'saving storage state');
  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});


