import { test, expect } from '@playwright/test';

test.describe('Performance (global)', () => {
  test('home page loads within budget', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadMs = Date.now() - start;
    expect(loadMs).toBeLessThan(5000);
  });

  test('admin table sort is responsive', async ({ page, browserName }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for React to hydrate and admin check to complete
    // Wait for auth loading to disappear AND admin tabs to appear (not access denied)
    // CI environments are slower, so use longer timeout
    const ciTimeout = process.env.CI ? 30000 : 20000;
    
    // Use waitForFunction to check multiple conditions atomically
    await page.waitForFunction(() => {
      const loading = document.querySelector('.admin-page .loading');
      const denied = document.body.textContent?.includes('access denied');
      const tabs = document.querySelector('.admin-tabs');
      // Success: loading gone (or never existed) AND tabs exist AND not denied
      return loading === null && tabs !== null && !denied;
    }, { timeout: ciTimeout });
    
    await page.getByRole('button', { name: /^card management$/i }).click();
    await page.getByRole('button', { name: /^table$/i }).click();
    const sortButton = page.getByRole('button', { name: /sort by type/i });
    const start = Date.now();
    await sortButton.click();
    await page.waitForTimeout(100);
    const dur = Date.now() - start;
    // CI environments are slower, be realistic with thresholds
    // Chromium is fastest, webkit/firefox need more time
    const threshold = browserName === 'chromium' ? 2000 : 5000;
    expect(dur).toBeLessThan(threshold);
  });

  test('network requests are reasonable', async ({ page }) => {
    const requests = [];
    page.on('requestfinished', req => requests.push(req));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(requests.length).toBeLessThan(100);
  });
});


