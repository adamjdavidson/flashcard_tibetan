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
  test.setTimeout(60000); // 60 seconds for CI (network latency, Supabase API calls, auth polling)
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
    logDiag('Starting Supabase auth', 'signInWithPassword');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authStart = Date.now();
    const { data, error } = await supabase.auth.signInWithPassword({ email: sanitize(email), password: sanitize(password) });
    logDiag('Supabase auth completed', { elapsed: Date.now() - authStart, hasError: !!error, hasSession: !!data?.session });
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
    const userId = safeSession.user?.id || data.session.user?.id;
    logDiag('Inject keys', { storageKey, sessionKeys: Object.keys(safeSession), userId });

    // PROMOTE TO ADMIN BEFORE APP BOOTS - app's first render will see admin role
    const serviceRole = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (serviceRole) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRole);
        const { error: upsertErr } = await adminClient
          .from('user_roles')
          .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
        if (upsertErr) logDiag('Promote-admin upsert error', upsertErr.message);

        // Confirm row exists via service client
        const start = Date.now();
        let gotAdmin = false;
        while (Date.now() - start < 8000) {
          const { data: roleRow } = await adminClient
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
          if (roleRow?.role === 'admin') { gotAdmin = true; break; }
          await new Promise(r => setTimeout(r, 250));
        }
        logDiag('Promote-admin (before boot)', { userId, gotAdmin });
      } catch (e) {
        logDiag('Promote-admin exception', e && (e.message || String(e)));
      }
    } else {
      logDiag('Promote-admin skipped', 'SUPABASE_SERVICE_ROLE_KEY not set');
    }

    // Stamp BEFORE app boot - use the exact session format the SDK expects
    await page.addInitScript(({ storageKey, session }) => {
      try {
        // Store session in the format Supabase SDK v2 expects
        localStorage.setItem(storageKey, JSON.stringify(session));
        console.log('[AUTH-SETUP] addInitScript stamped:', storageKey);
      } catch (e) { console.error('[AUTH-SETUP] init inject failed:', e && (e.message || String(e))); }
    }, { storageKey, session: safeSession });

    // Load the app
    logDiag('Navigating to app', '/');
    const gotoStart = Date.now();
    await page.goto('/');
    logDiag('Page navigation completed', { elapsed: Date.now() - gotoStart });
    logDiag('Waiting for domcontentloaded', 'initial load');
    await page.waitForLoadState('domcontentloaded');
    logDiag('domcontentloaded reached', 'initial load complete');

    // Verify storage immediately
    const keysPost = await page.evaluate(() => Object.keys(localStorage));
    logDiag('localStorage keys (post-boot)', keysPost);
    logDiag('auth storage present (post-boot)', keysPost.includes(storageKey));

    // Ensure SDK knows about the session as well
    logDiag('Calling setSession in browser', 'ensuring SDK knows about session');
    const setSessionStart = Date.now();
    const setSessionResult = await page.evaluate(async ({ url, key, session }) => {
      try {
        const mod = await import('https://esm.sh/@supabase/supabase-js@2');
        const supa = mod.createClient(url, key);
        const res = await supa.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        return { success: true, hasData: !!(res && res.data), error: null };
      } catch (e) {
        return { success: false, hasData: false, error: e && (e.message || String(e)) };
      }
    }, { url: supabaseUrl, key: supabaseKey, session: safeSession });
    logDiag('setSession completed', { elapsed: Date.now() - setSessionStart, ...setSessionResult });

    // Give SDK time to persist, then reload fully
    logDiag('Before reload', 'waiting 1s then reloading');
    await page.waitForTimeout(1000);
    logDiag('Reloading page', 'starting reload');
    await page.reload();
    logDiag('After reload', 'waiting for domcontentloaded');
    // Use domcontentloaded instead of networkidle - networkidle can hang in CI
    // due to background requests (token refresh, analytics, etc.)
    await page.waitForLoadState('domcontentloaded');
    logDiag('After domcontentloaded', 'starting auth restoration polling');

    // CRITICAL: Wait for auth state to fully initialize after reload
    // Poll until the session is restored by the Supabase SDK
    logDiag('Starting auth restoration polling', 'maxWait: 10000ms');
    const authRestored = await page.evaluate(async ({ url, key, maxWait = 10000 }) => {
      const start = Date.now();
      let attempt = 0;
      while (Date.now() - start < maxWait) {
        attempt++;
        try {
          const mod = await import('https://esm.sh/@supabase/supabase-js@2');
          const client = mod.createClient(url, key);
          const { data: { user } } = await client.auth.getUser();
          if (user?.id) {
            console.log(`[AUTH-SETUP] Auth restored on attempt ${attempt}, elapsed: ${Date.now() - start}ms`);
            return { success: true, userId: user.id, elapsed: Date.now() - start, attempts: attempt };
          }
        } catch (e) {
          // SDK might not be ready yet
          if (attempt % 5 === 0) {
            console.log(`[AUTH-SETUP] Auth restoration attempt ${attempt}, error:`, e && (e.message || String(e)));
          }
        }
        await new Promise(r => setTimeout(r, 200));
      }
      console.log(`[AUTH-SETUP] Auth restoration failed after ${attempt} attempts, elapsed: ${Date.now() - start}ms`);
      return { success: false, elapsed: Date.now() - start, attempts: attempt };
    }, { url: supabaseUrl, key: supabaseKey });
    logDiag('auth restoration after reload', authRestored);

    if (!authRestored.success) {
      logDiag('AUTH RESTORATION FAILED', `elapsed: ${authRestored.elapsed}ms`);
      throw new Error('Session not restored after reload - auth state not persisting');
    }
    logDiag('Auth restoration succeeded', 'continuing to final checks');

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

    // Verify role via anon client (poll for session hydration first)
    // Since we promoted BEFORE boot, the app should already see admin role
    const finalCheck = await page.evaluate(async ({ url, key }) => {
      try {
        const mod = await import('https://esm.sh/@supabase/supabase-js@2');
        const s = mod.createClient(url, key);

        // Poll for session hydration (avoid uid: null race condition)
        let uid = null;
        for (let i = 0; i < 12; i++) {
          const sess = await s.auth.getSession();
          uid = sess?.data?.session?.user?.id || null;
          if (uid) break;
          await new Promise(r => setTimeout(r, 250));
        }

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

    if (finalCheck.role !== 'admin') {
      console.warn('[AUTH-SETUP] WARNING: Admin role not visible to anon client - tests may fail');
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
  logDiag('Waiting for app auth UI to render...', 'polling for user indicator, maxWait: 15000ms');
  const uiReady = await page.evaluate(async () => {
    const start = Date.now();
    let attempt = 0;
    while (Date.now() - start < 15000) {
      attempt++;
      // Check if any user indicator is visible
      const userEmail = document.querySelector('.user-email');
      const userMenu = document.querySelector('[data-testid="user-menu"]');
      const emailVisible = userEmail && userEmail.offsetParent !== null;
      const menuVisible = userMenu && userMenu.offsetParent !== null;
      if (emailVisible || menuVisible) {
        console.log(`[AUTH-SETUP] UI indicator found on attempt ${attempt}, elapsed: ${Date.now() - start}ms`);
        return { success: true, elapsed: Date.now() - start, indicator: emailVisible ? 'user-email' : 'user-menu', attempts: attempt };
      }
      if (attempt % 10 === 0) {
        console.log(`[AUTH-SETUP] UI polling attempt ${attempt}, elapsed: ${Date.now() - start}ms, email exists: ${!!userEmail}, menu exists: ${!!userMenu}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`[AUTH-SETUP] UI indicator not found after ${attempt} attempts, elapsed: ${Date.now() - start}ms`);
    return { success: false, elapsed: Date.now() - start, attempts: attempt };
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
  logDiag('Final visibility check', 'expecting user indicator to be visible');
  try {
    await expect(page.locator('.user-email, [data-testid="user-menu"]').first()).toBeVisible({ timeout: 2000 });
    logDiag('Final visibility check passed', 'user indicator is visible');
  } catch (error) {
    logDiag('Final visibility check failed', error.message);
    throw new Error(`User indicator not visible even after polling: ${error.message}`);
  }

  logDiag('Auth setup complete', 'saving storage state');
  fs.mkdirSync('playwright/.auth', { recursive: true });
  const saveStart = Date.now();
  await page.context().storageState({ path: authFile });
  logDiag('Storage state saved', { elapsed: Date.now() - saveStart, path: authFile });
});
