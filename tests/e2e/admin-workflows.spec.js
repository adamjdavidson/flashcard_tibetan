import { test, expect } from '@playwright/test';

test.describe('Admin workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
  });

  test('Statistics tab shows admin stats UI', async ({ page }) => {
    const tabs = page.locator('.admin-tabs');
    await tabs.getByRole('button', { name: /^statistics$/i }).click({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: /system statistics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('User Management tab shows users UI', async ({ page }) => {
    const tabs = page.locator('.admin-tabs');
    await tabs.getByRole('button', { name: /^user management$/i }).click({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
    // Create user form elements
    await expect(page.getByRole('heading', { name: /create new user/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create user/i })).toBeVisible();
  });

  test('Card Review tab shows review UI', async ({ page }) => {
    const tabs = page.locator('.admin-tabs');
    await tabs.getByRole('button', { name: /^card review$/i }).click({ timeout: 20000 });
    // Header in AdminCardReview
    await expect(page.getByRole('heading', { name: /user-created cards/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });
});


