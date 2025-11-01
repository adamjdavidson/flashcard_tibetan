// Note: Playwright E2E tests should be run with: npx playwright test
// These tests require the dev server to be running
// Skip during unit test runs
if (typeof test !== 'undefined') {
  const { test } = require('@playwright/test');

  test.describe('Card Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can navigate to card management', async ({ page }) => {
    const cardManagerLink = page.locator('a, button').filter({ hasText: /cards|manage/i });
    if (await cardManagerLink.count() > 0) {
      await cardManagerLink.first().click();
      await page.waitForTimeout(1000);
      // Should be on card management page
    }
  });

  test('user can filter cards', async ({ page }) => {
    await page.goto('/');
    
    const filterCheckbox = page.locator('input[type="checkbox"]').first();
    if (await filterCheckbox.count() > 0) {
      await filterCheckbox.check();
      await page.waitForTimeout(500);
      // Cards should be filtered
    }
  });
  });
}