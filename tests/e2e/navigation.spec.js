import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('buttons navigate between views', async ({ page }) => {
    await page.goto('/');

    // Study is default
    await expect(page).toHaveURL(/\/?$/);

    // Manage Cards
    const manageBtn = page.getByRole('button', { name: /manage cards/i });
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();
    await expect(page).toHaveURL(/\/manage/);

    // Settings
    const settingsBtn = page.getByRole('button', { name: /settings/i });
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await expect(page).toHaveURL(/\/settings/);

    // Admin (visible for admin user from setup)
    const adminBtn = page.getByRole('button', { name: /admin/i });
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();
    await expect(page).toHaveURL(/\/admin/);
  });
});


