import { test, expect } from '@playwright/test';

test.describe('Admin page', () => {
  test('admin page is reachable and renders', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Admin shell visible (tabs or page container) - use first() for strict mode
    await expect(page.locator('.admin-page,.admin-tabs').first()).toBeVisible({ timeout: 20000 });
    // No access denied
    await expect(page.locator('text=/access denied/i')).toHaveCount(0);
  });
});


