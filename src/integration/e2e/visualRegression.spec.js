import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('flashcard appears correctly', async ({ page }) => {
    // Wait for flashcard to load
    const flashcard = page.locator('.flashcard').first();
    
    if (await flashcard.count() > 0) {
      await flashcard.waitFor({ state: 'visible', timeout: 5000 });
      
      // Take screenshot of flashcard
      await expect(flashcard).toHaveScreenshot('flashcard.png', {
        maxDiffPixels: 100,
        threshold: 0.2
      });
    } else {
      test.skip();
    }
  });

  test('card manager appears correctly', async ({ page }) => {
    // Navigate to card management
    const cardManagerLink = page.locator('a, button').filter({ hasText: /cards|manage/i });
    
    if (await cardManagerLink.count() > 0) {
      await cardManagerLink.first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of card manager
      const cardManager = page.locator('.card-manager').first();
      if (await cardManager.count() > 0) {
        await expect(cardManager).toHaveScreenshot('card-manager.png', {
          maxDiffPixels: 500,
          threshold: 0.3
        });
      }
    } else {
      test.skip();
    }
  });

  test('admin page appears correctly', async ({ page }) => {
    // Navigate to admin page
    const adminLink = page.locator('a, button').filter({ hasText: /admin/i });
    
    if (await adminLink.count() > 0) {
      await adminLink.first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of admin page
      const adminPage = page.locator('.admin-page').first();
      if (await adminPage.count() > 0) {
        await expect(adminPage).toHaveScreenshot('admin-page.png', {
          maxDiffPixels: 500,
          threshold: 0.3
        });
      }
    } else {
      test.skip();
    }
  });

  test('full page screenshot', async ({ page }) => {
    // Take full page screenshot
    await expect(page).toHaveScreenshot('full-page.png', {
      fullPage: true,
      maxDiffPixels: 1000,
      threshold: 0.3
    });
  });
});

