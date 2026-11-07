// Giả lập GitHub Pages (/Start_up/): chỉ chạy trong project "subpath-github-pages".
// Bắt lại các lỗi từng gặp: ảnh chip kit gợi ý vỡ, ảnh nhỏ trang chi tiết vỡ.
import { test, expect, PAGES, brokenImages } from './helpers.mjs';

test.describe('Sub-path /Start_up/ (GitHub Pages)', () => {
  for (const path of PAGES) {
    test(`/Start_up/${path} không ảnh vỡ, không 404`, async ({ page, issues }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      if (path === 'build-your-own-kit/') await page.locator('.js-apply-reco').click();
      expect(await brokenImages(page)).toEqual([]);
      await issues.expectNone();
    });
  }

  test('Ảnh chip "Kit gợi ý" nằm trong /Start_up/', async ({ page }) => {
    await page.goto('build-your-own-kit/');
    const srcs = await page.locator('.js-reco-items img').evaluateAll((l) => l.map((i) => new URL(i.src).pathname));
    expect(srcs.length).toBeGreaterThan(0);
    for (const s of srcs) expect(s).toMatch(/^\/Start_up\/images\//);
  });

  test('Thêm vào giỏ: link và ảnh trong giỏ đúng thư mục con', async ({ page }) => {
    await page.goto('products/');
    await page.locator('.js-add-to-cart').first().click();
    await page.locator('.sk-cart-toast a').click();
    await expect(page).toHaveURL(/\/Start_up\/cart-demo\//);
    const src = await page.locator('.sk-cart-thumb img').first().evaluate((i) => new URL(i.src).pathname);
    expect(src).toMatch(/^\/Start_up\//);
  });
});
