import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Log load time
    console.log(`Page load time: ${loadTime}ms`);
    
    // Assert load time is reasonable (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('page loads within performance budget', async ({ page }) => {
    await page.goto('/');
    
    // Measure performance metrics using Performance API
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.domContentLoadedEventStart,
      };
    });

    // DOM should be interactive quickly
    expect(performanceMetrics.domInteractive).toBeLessThan(3000); // 3 seconds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000); // 1 second
  });

  test('flashcard interactions are responsive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const flashcard = page.locator('.flashcard').first();
    
    if (await flashcard.count() > 0) {
      // Measure click response time
      const startTime = Date.now();
      await flashcard.click();
      const clickTime = Date.now() - startTime;
      
      // Click should respond quickly
      expect(clickTime).toBeLessThan(500); // 500ms max
      
      console.log(`Flashcard click response time: ${clickTime}ms`);
    } else {
      test.skip();
    }
  });

  test('card filtering is fast', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to card management
    const cardManagerLink = page.locator('a, button').filter({ hasText: /cards|manage/i });
    
    if (await cardManagerLink.count() > 0) {
      await cardManagerLink.first().click();
      await page.waitForTimeout(1000);
      
      // Measure filter operation
      const filterSelect = page.locator('select').first();
      
      if (await filterSelect.count() > 0) {
        const startTime = Date.now();
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(100); // Wait for filter to apply
        const filterTime = Date.now() - startTime;
        
        // Filtering should be fast
        expect(filterTime).toBeLessThan(500); // 500ms max
        
        console.log(`Filter operation time: ${filterTime}ms`);
      }
    } else {
      test.skip();
    }
  });

  test('memory usage is reasonable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryInfo) {
      // Check memory usage is reasonable (adjust threshold as needed)
      const memoryUsageMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      expect(memoryUsageMB).toBeLessThan(100); // 100MB max
      
      console.log(`Memory usage: ${memoryUsageMB.toFixed(2)}MB`);
    } else {
      // Memory API not available in all browsers
      console.log('Memory API not available');
    }
  });

  test('network requests are optimized', async ({ page }) => {
    const requests = [];
    
    // Track network requests
    page.on('request', request => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check number of requests
    expect(requests.length).toBeLessThan(100); // Reasonable number of requests
    
    // Check for large assets
    const responses = await Promise.all(
      requests.map(req => 
        page.evaluate(async (url) => {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            return blob.size;
          } catch {
            return 0;
          }
        }, req.url)
      )
    );
    
    // Check total transfer size
    const totalSize = responses.reduce((sum, size) => sum + size, 0);
    const totalSizeMB = totalSize / 1024 / 1024;
    
    expect(totalSizeMB).toBeLessThan(10); // 10MB max total transfer
    
    console.log(`Total transfer size: ${totalSizeMB.toFixed(2)}MB`);
  });
});

