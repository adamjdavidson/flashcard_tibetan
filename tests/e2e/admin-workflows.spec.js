import { test, expect } from '@playwright/test';

test.describe('Admin workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Statistics tab shows admin stats UI', async ({ page }) => {
    await page.getByRole('button', { name: /^statistics$/i }).click();
    await expect(page.getByRole('heading', { name: /system statistics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('User Management tab shows users UI', async ({ page }) => {
    await page.getByRole('button', { name: /^user management$/i }).click();
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
    // Create user form elements
    await expect(page.getByRole('heading', { name: /create new user/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create user/i })).toBeVisible();
  });

  test('Card Review tab shows review UI', async ({ page }) => {
    await page.getByRole('button', { name: /^card review$/i }).click();
    // Header in AdminCardReview
    await expect(page.getByRole('heading', { name: /user-created cards/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });
});


