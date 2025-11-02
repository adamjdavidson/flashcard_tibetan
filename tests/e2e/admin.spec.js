import { test, expect } from '@playwright/test';

test.describe('Admin page', () => {
  test('admin page is reachable and renders', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Admin button should be active in nav
    await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();

    // Main app container visible
    await expect(page.locator('.app-main')).toBeVisible();
  });
});


