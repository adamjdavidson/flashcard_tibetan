import { defineConfig, devices } from '@playwright/test';

const enableWebKit = !!process.env.WEBKIT;

// Build projects conditionally so WebKit can be enabled only in environments
// that have correct system dependencies (e.g., CI container).
const projects = [
  // Setup project creates storage state via UI login
  { 
    name: 'setup', 
    testMatch: /.*\.setup\.js/,
    timeout: 60000, // 60 seconds for auth setup (CI network latency, Supabase API calls)
  },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
];

if (enableWebKit) {
  projects.push({
    name: 'webkit',
    use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  });
}

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  // CI environments are slower - increase timeouts to accommodate legitimate network/rendering delays
  timeout: process.env.CI ? 60000 : 30000, // 60s in CI, 30s locally
  expect: {
    timeout: process.env.CI ? 30000 : 10000, // 30s in CI, 10s locally
  },
  // Reduce workers in CI to avoid resource contention (tests pass individually but fail in parallel)
  workers: process.env.CI ? 2 : undefined, // 2 workers in CI, default locally
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});


