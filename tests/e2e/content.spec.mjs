// QA_PLAN mục 7: Nội dung (C1–C5)
import { test, expect } from './helpers.mjs';

test.describe('C — Nội dung', () => {
  test('[C1] FAQ: 7 thẻ, 2 cột desktop / 1 cột mobile', async ({ page }) => {
    await page.goto('faq/');
    await expect(page.locator('.sk-faq-card')).toHaveCount(7);
    const cols = await page.locator('.sk-faq-cards').evaluate((el) => getComputedStyle(el).columnCount);
    const width = page.viewportSize().width;
    expect(cols).toBe(width >= 992 ? '2' : '1');
  });

  test('[C2] FAQ: accordion mở/đóng, chỉ 1 câu mở', async ({ page }) => {
    await page.goto('faq/');
    const qs = page.locator('.sk-faq-q');
    await expect(qs).toHaveCount(5);
    await qs.nth(0).click();
    await expect(page.locator('#faq-1')).toBeVisible();
    await expect(qs.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await qs.nth(1).click();
    await expect(page.locator('#faq-2')).toBeVisible();
    await expect(page.locator('#faq-1')).toBeHidden();
    await qs.nth(1).click();
    await expect(page.locator('#faq-2')).toBeHidden();
  });

  test('[C3] FAQ: form hỏi đáp có đủ ô', async ({ page }) => {
    await page.goto('faq/');
    const form = page.locator('.sk-faq form');
    for (const n of ['name', 'email', 'message']) await expect(form.locator(`[name="${n}"]`)).toBeVisible();
  });

  test.fixme('[C3] FAQ: form hỏi đáp gửi về email của website', async () => {
    // Chờ triển khai cùng G5.
  });

  test('[C4] Blog: danh sách và các bài mở được', async ({ page }) => {
    await page.goto('blog/');
    const links = await page.locator('main a[href*="/blog/"], section a[href*="blog/"]').evaluateAll((as) => [...new Set(as.map((a) => a.href).filter((h) => !/\/blog\/(page\/\d+\/)?$/.test(h)))]);
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const href of links) {
      await page.goto(href);
      await expect(page.locator('h1, h2').first()).not.toBeEmpty();
    }
  });

  test('[C5] Contact và Terms: địa chỉ Phường Chợ Quán', async ({ page }) => {
    await page.goto('contact/');
    await expect(page.locator('body')).toContainText('Phường Chợ Quán');
    await expect(page.locator('body')).not.toContainText('Phường 4');
    await page.goto('terms-conditions/');
    await expect(page.locator('h1').first()).not.toBeEmpty();
  });
});
