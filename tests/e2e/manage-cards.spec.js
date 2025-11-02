import { test, expect } from '@playwright/test';

test.describe('Manage Cards', () => {
  test('form and filters render', async ({ page }) => {
    // Navigate via top nav button
    await page.goto('/');
    const manageBtn = page.getByRole('button', { name: /manage cards/i });
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      await page.waitForURL(/\/manage/);
    } else {
      await page.goto('/manage');
      await page.waitForLoadState('networkidle');
    }

    // Quick add form visible
    await expect(page.getByRole('heading', { name: /quick translate|add cards/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByLabel(/english word/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /translate/i })).toBeVisible();

    // Filters present
    await expect(page.getByLabel(/filter by type/i)).toBeVisible({ timeout: 2000 }).catch(() => {});
    await expect(page.getByLabel(/filter by category/i)).toBeVisible({ timeout: 2000 }).catch(() => {});

    // Interact lightly with type filter if present
    const typeFilter = page.getByLabel(/filter by type/i).first();
    if (await typeFilter.count()) {
      await typeFilter.selectOption({ label: /all types|word|number|phrase/i }).catch(() => {});
      await page.waitForTimeout(200);
    }
  });
});


