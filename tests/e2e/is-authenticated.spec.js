import { test, expect } from '@playwright/test';

test('is authenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.user-email')).toBeVisible({ timeout: 15000 });
});


