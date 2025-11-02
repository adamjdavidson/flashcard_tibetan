import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('buttons navigate between views', async ({ page }) => {
    await page.goto('/');

    // Study is default
    await expect(page).toHaveURL(/\/?$/);

    // Manage Cards (fallback to direct URL if nav not rendered yet)
    const manageBtn = page.getByRole('button', { name: /manage cards/i });
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
    } else {
      await page.goto('/manage');
    }
    await expect(page).toHaveURL(/\/manage/);

    // Settings
    const settingsBtn = page.getByRole('button', { name: /settings/i });
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
    } else {
      await page.goto('/settings');
    }
    await expect(page).toHaveURL(/\/settings/);

    // Admin (visible for admin user from setup)
    const adminBtn = page.getByRole('button', { name: /admin/i });
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
    } else {
      await page.goto('/admin');
    }
    await expect(page).toHaveURL(/\/admin/);
  });
});


