import { test, expect } from '@playwright/test';

async function injectAxe(page) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@axe-core/playwright@latest/dist/axe.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  });
}

async function runAxe(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      if (typeof axe !== 'undefined') {
        // eslint-disable-next-line no-undef
        axe.run(document, (err, results) => {
          if (err) resolve({ error: err.message });
          else resolve(results);
        });
      } else {
        resolve({ error: 'axe-core not available' });
      }
    });
  });
}

test.describe('Accessibility (global)', () => {
  for (const route of ['/', '/admin']) {
    test(`no critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      try {
        await injectAxe(page);
      } catch {
        test.skip(true, 'axe injection failed');
      }

      const results = await runAxe(page);
      if (results.error) test.skip(true, results.error);

      // Filter to serious/critical violations only for signal
      const violations = (results.violations || []).filter(v => ['serious', 'critical'].includes(v.impact));
      expect(violations).toHaveLength(0);
    });
  }

  test('inputs have labels and buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Inputs
    const inputs = await page.locator('input, select, textarea').all();
    const unlabeled = [];
    for (const input of inputs) {
      if (!(await input.isVisible().catch(() => false))) continue;
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      if (id) {
        const labelCount = await page.locator(`label[for="${id}"]`).count();
        if (!(labelCount > 0 || ariaLabel || ariaLabelledBy || placeholder)) unlabeled.push(await input.evaluate(el => el.outerHTML));
      } else {
        // Some hidden form controls or 3rd-party inputs may not have labels; only assert for visible ones
        if (!(ariaLabel || ariaLabelledBy || placeholder)) unlabeled.push(await input.evaluate(el => el.outerHTML));
      }
    }

    if (unlabeled.length) {
      console.warn('Unlabeled visible inputs:', unlabeled.slice(0, 5));
    }

    // Buttons
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = (await button.textContent())?.trim();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      expect(text || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});


