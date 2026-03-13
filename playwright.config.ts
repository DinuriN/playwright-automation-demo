import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // bumped so retry/trace behavior shows in report
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'always' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
  trace: 'on',
  screenshot: 'on',
  video: 'retain-on-failure',
  actionTimeout: 10000,
},
timeout: 60000,
  projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'], actionTimeout: 10000 } },  
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
],
});