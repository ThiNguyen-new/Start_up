// QA_PLAN mục 7: Nội dung (C1–C5)
import { test, expect } from './helpers.mjs';

test.describe('D — Câu dẫn đầu mỗi trang (ui-ux-story-plan D)', () => {
  const STORY_PAGES = ['products/', 'build-your-own-kit/', 'schedule-rescue/', 'send-rescue/', 'blog/', 'faq/', 'contact/', 'cart-demo/'];

  test('[D1] Mỗi trang con có nhãn + câu dẫn + icon, vẫn đúng một h1', async ({ page }) => {
    const leads = new Set();
    for (const path of STORY_PAGES) {
      await page.goto(path);
      await expect(page.locator('h1'), `h1 ở /${path}`).toHaveCount(1);
      await expect(page.locator('.sk-page-eyebrow'), `nhãn ở /${path}`).toHaveText(/\S/);
      const lead = page.locator('.sk-page-lead');
      await expect(lead, `câu dẫn ở /${path}`).toBeVisible();
      const text = (await lead.textContent()).trim();
      expect(text.length, `câu dẫn ở /${path}`).toBeGreaterThan(20);
      leads.add(text);
      const icon = page.locator('.sk-page-icon');
      await expect(icon).toHaveAttribute('alt', ''); // trang trí
      expect(await icon.evaluate((i) => i.complete && i.naturalWidth > 0), `icon ở /${path}`).toBe(true);
    }
    expect(leads.size, 'mỗi trang một câu dẫn riêng').toBe(STORY_PAGES.length);
  });

  test('[D2] Trang con của section (bài blog, kit) thừa hưởng màu + icon, không lặp câu dẫn', async ({ page }) => {
    await page.goto('blog/chay-deadline-nhom/');
    await expect(page.locator('.sk-page-band')).toHaveAttribute('data-accent', 'success');
    await expect(page.locator('.sk-page-icon')).toBeVisible();
    await expect(page.locator('.sk-page-lead')).toHaveCount(0);
    await page.goto('terms-conditions/'); // không khai story: hiển thị như cũ
    await expect(page.locator('.sk-page-band h1')).toBeVisible();
    await expect(page.locator('.sk-page-lead, .sk-page-eyebrow, .sk-page-icon')).toHaveCount(0);
  });
});

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
