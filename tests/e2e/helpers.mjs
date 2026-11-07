// Tiện ích dùng chung cho test E2E.
import { test as base, expect } from '@playwright/test';

/** Các trang chính của site (đường dẫn tương đối, không có "/" đầu để chạy được cả ở /Start_up/). */
export const PAGES = [
  '', 'products/', 'products/club-survival-kit/', 'build-your-own-kit/', 'schedule-rescue/',
  'send-rescue/', 'cart-demo/', 'faq/', 'contact/', 'blog/', 'blog/chay-deadline-nhom/', 'terms-conditions/',
];

/** Ngày YYYY-MM-DD theo giờ Việt Nam, cộng thêm `days` ngày. */
export function isoDate(days = 0) {
  const now = new Date(Date.now() + 7 * 3600 * 1000); // UTC+7
  now.setUTCDate(now.getUTCDate() + days);
  return now.toISOString().slice(0, 10);
}

/**
 * Fixture `issues`: tự ghi lỗi console, lỗi JS và request >= 400 (cùng origin).
 * Gọi `await issues.expectNone()` cuối test để fail kèm danh sách lỗi.
 */
export const test = base.extend({
  issues: async ({ page }, use) => {
    const list = [];
    page.on('pageerror', (e) => list.push(`JS error: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') list.push(`console.error: ${m.text()}`); });
    page.on('response', (r) => {
      const u = new URL(r.url());
      if (r.status() >= 400 && u.hostname === 'localhost') list.push(`HTTP ${r.status()}: ${u.pathname}`);
    });
    await use({
      list,
      expectNone: async () => expect(list, `Có lỗi trên trang:\n${list.join('\n')}`).toEqual([]),
    });
  },
});
export { expect };

/** Ảnh đã tải xong nhưng hỏng (naturalWidth = 0). Trả về danh sách src. */
export async function brokenImages(page) {
  await page.evaluate(async () => {
    // Cuộn hết trang để ảnh lazy được tải.
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  return page.evaluate(() => [...document.images]
    .filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0)
    .map((i) => i.getAttribute('src')));
}

/** Xóa sessionStorage của site trước khi test (giỏ hàng, panic level...). */
export async function freshSession(page, path = '') {
  await page.goto(path);
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(path);
}

/** Thêm sản phẩm đầu tiên ở trang danh sách vào giỏ, trả về tên. */
export async function addFirstProduct(page) {
  await page.goto('products/');
  const btn = page.locator('.js-add-to-cart').first();
  const name = await btn.getAttribute('data-item-name');
  await btn.click();
  return name;
}

/** Mobile/tablet (dưới 992px) thì menu nằm trong nút ☰. */
export const isCollapsedNav = (page) => (page.viewportSize()?.width || 1440) < 992;
