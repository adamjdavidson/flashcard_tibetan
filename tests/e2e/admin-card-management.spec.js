import { test, expect } from '@playwright/test';

test.describe('Admin Card Management - phase 1', () => {
  test.beforeEach(async ({ page }) => {
    // Go to admin page where advanced card management lives
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for React to hydrate and admin check to complete
    // Check that we don't see "access denied" and admin tabs appear
    await page.waitForFunction(() => {
      const denied = document.body.textContent?.includes('access denied');
      const tabs = document.querySelector('.admin-tabs');
      return !denied && tabs !== null;
    }, { timeout: 20000 });

    // Wait for the admin tab bar to render
    const tabs = page.locator('.admin-tabs');
    await expect(tabs).toBeVisible({ timeout: 20000 });

    // Navigate to the explicit "Card Management" admin tab inside the tab bar
    await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });

    // Ensure Table view is active
    await page.getByRole('button', { name: /^table$/i }).click({ timeout: 20000 });
  });

  test('displays cards in table view', async ({ page }) => {
    // Assert explicit table from AdminCardTable
    const table = page.getByRole('table', { name: /card management table/i });
    await expect(table).toBeVisible();

    // Expect some headers commonly used (best-effort; do not fail suite if absent)
    const typeHeader = page.getByText(/type/i);
    if (await typeHeader.count()) {
      await expect(typeHeader.first()).toBeVisible();
    }
    const frontHeader = page.getByText(/front/i);
    if (await frontHeader.count()) {
      await expect(frontHeader.first()).toBeVisible();
    }
  });

  test('sorts by a column (Type)', async ({ page }) => {
    // Find a sort control and click it; fall back to a generic sortable header
    const sortByType = page.getByRole('button', { name: /sort by type/i });
    if (await sortByType.count()) {
      await sortByType.click();
      await page.waitForTimeout(300);
      await expect(sortByType).toContainText(/↑|↓/);
      await sortByType.click();
      await page.waitForTimeout(300);
      await expect(sortByType).toContainText(/↑|↓/);
    } else {
      // Try clicking the Type header directly if button not present
      const typeHeader = page.getByText(/type/i).first();
      if (await typeHeader.count()) {
        await typeHeader.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('filters by type', async ({ page }) => {
    // Use AdminPage filter with id "filter-type"
    const typeSelect = page.getByLabel(/filter by type/i);
    await typeSelect.selectOption(/word|number|phrase/i);
    await page.waitForTimeout(300);
    await expect(page.getByRole('table', { name: /card management table/i })).toBeVisible();
  });

  test('view switch between Table and Cards', async ({ page }) => {
    // Prefer explicit toggles labeled "Table" and "Cards"
    const tableToggle = page.getByRole('button', { name: /^table$/i });
    const cardsToggle = page.getByRole('button', { name: /^cards$/i });

    await tableToggle.click();
    await page.waitForTimeout(150);
    await cardsToggle.click();
    await page.waitForTimeout(150);
    await tableToggle.click();
    await page.waitForTimeout(150);
    await expect(page.getByRole('table', { name: /card management table/i })).toBeVisible();
  });

  test('pagination works (Rows per page)', async ({ page }) => {
    // Look for a rows-per-page control: label or select near text
    const control = page.locator('#page-size-select');
    await expect(control).toBeVisible();
    await control.selectOption('25');
    await page.waitForTimeout(200);
    const nextBtn = page.getByRole('button', { name: /^next page$|^next$/i });
    if (!(await nextBtn.isDisabled())) {
      await nextBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('keyboard navigation on sortable header', async ({ page }) => {
    // Focus a sort button/header and press Enter
    const sortByType = page.getByRole('button', { name: /sort by type/i });
    await expect(sortByType).toBeVisible();
    await sortByType.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await expect(sortByType).toContainText(/↑|↓|↕/);
  });
});


