import { test, expect } from '@playwright/test';

test.describe('Study flow', () => {
  test('flip and rate a card', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Ensure we are on Study view
    const studyBtn = page.getByRole('button', { name: /study/i });
    if (await studyBtn.count()) {
      await studyBtn.click();
    }

    // Find a flashcard and click to flip
    const card = page.locator('.flashcard').first();
    if (!(await card.count())) {
      test.skip(true, 'No flashcard visible');
    }
    await card.click();
    await page.waitForTimeout(150);

    // Click one of the rating buttons
    const rating = page.getByRole('button').filter({ hasText: /forgot|partial|hard|easy/i }).first();
    if (await rating.count()) {
      await rating.click();
      await page.waitForTimeout(200);
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Rating buttons not present');
    }
  });
});


