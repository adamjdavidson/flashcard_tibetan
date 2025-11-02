import { test, expect } from '@playwright/test';

test('is authenticated', async ({ page }) => {
  await page.goto('/');
  const userIndicator = page.locator('.user-email').or(page.locator('[data-testid="user-menu"]').first());
  await expect(userIndicator).toBeVisible({ timeout: 20000 });
});


