import { defineConfig, devices } from '@playwright/test';

const enableWebKit = !!process.env.WEBKIT;

// Build projects conditionally so WebKit can be enabled only in environments
// that have correct system dependencies (e.g., CI container).
const projects = [
  // Setup project creates storage state via UI login
  { name: 'setup', testMatch: /.*\.setup\.js/ },
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


