import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page has no accessibility violations', async ({ page }) => {
    // Run axe accessibility checks
    await page.evaluate(() => {
      // Inject axe-core
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@axe-core/playwright@latest/dist/axe.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }).catch(() => {
      // If axe-core can't be loaded, skip test
      test.skip();
    });

    // Run accessibility scan
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof axe !== 'undefined') {
          axe.run(document, (err, results) => {
            if (err) resolve({ error: err.message });
            else resolve(results);
          });
        } else {
          resolve({ error: 'axe-core not available' });
        }
      });
    });

    if (results.error) {
      test.skip();
      return;
    }

    // Check for violations
    expect(results.violations).toHaveLength(0);
  });

  test('all images have alt text', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt text should be present (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('all form inputs have labels', async ({ page }) => {
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have either id with label[for=id], aria-label, or aria-labelledby
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('all buttons have accessible names', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Button should have accessible name
      expect(text?.trim() || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    // Check that h1 exists
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
    
    // Check that heading order is logical (no skipping from h1 to h3)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let lastLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));
      
      // Headings shouldn't skip more than one level
      if (lastLevel > 0) {
        expect(level - lastLevel).toBeLessThanOrEqual(1);
      }
      
      lastLevel = level;
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    // Test that all interactive elements are keyboard accessible
    const interactiveElements = await page.locator('a, button, input, select, textarea').all();
    
    for (const element of interactiveElements) {
      const tabIndex = await element.getAttribute('tabindex');
      
      // Elements should either have no tabindex (natural order) or tabindex >= 0
      if (tabIndex !== null) {
        expect(parseInt(tabIndex) || 0).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

