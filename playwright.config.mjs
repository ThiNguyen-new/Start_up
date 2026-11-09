// Playwright E2E cho Survival Kit — xem QA_PLAN.md (mỗi test ghi ID mục trong plan).
// Chạy: pnpm test:e2e   (tự bật `pnpm dev` ở cổng 1313 và bản build ở /Start_up/ cổng 1314)
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
// Máy cá nhân: dùng Edge có sẵn, không phải tải Chromium. CI: Chromium của Playwright.
const browser = isCI ? {} : { channel: 'msedge' };

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  workers: isCI ? 2 : 4,
  retries: isCI ? 1 : 0,
  forbidOnly: isCI,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:1313',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...browser,
  },
  projects: [
    { name: 'desktop-1440', testIgnore: /subpath.spec.mjs/, use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-768', testIgnore: /subpath.spec.mjs/, use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile-375', testIgnore: /subpath.spec.mjs/, use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    // Giả lập GitHub Pages: site nằm trong thư mục con /Start_up/ (nơi từng vỡ ảnh).
    {
      name: 'subpath-github-pages',
      testMatch: /subpath\.spec\.mjs/,
      use: { ...devices['Desktop Chrome'], ...browser, baseURL: 'http://localhost:1314/Start_up/' },
    },
  ],
  webServer: [
    {
      command: 'pnpm dev',
      env: { PORT: '1313' },
      url: 'http://localhost:1313/',
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'pnpm build --destination tests/.site-build && node tests/e2e/serve-subpath.mjs',
      url: 'http://localhost:1314/Start_up/',
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
